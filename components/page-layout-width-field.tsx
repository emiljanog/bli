"use client";

import { useState } from "react";

type PageLayoutWidthFieldProps = {
  name: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number;
};

export function PageLayoutWidthField({
  name,
  min = 960,
  max = 2400,
  step = 10,
  defaultValue,
}: PageLayoutWidthFieldProps) {
  const safeInitial = Math.max(min, Math.min(max, Math.round(Number(defaultValue) || 1440)));
  const [value, setValue] = useState(safeInitial);

  return (
    <div className="grid gap-3">
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Custom Width (px)</span>
        <input
          name={name}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const parsed = Number(event.currentTarget.value);
            if (!Number.isFinite(parsed)) return;
            setValue(Math.max(min, Math.min(max, Math.round(parsed))));
          }}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Width Slider</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            const parsed = Number(event.currentTarget.value);
            if (!Number.isFinite(parsed)) return;
            setValue(Math.max(min, Math.min(max, Math.round(parsed))));
          }}
          className="w-full accent-sky-500"
        />
      </label>

      <p className="text-xs text-slate-500">Value: {value}px</p>
    </div>
  );
}
