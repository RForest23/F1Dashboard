import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { fetchOfficialCalendar } from "@/lib/server/calendar/fetch-official-calendar";
import { fetchOpenF1Sessions } from "@/lib/server/calendar/fetch-openf1-sessions";
import { buildDashboardPayload } from "@/lib/server/dashboard/build-dashboard";
import { fetchHeadlines } from "@/lib/server/news/fetch-headlines";
import { fetchStandings } from "@/lib/server/standings/fetch-standings";
import { fetchWeekendWeather } from "@/lib/server/weather/fetch-weekend-weather";

export default async function HomePage() {
  const payload = await buildDashboardPayload({
    now: new Date().toISOString(),
    fetchOfficialCalendar,
    fetchOpenF1Sessions,
    fetchWeekendWeather,
    fetchStandings,
    fetchHeadlines
  });

  return <DashboardShell payload={payload} />;
}
