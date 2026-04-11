import type { DashboardSession } from "@/lib/dashboard/contracts";

export function WeekendTimeline({
  schedule
}: {
  schedule: DashboardSession[];
}) {
  return (
    <section className="panel timeline-panel">
      <div className="section-eyebrow">Weekend Schedule</div>
      <div className="timeline-list">
        {schedule.map((session) => (
          <div className={`timeline-row state-${session.state}`} key={session.name}>
            <div>
              <div className="timeline-name">{session.name}</div>
              <div className="timeline-time">
                {new Date(session.start).toLocaleString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/London"
                })}{" "}
                UK
              </div>
            </div>
            <span className="timeline-state">
              {session.state === "current" ? "Live" : session.state}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
