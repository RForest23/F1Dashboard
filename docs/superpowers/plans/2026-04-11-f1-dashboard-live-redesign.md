# F1 Dashboard Live Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current static F1 dashboard into a Vercel-hosted Next.js app that shows the correct active or upcoming weekend, adds weather, standings, and current news, and generates SVG track maps from data for the Xeneon Edge display.

**Architecture:** Replace the single `index.html` page with a small Next.js App Router application. Put all source-specific logic behind server-side adapters and one normalized dashboard route, then render a wide-screen display shell from that single payload. Keep circuit geometry local in the repo after an import step so runtime rendering stays fast and deterministic.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Playwright, Zod, Cheerio, OpenF1, Open-Meteo, Formula1.com scraping, F1 API standings endpoint, vendored GeoJSON circuit data.

---

## File Structure

### Runtime App

- Create: `package.json` for scripts and dependencies
- Create: `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/app/api/dashboard/route.ts`
- Create: `src/app/api/track/[meetingId]/route.ts`

### Frontend Components

- Create: `src/components/dashboard/dashboard-shell.tsx`
- Create: `src/components/dashboard/hero-race-panel.tsx`
- Create: `src/components/dashboard/weekend-timeline.tsx`
- Create: `src/components/dashboard/track-map-panel.tsx`
- Create: `src/components/dashboard/weather-panel.tsx`
- Create: `src/components/dashboard/standings-panel.tsx`
- Create: `src/components/dashboard/paddock-feed.tsx`
- Create: `src/components/dashboard/status-bar.tsx`

### Shared Domain Model

- Create: `src/lib/dashboard/contracts.ts`
- Create: `src/lib/dashboard/time.ts`
- Create: `src/lib/dashboard/format.ts`

### Server Adapters

- Create: `src/lib/server/http.ts`
- Create: `src/lib/server/cache.ts`
- Create: `src/lib/server/calendar/fetch-official-calendar.ts`
- Create: `src/lib/server/calendar/fetch-openf1-sessions.ts`
- Create: `src/lib/server/calendar/normalize-calendar.ts`
- Create: `src/lib/server/weather/fetch-weekend-weather.ts`
- Create: `src/lib/server/standings/fetch-standings.ts`
- Create: `src/lib/server/news/fetch-headlines.ts`
- Create: `src/lib/server/track/build-track-svg.ts`
- Create: `src/lib/server/dashboard/build-dashboard.ts`

### Repo Data

- Create: `src/data/calendar-overrides.ts`
- Create: `src/data/circuit-metadata.ts`
- Create: `src/data/track-geometry.json`
- Create: `scripts/sync-track-geometry.mjs`

### Tests

- Create: `src/lib/server/calendar/normalize-calendar.test.ts`
- Create: `src/lib/server/dashboard/build-dashboard.test.ts`
- Create: `src/lib/server/track/build-track-svg.test.ts`
- Create: `src/app/page.test.tsx`
- Create: `tests/dashboard.spec.ts`

### Legacy Reference

- Leave `index.html` and `assets/tracks/*` untouched until the new app passes local verification.
- Delete or archive the legacy static page only in the final cleanup task after Vercel preview verification succeeds.

## Task 1: Bootstrap The Next.js App Shell And Test Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `.gitignore`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `src/app/page.test.tsx`

