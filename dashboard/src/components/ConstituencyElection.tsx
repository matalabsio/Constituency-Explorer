import { Card, CardBody, DataTableShell, FieldGrid, MiniStat, MiniStatGrid } from "@/components/ui";
import { BRAND } from "@/lib/colors";
import { formatNumber } from "@/lib/mandals";
import type { ConstituencyElections, ConstituencyProfile } from "@/lib/queries";

export function ConstituencyProfilePanel({ profile }: { profile: ConstituencyProfile }) {
  return (
    <Card accent={BRAND.green}>
      <CardBody>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">Administrative profile</h3>
            <p className="mt-1 mb-5 text-sm text-[var(--muted)]">
              {profile.district} · {profile.lokSabhaSegment} Lok Sabha segment
            </p>
            <FieldGrid
              fields={[
                { label: "Reservation", value: profile.reservation },
                { label: "District", value: profile.district },
                { label: "Lok Sabha segment", value: profile.lokSabhaSegment },
                { label: "PIN code (Kurupam HQ)", value: profile.postalCode },
                {
                  label: "Nearest town",
                  value:
                    profile.nearestTown && profile.nearestTownKm
                      ? `${profile.nearestTown} (~${profile.nearestTownKm} km)`
                      : profile.nearestTown,
                },
                { label: "Rivers", value: profile.rivers.join(", ") || null },
              ]}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">Electorate landscape</h3>
            <p className="mt-1 mb-5 text-sm text-[var(--muted)]">
              Agency tracts across five revenue mandals
            </p>
            <MiniStatGrid>
              {profile.ruralElectorPct != null ? (
                <MiniStat label="Rural electors" value={`${profile.ruralElectorPct}%`} />
              ) : null}
              {profile.stElectorConcentrationPct != null ? (
                <MiniStat label="ST concentration" value={`${profile.stElectorConcentrationPct}%`} />
              ) : null}
              <MiniStat label="Mandals included" value={profile.includedMandals.length} />
            </MiniStatGrid>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.includedMandals.map((mandal) => (
                <li
                  key={mandal}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                >
                  {mandal}
                </li>
              ))}
            </ul>
            {profile.borderNotes ? (
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{profile.borderNotes}</p>
            ) : null}
            {profile.heritage ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                <span className="font-medium text-[var(--foreground)]">Heritage:</span> {profile.heritage}
              </p>
            ) : null}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function ElectionHistoryPanel({
  elections,
  constituencyName,
}: {
  elections: ConstituencyElections["elections"];
  constituencyName: string;
}) {
  return (
    <Card accent={BRAND.red}>
      <CardBody className="p-0 sm:p-0">
        <DataTableShell>
          <table className="data-table w-full min-w-[40rem] text-sm">
            <thead>
              <tr>
                <th>Year</th>
                <th className="text-right">Registered voters</th>
                <th className="text-right">Turnout</th>
                <th className="text-right">Votes polled</th>
                <th>Winner</th>
                <th>Runner-up</th>
                <th className="text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {elections.map((election) => (
                <tr key={election.year}>
                  <td className="font-semibold tabular-nums">{election.year}</td>
                  <td className="text-right tabular-nums">
                    {formatNumber(election.totalRegisteredVoters)}
                  </td>
                  <td className="text-right tabular-nums">{election.turnoutPct.toFixed(2)}%</td>
                  <td className="text-right tabular-nums">{formatNumber(election.votesPolled)}</td>
                  <td>
                    <span className="font-medium text-[var(--foreground)]">{election.winner.name}</span>
                    <span className="ml-1.5 text-xs text-[var(--muted)]">
                      ({election.winner.party}) · {formatNumber(election.winner.votes)}
                    </span>
                  </td>
                  <td>
                    <span className="font-medium text-[var(--foreground)]">{election.runnerUp.name}</span>
                    <span className="ml-1.5 text-xs text-[var(--muted)]">
                      ({election.runnerUp.party}) · {formatNumber(election.runnerUp.votes)}
                    </span>
                  </td>
                  <td className="text-right tabular-nums font-medium text-[var(--accent)]">
                    {formatNumber(election.victoryMargin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableShell>
        <p className="border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--muted)]">
          {constituencyName} assembly election history · sources include IndiaVotes and Wikipedia
        </p>
      </CardBody>
    </Card>
  );
}
