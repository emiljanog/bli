"use client";

import { useMemo, useState } from "react";

type BrandColorFieldProps = {
  name: string;
  label: string;
  defaultValue: string;
};

const SHORT_HEX = /^#([0-9a-f]{3})$/i;
const LONG_HEX = /^#([0-9a-f]{6})$/i;

function isHexColor(value: string): boolean {
  const safe = value.trim();
  return SHORT_HEX.test(safe) || LONG_HEX.test(safe);
}

function toLongHex(value: string): string {
  const safe = value.trim();
  const short = safe.match(SHORT_HEX);
  if (!short) return safe.toLowerCase();
  const [r, g, b] = short[1].split("");
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

export function BrandColorField({ name, label, defaultValue }: BrandColorFieldProps) {
  const fallback = useMemo(() => {
    const safe = defaultValue.trim();
    if (isHexColor(safe)) return toLongHex(safe);
    return "#000000";
  }, [defaultValue]);

  const [value, setValue] = useState(fallback);

  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className="flex gap-2">
        <input
          type="color"
          value={isHexColor(value) ? toLongHex(value) : fallback}
          onChange={(event) => setValue(event.target.value)}
          className="h-10 w-14 rounded-xl border border-slate-300 bg-white p-1"
        />
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="#ff8a00"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
        />
      </div>
    </label>
  );
}