- [ ] **Step 1: Write the initial page smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the dashboard heading", () => {
    render(<HomePage />);

    expect(screen.getByText("F1 Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Loading race state")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create the app scaffold and test tooling**

```json
{
  "name": "f1-dashboard",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "next lint"
  },
  "dependencies": {
    "cheerio": "^1.0.0",
    "clsx": "^2.1.1",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.6.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
```

- [ ] **Step 3: Run the page smoke test and verify it fails**

Run: `npm run test -- src/app/page.test.tsx`

Expected: FAIL with `Cannot find module './page'` or equivalent missing-file error.

- [ ] **Step 4: Implement the minimal Next.js layout and page shell**

```tsx
// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>F1 Dashboard</h1>
      <p>Loading race state</p>
    </main>
  );
}
```

```css
/* src/app/globals.css */
:root {
  color-scheme: dark;
  --bg: #070707;
  --panel: #121212;
  --line: #2a2a2a;
  --text: #f2f2f2;
  --muted: #9d9d9d;
  --accent: #e10600;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: "Segoe UI", system-ui, sans-serif;
}
```

- [ ] **Step 5: Run unit tests and verify they pass**

Run: `npm run test -- src/app/page.test.tsx`

Expected: PASS with `1 passed`.

- [ ] **Step 6: Commit the scaffold**

```bash
git add package.json tsconfig.json next.config.ts vitest.config.ts vitest.setup.ts playwright.config.ts .gitignore src/app/layout.tsx src/app/page.tsx src/app/globals.css src/app/page.test.tsx
git commit -m "feat: scaffold next dashboard app"
```

## Task 2: Build Calendar Normalization And Weekend Selection

**Files:**
- Create: `src/lib/dashboard/contracts.ts`
- Create: `src/lib/dashboard/time.ts`
- Create: `src/lib/server/http.ts`
- Create: `src/lib/server/cache.ts`
- Create: `src/lib/server/calendar/fetch-official-calendar.ts`
- Create: `src/lib/server/calendar/fetch-openf1-sessions.ts`
- Create: `src/lib/server/calendar/normalize-calendar.ts`
- Create: `src/data/calendar-overrides.ts`
- Create: `src/data/circuit-metadata.ts`
- Test: `src/lib/server/calendar/normalize-calendar.test.ts`

- [ ] **Step 1: Write failing tests for cancelled-round filtering and mode selection**

```ts
import { describe, expect, it, vi } from "vitest";
import { buildMeetingState } from "./normalize-calendar";

describe("buildMeetingState", () => {
  it("skips cancelled meetings even if session data exists", () => {
    const result = buildMeetingState({
      now: "2026-04-11T12:00:00.000Z",
      officialRounds: [
        { slug: "miami-2026", name: "Miami Grand Prix", status: "scheduled" }
      ],
      openf1Meetings: [
        { slug: "bahrain-2026", name: "Bahrain Grand Prix", status: "scheduled" },
        { slug: "miami-2026", name: "Miami Grand Prix", status: "scheduled" }
      ],
      overrides: {
        cancelledRoundSlugs: ["bahrain-2026", "saudi-arabia-2026"]
      }
    });

    expect(result.meeting.slug).toBe("miami-2026");
    expect(result.mode).toBe("upcoming");
  });

  it("switches to live mode for an active weekend", () => {
    const result = buildMeetingState({
      now: "2026-05-02T18:00:00.000Z",
      officialRounds: [{ slug: "miami-2026", name: "Miami Grand Prix", status: "scheduled" }],
      openf1Meetings: [
        {
          slug: "miami-2026",
          name: "Miami Grand Prix",
          sessions: [
            {
              name: "Qualifying",
              start: "2026-05-02T20:00:00.000Z",
              end: "2026-05-02T21:00:00.000Z"
            }
          ]
        }
      ],
      overrides: { cancelledRoundSlugs: [] }
    });

    expect(result.mode).toBe("live");
    expect(result.highlightSession.name).toBe("Qualifying");
  });
});
```

- [ ] **Step 2: Run the normalization tests and verify they fail**

Run: `npm run test -- src/lib/server/calendar/normalize-calendar.test.ts`

Expected: FAIL with `Cannot find module './normalize-calendar'`.

- [ ] **Step 3: Implement shared contracts, overrides, and normalization logic**

```ts
// src/data/calendar-overrides.ts
export const calendarOverrides = {
  cancelledRoundSlugs: ["bahrain-2026", "saudi-arabia-2026"],
  meetingAliases: {
    "miami-international-autodrome": "miami-2026",
    "albert-park-circuit": "australia-2026"
  }
} as const;
```

```ts
// src/lib/dashboard/contracts.ts
export type DashboardMode = "upcoming" | "live";

export interface DashboardSession {
  name: string;
  state: "complete" | "current" | "upcoming";
  start: string;
  end: string;
}

export interface DashboardMeeting {
  slug: string;
  name: string;
  circuitName: string;
  location: string;
  countryCode: string;
  start: string;
  end: string;
}
```

```ts
// src/lib/server/calendar/normalize-calendar.ts
export function buildMeetingState(input: BuildMeetingStateInput) {
  const allowedRounds = new Set(
    input.officialRounds
      .filter((round) => !input.overrides.cancelledRoundSlugs.includes(round.slug))
      .map((round) => round.slug)
  );

  const candidateMeetings = input.openf1Meetings
    .filter((meeting) => allowedRounds.has(meeting.slug))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  const current = candidateMeetings.find(
    (meeting) => Date.parse(input.now) >= Date.parse(meeting.start) && Date.parse(input.now) <= Date.parse(meeting.end)
  );

  const selected = current ?? candidateMeetings.find((meeting) => Date.parse(input.now) < Date.parse(meeting.start));
  if (!selected) {
    throw new Error("No valid meeting available");
  }

  return {
    mode: current ? "live" : "upcoming",
    meeting: selected,
    highlightSession: pickHighlightSession(selected, input.now)
  };
}
```

- [ ] **Step 4: Add source fetch wrappers with stable parsing boundaries**

```ts
// src/lib/server/calendar/fetch-official-calendar.ts
import * as cheerio from "cheerio";

export async function fetchOfficialCalendar(year: number) {
  const html = await fetchText(`https://www.formula1.com/en/racing/${year}`);
  const $ = cheerio.load(html);

  return $("[data-testid='race-listing-card']").map((_, card) => {
    const link = $(card).find("a").attr("href") ?? "";
    const slug = link.split("/").filter(Boolean).pop() ?? "";

    return {
      slug: `${slug}-${year}`,
      name: $(card).find("[data-testid='event-name']").text().trim(),
      status: "scheduled"
    };
  }).get();
}
```

```ts
// src/lib/server/calendar/fetch-openf1-sessions.ts
export async function fetchOpenF1Sessions(year: number) {
  const json = await fetchJson(`https://api.openf1.org/v1/sessions?year=${year}`);
  return groupSessionsIntoMeetings(json);
}
```

- [ ] **Step 5: Run normalization tests and verify they pass**

Run: `npm run test -- src/lib/server/calendar/normalize-calendar.test.ts`

Expected: PASS with both tests green.

- [ ] **Step 6: Commit the calendar work**

```bash
git add src/lib/dashboard/contracts.ts src/lib/dashboard/time.ts src/lib/server/http.ts src/lib/server/cache.ts src/lib/server/calendar/fetch-official-calendar.ts src/lib/server/calendar/fetch-openf1-sessions.ts src/lib/server/calendar/normalize-calendar.ts src/data/calendar-overrides.ts src/data/circuit-metadata.ts src/lib/server/calendar/normalize-calendar.test.ts
git commit -m "feat: normalize calendar and active weekend state"
```

## Task 3: Add Track Geometry Import And SVG Rendering

**Files:**
- Create: `scripts/sync-track-geometry.mjs`
- Create: `src/data/track-geometry.json`
- Create: `src/lib/server/track/build-track-svg.ts`
- Create: `src/app/api/track/[meetingId]/route.ts`
- Test: `src/lib/server/track/build-track-svg.test.ts`

- [ ] **Step 1: Write the failing SVG generation test**

```ts
import { describe, expect, it } from "vitest";
import { buildTrackSvg } from "./build-track-svg";

