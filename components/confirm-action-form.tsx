"use client";

import { useState } from "react";

type HiddenField = {
  name: string;
  value: string;
};

type ConfirmActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: HiddenField[];
  confirmMessage: string;
  buttonLabel: string;
  confirmLabel?: string;
  cancelLabel?: string;
  buttonClassName: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  promptClassName?: string;
  confirmContainerClassName?: string;
  buttonsRowClassName?: string;
  className?: string;
};

export function ConfirmActionForm({
  action,
  hiddenFields,
  confirmMessage,
  buttonLabel,
  confirmLabel = "Yes Delete",
  cancelLabel = "Cancel",
  buttonClassName,
  confirmButtonClassName,
  cancelButtonClassName,
  promptClassName,
  confirmContainerClassName,
  buttonsRowClassName,
  className,
}: ConfirmActionFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <form action={action} className={className}>
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}

      {isConfirming ? (
        <div className={confirmContainerClassName ?? "flex flex-col items-start gap-2"}>
          <span className={promptClassName ?? "text-xs font-semibold text-slate-600"}>
            {confirmMessage}
          </span>
          <div className={buttonsRowClassName ?? "flex items-center gap-2"}>
            <button type="submit" className={confirmButtonClassName ?? buttonClassName}>
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              className={
                cancelButtonClassName ??
                "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              }
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setIsConfirming(true)} className={buttonClassName}>
          {buttonLabel}
        </button>
      )}
    </form>
  );
}
