import type { CSSProperties } from "react";
import type { StandingsSummary } from "@/lib/dashboard/contracts";

const teamColors: Record<string, string> = {
  McLaren: "#ff8000",
  Ferrari: "#dc0000",
  Mercedes: "#00d2be",
  "Red Bull Racing": "#1e5bc6",
  Williams: "#005aff",
  Alpine: "#ff87bc",
  "Aston Martin": "#006f62",
  Haas: "#b6babd",
  RB: "#6692ff",
  Sauber: "#00e701"
};

const driverTeamColors: Record<string, string> = {
  "Lando Norris": teamColors.McLaren,
  "Oscar Piastri": teamColors.McLaren,
  "Charles Leclerc": teamColors.Ferrari,
  "Lewis Hamilton": teamColors.Ferrari,
  "George Russell": teamColors.Mercedes,
  "Kimi Antonelli": teamColors.Mercedes,
  "Max Verstappen": teamColors["Red Bull Racing"],
  "Yuki Tsunoda": teamColors["Red Bull Racing"],
  "Fernando Alonso": teamColors["Aston Martin"],
  "Lance Stroll": teamColors["Aston Martin"],
  "Pierre Gasly": teamColors.Alpine,
  "Jack Doohan": teamColors.Alpine,
  "Alex Albon": teamColors.Williams,
  "Carlos Sainz": teamColors.Williams,
  "Esteban Ocon": teamColors.Haas,
  "Oliver Bearman": teamColors.Haas,
  "Liam Lawson": teamColors.RB,
  "Isack Hadjar": teamColors.RB,
  "Nico Hulkenberg": teamColors.Sauber,
  "Gabriel Bortoleto": teamColors.Sauber
};

function getConstructorColor(name: string) {
  return teamColors[name] ?? "#5b5b5b";
}

function getDriverColor(name: string) {
  return driverTeamColors[name] ?? "#5b5b5b";
}

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
              <li
                key={`driver-${entry.position}`}
                style={{ "--team-accent": getDriverColor(entry.name) } as CSSProperties}
              >
                <span className="standings-entry-name">{entry.name}</span>
                <strong>{entry.points}</strong>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2>Constructors</h2>
          <ol>
            {standings.constructors.map((entry) => (
              <li
                key={`constructor-${entry.position}`}
                style={
                  { "--team-accent": getConstructorColor(entry.name) } as CSSProperties
                }
              >
                <span className="standings-entry-name">{entry.name}</span>
                <strong>{entry.points}</strong>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {standings.stale ? (
        <p className="support-copy">
          Standings feed unavailable, panel kept as a shell.
        </p>
      ) : null}
    </section>
  );
}
