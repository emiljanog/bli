import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  ADMIN_USERNAME_COOKIE_NAME,
} from "@/lib/admin-auth";
import {
  CART_SESSION_COOKIE,
  addCartItemToSession,
  clearCartSession,
  createCartSessionId,
  listCartItems,
  mergeCartSessions,
  removeCartItemFromSession,
  updateCartItemQuantityInSession,
} from "@/lib/server-cart-store";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function resolveSession() {
  const cookieStore = await cookies();
  const existingGuestSession = asString(cookieStore.get(CART_SESSION_COOKIE)?.value ?? "");
  const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  const username = isLoggedIn
    ? asString(cookieStore.get(ADMIN_USERNAME_COOKIE_NAME)?.value ?? "")
    : "";

  if (username) {
    const normalizedUsername = username
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const userSessionId = `user_${normalizedUsername || "account"}`;
    if (existingGuestSession && existingGuestSession !== userSessionId) {
      mergeCartSessions(existingGuestSession, userSessionId);
    }
    return { sessionId: userSessionId, shouldSetCookie: false };
  }

  if (existingGuestSession) {
    return { sessionId: existingGuestSession, shouldSetCookie: false };
  }

  return { sessionId: createCartSessionId(), shouldSetCookie: true };
}

function withSessionCookie(
  response: NextResponse,
  sessionId: string,
  shouldSetCookie: boolean,
): NextResponse {
  if (shouldSetCookie) {
    response.cookies.set({
      name: CART_SESSION_COOKIE,
      value: sessionId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export async function GET() {
  const { sessionId, shouldSetCookie } = await resolveSession();
  const items = listCartItems(sessionId);
  const response = NextResponse.json({ items });
  return withSessionCookie(response, sessionId, shouldSetCookie);
}

export async function POST(request: NextRequest) {
  const { sessionId, shouldSetCookie } = await resolveSession();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const id = asString(body.id);
  const name = asString(body.name);
  const price = asNumber(body.price);
  if (!id || !name || price <= 0) {
    const errorResponse = NextResponse.json(
      { error: "Invalid cart item payload." },
      { status: 400 },
    );
    return withSessionCookie(errorResponse, sessionId, shouldSetCookie);
  }

  const items = addCartItemToSession(sessionId, {
    id,
    name,
    price,
    image: asString(body.image) || undefined,
    quantity: asNumber(body.quantity) || 1,
  });

  const response = NextResponse.json({ items });
  return withSessionCookie(response, sessionId, shouldSetCookie);
}

export async function PATCH(request: NextRequest) {
  const { sessionId, shouldSetCookie } = await resolveSession();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = asString(body.id);
  const quantity = asNumber(body.quantity);

  if (!id) {
    const errorResponse = NextResponse.json(
      { error: "Missing cart item id." },
      { status: 400 },
    );
    return withSessionCookie(errorResponse, sessionId, shouldSetCookie);
  }

  const items = updateCartItemQuantityInSession(sessionId, id, quantity);
  const response = NextResponse.json({ items });
  return withSessionCookie(response, sessionId, shouldSetCookie);
}

export async function DELETE(request: NextRequest) {
  const { sessionId, shouldSetCookie } = await resolveSession();
  const itemId = asString(request.nextUrl.searchParams.get("id") ?? "");
  const items = itemId
    ? removeCartItemFromSession(sessionId, itemId)
    : clearCartSession(sessionId);

  const response = NextResponse.json({ items });
  return withSessionCookie(response, sessionId, shouldSetCookie);
}
