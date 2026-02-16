import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-[90%] max-w-[1440px] gap-8 py-10 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-lg font-bold text-slate-900">BLI Shop</p>
          <p className="max-w-sm text-sm text-slate-600">
            Platforme moderne per shopping online me dizajn te paster dhe eksperience te shpejte.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Navigation
          </p>
          <ul className="space-y-2">
            {footerLinks.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm text-slate-700 transition hover:text-slate-900">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</p>
          <p className="text-sm text-slate-700">support@bli.al</p>
          <p className="text-sm text-slate-700">+355 69 123 4567</p>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        (c) {new Date().getFullYear()} BLI Shop. All rights reserved.
      </div>
    </footer>
  );
}
