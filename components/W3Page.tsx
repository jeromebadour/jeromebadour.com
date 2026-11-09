import { EFooter, EHeader, ETabbar } from "./Shell";
import { out, page } from "@/lib/links";
import { Brand, brandColour, Glyph, type BrandName, type GlyphName } from "./Glyph";
import { ScreenViewer, type Shot } from "./ScreenViewer";

// The platform live at peak hours: the Windows app's main screen, as it was. Its counts are the caption's.
const live: Shot = { src: "/p/w3a-live.jpg", thumb: "/p/w3a-live-t.jpg", cap: "The Windows app at peak hours", g: "desktop", fit: "contain" };
export const W3A_LINE = "A platform people use every day: players from South America to Asia meet, talk and play on it, with 200+ online at once at peak hours. I built every part and run it on my own.";
// The registered count is left to the stats above (9,400+): the picture is from a day with fewer, and two different
// registered counts an inch apart would read as a mistake.
export const W3A_LIVE = "180+ players online at once and 7+ matches running.";


type Node = { id: string; g: GlyphName; tone: string; title: string; sub: string; x: number; y: number };

// Map positions in a 1000 x 640 box (percent of width/height used by both the SVG lines and the nodes).
const core = { x: 500, y: 290 };
const nodes: Node[] = [
  { id: "website", g: "web", tone: "sage", title: "Website", sub: "Landing page, live stats, ladders", x: 140, y: 80 },
  { id: "forum", g: "forum", tone: "blue", title: "Forum", sub: "5+ regions, reports with the replay", x: 140, y: 290 },
  { id: "desktop-app", g: "desktop", tone: "red", title: "Windows app", sub: "Chat, voice, matchmaking, rejoin", x: 140, y: 500 },
  { id: "shop", g: "shop", tone: "amber", title: "Shop", sub: "Memberships, wallet, receipts", x: 860, y: 80 },
  { id: "console", g: "console", tone: "violet", title: "Admin console", sub: "28+ sections, 137+ permissions", x: 860, y: 290 },
  { id: "ai-translation", g: "translate", tone: "blue", title: "AI translation", sub: "6+ languages, spend caps", x: 860, y: 500 },
  { id: "game-servers", g: "server", tone: "green", title: "Game servers", sub: "80+ servers in 6+ regions", x: 380, y: 600 },
  { id: "reliability", g: "shield", tone: "violet", title: "Standby server", sub: "Stays in sync, takes over", x: 620, y: 600 },
];

const stats: { g: GlyphName; tone: string; v: string; l: string }[] = [
  { g: "about", tone: "sage", v: "9,400+", l: "registered accounts" },
  { g: "pulse", tone: "amber", v: "17,000+", l: "games hosted" },
  { g: "server", tone: "green", v: "80+ servers", l: "in 6+ regions" },
  { g: "release", tone: "blue", v: "15+", l: "public releases since August" },
];

import { B, G, type Tech } from "@/lib/tech";
export { B, G, type Tech };
export const stack: { part: string; g: GlyphName; tone: string; tech: Tech[]; note: string }[] = [
  { part: "Website, forum, console", g: "web", tone: "sage", tech: [B("Node.js","node"), B("JavaScript","js"), B("Socket.IO","socketio"), B("HTML","html"), B("CSS","css"), G("SQL","grid"), B("Shell","bash")], note: "Live updates sent as changes only" },
  { part: "Windows app", g: "desktop", tone: "red", tech: [B("Electron","electron"), B("JavaScript","js"), B("C","c"), B("HTML","html"), B("CSS","css"), B("NSIS","nsis")], note: "Signed auto-update, strict content-security policy, Windows 7 to 11, 6+ languages" },
  { part: "Updater", g: "release", tone: "blue", tech: [B("Go","go")], note: "A starter that installs the next version and falls back to the working one" },
  { part: "Native Windows code", g: "code", tone: "violet", tech: [B("C","c"), G("koffi","code"), B("Python","python"), G("capstone","code")], note: "Crash recovery and reconnect built in at the native level" },
  { part: "Forum", g: "forum", tone: "blue", tech: [G("TipTap","code"), B("Node.js","node")], note: "A rich editor with cards, spoilers and polls; a sanitizer tested on 441+ attack inputs" },
  { part: "Stream overlay", g: "screen", tone: "violet", tech: [G("Server-Sent Events","live")], note: "A live rank card for OBS and Streamlabs, pushed when a game ends" },
  { part: "Game servers", g: "server", tone: "green", tech: [B("C++","cpp"), G("GHost++ base","code"), G("JASS","code"), B("Go","go"), B("NSIS","nsis"), G("PowerShell","console"), B("Docker","docker"), B("Linux","linux")], note: "One source, x86 and ARM, updated as each game ends" },
  { part: "Reconnect gateway", g: "live", tone: "green", tech: [B("C","c"), B("C++","cpp"), G("Makefile","code")], note: "A dropped player rejoins the running game" },
  { part: "Voice", g: "message", tone: "sage", tech: [B("WebRTC","webrtc"), G("coturn","server")], note: "Team voice in game, with a relay server" },
  { part: "Data", g: "grid", tone: "blue", tech: [B("MySQL","mysql"), B("Redis","redis"), G("ProxySQL","grid")], note: "A standby copy kept in sync, backups restore-tested" },
  { part: "Network and delivery", g: "region", tone: "amber", tech: [B("Nginx","nginx"), B("Cloudflare","cloudflare"), B("WireGuard","wireguard"), B("PM2","pm2")], note: "Blue/green releases that disconnect nobody, tests before every update" },
  { part: "AI", g: "translate", tone: "violet", tech: [B("Claude API","claude")], note: "Chat translation with a monthly spend cap and per-user limits" },
  { part: "Payments", g: "shop", tone: "amber", tech: [B("PayPal","paypal"), G("Crypto","shop"), G("Local sellers","region"), G("Tebex (before)","shop"), G("Other","grid")], note: "Wallet, receipts and refunds, sellers in 6+ countries" },
  { part: "Security", g: "shield", tone: "green", tech: [G("Ed25519","shield")], note: "Every update signed with our own keys and checked before it installs" },
  { part: "Ops", g: "console", tone: "sage", tech: [B("Bash","bash"), B("Python","python"), G("PowerShell","console"), B("Git","git")], note: "Deploy, lock and patch tools, all or nothing with a revert" },
  { part: "Clouds", g: "server", tone: "blue", tech: [G("3+ cloud providers","server"), G("Standby region","region")], note: "One fleet across 3+ providers, with a standby region" },
];


