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

function countryCodeToFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2)
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
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

  const flag = countryCodeToFlagEmoji(payload.meeting.countryCode);
  const stateLabel =
    payload.mode === "live"
      ? `${payload.highlightSession.name} Live`
      : payload.highlightSession.name;
  const title = payload.meeting.roundNumber
    ? `Round ${payload.meeting.roundNumber} • ${payload.meeting.name}`
    : payload.meeting.name;

  return (
    <section className="hero panel">
      <div aria-hidden="true" className="hero-flag-band">
        {flag}
      </div>

      <div className="hero-copy">
        <h1>{title}</h1>
        <p className="hero-meta">
          {payload.meeting.circuitName} • {payload.meeting.location}
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
        <div className="hero-countdown-label">Race Countdown</div>
        <div className="hero-countdown-value">{countdown}</div>
        <div className="hero-countdown-meta">Target: {raceSession.name}</div>
      </div>
    </section>
  );
}
