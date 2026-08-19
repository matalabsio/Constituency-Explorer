"use client";

import { ConstituencyShell } from "@/components/ConstituencyShell";

export function DhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <ConstituencyShell basePath="/dhone" label="Dhone">
      {children}
    </ConstituencyShell>
  );
}
