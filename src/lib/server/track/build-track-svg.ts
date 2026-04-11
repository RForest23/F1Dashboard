interface TrackGeometry {
  slug: string;
  coordinates: number[][];
}

function asCoordinatePairs(coordinates: number[][]): [number, number][] {
  return coordinates.filter(
    (coordinate): coordinate is [number, number] => coordinate.length >= 2
  );
}

function normalizeCoordinates(coordinates: number[][]) {
  const coordinatePairs = asCoordinatePairs(coordinates);
  const xs = coordinatePairs.map(([x]) => x);
  const ys = coordinatePairs.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  const innerWidth = 880;
  const innerHeight = 440;
  const offsetX = 60;
  const offsetY = 60;

  return coordinatePairs.map(([x, y]) => {
    const normalizedX = offsetX + ((x - minX) / width) * innerWidth;
    const normalizedY = offsetY + (1 - (y - minY) / height) * innerHeight;
    return [Number(normalizedX.toFixed(2)), Number(normalizedY.toFixed(2))] as const;
  });
}

export function buildTrackSvg(track: TrackGeometry) {
  const points = normalizeCoordinates(track.coordinates);
  const pathData = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560" fill="none">',
    "<defs>",
    '<linearGradient id="track-accent" x1="120" y1="280" x2="880" y2="280" gradientUnits="userSpaceOnUse">',
    '<stop offset="0" stop-color="#ff6a33" />',
    '<stop offset="1" stop-color="#ffffff" />',
    "</linearGradient>",
    '<filter id="track-glow" x="-10%" y="-10%" width="120%" height="120%">',
    '<feGaussianBlur stdDeviation="16" result="blur" />',
    '<feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>',
    "</filter>",
    "</defs>",
    `<path d="${pathData}" stroke="#341110" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" />`,
    `<path d="${pathData}" stroke="url(#track-accent)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.42" filter="url(#track-glow)" />`,
    `<path d="${pathData}" stroke="#f7f5f2" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />`,
    "</svg>"
  ].join("");
}
