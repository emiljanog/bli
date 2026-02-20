"use client";

import { useMemo, useState } from "react";

type AdminProductDataEditorProps = {
  defaultPrice: number;
  defaultSalePrice: number | null;
  defaultSaleScheduleStartAt: string | null;
  defaultSaleScheduleEndAt: string | null;
  defaultStock: number;
};

function money(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Number(value.toFixed(2)));
}

function asNumberOrZero(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateTimeLocalValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60_000));
  return localDate.toISOString().slice(0, 19);
}

export function AdminProductDataEditor({
  defaultPrice,
  defaultSalePrice,
  defaultSaleScheduleStartAt,
  defaultSaleScheduleEndAt,
  defaultStock,
}: AdminProductDataEditorProps) {
  const [price, setPrice] = useState(String(defaultPrice));
  const [salePrice, setSalePrice] = useState(defaultSalePrice !== null ? String(defaultSalePrice) : "");
  const [stock, setStock] = useState(String(defaultStock));
  const defaultStartLocal = useMemo(() => toDateTimeLocalValue(defaultSaleScheduleStartAt), [defaultSaleScheduleStartAt]);
  const defaultEndLocal = useMemo(() => toDateTimeLocalValue(defaultSaleScheduleEndAt), [defaultSaleScheduleEndAt]);
  const [saleScheduleEnabled, setSaleScheduleEnabled] = useState(Boolean(defaultStartLocal || defaultEndLocal));
  const [saleScheduleStartAt, setSaleScheduleStartAt] = useState(defaultStartLocal);
  const [saleScheduleEndAt, setSaleScheduleEndAt] = useState(defaultEndLocal);

  const [editingPrice, setEditingPrice] = useState(false);
  const [editingSalePrice, setEditingSalePrice] = useState(false);
  const [editingStock, setEditingStock] = useState(false);

  const priceChanged = useMemo(() => money(asNumberOrZero(price)) !== money(defaultPrice), [defaultPrice, price]);
  const salePriceChanged = useMemo(() => {
    const next = salePrice.trim() ? money(asNumberOrZero(salePrice)) : null;
    const prev = defaultSalePrice !== null ? money(defaultSalePrice) : null;
    return next !== prev;
  }, [defaultSalePrice, salePrice]);
  const stockChanged = useMemo(() => {
    const next = Math.max(0, Math.floor(asNumberOrZero(stock)));
    return next !== Math.max(0, Math.floor(defaultStock));
  }, [defaultStock, stock]);
  const saleScheduleChanged = useMemo(() => {
    const hadDefaultSchedule = Boolean(defaultStartLocal || defaultEndLocal);
    const hasCurrentSchedule = saleScheduleEnabled && Boolean(saleScheduleStartAt || saleScheduleEndAt);
    if (hadDefaultSchedule !== hasCurrentSchedule) return true;
    return saleScheduleStartAt !== defaultStartLocal || saleScheduleEndAt !== defaultEndLocal;
  }, [defaultEndLocal, defaultStartLocal, saleScheduleEnabled, saleScheduleEndAt, saleScheduleStartAt]);

  function applySchedulePreset(durationMs: number) {
    const now = new Date();
    const end = new Date(now.getTime() + durationMs);
    setSaleScheduleEnabled(true);
    setSaleScheduleStartAt(toDateTimeLocalValue(now.toISOString()));
    setSaleScheduleEndAt(toDateTimeLocalValue(end.toISOString()));
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-[#ececed] p-4">
      <div className="rounded-xl border border-slate-300 bg-white">
        <div className="border-b border-slate-200 px-4 py-2">
          <p className="text-base font-semibold text-slate-800">Product data</p>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Regular price</span>
            <div className="relative">
              <input
                name="price"
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                readOnly={!editingPrice}
                className={`w-full rounded-xl border px-3 py-2 pr-24 text-sm outline-none ${
                  editingPrice
                    ? "border-slate-300 bg-white focus:border-[#2271b1]"
                    : "cursor-default border-slate-200 bg-slate-100 text-slate-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setEditingPrice((prev) => !prev)}
                className="absolute right-1 top-1 h-8 min-w-[74px] cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {editingPrice ? "Done" : "Edit"}
              </button>
            </div>
            {priceChanged ? <p className="text-[11px] font-semibold text-emerald-700">Changed</p> : null}
          </label>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sale price</span>
            <div className="relative">
              <input
                name="salePrice"
                type="number"
                min="0"
                value={salePrice}
                onChange={(event) => setSalePrice(event.target.value)}
                readOnly={!editingSalePrice}
                className={`w-full rounded-xl border px-3 py-2 pr-24 text-sm outline-none ${
                  editingSalePrice
                    ? "border-slate-300 bg-white focus:border-[#2271b1]"
                    : "cursor-default border-slate-200 bg-slate-100 text-slate-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setEditingSalePrice((prev) => !prev)}
                className="absolute right-1 top-1 h-8 min-w-[74px] cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {editingSalePrice ? "Done" : "Edit"}
              </button>
            </div>
            <input
              type="hidden"
              name="saleScheduleStartAt"
              value={saleScheduleEnabled ? saleScheduleStartAt : ""}
            />
            <input
              type="hidden"
              name="saleScheduleEndAt"
              value={saleScheduleEnabled ? saleScheduleEndAt : ""}
            />
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <button
                type="button"
                onClick={() => setSaleScheduleEnabled((prev) => !prev)}
                className="cursor-pointer text-xs font-semibold text-[#2271b1] hover:underline"
              >
                {saleScheduleEnabled ? "Hide schedule" : "Schedule"}
              </button>
              {saleScheduleEnabled ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applySchedulePreset(24 * 60 * 60 * 1000)}
                      className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      1 day
                    </button>
                    <button
                      type="button"
                      onClick={() => applySchedulePreset(7 * 24 * 60 * 60 * 1000)}
                      className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      1 week
                    </button>
                    <button
                      type="button"
                      onClick={() => applySchedulePreset(30 * 1000)}
                      className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      30 sec (test)
                    </button>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">From</span>
                    <input
                      type="datetime-local"
                      step={1}
                      value={saleScheduleStartAt}
                      onChange={(event) => setSaleScheduleStartAt(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#2271b1]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">To</span>
                    <input
                      type="datetime-local"
                      step={1}
                      value={saleScheduleEndAt}
                      onChange={(event) => setSaleScheduleEndAt(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#2271b1]"
                    />
                  </label>
                </div>
              ) : null}
            </div>
            {salePriceChanged || saleScheduleChanged ? (
              <p className="text-[11px] font-semibold text-emerald-700">Changed</p>
            ) : null}
          </div>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock quantity</span>
            <div className="relative">
              <input
                name="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                readOnly={!editingStock}
                className={`w-full rounded-xl border px-3 py-2 pr-24 text-sm outline-none ${
                  editingStock
                    ? "border-slate-300 bg-white focus:border-[#2271b1]"
                    : "cursor-default border-slate-200 bg-slate-100 text-slate-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setEditingStock((prev) => !prev)}
                className="absolute right-1 top-1 h-8 min-w-[74px] cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {editingStock ? "Done" : "Edit"}
              </button>
            </div>
            {stockChanged ? <p className="text-[11px] font-semibold text-emerald-700">Changed</p> : null}
          </label>
        </div>
      </div>
    </article>
  );
}
