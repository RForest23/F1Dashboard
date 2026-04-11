import type { DashboardMeeting, TrackSummary } from "@/lib/dashboard/contracts";

export function TrackMapPanel({
  track,
  meeting
}: {
  track: TrackSummary;
  meeting: DashboardMeeting;
}) {
  return (
    <section className="panel track-panel">
      <div className="section-eyebrow">Track Map</div>
      <div className="track-visual">
        <img src={track.svgPath} alt={`${meeting.name} track map`} />
      </div>
      <dl className="track-stats">
        <div>
          <dt>Length</dt>
          <dd>{track.lengthKm ? `${track.lengthKm} km` : "TBC"}</dd>
        </div>
        <div>
          <dt>Laps</dt>
          <dd>{track.laps ?? "TBC"}</dd>
        </div>
        <div>
          <dt>Lap record</dt>
          <dd>{track.lapRecord ?? "TBC"}</dd>
        </div>
        <div>
          <dt>Holder</dt>
          <dd>{track.lapRecordHolder ?? "TBC"}</dd>
        </div>
      </dl>
    </section>
  );
}
