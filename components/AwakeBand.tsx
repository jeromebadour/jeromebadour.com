"use client";
import { useEffect, useState } from "react";

// Around the clock: where W3Arena's players are awake (local 08:00 to 23:00) on a 24-hour UTC line, with a marker at
// the current time. Drawn on the client so the marker is the visitor's real now.
const REGIONS = [
  { name: "South America", off: -3, tone: "var(--t-blue)" },
  { name: "Europe", off: 1, tone: "var(--t-amber)" },
  { name: "Southeast Asia", off: 7, tone: "var(--t-green)" },
];
const W = 1360;
const x = (h: number) => (((h % 24) + 24) % 24) / 24 * W;

export function AwakeBand() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const f = () => { const d = new Date(); setNow(d.getUTCHours() + d.getUTCMinutes() / 60); };
    f(); const id = setInterval(f, 60_000); return () => clearInterval(id);
  }, []);
  const hhmm = now === null ? "--:--" : `${String(Math.floor(now)).padStart(2, "0")}:${String(Math.round((now % 1) * 60) % 60).padStart(2, "0")}`;
  return (
    <section className="n-awake" aria-label="Where the players are awake">
      <div className="n-awake-h"><span>Around the clock · where the players are awake</span><span className="n-ok">now {hhmm} UTC</span></div>
      <div className="n-awake-rows">
        {REGIONS.map((r) => {
          const a = x(8 - r.off), b = x(23 - r.off);
          const segs = a < b ? [[a, b]] : [[a, W], [0, b]];
          return (
            <div key={r.name} className="n-awake-row">
              <span>{r.name}</span>
              <svg viewBox={`0 0 ${W} 18`} preserveAspectRatio="none" aria-hidden="true">
                <rect y="8" width={W} height="2" fill="#ffffff10" />
                {segs.map(([p, q], i) => <rect key={i} x={p} y="4" width={q - p} height="10" rx="3" fill={r.tone} opacity=".55" />)}
              </svg>
            </div>
          );
        })}
        {now !== null && <span className="n-awake-now" style={{ left: `calc(150px + (100% - 150px) * ${now / 24})` }} />}
      </div>
    </section>
  );
}
