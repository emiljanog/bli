"use client";

import { useMemo, useState } from "react";

type AdminProductDescriptionEditorProps = {
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
};

export function AdminProductDescriptionEditor({
  name,
  defaultValue = "",
  rows = 14,
  placeholder = "Shkruaj pershkrimin...",
}: AdminProductDescriptionEditorProps) {
  const [mode, setMode] = useState<"visual" | "text">("visual");
  const [value, setValue] = useState(defaultValue);

  const wordCount = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [value]);

  return (
    <div className="rounded-xl border border-slate-300 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <div className="text-xs text-slate-500">B I | List | Quote | Link | Align | Shortcode</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`rounded border px-2 py-1 text-xs ${
              mode === "visual"
                ? "border-slate-300 bg-white font-semibold"
                : "border-slate-200 bg-slate-100"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`rounded border px-2 py-1 text-xs ${
              mode === "text"
                ? "border-slate-300 bg-white font-semibold"
                : "border-slate-200 bg-slate-100"
            }`}
          >
            TXT
          </button>
        </div>
      </div>

      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className={`w-full resize-y px-3 py-3 text-sm outline-none ${
          mode === "text" ? "font-mono" : "font-sans"
        }`}
      />

      <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Word count: {wordCount}
      </div>
    </div>
  );
}
