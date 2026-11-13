import { Glyph } from "./Glyph";
import { ESocials } from "./Shell";
import { SelfRow } from "./SelfRow";
import { LocalTime } from "./LocalTime";
import { AwakeBand } from "./AwakeBand";
import { APPS } from "@/lib/apps";
import { BOARD_SINCE, RELEASES } from "@/lib/releases";
import { out } from "@/lib/links";

// Night shift pieces only the home page has (BUILD-RULES 2.27): the framed art stage, the person card and the service
// board. The art lives only inside the stage's frame; text never sits on it (Kami 2026-11-09).

// A seeded random walk, so the art is the same on every request and never jumps between server and client.
function trace(w: number, h: number, seed: number) {
  let s = seed * 9301 + 49297;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let y = h * 0.6; const pts: string[] = [];
  for (let x = 0; x <= w; x += 6) {
    y = Math.min(Math.max(y + (r() * 6 - 3), h * 0.3), h * 0.85);
    if (r() < 0.02) pts.push(`${x},${y.toFixed(0)}`, `${x + 2},${(y - h * 0.35).toFixed(0)}`, `${x + 4},${(y + h * 0.1).toFixed(0)}`);
    else pts.push(`${x},${y.toFixed(0)}`);
  }
  return pts.join(" ");
}
const TONES = ["var(--t-sage)", "var(--t-blue)", "var(--t-sage)", "var(--t-green)", "var(--t-amber)", "var(--t-sage)",
  "var(--t-blue)", "var(--t-green)", "var(--t-sage)", "var(--t-amber)", "var(--t-blue)", "var(--t-sage)"];

export function SignalArt() {
  const W = 1360, H = 640;
  return (
    <svg className="n-art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs><filter id="n-glow"><feGaussianBlur stdDeviation="2.4" /></filter></defs>
      {TONES.map((c, i) => {
        const p = trace(W, 40, i * 5 + 2);
        return (
          <g key={i} transform={`translate(0,${40 + i * 48})`}>
            <rect y="20" width={W} height="1" className="n-art-rule" />
            <polyline points={p} fill="none" stroke={c} strokeWidth="1.4" opacity=".5" filter="url(#n-glow)" />
            <polyline points={p} fill="none" stroke={c} strokeWidth="1.4" opacity=".55" />
          </g>
        );
      })}
      <rect x={W - 280} y="0" width="2" height={H} fill="var(--accent)" opacity=".4" />
      <rect x={W - 330} y="0" width="50" height={H} fill="var(--accent)" opacity=".05" />
    </svg>
  );
}

export function PersonCard() {
  return (
    <div className="n-card">
      <img src="/jerome.jpg" alt="Jerome Badour" className="n-photo" />
      <div className="n-card-b">
        <b className="n-name">Jerome Badour</b>
        <span className="n-role">Full-stack developer · Founder and Lead Developer of W3Arena</span>
        <div className="n-chips">
          <span className="n-chip">Web · desktop · AI · servers</span>
          <span className="n-chip n-lang">English · Arabic · Turkish</span>
          <span className="n-chip n-clock"><LocalTime prefix="Local time " /></span>
        </div>
        <div className="e-soc"><ESocials /></div>
      </div>
    </div>
  );
}

const DAY = 86_400_000;
function Ticks({ dates }: { dates: string[] }) {
  const a = Date.parse(BOARD_SINCE), b = Date.now(), span = Math.max(b - a, DAY);
  const x = (d: number) => 4 + ((d - a) / span) * 242;
  const months: [string, number][] = [];
  for (let d = new Date(a); d.getTime() < b; d.setUTCMonth(d.getUTCMonth() + 1)) months.push([d.toLocaleString("en", { month: "short", timeZone: "UTC" }).toUpperCase(), d.getTime()]);
  return (
    <svg className="n-ticks" viewBox="0 0 250 30" preserveAspectRatio="none" aria-hidden="true">
      <rect width="250" height="14" rx="2" className="n-ticks-bg" />
      {dates.map((d) => <rect key={d} x={x(Date.parse(d)).toFixed(1)} y="0" width="2" height="14" rx="1" className="n-tick" />)}
      {months.map(([m, t]) => <text key={m + t} x={x(t).toFixed(0)} y="27" className="n-month">{m}</text>)}
    </svg>
  );
}

export function ServiceBoard() {
  return (
    <div className="n-board">
      <div className="n-board-h"><span>Service board</span><span className="n-ok">{APPS.length} live + this site · run by one person</span></div>
      {APPS.map((a) => {
        const r = RELEASES[a.id];
        return (
          <a key={a.id} className="n-svc" href={a.page}>
            <img src={a.mark} alt="" className="n-svc-mark" />
            <span className="n-svc-t"><span><b>{a.name}</b><em>{a.host}</em></span><small>{a.menu.sub}</small></span>
            {r && <span className="n-svc-r"><span className="n-svc-k"><span className="n-ok"><span className="dot" />{r.latest}</span><span>{r.note}</span></span><Ticks dates={r.dates} /></span>}
          </a>
        );
      })}
      <SelfRow note={RELEASES.site.note} ticks={<Ticks dates={RELEASES.site.dates} />} />
      <a className="n-board-f" href={out.w3aChangelog}><Glyph name="release" size={15} /><b>Latest W3Arena {RELEASES.w3arena.latest}</b><span>8 Nov 2026 · from the public changelog</span><Glyph name="arrow" size={14} /></a>
    </div>
  );
}

export { AwakeBand };
