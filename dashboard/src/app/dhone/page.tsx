import { AppShell } from "@/components/AppShell";
import { ConstituencyLanding } from "@/components/ConstituencyLanding";
import { getLandingData } from "@/lib/landing";

export default function DhonePage() {
  return (
    <AppShell>
      <ConstituencyLanding data={getLandingData("dhone")} />
    </AppShell>
  );
}
