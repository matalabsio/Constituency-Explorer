"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { focusRing } from "@/app/dhone/ui";

export function ConstituencyShell({
  basePath,
  label,
  children,
}: {
  basePath: string;
  label: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = [
    { label: "Overview", href: basePath },
    { label: "Mandals", href: `${basePath}/mandals` },
    { label: "Villages", href: `${basePath}/villages` },
    { label: "Booths", href: `${basePath}/booths` },
  ];

  const active =
    pathname === basePath
      ? basePath
      : nav.find((item) => item.href !== basePath && pathname.startsWith(item.href))?.href ?? basePath;

  return (
    <AppShell>
      <nav aria-label={`${label} pages`} className="mb-8 -mt-1">
        <ul className="scrollbar-thin flex gap-1 overflow-x-auto border-b border-[var(--border)]">
          {nav.map((item) => {
            const isActive = item.href === active;
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex cursor-pointer items-center border-b-2 px-4 py-2.5 text-sm font-medium transition ${focusRing} ${
                    isActive
                      ? "border-[var(--brand-green)] text-[var(--foreground)]"
                      : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {children}
    </AppShell>
  );
}
