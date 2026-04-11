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