describe("buildTrackSvg", () => {
  it("returns a viewBox-fitted SVG path for a meeting", () => {
    const svg = buildTrackSvg({
      slug: "miami-2026",
      coordinates: [
        [-80.238, 25.958],
        [-80.237, 25.959],
        [-80.236, 25.958]
      ]
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("viewBox=");
    expect(svg).toContain("<path");
  });
});
```

- [ ] **Step 2: Run the track test and verify it fails**

Run: `npm run test -- src/lib/server/track/build-track-svg.test.ts`

Expected: FAIL with missing-module error.

- [ ] **Step 3: Add the geometry sync script and local data store**

```js
// scripts/sync-track-geometry.mjs
import fs from "node:fs/promises";

const SOURCE_URL =
  "https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson";

const response = await fetch(SOURCE_URL);
const geojson = await response.json();

const reduced = geojson.features.map((feature) => ({
  slug: feature.properties?.slug,
  name: feature.properties?.Name,
  grandPrix: feature.properties?.["Grand Prix"],
  coordinates: feature.geometry?.coordinates?.[0] ?? []
}));

await fs.mkdir("src/data", { recursive: true });
await fs.writeFile("src/data/track-geometry.json", JSON.stringify(reduced, null, 2));
```

- [ ] **Step 4: Implement the SVG builder and route handler**

```ts
// src/lib/server/track/build-track-svg.ts
export function buildTrackSvg(track: { slug: string; coordinates: [number, number][] }) {
  const points = normalizeCoordinates(track.coordinates);
  const pathData = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560" fill="none">',
    '<rect width="1000" height="560" rx="32" fill="#0f0f0f" />',
    `<path d="${pathData}" stroke="#f3f3f3" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />`,
    "</svg>"
  ].join("");
}
```

```ts
// src/app/api/track/[meetingId]/route.ts
import { NextResponse } from "next/server";
import { buildTrackSvg } from "@/lib/server/track/build-track-svg";
import geometry from "@/data/track-geometry.json";

export async function GET(_: Request, context: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await context.params;
  const track = geometry.find((entry) => entry.slug === meetingId);

  if (!track) {
    return new NextResponse("Track not found", { status: 404 });
  }

  return new NextResponse(buildTrackSvg(track), {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800"
    }
  });
}
```

- [ ] **Step 5: Run the unit test and confirm it passes**

Run: `npm run test -- src/lib/server/track/build-track-svg.test.ts`

Expected: PASS with `1 passed`.

- [ ] **Step 6: Commit the track rendering layer**

```bash
git add scripts/sync-track-geometry.mjs src/data/track-geometry.json src/lib/server/track/build-track-svg.ts src/app/api/track/[meetingId]/route.ts src/lib/server/track/build-track-svg.test.ts
git commit -m "feat: generate cached svg track maps"
```

## Task 4: Aggregate Weather, Standings, News, And Dashboard State

**Files:**
- Create: `src/lib/server/weather/fetch-weekend-weather.ts`
- Create: `src/lib/server/standings/fetch-standings.ts`
- Create: `src/lib/server/news/fetch-headlines.ts`
- Create: `src/lib/server/dashboard/build-dashboard.ts`
- Create: `src/app/api/dashboard/route.ts`
- Test: `src/lib/server/dashboard/build-dashboard.test.ts`

- [ ] **Step 1: Write the failing aggregator tests**

```ts
import { describe, expect, it, vi } from "vitest";
import { buildDashboardPayload } from "./build-dashboard";

