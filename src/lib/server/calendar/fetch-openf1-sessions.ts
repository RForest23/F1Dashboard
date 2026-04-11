import type { SourceMeeting, SourceSession } from "@/lib/dashboard/contracts";
import { calendarOverrides } from "@/data/calendar-overrides";
import { getCircuitMetadata } from "@/data/circuit-metadata";
import { fetchJson } from "@/lib/server/http";
import { sortByStart } from "@/lib/dashboard/time";

interface OpenF1Session {
  meeting_key: number;
  country_name: string;
  location: string;
  circuit_short_name: string;
  session_name: string;
  date_start: string;
  date_end: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveMeetingSlug(session: OpenF1Session, year: number): string {
  const aliasCandidates = [
    session.circuit_short_name,
    session.location,
    session.country_name
  ];

  for (const candidate of aliasCandidates) {
    const alias = calendarOverrides.meetingAliases[candidate.toLowerCase()];
    if (alias) {
      return alias;
    }
  }

  return `${slugify(session.country_name)}-${year}`;
}

export function groupSessionsIntoMeetings(
  sessions: OpenF1Session[],
  year: number
): SourceMeeting[] {
  const meetingsMap = new Map<
    number,
    Omit<SourceMeeting, "sessions" | "start" | "end"> & { sessions: SourceSession[] }
  >();

  for (const session of sessions) {
    const slug = resolveMeetingSlug(session, year);
    const metadata = getCircuitMetadata(slug);

    if (!meetingsMap.has(session.meeting_key)) {
      meetingsMap.set(session.meeting_key, {
        slug,
        name: `${session.country_name} Grand Prix`,
        circuitName: metadata?.circuitName ?? session.circuit_short_name,
        location: metadata?.location ?? session.location,
        countryCode: metadata?.countryCode ?? slugify(session.country_name).slice(0, 2).toUpperCase(),
        lat: metadata?.lat ?? 0,
        lon: metadata?.lon ?? 0,
        sessions: []
      });
    }

    meetingsMap.get(session.meeting_key)?.sessions.push({
      name: session.session_name,
      start: session.date_start,
      end: session.date_end
    });
  }

  return Array.from(meetingsMap.values())
    .map((meeting) => {
      const sortedSessions = sortByStart(meeting.sessions);

      return {
        ...meeting,
        sessions: sortedSessions,
        start: sortedSessions[0]?.start ?? "",
        end: sortedSessions[sortedSessions.length - 1]?.end ?? ""
      };
    })
    .filter((meeting) => meeting.start && meeting.end)
    .sort((left, right) => left.start.localeCompare(right.start));
}

export async function fetchOpenF1Sessions(year: number): Promise<SourceMeeting[]> {
  const sessions = await fetchJson<OpenF1Session[]>(
    `https://api.openf1.org/v1/sessions?year=${year}`
  );

  return groupSessionsIntoMeetings(sessions, year);
}
