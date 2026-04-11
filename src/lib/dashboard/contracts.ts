export type DashboardMode = "upcoming" | "live";

export type SessionState = "complete" | "current" | "upcoming";

export interface DashboardSession {
  name: string;
  start: string;
  end: string;
  state: SessionState;
}

export interface DashboardMeeting {
  slug: string;
  name: string;
  circuitName: string;
  location: string;
  countryCode: string;
  lat: number;
  lon: number;
  start: string;
  end: string;
  sessions: DashboardSession[];
}

export interface OfficialRound {
  slug: string;
  name: string;
  status: "scheduled" | "cancelled";
}

export interface SourceSession {
  name: string;
  start: string;
  end: string;
}

export interface SourceMeeting {
  slug: string;
  name: string;
  circuitName: string;
  location: string;
  countryCode: string;
  lat: number;
  lon: number;
  start: string;
  end: string;
  sessions: SourceSession[];
}

export interface CalendarOverrides {
  cancelledRoundSlugs: string[];
  meetingAliases: Record<string, string>;
}

export interface MeetingState {
  mode: DashboardMode;
  meeting: DashboardMeeting;
  highlightSession: DashboardSession;
}

export interface TrackSummary {
  svgPath: string;
  lengthKm: string | null;
  laps: number | null;
  lapRecord: string | null;
  lapRecordHolder: string | null;
}

export interface WeatherSummary {
  summary: string;
  rainChancePercent: number;
  temperatureC?: number | null;
  sessions: Array<{
    label: string;
    rainChancePercent: number;
    temperatureC: number | null;
  }>;
  stale: boolean;
}

export interface StandingsEntry {
  position: number;
  name: string;
  points: number;
}

export interface StandingsSummary {
  drivers: StandingsEntry[];
  constructors: StandingsEntry[];
  stale: boolean;
}

export interface HeadlineItem {
  title: string;
  url: string;
}

export interface DashboardPayload {
  mode: DashboardMode;
  updatedAt: string;
  stale: boolean;
  meeting: DashboardMeeting;
  highlightSession: DashboardSession;
  schedule: DashboardSession[];
  track: TrackSummary;
  weather: WeatherSummary;
  standingsSummary: StandingsSummary;
  headlines: HeadlineItem[];
}
