import type {
  DashboardPayload,
  HeadlineItem,
  OfficialRound,
  SourceMeeting,
  StandingsSummary,
  WeatherSummary
} from "@/lib/dashboard/contracts";
import { calendarOverrides } from "@/data/calendar-overrides";
import { getCircuitMetadata } from "@/data/circuit-metadata";
import { buildMeetingState } from "@/lib/server/calendar/normalize-calendar";

export interface DashboardDeps {
  now: string;
  fetchOfficialCalendar: (year: number) => Promise<OfficialRound[]>;
  fetchOpenF1Sessions: (year: number) => Promise<SourceMeeting[]>;
  fetchWeekendWeather: (
    lat: number,
    lon: number,
    start: string,
    end: string
  ) => Promise<WeatherSummary>;
  fetchStandings: () => Promise<StandingsSummary>;
  fetchHeadlines: () => Promise<HeadlineItem[]>;
}

function staleWeather(): WeatherSummary {
  return {
    summary: "Weather unavailable",
    rainChancePercent: 0,
    temperatureC: null,
    sessions: [],
    stale: true
  };
}

function staleStandings(): StandingsSummary {
  return {
    drivers: [],
    constructors: [],
    stale: true
  };
}

export async function buildDashboardPayload(
  deps: DashboardDeps
): Promise<DashboardPayload> {
  const year = new Date(deps.now).getUTCFullYear();
  const meetingState = buildMeetingState({
    now: deps.now,
    officialRounds: await deps.fetchOfficialCalendar(year),
    openf1Meetings: await deps.fetchOpenF1Sessions(year),
    overrides: calendarOverrides
  });

  const [weatherResult, standingsResult, headlinesResult] = await Promise.allSettled([
    deps.fetchWeekendWeather(
      meetingState.meeting.lat,
      meetingState.meeting.lon,
      meetingState.meeting.start,
      meetingState.meeting.end
    ),
    deps.fetchStandings(),
    deps.fetchHeadlines()
  ]);

  const trackMetadata = getCircuitMetadata(meetingState.meeting.slug);

  return {
    mode: meetingState.mode,
    updatedAt: deps.now,
    stale: false,
    meeting: meetingState.meeting,
    highlightSession: meetingState.highlightSession,
    schedule: meetingState.meeting.sessions,
    track: {
      svgPath: `/api/track/${meetingState.meeting.slug}`,
      lengthKm: trackMetadata?.lengthKm ?? null,
      laps: trackMetadata?.laps ?? null,
      lapRecord: trackMetadata?.lapRecord ?? null,
      lapRecordHolder: trackMetadata?.lapRecordHolder ?? null
    },
    weather:
      weatherResult.status === "fulfilled" ? weatherResult.value : staleWeather(),
    standingsSummary:
      standingsResult.status === "fulfilled"
        ? standingsResult.value
        : staleStandings(),
    headlines:
      headlinesResult.status === "fulfilled" ? headlinesResult.value : []
  };
}
