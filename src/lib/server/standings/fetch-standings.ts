import type { StandingsSummary } from "@/lib/dashboard/contracts";
import { fetchJson } from "@/lib/server/http";

interface DriverStandingResponse {
  drivers_championship: Array<{
    position: number;
    points: number;
    driver: {
      name: string;
      surname: string;
    };
  }>;
}

interface ConstructorStandingResponse {
  constructors_championship: Array<{
    position: number;
    points: number;
    team: {
      teamName: string;
    };
  }>;
}

export async function fetchStandings(): Promise<StandingsSummary> {
  const [drivers, constructors] = await Promise.all([
    fetchJson<DriverStandingResponse>(
      "https://f1api.dev/api/current/drivers-championship?limit=5"
    ),
    fetchJson<ConstructorStandingResponse>(
      "https://f1api.dev/api/current/constructors-championship?limit=5"
    )
  ]);

  return {
    drivers: drivers.drivers_championship.map((entry) => ({
      position: entry.position,
      name: `${entry.driver.name} ${entry.driver.surname}`,
      points: entry.points
    })),
    constructors: constructors.constructors_championship.map((entry) => ({
      position: entry.position,
      name: entry.team.teamName,
      points: entry.points
    })),
    stale: false
  };
}
