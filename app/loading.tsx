export default function Loading() {
  return (
    <div className="mx-auto w-[90%] max-w-[var(--site-layout-max-width)] px-1 pb-8 pt-4 md:pt-6">
      <div className="route-loading-shimmer mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90" />
      <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm md:p-6">
        <div className="h-6 w-52 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-[88%] animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-[64%] animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
