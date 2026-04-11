# F1 Dashboard Live Redesign Design

## Summary

Redesign `F1Dashboard` from a single static HTML page into a lightweight Vercel-hosted dashboard with a thin server layer that normalizes multiple F1 data sources for a `2560x720` Xeneon Edge display. The new version should automatically switch between upcoming-race and active-weekend modes, exclude cancelled events, generate sharp SVG track maps from data, and surface weather, standings, and current news without making the display noisy or fragile.

## Problem Statement

The current dashboard mixes presentation, source selection, and fallback logic inside one `index.html` file. It can fetch OpenF1 session data, but it still relies on local metadata and static PNG track maps. This has a few concrete failures:

- The selected "next race" can be wrong when a round is cancelled or withdrawn.
- The "Paddock Feed" is not a real current-news feed.
- The dashboard does not adapt its layout or emphasis for an active race weekend.
- Track maps are manually maintained raster assets instead of generated display-quality vectors.

## Goals

- Show the correct next valid Grand Prix at all times.
- Automatically switch to the current race weekend when a valid event is active.
- Preserve the countdown and weekend schedule as primary dashboard features.
- Add a compact weather forecast with rain chance for the active or upcoming weekend.
- Add compact driver and constructor standings.
- Replace static track images with generated SVG outlines based on circuit data.
- Keep the output compatible with a public web URL loaded through the iCue Xeneon widget.
- Keep the UI readable and visually calm on a `2560x720` display with a slight widget border.

## Non-Goals

- Full live timing parity with the official F1 app.
- A general-purpose mobile or desktop responsive product.
- Historical results browsing or deep statistics beyond the display summary.
- Rich interactive controls beyond possible future toggles for debug or preview use.

## Constraints

- The dashboard must be reachable through a public URL.
- The final rendering target is a wide, low-height display surface.
- Multiple data sources are allowed, but the frontend should consume a normalized internal API rather than calling everything directly.
- The system should degrade gracefully when one source fails.

## Source Strategy

Use multiple sources, but hide that complexity behind a server-side normalization layer.

### Source of Truth by Domain

- Calendar validity and event presence: official Formula 1 race/calendar pages when possible.
- Session structure and active-weekend detail: OpenF1.
- Weather and rain chance: Open-Meteo.
- Standings: dedicated standings source if OpenF1 is insufficient.
- Headlines: current F1 news source with short headline extraction and cache.
- Track geometry: circuit data source capable of producing SVG outlines.

### Source Normalization Rules

- Cancelled, withdrawn, or invalidated rounds must be removed at the server layer.
- Frontend components must render normalized meeting/session models only.
- Every normalized payload must include freshness metadata and degraded-state flags.

## Proposed Architecture

### Hosting

- Deploy the dashboard on Vercel.
- Serve one public dashboard route suitable for the Xeneon widget.
- Use Vercel serverless functions or route handlers for data aggregation and caching.

### Application Layers

1. Display frontend
   - Renders the dashboard at `2560x720` with safe-area padding for the widget border.
   - Polls a small number of internal endpoints or a single aggregated dashboard endpoint.
   - Does not contain raw source-specific business logic.

2. Server-side aggregation layer
   - Fetches calendar, session, weather, standings, news, and circuit data.
   - Filters cancelled rounds.
   - Computes display mode and countdown targets.
   - Generates or caches track SVGs.
   - Returns one normalized dashboard payload.

3. Cache layer
   - Uses server-side caching to keep the dashboard fast and avoid repeated upstream calls.
   - Allows partial stale responses when one upstream source is degraded.

## Display State Model

The dashboard has two automatic display modes.

### Upcoming Mode

Use when no valid race weekend is currently active.

Primary content:

- Next valid Grand Prix name and location.
- Countdown to the race or primary next session.
- Full weekend schedule.
- Generated track outline and core circuit stats.
- Weekend weather summary with rain chance.
- Compact driver and constructor standings.
- Rotating paddock/news feed based on current headlines.

### Live Weekend Mode

Use when a valid race weekend is in progress, or when the event has become the primary active meeting based on server-side logic.

Primary content:

- Current weekend name and location.
- Current or next important session state, such as `FP2 Live`, `Qualifying in 2h`, or `Race Tomorrow`.
- Countdown retargeted to the most important upcoming session while preserving race-day visibility.
- Weekend schedule with completed/current/upcoming visual states.
- Session-aware weather emphasis for the next meaningful session.
- Compact standings and current news feed retained in secondary panels.

### Mode Resolution Rules

- If a valid meeting is active, show that meeting.
- If no valid meeting is active, show the next valid meeting.
- Once the final session of the active meeting ends, automatically roll forward to the next valid meeting.
- Cancelled or withdrawn events must never be selected, even if source sessions exist elsewhere.

## Frontend Component Model

Build the display from a small set of focused components.

### HeroRacePanel

- Race name, circuit, state label, countdown, and highlighted session.
- Primary focal point in both modes.

### WeekendTimeline

- Ordered session list for the active or upcoming meeting.
- Status styling for completed, current, and upcoming sessions.

### TrackMapPanel

- SVG circuit outline.
- Circuit length, lap count, lap record, and record holder.

### WeatherPanel

- Weekend summary forecast.
- Rain chance emphasis for the next important session.

### StandingsPanel

- Compact top driver standings.
- Compact top constructor standings.
- Designed to be glanceable from distance.

### PaddockFeed

- Rotating current headlines from normalized news data.
- No placeholder synthetic text unless all sources fail.

### StatusBar

