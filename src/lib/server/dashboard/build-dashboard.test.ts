import { describe, expect, it, vi } from "vitest";
import { buildDashboardPayload } from "./build-dashboard";

describe("buildDashboardPayload", () => {
  it("returns weather, standings, and headlines alongside the selected meeting", async () => {
    const payload = await buildDashboardPayload({
      now: "2026-04-11T12:00:00.000Z",
      fetchOfficialCalendar: vi.fn().mockResolvedValue([
        { slug: "miami-2026", name: "Miami Grand Prix", status: "scheduled" }
      ]),
      fetchOpenF1Sessions: vi.fn().mockResolvedValue([
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
      ]),
      fetchWeekendWeather: vi.fn().mockResolvedValue({
        summary: "Warm",
        rainChancePercent: 22,
        sessions: [],
        stale: false
      }),
      fetchStandings: vi.fn().mockResolvedValue({
        drivers: [{ position: 1, name: "Lando Norris", points: 62 }],
        constructors: []
      }),
      fetchHeadlines: vi.fn().mockResolvedValue([
        { title: "McLaren leads build-up", url: "https://example.com" }
      ])
    });

    expect(payload.weather.rainChancePercent).toBe(22);
    expect(payload.standingsSummary.drivers[0].name).toBe("Lando Norris");
    expect(payload.headlines[0].title).toContain("McLaren");
    expect(payload.track.svgPath).toBe("/api/track/miami-2026");
  });

  it("marks optional sections stale instead of throwing when one source fails", async () => {
    const payload = await buildDashboardPayload({
      now: "2026-04-11T12:00:00.000Z",
      fetchOfficialCalendar: vi.fn().mockResolvedValue([
        { slug: "miami-2026", name: "Miami Grand Prix", status: "scheduled" }
      ]),
      fetchOpenF1Sessions: vi.fn().mockResolvedValue([
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
      ]),
      fetchWeekendWeather: vi
        .fn()
        .mockRejectedValue(new Error("weather unavailable")),
      fetchStandings: vi.fn().mockResolvedValue({
        drivers: [],
        constructors: []
      }),
      fetchHeadlines: vi.fn().mockResolvedValue([])
    });

    expect(payload.weather.stale).toBe(true);
    expect(payload.stale).toBe(false);
    expect(payload.headlines).toEqual([]);
  });
});
