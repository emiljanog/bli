import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAdminAction } from "@/app/dashboard/actions";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_VALUE, ADMIN_USERNAME_COOKIE_NAME } from "@/lib/admin-auth";
import {
  changeMyAccountPasswordAction,
  createMyAccountTicketAction,
  replyMyAccountTicketAction,
  setMyAccountTicketStatusAction,
  updateMyAccountProfileAction,
} from "./actions";
import { findProductNameById, findUserByUsername, listOrdersByCustomer, listOrdersByUser, listSupportTicketsByUser } from "@/lib/shop-store";

type MyAccountPageProps = {
  searchParams?: Promise<{ kind?: string; msg?: string; tab?: string; create?: string }>;
};

type MyAccountTab = "profile" | "security" | "orders" | "ticket";

function normalizeTab(value: string | undefined): MyAccountTab {
  const safe = (value || "").trim().toLowerCase();
  if (safe === "security") return "security";
  if (safe === "orders") return "orders";
  if (safe === "ticket") return "ticket";
  return "profile";
}

function asMoney(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default async function MyAccountPage({ searchParams }: MyAccountPageProps) {
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

  const welcomeName = user?.name || username;
  const params = (await searchParams) ?? {};
  const activeTab = normalizeTab(params.tab);
  const showNewTicketForm = params.create === "1";

  const orderMatches = new Map<string, ReturnType<typeof listOrdersByCustomer>[number]>();
  if (user) {
    for (const order of listOrdersByUser(user.id)) {
      orderMatches.set(order.id, order);
    }
    const customerKeys = [`${user.name} ${user.surname}`.trim(), user.username, user.email].filter(Boolean);
    for (const key of customerKeys) {
      for (const order of listOrdersByCustomer(key)) {
        orderMatches.set(order.id, order);
      }
    }
  }
  const orders = Array.from(orderMatches.values()).slice(0, 8);
  const tickets = user ? listSupportTicketsByUser(user.id) : [];

  return (
    <main className="text-slate-900">
      <section className="site-container py-10 md:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">My Account</p>
              <h1 className="mt-2 text-4xl font-bold">User Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-slate-700">
                Welcome <span className="text-slate-900">{welcomeName}</span>
              </p>
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>

          {params.msg ? (
            <p
              className={`mt-4 rounded-xl border px-4 py-2 text-sm font-semibold ${
                params.kind === "ok"
                  ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                  : "border-rose-300 bg-rose-100 text-rose-800"
              }`}
            >
              {params.msg}
            </p>
          ) : null}

          {!user ? (
            <p className="mt-4 rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-800">
              User data was not found for this account.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-[230px_1fr]">
              <aside className="self-start rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:sticky lg:top-6">
                <nav className="space-y-1">
                  <Link
                    href="/my-account?tab=profile"
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      activeTab === "profile" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Profile Details
                  </Link>
                  <Link
                    href="/my-account?tab=security"
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      activeTab === "security" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Security
                  </Link>
                  <Link
                    href="/my-account?tab=orders"
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      activeTab === "orders" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/my-account?tab=ticket"
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      activeTab === "ticket" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Help Ticket
                  </Link>
                </nav>
              </aside>

              <div className="space-y-4">
                {activeTab === "profile" ? (
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Profile Details</p>
                <form action={updateMyAccountProfileAction} className="mt-3 space-y-3">
                  <input type="hidden" name="tab" value="profile" />
                  <input
                    name="name"
                    type="text"
                    defaultValue={user.name}
                    placeholder="Name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                  <input
                    name="surname"
                    type="text"
                    defaultValue={user.surname}
                    placeholder="Surname"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                  <input
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    placeholder="Email"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      name="phone"
                      type="text"
                      defaultValue={user.phone}
                      placeholder="Phone"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                    <input
                      name="city"
                      type="text"
                      defaultValue={user.city}
                      placeholder="City"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </div>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue={user.address}
                    placeholder="Address"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                  <button
                    type="submit"
                    className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
                  >
                    Save Changes
                  </button>
                </form>
                  </article>
                ) : null}

                {activeTab === "security" ? (
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Security</p>
                <form action={changeMyAccountPasswordAction} className="mt-3 space-y-3">
                  <input type="hidden" name="tab" value="security" />
                  <input
                    name="currentPassword"
                    type="password"
                    placeholder="Current password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                  <input
                    name="newPassword"
                    type="password"
                    minLength={6}
                    placeholder="New password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    minLength={6}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Change Password
                  </button>
                </form>
                  </article>
                ) : null}

                {activeTab === "orders" ? (
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-lg font-semibold text-slate-900">Orders</p>
                {orders.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600">No orders linked with this account yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {orders.map((order) => (
                      <details key={order.id} className="rounded-xl border border-slate-200 bg-white text-sm">
                        <summary className="cursor-pointer list-none px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{order.id}</span>
                            <span className="text-xs font-semibold text-slate-600">{order.status}</span>
                          </div>
                          <p className="mt-1 text-slate-600">
                            Date: {order.createdAt} | Total: {asMoney(order.total)}
                          </p>
                        </summary>
                        <div className="border-t border-slate-200 px-3 py-3 text-slate-700">
                          <p className="font-semibold text-slate-900">Products</p>
                          <div className="mt-1 space-y-1 text-sm">
                            {order.items.map((item, index) => (
                              <p key={`${order.id}-${item.productId}-${index}`}>
                                <span className="font-semibold text-slate-900">{findProductNameById(item.productId)}</span> x{item.quantity}
                              </p>
                            ))}
                          </div>
                          <p className="mt-1">
                            Discount: <span className="font-semibold text-slate-900">{asMoney(order.discount)}</span>
                          </p>
                          <p className="mt-1">
                            Coupon: <span className="font-semibold text-slate-900">{order.couponCode || "-"}</span>
                          </p>
                          {order.note ? (
                            <p className="mt-1">
                              Note: <span className="font-semibold text-slate-900">{order.note}</span>
                            </p>
                          ) : null}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
                  </article>
                ) : null}

                {activeTab === "ticket" ? (
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-900">Help Ticket</p>
                  {showNewTicketForm ? (
                    <Link
                      href="/my-account?tab=ticket"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Cancel
                    </Link>
                  ) : (
                    <Link
                      href="/my-account?tab=ticket&create=1"
                      className="rounded-xl site-primary-bg px-3 py-2 text-xs font-semibold text-white transition site-primary-bg-hover"
                    >
                      New Ticket
                    </Link>
                  )}
                </div>

                {showNewTicketForm ? (
                  <form action={createMyAccountTicketAction} className="mt-3 space-y-3">
                    <input type="hidden" name="tab" value="ticket" />
                    <input
                      name="subject"
                      type="text"
                      placeholder="Subject"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                      required
                    />
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Describe your issue..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                      required
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Open Ticket
                    </button>
                  </form>
                ) : null}

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">My tickets</p>
                  {tickets.length === 0 ? (
                    <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      No tickets yet.
                    </p>
                  ) : (
                    tickets.map((ticket) => (
                      <details key={ticket.id} className="rounded-xl border border-slate-200 bg-white text-sm">
                        <summary className="cursor-pointer list-none px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{ticket.subject}</span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                ticket.status === "Open"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {ticket.id} | {ticket.createdAt}
                          </p>
                        </summary>
                        <div className="border-t border-slate-200 px-3 py-3">
                          <p className="whitespace-pre-wrap text-sm text-slate-700">{ticket.message}</p>

                          <div className="mt-3 space-y-2">
                            {ticket.replies.length > 0 ? (
                              ticket.replies.map((reply) => (
                                <div key={reply.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                  <p className="text-xs text-slate-500">
                                    {reply.by} | {reply.createdAt}
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{reply.message}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500">No replies yet.</p>
                            )}
                          </div>

                          <form action={replyMyAccountTicketAction} className="mt-3 space-y-2">
                            <input type="hidden" name="tab" value="ticket" />
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            <textarea
                              name="message"
                              rows={3}
                              placeholder="Reply to this ticket..."
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                              required
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="submit"
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                              >
                                Reply
                              </button>
                            </div>
                          </form>
                          <form action={setMyAccountTicketStatusAction} className="mt-2">
                            <input type="hidden" name="tab" value="ticket" />
                            <input type="hidden" name="ticketId" value={ticket.id} />
                            <input type="hidden" name="status" value={ticket.status === "Open" ? "Closed" : "Open"} />
                            <button
                              type="submit"
                              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              {ticket.status === "Open" ? "Close Ticket" : "Reopen Ticket"}
                            </button>
                          </form>
                        </div>
                      </details>
                    ))
                  )}
                </div>
                  </article>
                ) : null}
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
