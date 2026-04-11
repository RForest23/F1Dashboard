import type { DashboardMode, WeatherSummary } from "@/lib/dashboard/contracts";

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
        <div>
          <div className="metric-label">Rain chance</div>
          <div className="metric-value">{weather.rainChancePercent}%</div>
        </div>
        <div>
          <div className="metric-label">Temperature</div>
          <div className="metric-value">
            {weather.temperatureC !== null && weather.temperatureC !== undefined
              ? `${weather.temperatureC}°C`
              : "TBC"}
          </div>
        </div>
      </div>
      <p className="support-copy">
        {weather.stale
          ? "Weather feed is stale, keeping the rest of the dashboard live."
          : mode === "live"
            ? "Session-state view keeps the rain risk in context for the current weekend."
            : "Weekend outlook focuses on race-week conditions and rain risk."}
      </p>
    </section>
  );
}
