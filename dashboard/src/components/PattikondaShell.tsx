"use client";

import { ConstituencyShell } from "@/components/ConstituencyShell";

export function PattikondaShell({ children }: { children: React.ReactNode }) {
  return (
    <ConstituencyShell basePath="/pattikonda" label="Pattikonda">
      {children}
    </ConstituencyShell>
  );
}
