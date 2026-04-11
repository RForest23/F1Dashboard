import { NextResponse } from "next/server";
import { fetchOfficialCalendar } from "@/lib/server/calendar/fetch-official-calendar";
import { fetchOpenF1Sessions } from "@/lib/server/calendar/fetch-openf1-sessions";
import { buildDashboardPayload } from "@/lib/server/dashboard/build-dashboard";
import { fetchHeadlines } from "@/lib/server/news/fetch-headlines";
import { fetchStandings } from "@/lib/server/standings/fetch-standings";
import { fetchWeekendWeather } from "@/lib/server/weather/fetch-weekend-weather";

export async function GET() {
  const payload = await buildDashboardPayload({
    now: new Date().toISOString(),
    fetchOfficialCalendar,
    fetchOpenF1Sessions,
    fetchWeekendWeather,
    fetchStandings,
    fetchHeadlines
  });

  return NextResponse.json(payload, {
    headers: {
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300"
    }
  });
}
