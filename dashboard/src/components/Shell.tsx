"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/mandals", label: "Mandals" },
  { href: "/villages", label: "Villages" },
  { href: "/sources", label: "Sources" },
  { href: "/documents", label: "Documents" },
  { href: "/review", label: "Review" },
  { href: "/export", label: "Export" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 bg-[var(--sidebar)] text-white">
          <div className="border-b border-white/10 px-5 py-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
              Internal admin
            </p>
            <h1 className="mt-2 font-serif text-2xl leading-tight text-white">
              Kurupam
              <span className="block text-lg font-normal text-white/70">Data collection</span>
            </h1>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-white text-[var(--brand-black)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="px-5 pb-6 pt-10 text-xs leading-5 text-white/40">
            Public site APIs return approved records only. Pending extracts stay internal.
          </p>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[var(--border)] bg-white/80 px-8 py-4 backdrop-blur">
            <p className="text-sm text-[var(--muted)]">
              Kurupam constituency sources (district + villagecodes.in)
            </p>
            <p className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs text-[var(--foreground)]">
              No invented facts · provenance required
            </p>
          </header>
          <main className="px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