export function W3Page() {
  return (
    <div className="page" data-v="e">
      <EHeader />

      <section className="w-top">
        <div className="w-crumb"><a href={page.home}><Glyph name="grid" size={13} />Apps</a><span>/</span><span>W3Arena</span></div>
        <div className="w-title">
          <img src="/w3a-round-48.png" alt="" className="w-logo" />
          <div>
            <h1>W3Arena <span className="e-dom">w3arena.pro</span></h1>
            <p className="e-line">{W3A_LINE}</p>
          </div>
          <div className="w-links">
            <a className="e-btn e-hire" href={out.w3arena}><Glyph name="live" size={15} />w3arena.pro</a>
            <a className="e-btn e-ghost" href={out.w3aChangelog}><Glyph name="release" size={15} />Changelog</a>
          </div>
        </div>
        <div className="w-stats">
          {stats.map((s) => (
            <div key={s.l} className={`e-stat t-${s.tone}`}>
              <span className="e-tile"><Glyph name={s.g} size={17} /></span>
              <span><b>{s.v}</b><small>{s.l}</small></span>
            </div>
          ))}
        </div>
      </section>

      <section className="w-live">
        <div className="e-how-head"><span className="e-k"><Glyph name="live" size={13} />Live at peak hours</span></div>
        <p className="w-live-cap">{W3A_LIVE}</p>
        <ScreenViewer shots={[live]} label="W3Arena live" host="W3Arena" frame="app" icon="desktop" />
      </section>

      <section className="w-mapsec">
        <div className="e-how-head"><span className="e-k"><Glyph name="grid" size={13} />How the platform fits together</span></div>
        <div className="w-map">
          <svg viewBox="0 0 1000 640" preserveAspectRatio="none" className="w-lines" aria-hidden="true">
            {nodes.map((n) => (
              <path key={n.id} d={`M${core.x} ${core.y} C ${(core.x + n.x) / 2} ${core.y}, ${(core.x + n.x) / 2} ${n.y}, ${n.x} ${n.y}`} />
            ))}
          </svg>
          <div className="w-core" style={{ left: `${core.x / 10}%`, top: `${(core.y / 640) * 100}%` }}>
            <img src="/w3a-round-48.png" alt="" />
            <b>W3Arena platform</b>
            <small>Accounts, ranks and games, shared by every part</small>
          </div>
          {nodes.map((n) => (
            <a key={n.id} href={`${page.w3arena}/${n.id}`} className={`w-node t-${n.tone}`} style={{ left: `${n.x / 10}%`, top: `${(n.y / 640) * 100}%` }}>
              <span className="e-tile"><Glyph name={n.g} size={16} /></span>
              <span><b>{n.title}</b><small>{n.sub}</small></span>
              <Glyph name="arrow" size={13} />
            </a>
          ))}
        </div>
        <ol className="w-chain">
          {nodes.map((n) => (
            <li key={n.id}><a href={`${page.w3arena}/${n.id}`} className={`t-${n.tone}`}><span className="e-tile"><Glyph name={n.g} size={16} /></span><span><b>{n.title}</b><small>{n.sub}</small></span><Glyph name="arrow" size={13} /></a></li>
          ))}
        </ol>
      </section>

      <section className="w-stack" id="built-with">
        <div className="e-how-head"><span className="e-k"><Glyph name="code" size={13} />Built with</span></div>
        <ul className="w-rows">
          {stack.map((r) => (
            <li key={r.part} className={`t-${r.tone}`}>
              <span className="w-part"><span className="e-tile"><Glyph name={r.g} size={16} /></span><b>{r.part}</b></span>
              <span className="w-techs">
                {r.tech.map((t) => (
                  <span key={t.name} className="w-tech">
                    {t.brand ? <span style={{ color: brandColour(t.brand) }}><Brand name={t.brand} size={16} /></span> : <Glyph name={t.g!} size={14} />}
                    {t.name}
                  </span>
                ))}
              </span>
              <small>{r.note}</small>
            </li>
          ))}
        </ul>
      </section>

      <EFooter />
      <ETabbar />
    </div>
  );
}
