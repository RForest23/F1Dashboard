import type { WeatherSummary } from "@/lib/dashboard/contracts";
import { fetchJson } from "@/lib/server/http";

interface OpenMeteoForecast {
  hourly?: {
    precipitation_probability?: number[];
    temperature_2m?: number[];
  };
}

function summarizeWeather(forecast: OpenMeteoForecast): Omit<WeatherSummary, "stale"> {
  const rainSeries = forecast.hourly?.precipitation_probability ?? [];
  const temperatureSeries = forecast.hourly?.temperature_2m ?? [];
  const rainChancePercent = rainSeries.length ? Math.max(...rainSeries) : 0;
  const averageTemperature = temperatureSeries.length
    ? Number(
        (
          temperatureSeries.reduce((sum, value) => sum + value, 0) /
          temperatureSeries.length
        ).toFixed(1)
      )
    : null;

  let summary = "Stable weekend conditions";

  if (rainChancePercent >= 50) {
    summary = "Rain threat building";
  } else if (averageTemperature !== null && averageTemperature >= 30) {
    summary = "Hot and likely dry";
  } else if (averageTemperature !== null && averageTemperature <= 15) {
    summary = "Cool conditions";
  }

  return {
    summary,
    rainChancePercent,
    temperatureC: averageTemperature,
    sessions: []
  };
}

export async function fetchWeekendWeather(
  lat: number,
  lon: number,
  start: string,
  end: string
): Promise<WeatherSummary> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "precipitation_probability,temperature_2m",
    timezone: "auto",
    start_date: start.slice(0, 10),
    end_date: end.slice(0, 10)
  });

  const forecast = await fetchJson<OpenMeteoForecast>(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  return {
    ...summarizeWeather(forecast),
    stale: false
  };
}
