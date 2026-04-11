export interface CircuitMetadata {
  slug: string;
  circuitName: string;
  location: string;
  countryCode: string;
  lat: number;
  lon: number;
  lengthKm?: string;
  laps?: number;
  lapRecord?: string;
  lapRecordHolder?: string;
}

export const circuitMetadataBySlug: Record<string, CircuitMetadata> = {
  "australia-2026": {
    slug: "australia-2026",
    circuitName: "Albert Park Circuit",
    location: "Melbourne",
    countryCode: "AU",
    lat: -37.8497,
    lon: 144.968,
    lengthKm: "5.278",
    laps: 58,
    lapRecord: "1:19.813",
    lapRecordHolder: "Charles Leclerc (2024)"
  },
  "china-2026": {
    slug: "china-2026",
    circuitName: "Shanghai International Circuit",
    location: "Shanghai",
    countryCode: "CN",
    lat: 31.3389,
    lon: 121.22
  },
  "japan-2026": {
    slug: "japan-2026",
    circuitName: "Suzuka Circuit",
    location: "Suzuka",
    countryCode: "JP",
    lat: 34.8431,
    lon: 136.5419,
    lengthKm: "5.807",
    laps: 53,
    lapRecord: "1:30.983",
    lapRecordHolder: "Lewis Hamilton (2019)"
  },
  "bahrain-2026": {
    slug: "bahrain-2026",
    circuitName: "Bahrain International Circuit",
    location: "Sakhir",
    countryCode: "BH",
    lat: 26.0325,
    lon: 50.5106
  },
  "saudi-arabia-2026": {
    slug: "saudi-arabia-2026",
    circuitName: "Jeddah Corniche Circuit",
    location: "Jeddah",
    countryCode: "SA",
    lat: 21.6319,
    lon: 39.1044
  },
  "miami-2026": {
    slug: "miami-2026",
    circuitName: "Miami International Autodrome",
    location: "Miami Gardens",
    countryCode: "US",
    lat: 25.9581,
    lon: -80.2389,
    lengthKm: "5.412",
    laps: 57,
    lapRecord: "1:29.708",
    lapRecordHolder: "Max Verstappen (2023)"
  },
  "canada-2026": {
    slug: "canada-2026",
    circuitName: "Circuit Gilles Villeneuve",
    location: "Montreal",
    countryCode: "CA",
    lat: 45.5006,
    lon: -73.5228
  },
  "monaco-2026": {
    slug: "monaco-2026",
    circuitName: "Circuit de Monaco",
    location: "Monte Carlo",
    countryCode: "MC",
    lat: 43.7347,
    lon: 7.4206
  },
  "austria-2026": {
    slug: "austria-2026",
    circuitName: "Red Bull Ring",
    location: "Spielberg",
    countryCode: "AT",
    lat: 47.2197,
    lon: 14.7647
  },
  "great-britain-2026": {
    slug: "great-britain-2026",
    circuitName: "Silverstone Circuit",
    location: "Silverstone",
    countryCode: "GB",
    lat: 52.0733,
    lon: -1.0147
  },
  "belgium-2026": {
    slug: "belgium-2026",
    circuitName: "Circuit de Spa-Francorchamps",
    location: "Stavelot",
    countryCode: "BE",
    lat: 50.4372,
    lon: 5.9714
  },
  "hungary-2026": {
    slug: "hungary-2026",
    circuitName: "Hungaroring",
    location: "Mogyorod",
    countryCode: "HU",
    lat: 47.5789,
    lon: 19.2486
  },
  "netherlands-2026": {
    slug: "netherlands-2026",
    circuitName: "Circuit Zandvoort",
    location: "Zandvoort",
    countryCode: "NL",
    lat: 52.3888,
    lon: 4.5409
  },
  "italy-2026": {
    slug: "italy-2026",
    circuitName: "Autodromo Nazionale Monza",
    location: "Monza",
    countryCode: "IT",
    lat: 45.6156,
    lon: 9.2811
  },
  "azerbaijan-2026": {
    slug: "azerbaijan-2026",
    circuitName: "Baku City Circuit",
    location: "Baku",
    countryCode: "AZ",
    lat: 40.3725,
    lon: 49.8533
  },
  "singapore-2026": {
    slug: "singapore-2026",
    circuitName: "Marina Bay Street Circuit",
    location: "Singapore",
    countryCode: "SG",
    lat: 1.2914,
    lon: 103.8644
  },
  "united-states-2026": {
    slug: "united-states-2026",
    circuitName: "Circuit of the Americas",
    location: "Austin",
    countryCode: "US",
    lat: 30.1328,
    lon: -97.6411
  },
  "mexico-2026": {
    slug: "mexico-2026",
    circuitName: "Autodromo Hermanos Rodriguez",
    location: "Mexico City",
    countryCode: "MX",
    lat: 19.4042,
    lon: -99.0907
  },
  "brazil-2026": {
    slug: "brazil-2026",
    circuitName: "Autodromo Jose Carlos Pace",
    location: "Sao Paulo",
    countryCode: "BR",
    lat: -23.7036,
    lon: -46.6997
  },
  "las-vegas-2026": {
    slug: "las-vegas-2026",
    circuitName: "Las Vegas Strip Circuit",
    location: "Las Vegas",
    countryCode: "US",
    lat: 36.1147,
    lon: -115.1728
  },
  "qatar-2026": {
    slug: "qatar-2026",
    circuitName: "Lusail International Circuit",
    location: "Lusail",
    countryCode: "QA",
    lat: 25.49,
    lon: 51.4542
  },
  "abu-dhabi-2026": {
    slug: "abu-dhabi-2026",
    circuitName: "Yas Marina Circuit",
    location: "Abu Dhabi",
    countryCode: "AE",
    lat: 24.4672,
    lon: 54.6031
  }
};

export function getCircuitMetadata(slug: string) {
  return circuitMetadataBySlug[slug];
}
