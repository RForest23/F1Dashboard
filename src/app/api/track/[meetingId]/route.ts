import { NextResponse } from "next/server";
import geometry from "@/data/track-geometry.json";
import { buildTrackSvg } from "@/lib/server/track/build-track-svg";

export async function GET(
  _: Request,
  context: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await context.params;
  const track = geometry.find((entry) => entry.slug === meetingId);

  if (!track) {
    return new NextResponse("Track not found", {
      status: 404
    });
  }

  return new NextResponse(buildTrackSvg(track), {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800"
    }
  });
}
