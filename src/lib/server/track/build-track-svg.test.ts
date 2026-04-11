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
    expect(svg).toContain('viewBox="0 0 1000 560"');
    expect(svg).toContain("linearGradient");
    expect(svg).toContain("<path");
  });
});
