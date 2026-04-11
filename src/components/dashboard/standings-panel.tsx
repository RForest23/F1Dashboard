import type { StandingsSummary } from "@/lib/dashboard/contracts";

export function StandingsPanel({
  standings
}: {
  standings: StandingsSummary;
}) {
  return (
    <section className="panel standings-panel">
      <div className="section-eyebrow">Standings</div>
      <div className="standings-columns">
        <div>
          <h2>Drivers</h2>
          <ol>
            {standings.drivers.map((entry) => (
              <li key={`driver-${entry.position}`}>
                <span>{entry.name}</span>
                <strong>{entry.points}</strong>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2>Constructors</h2>
          <ol>
            {standings.constructors.map((entry) => (
              <li key={`constructor-${entry.position}`}>
                <span>{entry.name}</span>
                <strong>{entry.points}</strong>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {standings.stale ? (
        <p className="support-copy">Standings feed unavailable, panel kept as a shell.</p>
      ) : null}
    </section>
  );
}
