import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin-shell";
import {
  deleteSupportTicketAction,
  replySupportTicketAction,
  setSupportTicketStatusAction,
} from "@/app/dashboard/actions";
import { getAdminRoleFromCookieStore } from "@/lib/admin-auth";
import { listSupportTickets } from "@/lib/shop-store";

export default async function AdminHelpTicketsPage() {
  const cookieStore = await cookies();
  const canDeleteTicket = getAdminRoleFromCookieStore(cookieStore) === "Super Admin";
  const tickets = listSupportTickets();

  return (
    <AdminShell title="Help Tickets" description="View user support tickets, reply, and close/reopen tickets.">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-2xl font-semibold">Tickets</p>
          <p className="text-sm text-slate-500">{tickets.length} total</p>
        </div>

        {tickets.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No support tickets yet.
          </p>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50">
                <details className="group">
                  <summary className="cursor-pointer list-none px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{ticket.subject}</p>
                        <p className="text-xs text-slate-600">
                          {ticket.id} | {ticket.username} | {ticket.email} | {ticket.createdAt}
                        </p>
                      </div>
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
                  </summary>

                  <div className="border-t border-slate-200 bg-white px-4 py-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">User message</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{ticket.message}</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Replies</p>
                      {ticket.replies.length === 0 ? (
                        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          No replies yet.
                        </p>
                      ) : (
                        ticket.replies.map((reply) => (
                          <div key={reply.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-xs text-slate-500">
                              {reply.by} | {reply.createdAt}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{reply.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <form action={replySupportTicketAction} className="mt-3 space-y-2">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard/help-tickets" />
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Write reply..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        required
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="submit"
                          className="rounded-xl site-primary-bg px-4 py-2 text-sm font-semibold text-white transition site-primary-bg-hover"
                        >
                          Reply
                        </button>
                      </div>
                    </form>
                    <form action={setSupportTicketStatusAction} className="mt-2">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard/help-tickets" />
                      <input type="hidden" name="status" value={ticket.status === "Open" ? "Closed" : "Open"} />
                      <button
                        type="submit"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        {ticket.status === "Open" ? "Close Ticket" : "Reopen Ticket"}
                      </button>
                    </form>
                    {canDeleteTicket ? (
                      <form action={deleteSupportTicketAction} className="mt-2">
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <input type="hidden" name="redirectTo" value="/dashboard/help-tickets" />
                        <button
                          type="submit"
                          className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Delete Ticket
                        </button>
                      </form>
                    ) : null}
                  </div>
                </details>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