describe("buildDashboardPayload", () => {
  it("returns weather, standings, and headlines alongside the selected meeting", async () => {
    const payload = await buildDashboardPayload({
      now: "2026-04-11T12:00:00.000Z",
      fetchOfficialCalendar: vi.fn(),
      fetchOpenF1Sessions: vi.fn(),
      fetchWeekendWeather: vi.fn().mockResolvedValue({ summary: "Warm", rainChancePercent: 22 }),
      fetchStandings: vi.fn().mockResolvedValue({ drivers: [{ position: 1, name: "Norris", points: 62 }], constructors: [] }),
      fetchHeadlines: vi.fn().mockResolvedValue([{ title: "McLaren leads build-up", url: "https://example.com" }])
    });

    expect(payload.weather.rainChancePercent).toBe(22);
    expect(payload.standingsSummary.drivers[0].name).toBe("Norris");
    expect(payload.headlines[0].title).toContain("McLaren");
  });

  it("marks optional sections stale instead of throwing when one source fails", async () => {
    const payload = await buildDashboardPayload({
      now: "2026-04-11T12:00:00.000Z",
      fetchOfficialCalendar: vi.fn(),
      fetchOpenF1Sessions: vi.fn(),
      fetchWeekendWeather: vi.fn().mockRejectedValue(new Error("weather unavailable")),
      fetchStandings: vi.fn().mockResolvedValue({ drivers: [], constructors: [] }),
      fetchHeadlines: vi.fn().mockResolvedValue([])
    });

    expect(payload.weather.stale).toBe(true);
    expect(payload.stale).toBe(false);
  });
});
```

- [ ] **Step 2: Run the aggregator test and verify it fails**

Run: `npm run test -- src/lib/server/dashboard/build-dashboard.test.ts`

Expected: FAIL with missing-module error.

- [ ] **Step 3: Implement the source adapters**

```ts
// src/lib/server/weather/fetch-weekend-weather.ts
export async function fetchWeekendWeather(lat: number, lon: number, start: string, end: string) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "precipitation_probability,temperature_2m",
    timezone: "Europe/London",
    start_date: start.slice(0, 10),
    end_date: end.slice(0, 10)
  });

  const json = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  return summarizeWeather(json);
}
```

```ts
// src/lib/server/standings/fetch-standings.ts
export async function fetchStandings() {
  const [drivers, constructors] = await Promise.all([
    fetchJson("https://f1api.dev/api/current/drivers-championship?limit=5"),
    fetchJson("https://f1api.dev/api/current/constructors-championship?limit=5")
  ]);

  return {
    drivers: drivers.drivers_championship.map((entry: any) => ({
      position: entry.position,
      name: `${entry.driver.name} ${entry.driver.surname}`,
      points: entry.points
    })),
    constructors: constructors.constructors_championship.map((entry: any) => ({
      position: entry.position,
      name: entry.team.teamName,
      points: entry.points
    }))
  };
}
```

```ts
// src/lib/server/news/fetch-headlines.ts
import * as cheerio from "cheerio";

