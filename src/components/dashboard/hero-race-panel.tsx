"use client";

import { useEffect, useState } from "react";
import type { DashboardPayload } from "@/lib/dashboard/contracts";

function formatCountdown(target: string) {
  const diff = new Date(target).getTime() - Date.now();

  if (diff <= 0) {
    return "LIVE / DONE";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function HeroRacePanel({ payload }: { payload: DashboardPayload }) {
  const raceSession =
    payload.schedule.find((session) => session.name === "Race") ??
    payload.highlightSession;
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(raceSession.start)
  );

  useEffect(() => {
    setCountdown(formatCountdown(raceSession.start));

    const timer = window.setInterval(() => {
      setCountdown(formatCountdown(raceSession.start));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [raceSession.start]);

  const stateLabel =
    payload.mode === "live"
      ? `${payload.highlightSession.name} Focus`
      : "Next Valid Grand Prix";

  return (
    <section className="hero panel">
      <div className="hero-copy">
        <div className="hero-kicker">Xeneon Race View</div>
        <h1>{payload.meeting.name}</h1>
        <p className="hero-meta">
          {payload.meeting.circuitName} · {payload.meeting.location}
        </p>
        <div className="hero-status-row">
          <span
            className={
              payload.mode === "live" ? "state-pill state-live" : "state-pill"
            }
          >
            {stateLabel}
          </span>
          <span className="hero-next-session">
            {payload.highlightSession.name} ·{" "}
            {new Date(payload.highlightSession.start).toLocaleString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/London"
            })}{" "}
            UK
          </span>
        </div>
      </div>

      <div className="hero-countdown">
        <div className="hero-countdown-label">Countdown</div>
        <div className="hero-countdown-value">{countdown}</div>
        <div className="hero-countdown-meta">
          Target: {raceSession.name}
        </div>
      </div>
    </section>
  );
}
