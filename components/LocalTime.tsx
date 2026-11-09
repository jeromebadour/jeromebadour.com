"use client";
import { useEffect, useState } from "react";

// Jerome's local time (Istanbul, UTC+3), a plain fact for a client in another time zone. It updates each minute and
// is drawn on the client only, so the page the server sends never shows a stale time.
const fmt = () => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());

export function LocalTime({ prefix = "" }: { prefix?: string }) {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    setT(fmt());
    const id = setInterval(() => setT(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);
  return <span className="n-time">{prefix}{t ?? "--:--"} <span className="n-tz">UTC+3</span></span>;
}