export async function fetchHeadlines() {
  const html = await fetchText("https://www.formula1.com/en/latest/all.html");
  const $ = cheerio.load(html);

  return $("a[href*='/en/latest/article']")
    .slice(0, 6)
    .map((_, node) => ({
      title: $(node).text().trim(),
      url: new URL($(node).attr("href")!, "https://www.formula1.com").toString()
    }))
    .get();
}
```

- [ ] **Step 4: Implement the dashboard builder and route**

```ts
// src/lib/server/dashboard/build-dashboard.ts
export async function buildDashboardPayload(deps: DashboardDeps) {
  const meetingState = buildMeetingState({
    now: deps.now,
    officialRounds: await deps.fetchOfficialCalendar(2026),
    openf1Meetings: await deps.fetchOpenF1Sessions(2026),
    overrides: calendarOverrides
  });

  const [weatherResult, standingsResult, headlinesResult] = await Promise.allSettled([
    deps.fetchWeekendWeather(meetingState.meeting.lat, meetingState.meeting.lon, meetingState.meeting.start, meetingState.meeting.end),
    deps.fetchStandings(),
    deps.fetchHeadlines()
  ]);

  return {
    mode: meetingState.mode,
    updatedAt: new Date(deps.now).toISOString(),
    stale: false,
    meeting: meetingState.meeting,
    highlightSession: meetingState.highlightSession,
    weather: settledWeather(weatherResult),
    standingsSummary: settledStandings(standingsResult),
    headlines: settledHeadlines(headlinesResult)
  };
}
```

```ts
// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server";

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
```

- [ ] **Step 5: Run the dashboard tests and confirm they pass**

Run: `npm run test -- src/lib/server/dashboard/build-dashboard.test.ts`

Expected: PASS with both tests green.

- [ ] **Step 6: Commit the aggregation layer**

```bash
git add src/lib/server/weather/fetch-weekend-weather.ts src/lib/server/standings/fetch-standings.ts src/lib/server/news/fetch-headlines.ts src/lib/server/dashboard/build-dashboard.ts src/app/api/dashboard/route.ts src/lib/server/dashboard/build-dashboard.test.ts
git commit -m "feat: aggregate dashboard data sources"
```

## Task 5: Build The Xeneon-Optimized Frontend And Mode-Specific Panels

**Files:**
- Create: `src/components/dashboard/dashboard-shell.tsx`
- Create: `src/components/dashboard/hero-race-panel.tsx`
- Create: `src/components/dashboard/weekend-timeline.tsx`
- Create: `src/components/dashboard/track-map-panel.tsx`
- Create: `src/components/dashboard/weather-panel.tsx`
- Create: `src/components/dashboard/standings-panel.tsx`
- Create: `src/components/dashboard/paddock-feed.tsx`
- Create: `src/components/dashboard/status-bar.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Test: `src/app/page.test.tsx`

