import { AppShell } from "@/components/AppShell";
import { ConstituencyLanding } from "@/components/ConstituencyLanding";
import { getLandingData } from "@/lib/landing";

export const dynamic = "force-static";

export default function PattikondaPage() {
  return (
    <AppShell>
      <ConstituencyLanding data={getLandingData("pattikonda")} />
    </AppShell>
  );
}
