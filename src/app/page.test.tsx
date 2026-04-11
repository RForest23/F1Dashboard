import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardPayload } from "@/lib/dashboard/contracts";

const mockPayload: DashboardPayload = {
  mode: "upcoming",
  updatedAt: "2026-04-11T12:00:00.000Z",
  stale: false,
  meeting: {
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
        end: "2026-05-01T17:30:00.000Z",
        state: "upcoming"
      }
    ]
  },
  highlightSession: {
    name: "Practice 1",
    start: "2026-05-01T16:30:00.000Z",
    end: "2026-05-01T17:30:00.000Z",
    state: "upcoming"
  },
  schedule: [
    {
      name: "Practice 1",
      start: "2026-05-01T16:30:00.000Z",
      end: "2026-05-01T17:30:00.000Z",
      state: "upcoming"
    }
  ],
  track: {
    svgPath: "/api/track/miami-2026",
    lengthKm: "5.412",
    laps: 57,
    lapRecord: "1:29.708",
    lapRecordHolder: "Max Verstappen (2023)"
  },
  weather: {
    summary: "Warm and humid",
    rainChancePercent: 22,
    temperatureC: 29,
    sessions: [],
    stale: false
  },
  standingsSummary: {
    drivers: [{ position: 1, name: "Lando Norris", points: 62 }],
    constructors: [{ position: 1, name: "McLaren", points: 108 }],
    stale: false
  },
  headlines: [{ title: "McLaren leads build-up", url: "https://example.com" }]
};

const buildDashboardPayload = vi.fn();

vi.mock("@/lib/server/dashboard/build-dashboard", () => ({
  buildDashboardPayload
}));

vi.mock("@/lib/server/calendar/fetch-official-calendar", () => ({
  fetchOfficialCalendar: vi.fn()
}));

vi.mock("@/lib/server/calendar/fetch-openf1-sessions", () => ({
  fetchOpenF1Sessions: vi.fn()
}));

vi.mock("@/lib/server/weather/fetch-weekend-weather", () => ({
  fetchWeekendWeather: vi.fn()
}));

vi.mock("@/lib/server/standings/fetch-standings", () => ({
  fetchStandings: vi.fn()
}));

vi.mock("@/lib/server/news/fetch-headlines", () => ({
  fetchHeadlines: vi.fn()
}));

describe("HomePage", () => {
  beforeEach(() => {
    buildDashboardPayload.mockResolvedValue(mockPayload);
  });

  it("renders the core dashboard regions", async () => {
    const { default: HomePage } = await import("./page");

    render(await HomePage());

    expect(screen.getByText("Paddock Feed")).toBeInTheDocument();
    expect(screen.getByText("Weekend Schedule")).toBeInTheDocument();
    expect(screen.getByText("Standings")).toBeInTheDocument();
  });
});
