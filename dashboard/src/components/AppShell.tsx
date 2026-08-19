"use client";

import PillNav from "@/components/PillNav/PillNav";
import { BRAND } from "@/lib/colors";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/" },
  { label: "Mandals", href: "/mandals" },
  { label: "Villages", href: "/villages" },
  { label: "Maps", href: "/maps" },
  { label: "Booths", href: "/booths" },
  { label: "Dhone", href: "/dhone" },
  { label: "Pattikonda", href: "/pattikonda" },
];

function resolveActiveHref(pathname: string): string {
  if (pathname === "/") return "/";
  const match = NAV_ITEMS.find(
    (item) => item.href !== "/" && (pathname === item.href || pathname.startsWith(`${item.href}/`))
  );
  return match?.href ?? pathname;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeHref = resolveActiveHref(pathname);

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {/* TDP flag stripe: yellow, red, green */}
      <div className="flex h-1 w-full shrink-0" aria-hidden="true">
        <div className="h-full flex-[2] bg-[var(--brand-yellow)]" />
        <div className="h-full flex-1 bg-[var(--brand-red)]" />
        <div className="h-full flex-[2] bg-[var(--brand-green)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <PillNav
            logo="/kurupam-logo.svg"
            logoAlt="Kurupam Constituency Explorer"
            items={NAV_ITEMS}
            activeHref={activeHref}
            ease="power2.easeOut"
            baseColor={BRAND.black}
            pillColor={BRAND.white}
            pillTextColor={BRAND.black}
            hoveredPillTextColor={BRAND.black}
            activeDotColor={BRAND.green}
            initialLoadAnimation
          />
          <p className="hidden text-right text-[11px] leading-snug text-[var(--muted)] sm:block">
            <span className="font-semibold text-[var(--foreground)]">
              {pathname.startsWith("/pattikonda")
                ? "Pattikonda (GEN)"
                : pathname.startsWith("/dhone")
                  ? "Dhone (GEN)"
                  : "Kurupam (ST)"}
            </span>
            <br />
            {pathname.startsWith("/pattikonda")
              ? "Kurnool"
              : pathname.startsWith("/dhone")
                ? "Nandyal"
                : "Parvathipuram Manyam"}
          </p>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
