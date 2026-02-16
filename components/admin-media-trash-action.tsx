"use client";

import { useState } from "react";
import { trashMediaAction } from "@/app/dashboard/actions";

type AdminMediaTrashActionProps = {
  mediaId: string;
  redirectTo: string;
  buttonLabel?: string;
  buttonClassName?: string;
  confirmText?: string;
  fullWidth?: boolean;
};

export function AdminMediaTrashAction({
  mediaId,
  redirectTo,
  buttonLabel = "Move to Trash",
  buttonClassName = "rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-200",
  confirmText = "Are you sure you want to move this media to trash?",
  fullWidth = false,
}: AdminMediaTrashActionProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button type="button" onClick={() => setIsConfirming(true)} className={buttonClassName}>
        {buttonLabel}
      </button>
    );
  }

  const actionButtonClass = fullWidth
    ? "inline-flex h-9 w-full items-center justify-center rounded-lg border border-rose-300 bg-rose-100 px-3 text-xs font-semibold text-rose-800 transition hover:bg-rose-200"
    : "inline-flex h-8 min-w-24 items-center justify-center rounded-md border border-rose-300 bg-rose-100 px-3 text-xs font-semibold text-rose-800 transition hover:bg-rose-200";
  const cancelButtonClass = fullWidth
    ? "inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
    : "inline-flex h-8 min-w-24 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100";

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-2 ${fullWidth ? "space-y-2" : "space-y-1.5"}`}>
      <p className="text-xs font-semibold text-amber-900">{confirmText}</p>
      <div className="flex items-center gap-2">
        <form action={trashMediaAction} className={fullWidth ? "flex-1" : ""}>
          <input type="hidden" name="mediaId" value={mediaId} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button type="submit" className={actionButtonClass}>
            Yes, Move to Trash
          </button>
        </form>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className={`${cancelButtonClass} ${fullWidth ? "flex-1" : ""}`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
