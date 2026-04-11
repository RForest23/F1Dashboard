import { describe, expect, it } from "vitest";
import { buildMeetingState } from "./normalize-calendar";

describe("buildMeetingState", () => {
  it("skips cancelled meetings even if session data exists", () => {
    const result = buildMeetingState({
      now: "2026-04-11T12:00:00.000Z",
      officialRounds: [
        { slug: "miami-2026", name: "Miami Grand Prix", status: "scheduled" }
      ],
      openf1Meetings: [
        {
          slug: "bahrain-2026",
          name: "Bahrain Grand Prix",
          circuitName: "Bahrain International Circuit",
          location: "Sakhir",
          countryCode: "BH",
          lat: 26.0325,
          lon: 50.5106,
          start: "2026-04-10T11:30:00.000Z",
          end: "2026-04-12T16:00:00.000Z",
          sessions: []
        },
        {
          slug: "miami-2026",
          name: "Miami Grand Prix",
          circuitName: "Miami International Autodrome",
          location: "Miami Gardens",
          countryCode: "US",
          lat: 25.9581,
          lon: -80.2389,
          start: "2026-05-01T16:30:00.000Z",
          end: "2026-05-03T21:30:00.000Z",
          sessions: [
            {
              name: "Practice 1",
              start: "2026-05-01T16:30:00.000Z",
              end: "2026-05-01T17:30:00.000Z"
            }
          ]
        }
      ],
      overrides: {
        cancelledRoundSlugs: ["bahrain-2026", "saudi-arabia-2026"],
        meetingAliases: {}
      }
    });

    expect(result.meeting.slug).toBe("miami-2026");
    expect(result.mode).toBe("upcoming");
  });

  it("switches to live mode for an active weekend", () => {
    const result = buildMeetingState({
      now: "2026-05-02T18:00:00.000Z",
      officialRounds: [
        { slug: "miami-2026", name: "Miami Grand Prix", status: "scheduled" }
      ],
      openf1Meetings: [
        {
          slug: "miami-2026",
          name: "Miami Grand Prix",
          circuitName: "Miami International Autodrome",
          location: "Miami Gardens",
          countryCode: "US",
          lat: 25.9581,
          lon: -80.2389,
          start: "2026-05-01T16:30:00.000Z",
          end: "2026-05-03T21:30:00.000Z",
          sessions: [
            {
              name: "Sprint",
              start: "2026-05-02T16:00:00.000Z",
              end: "2026-05-02T17:00:00.000Z"
            },
            {
              name: "Qualifying",
              start: "2026-05-02T20:00:00.000Z",
              end: "2026-05-02T21:00:00.000Z"
            }
          ]
        }
      ],
      overrides: {
        cancelledRoundSlugs: [],
        meetingAliases: {}
      }
    });

    expect(result.mode).toBe("live");
    expect(result.highlightSession.name).toBe("Qualifying");
    expect(result.meeting.sessions[0].state).toBe("complete");
    expect(result.meeting.sessions[1].state).toBe("upcoming");
  });
});
