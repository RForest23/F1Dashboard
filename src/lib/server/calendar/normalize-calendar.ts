import type {
  CalendarOverrides,
  DashboardMeeting,
  DashboardSession,
  MeetingState,
  OfficialRound,
  SourceMeeting,
  SourceSession
} from "@/lib/dashboard/contracts";
import { isBefore, isWithinRange, sortByStart, toTimestamp } from "@/lib/dashboard/time";

interface BuildMeetingStateInput {
  now: string;
  officialRounds: OfficialRound[];
  openf1Meetings: SourceMeeting[];
  overrides: CalendarOverrides;
}

function decorateSessions(sessions: SourceSession[], now: string): DashboardSession[] {
  return sortByStart(sessions).map((session) => {
    let state: DashboardSession["state"] = "upcoming";

    if (isWithinRange(now, session.start, session.end)) {
      state = "current";
    } else if (!isBefore(now, session.start)) {
      state = "complete";
    }

    return {
      ...session,
      state
    };
  });
}

function pickHighlightSession(
  sessions: DashboardSession[],
  now: string
): DashboardSession {
  const current = sessions.find((session) => session.state === "current");
  if (current) {
    return current;
  }

  const next = sessions.find((session) => isBefore(now, session.start));
  return next ?? sessions[sessions.length - 1];
}

function decorateMeeting(meeting: SourceMeeting, now: string): DashboardMeeting {
  const sessions = decorateSessions(meeting.sessions, now);

  return {
    ...meeting,
    sessions
  };
}

export function buildMeetingState(input: BuildMeetingStateInput): MeetingState {
  const allowedRoundSlugs = new Set(
    input.officialRounds
      .filter((round) => round.status === "scheduled")
      .filter((round) => !input.overrides.cancelledRoundSlugs.includes(round.slug))
      .map((round) => round.slug)
  );

  const candidateMeetings = input.openf1Meetings
    .filter((meeting) => allowedRoundSlugs.has(meeting.slug))
    .sort((left, right) => toTimestamp(left.start) - toTimestamp(right.start));

  const current = candidateMeetings.find((meeting) =>
    isWithinRange(input.now, meeting.start, meeting.end)
  );

  const selected =
    current ??
    candidateMeetings.find((meeting) => isBefore(input.now, meeting.start)) ??
    candidateMeetings[candidateMeetings.length - 1];

  if (!selected) {
    throw new Error("No valid meeting available");
  }

  const decoratedMeeting = decorateMeeting(selected, input.now);

  return {
    mode: current ? "live" : "upcoming",
    meeting: decoratedMeeting,
    highlightSession: pickHighlightSession(decoratedMeeting.sessions, input.now)
  };
}
