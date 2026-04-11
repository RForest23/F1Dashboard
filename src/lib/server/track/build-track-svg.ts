interface TrackGeometry {
  slug: string;
  coordinates: [number, number][];
}

function normalizeCoordinates(coordinates: [number, number][]) {
  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);
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

  return coordinates.map(([x, y]) => {
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
    '<rect width="1000" height="560" rx="32" fill="#0f0f0f" />',
    '<rect x="16" y="16" width="968" height="528" rx="24" stroke="#242424" />',
    `<path d="${pathData}" stroke="#f3f3f3" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />`,
    "</svg>"
  ].join("");
}
