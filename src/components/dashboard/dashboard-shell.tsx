import type { DashboardPayload } from "@/lib/dashboard/contracts";
import { HeroRacePanel } from "./hero-race-panel";
import { PaddockFeed } from "./paddock-feed";
import { StandingsPanel } from "./standings-panel";
import { TrackMapPanel } from "./track-map-panel";
import { WeatherPanel } from "./weather-panel";
import { WeekendTimeline } from "./weekend-timeline";

export function DashboardShell({ payload }: { payload: DashboardPayload }) {
  return (
    <main className="dashboard-frame">
      <HeroRacePanel payload={payload} />

      <section className="dashboard-main">
        <TrackMapPanel meeting={payload.meeting} track={payload.track} />
        <WeekendTimeline schedule={payload.schedule} />
        <div className="dashboard-side">
          <WeatherPanel mode={payload.mode} weather={payload.weather} />
          <StandingsPanel standings={payload.standingsSummary} />
        </div>
      </section>

      <PaddockFeed headlines={payload.headlines} />
    </main>
  );
}