- Last updated time.
- Optional stale/degraded data indicator.

## Normalized Data Contract

Expose a primary `dashboard` payload that already contains the computed state for the page.

```json
{
  "mode": "upcoming",
  "updatedAt": "2026-04-11T12:34:56.000Z",
  "stale": false,
  "meeting": {
    "id": "miami-2026",
    "name": "Miami Grand Prix",
    "location": "Miami",
    "circuitName": "Miami International Autodrome",
    "countryCode": "US",
    "status": "scheduled",
    "start": "2026-05-01T16:30:00.000Z",
    "end": "2026-05-03T21:00:00.000Z"
  },
  "highlightSession": {
    "name": "Practice 1",
    "state": "upcoming",
    "start": "2026-05-01T16:30:00.000Z",
    "end": "2026-05-01T17:30:00.000Z"
  },
  "countdownTarget": {
    "label": "Race Start",
    "time": "2026-05-03T20:00:00.000Z"
  },
  "schedule": [],
  "track": {
    "svgPath": "/api/track/miami-2026.svg",
    "lengthKm": "5.412",
    "laps": 57,
    "lapRecord": "1:29.708",
    "lapRecordHolder": "Max Verstappen (2023)"
  },
  "weather": {
    "summary": "Warm and humid",
    "rainChancePercent": 28,
    "sessions": []
  },
  "standingsSummary": {
    "drivers": [],
    "constructors": []
  },
  "headlines": [],
  "sources": {
    "calendar": "official-f1",
    "sessions": "openf1",
    "weather": "open-meteo",
    "standings": "selected-during-planning",
    "news": "selected-during-planning"
  }
}
```

The exact wire format can evolve during implementation, but the frontend should continue to receive one normalized payload with meeting, session, weather, track, standings, headlines, and freshness information.

## Track Map Generation

Replace local PNG track images with generated SVG outlines.

### First-Pass Requirements

- Use clean schematic outlines rather than detailed corner labels.
- Generate vector output so the circuit remains sharp on the display.
- Cache generated SVGs by circuit identifier.
- Allow a manual metadata override for naming mismatches between sources.

### Fallback Rules

- If geometry fetch fails, return the last cached SVG.
- If no SVG has ever been generated for the circuit, render a styled fallback panel instead of a broken image.
- Missing geometry must not break the rest of the dashboard.

## Weather Model

Weather should be compact and display-oriented.

### Required Fields

- Overall weekend summary.
- Temperature range or representative temperature.
- Rain chance percentage.
- Session-aware forecast for the next important session.

### Presentation Rules

- Upcoming mode emphasizes weekend outlook.
- Live mode emphasizes the next important session and race-day risk.

## Standings Model

Standings are supporting context, not the hero.

### Required Fields

- Top driver positions with name and points.
- Top constructor positions with name and points.

### Presentation Rules

- Keep the panel compact.
- Prefer top 5 or top 6, not full table mode, on the default layout.
- Mark the panel stale rather than removing it if the standings source fails.

## News Feed

Replace the current static message rotation with a real headline feed.

### Requirements

- Use short current headlines from an F1-focused source.
- Rotate through several recent headlines.
- Cache headlines for stability.
- Mark the feed stale if the news source fails, while preserving the last successful headlines.

## Caching and Refresh Strategy

Use different cache windows per data type.

- Calendar and circuit metadata: long cache with manual override support.
- Session state: short cache suitable for weekend updates.
- Weather: moderate cache.
- Standings: moderate cache.
- News: moderate cache with fallback to last known good items.

The frontend should refresh on a steady cadence, but not so aggressively that it causes visible flicker or upstream strain.

## Failure Handling

Failures must degrade locally, not globally.

### Calendar Failure

- Keep showing the last valid normalized meeting.
- Mark the dashboard stale.

### Session Failure

- Preserve the selected meeting and schedule from cache.
- Downgrade live-state accuracy gracefully.

### Weather Failure

- Hide or soften forecast details.
- Keep the rest of the dashboard intact.

### Standings Failure

- Keep the standings panel shell.
- Show stale or unavailable state instead of removing the panel entirely.

### News Failure

- Keep cached headlines if available.
- Fall back to a small unavailable state if not.

### Track Generation Failure

- Serve cached SVG if available.
- Otherwise show a styled placeholder card.

## Visual Direction

Keep the red-and-black motorsport tone, but make it feel more alive without becoming cluttered.

- Preserve strong countdown prominence.
- Add clearer hierarchy between hero content and supporting panels.
- Use motion sparingly for status transitions, countdown, and headline rotation.
- Design specifically for wide-format readability at distance.
- Build in safe-area padding to account for the widget border.

## Implementation Notes

- The existing repo is currently a static single-page build.
- The redesign likely warrants a small app structure rather than continuing to grow one large HTML file.
- Migration should prioritize data correctness first, then visual refinement.
- Manual metadata overrides should remain possible for naming mismatches, source gaps, and exceptional calendar changes.

## Open Decisions to Resolve During Planning

- Exact standings/news source selection.
- Exact circuit geometry source and normalization method.
- Final frontend framework choice for the Vercel app.
- Exact cache durations and revalidation strategy.

## Success Criteria

- The dashboard no longer selects cancelled rounds as the next race.
- The dashboard automatically enters active-weekend mode when a valid event is underway.
- Countdown and schedule remain clear and reliable.
- Track maps are generated from data and render as SVG.
- Weather, standings, and current headlines appear without overwhelming the display.
- The final dashboard is stable when loaded as a public web URL in the iCue Xeneon widget.
