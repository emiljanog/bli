"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type AdminNotificationItem = {
  id: string;
  type: "Order" | "Ticket" | "User";
  title: string;
  message: string;
  href: string;
  createdAt: string;
  isRead: boolean;
};

type AdminNotificationsMenuProps = {
  initialNotifications: AdminNotificationItem[];
  initialUnreadCount: number;
};

function formatNotificationDate(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getUTCMonth()] ?? "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  return `${month} ${day}, ${hour}:${minute} UTC`;
}

function playNotificationSound() {
  if (typeof window === "undefined") return;
  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  try {
    const audioContext = new AudioContextCtor();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.0001;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
    oscillator.onended = () => {
      void audioContext.close();
    };
  } catch {
    // Ignore browsers that block autoplay sound until user gesture.
  }
}

export function AdminNotificationsMenu({
  initialNotifications,
  initialUnreadCount,
}: AdminNotificationsMenuProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set(initialNotifications.map((item) => item.id)));
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    let canceled = false;

    async function refreshNotifications(allowSound: boolean) {
      try {
        const response = await fetch("/api/admin/notifications?limit=14", {
          method: "GET",
          cache: "no-store",
        });
        const data = (await response.json().catch(() => null)) as
          | { ok?: boolean; unreadCount?: number; notifications?: AdminNotificationItem[] }
          | null;
        if (!response.ok || !data?.ok || canceled) return;

        const nextNotifications = Array.isArray(data.notifications) ? data.notifications : [];
        const nextUnread = Number.isFinite(data.unreadCount) ? Number(data.unreadCount) : 0;
        const knownIds = knownIdsRef.current;
        const hasNewItem = nextNotifications.some((item) => !knownIds.has(item.id));
        nextNotifications.forEach((item) => knownIds.add(item.id));

        setNotifications(nextNotifications);
        setUnreadCount(nextUnread);
        if (allowSound && hasNewItem) {
          playNotificationSound();
        }
      } catch {
        // Silent retry on next poll.
      }
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refreshNotifications(true);
    }, 5000);

    return () => {
      canceled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onOutsideClick(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [open]);

  async function markAllAsRead() {
    if (isMarking || unreadCount === 0) return;
    setIsMarking(true);
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; unreadCount?: number; notifications?: AdminNotificationItem[] }
        | null;
      if (!response.ok || !data?.ok) return;

      const nextNotifications = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(nextNotifications);
      setUnreadCount(Number.isFinite(data.unreadCount) ? Number(data.unreadCount) : 0);
      nextNotifications.forEach((item) => knownIdsRef.current.add(item.id));
    } finally {
      setIsMarking(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 17a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute right-0 top-0 inline-flex h-4 min-w-4 -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      <div
        className={`absolute right-0 top-full z-[230] mt-2 w-80 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] shadow-lg transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-3 py-2">
          <p className="text-sm font-semibold text-[var(--admin-text)]">Notifications</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={isMarking}
              className="cursor-pointer rounded-md border border-[var(--admin-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-muted)] transition hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isMarking ? "Saving..." : "Mark all read"}
            </button>
          ) : null}
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--admin-border)] px-3 py-3 text-xs text-[var(--admin-muted)]">
              No notifications yet.
            </p>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg border px-3 py-2 text-left transition ${
                    notification.isRead
                      ? "border-transparent hover:bg-[var(--admin-hover-bg)]"
                      : "border-amber-300/70 bg-amber-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--admin-text)]">{notification.title}</p>
                    <p className="text-[11px] text-[var(--admin-muted)]">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">{notification.message}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
