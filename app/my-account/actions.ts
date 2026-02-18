"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_VALUE,
  ADMIN_USERNAME_COOKIE_NAME,
} from "@/lib/admin-auth";
import {
  addSupportTicket,
  addSupportTicketReply,
  findUserByUsername,
  listSupportTicketsByUser,
  setSupportTicketStatus,
  updateUser,
} from "@/lib/shop-store";

function asString(input: FormDataEntryValue | null): string {
  return typeof input === "string" ? input.trim() : "";
}

type MyAccountTab = "profile" | "security" | "orders" | "ticket";

function asTab(input: FormDataEntryValue | null): MyAccountTab {
  const safe = asString(input).toLowerCase();
  if (safe === "security") return "security";
  if (safe === "orders") return "orders";
  if (safe === "ticket") return "ticket";
  return "profile";
}

function redirectWithMessage(kind: string, message: string, tab: MyAccountTab = "profile"): never {
  const params = new URLSearchParams();
  params.set("kind", kind);
  params.set("msg", message);
  params.set("tab", tab);
  redirect(`/my-account?${params.toString()}`);
}

async function requireAuthenticatedUser() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get(ADMIN_COOKIE_NAME)?.value === ADMIN_SESSION_VALUE;
  if (!isLoggedIn) {
    redirect("/login?next=/my-account");
  }
  const username = cookieStore.get(ADMIN_USERNAME_COOKIE_NAME)?.value?.trim() ?? "";
  const user = findUserByUsername(username);
  if (!user) {
    redirect("/login?next=/my-account");
  }
  return user;
}

function userOwnsTicket(userId: string, ticketId: string): boolean {
  if (!userId || !ticketId) return false;
  return listSupportTicketsByUser(userId).some((ticket) => ticket.id === ticketId);
}

export async function updateMyAccountProfileAction(formData: FormData) {
  const tab = asTab(formData.get("tab"));
  const user = await requireAuthenticatedUser();

  const name = asString(formData.get("name"));
  const surname = asString(formData.get("surname"));
  const email = asString(formData.get("email"));
  const phone = asString(formData.get("phone"));
  const city = asString(formData.get("city"));
  const address = asString(formData.get("address"));
  if (!name || !email) {
    redirectWithMessage("error", "Name and email are required.", tab);
  }

  const updated = updateUser(user.id, {
    name,
    surname,
    username: user.username,
    email,
    password: "",
    avatarUrl: user.avatarUrl,
    role: user.role,
    phone,
    city,
    address,
  });

  if (!updated) {
    redirectWithMessage("error", "Failed to update profile.", tab);
  }

  revalidatePath("/my-account");
  revalidatePath("/dashboard/users");
  revalidatePath(`/dashboard/users/${user.id}`);
  redirectWithMessage("ok", "Profile updated.", tab);
}

export async function changeMyAccountPasswordAction(formData: FormData) {
  const tab = asTab(formData.get("tab"));
  const user = await requireAuthenticatedUser();

  const currentPassword = asString(formData.get("currentPassword"));
  const newPassword = asString(formData.get("newPassword"));
  const confirmPassword = asString(formData.get("confirmPassword"));
  if (currentPassword !== user.password) {
    redirectWithMessage("error", "Current password is not correct.", tab);
  }
  if (newPassword.length < 6) {
    redirectWithMessage("error", "New password must be at least 6 characters.", tab);
  }
  if (newPassword !== confirmPassword) {
    redirectWithMessage("error", "New password and confirm password do not match.", tab);
  }

  const updated = updateUser(user.id, {
    name: user.name,
    surname: user.surname,
    username: user.username,
    email: user.email,
    password: newPassword,
    avatarUrl: user.avatarUrl,
    role: user.role,
    phone: user.phone,
    city: user.city,
    address: user.address,
  });

  if (!updated) {
    redirectWithMessage("error", "Failed to update password.", tab);
  }

  revalidatePath("/my-account");
  revalidatePath("/dashboard/users");
  revalidatePath(`/dashboard/users/${user.id}`);
  redirectWithMessage("ok", "Password changed.", tab);
}

export async function createMyAccountTicketAction(formData: FormData) {
  const tab = asTab(formData.get("tab"));
  const user = await requireAuthenticatedUser();

  const subject = asString(formData.get("subject"));
  const message = asString(formData.get("message"));
  if (!subject || !message) {
    redirectWithMessage("error", "Subject and message are required.", tab);
  }

  const created = addSupportTicket({
    userId: user.id,
    username: user.username,
    email: user.email,
    subject,
    message,
  });

  if (!created) {
    redirectWithMessage("error", "Failed to create support ticket.", tab);
  }

  revalidatePath("/my-account");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/help-tickets");
  redirectWithMessage("ok", "Support ticket created.", tab);
}

export async function replyMyAccountTicketAction(formData: FormData) {
  const tab = asTab(formData.get("tab"));
  const user = await requireAuthenticatedUser();
  const ticketId = asString(formData.get("ticketId"));
  const message = asString(formData.get("message"));

  if (!ticketId || !message) {
    redirectWithMessage("error", "Reply message is required.", tab);
  }
  if (!userOwnsTicket(user.id, ticketId)) {
    redirectWithMessage("error", "Ticket not found for this account.", tab);
  }

  const replied = addSupportTicketReply(ticketId, user.username, message);
  if (!replied) {
    redirectWithMessage("error", "Failed to send reply.", tab);
  }

  revalidatePath("/my-account");
  revalidatePath("/dashboard/help-tickets");
  redirectWithMessage("ok", "Reply sent.", tab);
}

export async function setMyAccountTicketStatusAction(formData: FormData) {
  const tab = asTab(formData.get("tab"));
  const user = await requireAuthenticatedUser();
  const ticketId = asString(formData.get("ticketId"));
  const status = asString(formData.get("status")) === "Open" ? "Open" : "Closed";

  if (!ticketId) {
    redirectWithMessage("error", "Ticket not found.", tab);
  }
  if (!userOwnsTicket(user.id, ticketId)) {
    redirectWithMessage("error", "Ticket not found for this account.", tab);
  }

  const updated = setSupportTicketStatus(ticketId, status);
  if (!updated) {
    redirectWithMessage("error", "Failed to update ticket status.", tab);
  }

  revalidatePath("/my-account");
  revalidatePath("/dashboard/help-tickets");
  redirectWithMessage("ok", status === "Closed" ? "Ticket closed." : "Ticket reopened.", tab);
}
