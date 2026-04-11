import type { DashboardMode, WeatherSummary } from "@/lib/dashboard/contracts";

function WeatherIcon({ kind }: { kind: "rain" | "temp" }) {
  if (kind === "rain") {
    return (
      <svg aria-hidden="true" className="metric-icon" viewBox="0 0 24 24">
        <path
          d="M12 3c3.4 4.3 5.1 7.2 5.1 9A5.1 5.1 0 0 1 7 12c0-1.8 1.7-4.7 5-9Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="metric-icon" viewBox="0 0 24 24">
      <path
        d="M10 5a2 2 0 1 1 4 0v8.4a4.5 4.5 0 1 1-4 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 10.2v6.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="17.7" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function WeatherPanel({
  weather,
  mode
}: {
  weather: WeatherSummary;
  mode: DashboardMode;
}) {
  return (
    <section className="panel weather-panel">
      <div className="section-eyebrow">Weekend Weather</div>
      <div className="weather-summary">{weather.summary}</div>
      <div className="weather-grid">
        <div className="weather-metric">
          <div className="metric-label">Rain chance</div>
          <div className="metric-value">
            <WeatherIcon kind="rain" />
            <span>{weather.rainChancePercent}%</span>
          </div>
        </div>
        <div className="weather-metric">
          <div className="metric-label">Temperature</div>
          <div className="metric-value">
            <WeatherIcon kind="temp" />
            <span>
              {weather.temperatureC !== null && weather.temperatureC !== undefined
                ? `${weather.temperatureC}°C`
                : "TBC"}
            </span>
          </div>
        </div>
      </div>
      <p className="support-copy">
        {weather.stale
          ? "Forecast window has not opened yet, so this panel stays in a pending state."
          : mode === "live"
            ? "Session-state view keeps the rain risk in context for the current weekend."
            : "Weekend outlook focuses on race-week conditions and rain risk."}
      </p>
    </section>
  );
}
