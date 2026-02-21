"use client";

import { usePathname } from "next/navigation";

type TableConfig = {
  title: string;
  description: string;
  columns: string[];
  rows: number;
  withSidebar?: boolean;
};

const TABLE_CONFIGS: Record<string, TableConfig> = {
  "/dashboard/products": {
    title: "Products",
    description: "Loading product table and filters...",
    columns: ["ID", "Name", "URL", "Category", "Tags", "Price", "Stock", "Reviews", "Status", "Actions"],
    rows: 7,
  },
  "/dashboard/orders": {
    title: "Orders",
    description: "Loading order list and statuses...",
    columns: ["Order", "Date", "Customer", "Product", "Qty", "Total", "Discount", "Coupon", "Status", "Actions"],
    rows: 7,
  },
  "/dashboard/users": {
    title: "Users",
    description: "Loading users table and role filters...",
    columns: ["ID", "Name", "Username", "Email", "Role", "Phone", "City", "Status", "Created", "Actions"],
    rows: 7,
  },
  "/dashboard/pages": {
    title: "Pages",
    description: "Loading pages table...",
    columns: ["ID", "Name", "URL", "Status", "Updated", "Actions"],
    rows: 7,
  },
  "/dashboard/media": {
    title: "Media",
    description: "Loading media library table...",
    columns: ["Preview", "ID", "Alt", "Description", "Used", "Assigned", "Status", "Updated", "Actions"],
    rows: 7,
  },
  "/dashboard/reviews": {
    title: "Reviews",
    description: "Loading moderation queue...",
    columns: ["Product", "Author", "Rating", "Comment", "Date", "Status", "Action"],
    rows: 7,
    withSidebar: true,
  },
  "/dashboard/coupons": {
    title: "Coupons",
    description: "Loading coupons and discount setup...",
    columns: ["Code", "Description", "Type", "Value", "Min Subtotal", "Status", "Action"],
    rows: 7,
    withSidebar: true,
  },
  "/dashboard/customers": {
    title: "Customers",
    description: "Loading customer list...",
    columns: ["Username", "Name", "Email", "Phone", "City", "Orders", "Created"],
    rows: 7,
    withSidebar: true,
  },
  "/dashboard/sales": {
    title: "Sales",
    description: "Loading sales entries...",
    columns: ["Date", "Source", "Amount", "Notes"],
    rows: 8,
  },
};

function TableLoading({ config }: { config: TableConfig }) {
  const rows = Array.from({ length: config.rows });

  return (
    <div className={config.withSidebar ? "grid gap-4 lg:grid-cols-[1fr_320px]" : "space-y-4"}>
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold text-slate-900">{config.title}</p>
            <p className="text-sm text-slate-500">{config.description}</p>
          </div>
          <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200" />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-slate-200" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                {config.columns.map((column) => (
                  <th key={column} className="pb-2 pr-3 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((_, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="border-b border-slate-100">
                  {config.columns.map((column, colIndex) => (
                    <td key={`${column}-${rowIndex}-${colIndex}`} className="py-3 pr-3">
                      <div
                        className="h-4 animate-pulse rounded bg-slate-200"
                        style={{ width: `${Math.max(30, 92 - (colIndex % 5) * 12)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {config.withSidebar ? (
        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-[84%] animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-[68%] animate-pulse rounded bg-slate-200" />
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-10 w-full animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-2 h-10 w-full animate-pulse rounded-xl bg-slate-200" />
          </article>
        </aside>
      ) : null}
    </div>
  );
}

function DashboardOverviewLoading() {
  const metrics = Array.from({ length: 4 });
  const listRows = Array.from({ length: 5 });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((_, index) => (
          <article key={`metric-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200" />
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 h-7 w-48 animate-pulse rounded bg-slate-200" />
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {listRows.map((_, index) => (
                <tr key={`overview-row-${index}`} className="border-b border-slate-100">
                  <td className="py-3"><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /></td>
                  <td className="py-3"><div className="h-4 w-28 animate-pulse rounded bg-slate-200" /></td>
                  <td className="py-3"><div className="h-4 w-20 animate-pulse rounded bg-slate-200" /></td>
                  <td className="py-3"><div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <div className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-7 w-36 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`top-product-${index}`} className="rounded-xl border border-slate-200 p-3">
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`sale-item-${index}`} className="flex items-center justify-between">
                  <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

function EditorLoading() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="space-y-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_260px]">
            <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-40 w-full animate-pulse rounded-xl bg-slate-200" />
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </article>
      </section>

      <aside className="space-y-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-9 w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-2 h-9 w-full animate-pulse rounded-xl bg-slate-200" />
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-36 w-full animate-pulse rounded-xl bg-slate-200" />
        </article>
      </aside>
    </div>
  );
}

function SettingsLoading() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={`tab-${index}`} className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
        ))}
      </div>
      <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-[65%] animate-pulse rounded bg-slate-200" />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`field-${index}`} className="space-y-2">
            <div className="h-3.5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}

function SliderLoading() {
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={`slide-${index}`} className="rounded-2xl border border-slate-200 p-4">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-2">
              <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-20 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-10 w-[88%] animate-pulse rounded-xl bg-slate-200" />
            </div>
            <div className="route-loading-shimmer h-40 overflow-hidden rounded-xl bg-slate-200" />
          </div>
        </article>
      ))}
      <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
    </section>
  );
}

function TaxonomyLoading() {
  return (
    <div className="space-y-5">
      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="h-7 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`taxonomy-form-${index}`} className="h-10 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`taxonomy-item-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                  <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function TicketsLoading() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={`ticket-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="h-5 w-[48%] animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-[75%] animate-pulse rounded bg-slate-200" />
            <div className="mt-3 flex gap-2">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function resolveLoadingContent(pathname: string) {
  if (pathname === "/dashboard") return <DashboardOverviewLoading />;

  if (pathname.startsWith("/dashboard/settings")) return <SettingsLoading />;
  if (pathname.startsWith("/dashboard/slider")) return <SliderLoading />;
  if (pathname.startsWith("/dashboard/help-tickets")) return <TicketsLoading />;
  if (
    pathname.startsWith("/dashboard/store/categories") ||
    pathname.startsWith("/dashboard/categories") ||
    pathname.startsWith("/dashboard/tags")
  ) {
    return <TaxonomyLoading />;
  }
  if (
    pathname.startsWith("/dashboard/products/new") ||
    pathname.startsWith("/dashboard/products/by-slug/") ||
    pathname.startsWith("/dashboard/products/") ||
    pathname.startsWith("/dashboard/pages/new") ||
    pathname.startsWith("/dashboard/pages/by-slug/") ||
    pathname.startsWith("/dashboard/pages/") ||
    pathname.startsWith("/dashboard/users/") ||
    pathname.startsWith("/dashboard/orders/") ||
    pathname.startsWith("/dashboard/media/new") ||
    pathname.startsWith("/dashboard/media/")
  ) {
    return <EditorLoading />;
  }

  const table = TABLE_CONFIGS[pathname];
  if (table) return <TableLoading config={table} />;

  return <TableLoading config={TABLE_CONFIGS["/dashboard/products"]} />;
}

export default function DashboardLoading() {
  const pathname = usePathname();

  return (
    <main className="admin-theme min-h-screen bg-[var(--admin-app-bg)] px-4 py-5 md:px-8 md:py-7">
      <div className="route-loading-shimmer mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-200/90" />
      <div className="mb-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-header-bg)] p-5">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-[56%] animate-pulse rounded bg-slate-200" />
      </div>

      {resolveLoadingContent(pathname || "/dashboard")}
    </main>
  );
}

