"use client";

import PillNav from "@/components/PillNav/PillNav";
import { BRAND } from "@/lib/colors";
import {
  CONSTITUENCIES,
  constituencyFromPath,
  getConstituencyMeta,
  overviewHref,
  resolveSectionHref,
  sectionNav,
} from "@/lib/constituencies";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

function ConstituencyList({
  activeId,
  onSelect,
}: {
  activeId: ReturnType<typeof constituencyFromPath>;
  onSelect: () => void;
}) {
  return (
    <nav aria-label="Constituencies">
      <ul className="space-y-1">
        {CONSTITUENCIES.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <Link
                href={overviewHref(c.basePath)}
                aria-current={active ? "page" : undefined}
                onClick={onSelect}
                className={`flex flex-col rounded-lg px-3 py-2.5 transition ${
                  active
                    ? "bg-[var(--brand-black)] text-white"
                    : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                <span className="text-sm font-semibold">{c.name}</span>
                <span className={`mt-0.5 text-[11px] ${active ? "text-white/60" : "text-[var(--muted)]"}`}>
                  AC {c.assemblyNo} {c.reservation} · {c.district}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeId = constituencyFromPath(pathname);
  const meta = getConstituencyMeta(activeId);
  const navItems = sectionNav(meta);
  const activeHref = resolveSectionHref(pathname, navItems);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-5">
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] py-1 pl-1 pr-3 text-left text-[var(--foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green)] active:scale-[0.98]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/kurupam-logo.svg"
              alt=""
              className="h-8 w-8 rounded-full bg-[var(--surface-muted)] object-cover"
            />
            <span className="hidden text-[13px] font-semibold leading-tight sm:block">
              Constituency Explorer
            </span>
            <span className="text-[13px] font-semibold sm:hidden">Explorer</span>
          </button>

          <div className="hidden min-w-0 flex-1 min-[769px]:block">
            <PillNav
              logo="/kurupam-logo.svg"
              logoAlt={`${meta.name} overview`}
              items={navItems}
              activeHref={activeHref}
              ease="power2.easeOut"
              baseColor={BRAND.black}
              pillColor={BRAND.white}
              pillTextColor={BRAND.black}
              hoveredPillTextColor={BRAND.black}
              activeDotColor={BRAND.green}
              initialLoadAnimation={false}
              hideLogo
            />
          </div>
        </div>
        <nav
          aria-label="Sections"
          className="flex gap-1 overflow-x-auto px-3 pb-2.5 min-[769px]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 shrink-0 rounded-full px-3 py-2 text-[13px] font-semibold whitespace-nowrap ${
                  active
                    ? "bg-[var(--brand-black)] text-white"
                    : "bg-[var(--surface-muted)] text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] flex">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--overlay)]"
            aria-label="Close constituency list"
            onClick={() => setOpen(false)}
          />
          <aside
            id={panelId}
            className="relative z-[61] flex h-full w-[min(18rem,88vw)] flex-col border-r border-[var(--border)] bg-white shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">Constituencies</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ConstituencyList activeId={activeId} onSelect={() => setOpen(false)} />
            </div>
            <p className="border-t border-[var(--border)] px-4 py-3 text-[11px] text-[var(--muted)]">
              {meta.name} · AC {meta.assemblyNo} {meta.reservation} · {meta.district}
            </p>
          </aside>
        </div>
      ) : null}

      <main id="main-content" className="min-w-0 px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
