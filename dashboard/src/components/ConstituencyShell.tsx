"use client";

import { AppShell } from "@/components/AppShell";

export function ConstituencyShell({
  children,
}: {
  basePath?: string;
  label?: string;
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