- [ ] **Step 1: Expand the page test to assert key dashboard regions**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the core dashboard regions", async () => {
    render(await HomePage());

    expect(screen.getByText("Paddock Feed")).toBeInTheDocument();
    expect(screen.getByText("Weekend Schedule")).toBeInTheDocument();
    expect(screen.getByText("Standings")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the page test and verify it fails**

Run: `npm run test -- src/app/page.test.tsx`

Expected: FAIL because the new panel labels do not exist yet.

- [ ] **Step 3: Implement the server-rendered page and dashboard shell**

```tsx
// src/app/page.tsx
export default async function HomePage() {
  const payload = await getDashboardPayload();

  return <DashboardShell payload={payload} />;
}
```

```tsx
// src/components/dashboard/dashboard-shell.tsx
export function DashboardShell({ payload }: { payload: DashboardPayload }) {
  return (
    <main className="dashboard-frame">
      <HeroRacePanel payload={payload} />
      <section className="dashboard-main">
        <TrackMapPanel track={payload.track} meeting={payload.meeting} />
        <WeekendTimeline schedule={payload.schedule} />
        <WeatherPanel weather={payload.weather} mode={payload.mode} />
        <StandingsPanel standings={payload.standingsSummary} />
      </section>
      <PaddockFeed headlines={payload.headlines} />
      <StatusBar updatedAt={payload.updatedAt} stale={payload.stale} />
    </main>
  );
}
```

- [ ] **Step 4: Implement wide-screen-safe styling and live/upcoming visual states**

```css
/* src/app/globals.css */
.dashboard-frame {
  height: 100vh;
  padding: 18px 22px;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  gap: 12px;
  background:
    radial-gradient(circle at top left, rgba(225, 6, 0, 0.18), transparent 28%),
    linear-gradient(180deg, #080808, #050505);
}

.dashboard-main {
  display: grid;
  grid-template-columns: 1.3fr 1fr 0.85fr;
  gap: 12px;
  min-height: 0;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(14, 14, 14, 0.94);
  min-height: 0;
}

.state-live {
  color: #ff5d5d;
}

.state-upcoming {
  color: #f2f2f2;
}
```

- [ ] **Step 5: Run page tests and a local browser smoke check**

Run: `npm run test -- src/app/page.test.tsx`

Expected: PASS.

Run: `npm run dev`

Expected: the dashboard loads at `http://localhost:3000` with hero, schedule, standings, and news regions visible on a `2560x720` viewport without vertical overflow.

- [ ] **Step 6: Commit the UI shell**

```bash
git add src/components/dashboard/dashboard-shell.tsx src/components/dashboard/hero-race-panel.tsx src/components/dashboard/weekend-timeline.tsx src/components/dashboard/track-map-panel.tsx src/components/dashboard/weather-panel.tsx src/components/dashboard/standings-panel.tsx src/components/dashboard/paddock-feed.tsx src/components/dashboard/status-bar.tsx src/app/page.tsx src/app/globals.css src/app/page.test.tsx
git commit -m "feat: build xeneon dashboard layout"
```

## Task 6: Verify End-To-End Behavior, Remove Legacy Assets, And Prepare Vercel Deployment

**Files:**
- Create: `tests/dashboard.spec.ts`
- Modify: `.gitignore`
- Delete: `index.html`
- Delete: `assets/tracks/*.png`
- Modify: `assets/tracks/README.md`

- [ ] **Step 1: Write the end-to-end smoke test**

```ts
import { expect, test } from "@playwright/test";

test("dashboard renders current race state and supporting panels", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Paddock Feed")).toBeVisible();
  await expect(page.getByText("Weekend Schedule")).toBeVisible();
  await expect(page.getByText("Standings")).toBeVisible();
  await expect(page.locator("img, svg")).toHaveCount(1);
});
```

- [ ] **Step 2: Run the e2e test and verify it fails before final cleanup**

Run: `npm run test:e2e -- tests/dashboard.spec.ts`

Expected: FAIL until the local app and API routes are wired together correctly.

- [ ] **Step 3: Make the last-mile fixes and archive the legacy implementation**

```md
<!-- assets/tracks/README.md -->
# Legacy Track Assets

The PNG files previously used by the static dashboard have been removed after the
Next.js dashboard switched to generated SVG track routes. Keep this folder only if
future fallback assets are intentionally reintroduced.
```

```gitignore
.next
node_modules
playwright-report
test-results
```

- [ ] **Step 4: Re-run the full verification set**

Run: `npm run test`

Expected: PASS for all Vitest suites.

Run: `npm run test:e2e -- tests/dashboard.spec.ts`

Expected: PASS for the dashboard smoke flow.

Run: `npm run build`

Expected: PASS with a production build suitable for Vercel deployment.

- [ ] **Step 5: Remove the legacy static page only after verification passes**

```bash
git rm index.html
git rm assets/tracks/*.png
git add assets/tracks/README.md .gitignore tests/dashboard.spec.ts
```

- [ ] **Step 6: Commit the deployment-ready migration**

```bash
git commit -m "feat: ship live xeneon dashboard"
```

## Self-Review Checklist

- Spec coverage:
  - Correct active/upcoming weekend selection is covered by Task 2 and Task 4.
  - Weather, standings, and headlines are covered by Task 4 and Task 5.
  - SVG track maps are covered by Task 3 and Task 5.
  - Xeneon-safe wide layout is covered by Task 5.
  - Graceful degradation is covered by Task 4.
- Placeholder scan:
  - No `TODO` or `TBD` markers remain in the tasks.
  - Every task includes exact files, commands, and code snippets.
- Type consistency:
  - Shared dashboard types are introduced in Task 2 before downstream usage in Tasks 4 and 5.
  - Track SVG route uses the `meetingId` slug introduced by the calendar normalization layer.
