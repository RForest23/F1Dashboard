import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_URL =
  "https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson";

const slugOverrides = {
  australian: "australia",
  "albert-park-circuit": "australia",
  chinese: "china",
  "shanghai-international-circuit": "china",
  japanese: "japan",
  "suzuka-circuit": "japan",
  bahrain: "bahrain",
  "bahrain-international-circuit": "bahrain",
  "saudi-arabian": "saudi-arabia",
  "jeddah-corniche-circuit": "saudi-arabia",
  miami: "miami",
  "miami-international-autodrome": "miami",
  canadian: "canada",
  "circuit-gilles-villeneuve": "canada",
  monaco: "monaco",
  "circuit-de-monaco": "monaco",
  austrian: "austria",
  "red-bull-ring": "austria",
  british: "great-britain",
  silverstone: "great-britain",
  belgian: "belgium",
  "circuit-de-spa-francorchamps": "belgium",
  hungarian: "hungary",
  hungaroring: "hungary",
  dutch: "netherlands",
  "circuit-zandvoort": "netherlands",
  italian: "italy",
  "autodromo-nazionale-monza": "italy",
  azerbaijan: "azerbaijan",
  "baku-city-circuit": "azerbaijan",
  singapore: "singapore",
  "marina-bay-street-circuit": "singapore",
  "united-states": "united-states",
  "circuit-of-the-americas": "united-states",
  mexican: "mexico",
  "autodromo-hermanos-rodriguez": "mexico",
  brazilian: "brazil",
  "autodromo-jose-carlos-pace": "brazil",
  "las-vegas": "las-vegas",
  "las-vegas-strip-circuit": "las-vegas",
  qatar: "qatar",
  "lusail-international-circuit": "qatar",
  "abu-dhabi": "abu-dhabi",
  "yas-marina-circuit": "abu-dhabi",
  "emilia-romagna": "emilia-romagna",
  "autodromo-enzo-e-dino-ferrari": "emilia-romagna",
  spanish: "spain",
  "circuit-de-barcelona-catalunya": "spain"
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlug(feature) {
  const rawGrandPrix = feature.properties?.["Grand Prix"] ?? "";
  const stripped = rawGrandPrix.replace(/\s+Grand Prix$/i, "").trim();
  const normalized = slugify(stripped);

  if (normalized) {
    return `${slugOverrides[normalized] ?? normalized}-2026`;
  }

  const fallback = slugify(feature.properties?.Name ?? "track");
  return `${slugOverrides[fallback] ?? fallback}-2026`;
}

function getCoordinates(geometry) {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "LineString") {
    return geometry.coordinates ?? [];
  }

  if (geometry.type === "MultiLineString" || geometry.type === "Polygon") {
    return geometry.coordinates?.[0] ?? [];
  }

  return [];
}

const response = await fetch(SOURCE_URL);

if (!response.ok) {
  throw new Error(`Failed to download track geometry: ${response.status}`);
}

const geojson = await response.json();

const reduced = geojson.features
  .map((feature) => ({
    slug: normalizeSlug(feature),
    name: feature.properties?.Name ?? "",
    grandPrix: feature.properties?.["Grand Prix"] ?? "",
    coordinates: getCoordinates(feature.geometry)
  }))
  .filter((entry) => Array.isArray(entry.coordinates) && entry.coordinates.length > 2);

const outputPath = path.join(process.cwd(), "src", "data", "track-geometry.json");
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(reduced, null, 2));
