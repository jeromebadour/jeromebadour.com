"use client";
import { useState } from "react";
import { EFooter, EHeader, ETabbar } from "./Shell";
import { out } from "@/lib/links";
import { Glyph, type GlyphName } from "./Glyph";

type Kind = "fix" | "build" | "ai" | "run";
type Link = { kind: "live" | "release" | "code" | "demo" | "screen" | "page"; label: string; href: string };
type Shot = { src: string; frame: "browser" | "app"; host: string; path: string; icon?: GlyphName; fit?: boolean };
type Service = { id: string; kind: Kind; g: GlyphName; t: string; d: string; stats: [string, string][]; shot?: Shot; steps?: [GlyphName, string][]; links: Link[] };

const kinds: Record<Kind, { label: string; tone: string; g: GlyphName }> = {
  fix: { label: "Fix", tone: "amber", g: "search" },
  build: { label: "Build", tone: "sage", g: "web" },
  ai: { label: "AI", tone: "violet", g: "ai" },
  run: { label: "Run", tone: "green", g: "server" },
};

const services: Service[] = [
  {
    id: "bug", kind: "fix", g: "search", t: "Fix a bug or error on your website or app",
    d: "I reproduce it, find the real cause, fix it there and prove it is gone before I hand it back.",
    stats: [["13 s", "hourly server freeze traced and removed"], ["Same day", "fix when an update locked a paying user out"]],
    shot: { src: "/p/web/changelog.jpg", frame: "browser", host: "w3arena.pro", path: "/changelog" },
    links: [{ kind: "release", label: "W3Arena 5.1.5", href: out.w3aChangelog }, { kind: "page", label: "How I work", href: "/how-i-work" }],
  },
  {
    id: "web", kind: "build", g: "web", t: "Build a landing page, a website or a web app",
    d: "From one landing page to a full web app with accounts, live data and an admin behind it, on phone and desktop.",
    stats: [["14+", "public pages on w3arena.pro"], ["9,400+", "accounts on it"]],
    shot: { src: "/p/web/home.jpg", frame: "browser", host: "w3arena.pro", path: "/" },
    links: [{ kind: "page", label: "W3Arena website", href: "/work/w3arena/website" }, { kind: "page", label: "Distill", href: "/work/distill" }, { kind: "live", label: "w3arena.pro", href: "https://w3arena.pro" }],
  },
  {
    id: "feature", kind: "build", g: "grid", t: "Add a feature to a project you already have",
    d: "New features shipped into a product people are using, without taking it down.",
    stats: [["15+", "public releases since August"], ["0", "players disconnected by a release"]],
    shot: { src: "/p/app/translate.jpg", frame: "app", host: "W3Arena", path: "Chat translation", icon: "translate" },
    links: [{ kind: "release", label: "Changelog", href: "https://w3arena.pro/changelog" }, { kind: "page", label: "AI translation", href: "/work/w3arena/ai-translation" }],
  },
  {
    id: "ai", kind: "ai", g: "ai", t: "Add AI features to your product",
    d: "Chatbots, translation and summaries on Claude or OpenAI, with spend caps so the cost never surprises you.",
    stats: [["~$1", "API cost of live chat translation since launch"], ["Every point", "of a Distill summary linked to its sentences"]],
    shot: { src: "/p/distill/summary.jpg", frame: "browser", host: "distill.jeromebadour.com", path: "/", fit: true },
    links: [{ kind: "page", label: "AI translation", href: "/work/w3arena/ai-translation" }, { kind: "page", label: "Distill", href: "/work/distill" }, { kind: "live", label: "Open Distill", href: "https://distill.jeromebadour.com" }],
  },
  {
    id: "admin", kind: "build", g: "console", t: "Build an admin dashboard for your team",
    d: "Each person sees only what their role allows, every action is confirmed with 2FA, and all of it is on record.",
    stats: [["137+", "permissions in 13+ tiers"], ["6,800+", "staff actions logged"]],
    shot: { src: "/p/console/access.jpg", frame: "app", host: "W3Arena Console", path: "Access control", icon: "console" },
    links: [{ kind: "page", label: "Admin console", href: "/work/w3arena/console" }, { kind: "demo", label: "Admin demo", href: out.distillDemo }],
  },
  {
    id: "payments", kind: "build", g: "shop", t: "Add payments to your app",
    d: "Checkout, receipts and refunds with Stripe, PayPal, crypto or a local provider, and an admin view of every payment.",
    stats: [["3+", "ways to pay in the W3Arena shop"], ["6+", "countries with local sellers"], ["14 days", "to refund until a purchase is used"]],
    shot: { src: "/p/shop/receipt.jpg", frame: "app", host: "W3Arena Shop", path: "Receipt", icon: "shop" },
    links: [{ kind: "page", label: "Shop", href: "/work/w3arena/shop" }, { kind: "page", label: "Admin console", href: "/work/w3arena/console" }],
  },
  {
    id: "rules", kind: "run", g: "shield", t: "Write your app's privacy policy and terms",
    d: "Privacy policy, terms of use and refund rules in plain words, written from what your app really keeps and does. Where the law needs a lawyer, I say so.",
    stats: [["2+", "policies live on w3arena.pro, versioned and dated"], ["0", "chat or voice kept, and the policy says so"], ["14 days", "refund rule, every case provable by receipt"]],
    shot: { src: "/p/legal/privacy.jpg", frame: "browser", host: "jeromebadour.com", path: "/privacy", fit: true },
    links: [{ kind: "live", label: "W3Arena privacy", href: "https://w3arena.pro/privacy" }, { kind: "live", label: "W3Arena terms", href: "https://w3arena.pro/terms" }, { kind: "page", label: "This site's privacy", href: "/privacy" }],
  },
  {
    id: "desktop", kind: "build", g: "desktop", t: "Build a Windows desktop app",
    d: "It installs and updates itself, recovers from a crash, and runs on Windows 7 to 11.",
    stats: [["14+", "public app releases"], ["6+", "languages"]],
    shot: { src: "/p/app/lobby.jpg", frame: "app", host: "W3Arena", path: "Lobby and chat", icon: "desktop" },
    links: [{ kind: "page", label: "Windows app", href: "/work/w3arena/desktop-app" }, { kind: "release", label: "Changelog", href: "https://w3arena.pro/changelog" }],
  },
  {
    id: "realtime", kind: "run", g: "server", t: "Build a game server or a realtime feature",
    d: "Chat, live updates and multiplayer, on servers that update without ending a running game.",
    stats: [["80+", "game servers in 6+ regions"], ["0", "games cut by an update"]],
    shot: { src: "/p/5-game-server-fleet.jpg", frame: "app", host: "W3Arena", path: "Game servers", icon: "region", fit: true },
    links: [{ kind: "page", label: "Game servers", href: "/work/w3arena/game-servers" }, { kind: "page", label: "Windows app", href: "/work/w3arena/desktop-app" }],
  },
  {
    id: "speed", kind: "fix", g: "pulse", t: "Make a slow app or server fast again",
    d: "Measured first, then fixed where the time actually goes.",
    stats: [["88%", "less live data traffic on the server"], ["97%", "less network traffic in the app"], ["2×", "faster game starts"]],
    shot: { src: "/p/app/find.jpg", frame: "app", host: "W3Arena", path: "Find match", icon: "desktop" },
    links: [{ kind: "page", label: "Game servers", href: "/work/w3arena/game-servers" }, { kind: "page", label: "How I work", href: "/how-i-work" }],
  },
  {
    id: "deploy", kind: "run", g: "shield", t: "Put your project on a server",
    d: "HTTPS, backups that are actually restored, and alerts that tell you when something breaks.",
    stats: [["0", "data lost when a provider shut the account down"], ["Weekly", "backup restore on Distill"]],
    shot: { src: "/p/distill/server.jpg", frame: "browser", host: "distill.jeromebadour.com", path: "/admin", fit: true },
    links: [{ kind: "page", label: "Standby server", href: "/work/w3arena/reliability" }, { kind: "demo", label: "Server and backups", href: out.distillDemo }],
  },
  {
    id: "rescue", kind: "fix", g: "tested", t: "Check and fix an app built with AI tools",
    d: "For an app that almost works: I find what is really broken, fix it at the root and add the tests that keep it fixed.",
    stats: [],
    steps: [["search", "The real cause found before anything changes"], ["pulse", "Measured before and after"], ["tested", "Tested before it comes back to you"]],
    links: [{ kind: "page", label: "How I work", href: "/how-i-work" }, { kind: "code", label: "Distill tests", href: out.distillTests }],
  },
];

function Chips({ links }: { links: Link[] }) {
  return (
    <div className="e-pc">
      {links.map((x) => (
        <a key={x.label} href={x.href} className={`pc-${x.kind}`}><Glyph name={x.kind === "page" ? "arrow" : x.kind} size={12} />{x.label}</a>
      ))}
    </div>
  );
}

function Proof({ s }: { s: Service }) {
  const k = kinds[s.kind];
  return (
    <div className={`s-proof t-${k.tone}`}>
      {s.shot ? (
        <div className="sv s-win">
          <div className="sv-chrome">
            {s.shot.frame === "browser" ? (
              <>
                <span className="sv-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="sv-addr"><Glyph name="shield" size={13} /><b>{s.shot.host}</b><span>{s.shot.path}</span></span>
              </>
            ) : (
              <span className="sv-addr app"><Glyph name={s.shot.icon ?? "app"} size={13} /><b>{s.shot.host}</b><span>{s.shot.path}</span></span>
            )}
            <span className="sv-meta"><span className="sv-live"><span className="dot" />Live</span></span>
          </div>
          <div className="sv-stage"><img key={s.id} src={s.shot.src} alt={`${s.shot.host}: ${s.shot.path}`} className={`on${s.shot.fit ? " fit" : ""}`} /></div>
        </div>
      ) : (
        <ol className="s-steps">
          {s.steps?.map(([g, t], n) => (
            <li key={t}><span className="h-n">{String(n + 1).padStart(2, "0")}</span><span className="e-tile"><Glyph name={g} size={15} /></span>{t}</li>
          ))}
        </ol>
      )}
      {s.stats.length > 0 && (
        <dl className="s-stats">
          {s.stats.map(([v, l]) => (<div key={l}><dt>{v}</dt><dd>{l}</dd></div>))}
        </dl>
      )}
      <Chips links={s.links} />
    </div>
  );
}

export function ServicesPage() {
  const [on, setOn] = useState(services[0].id);
  const cur = services.find((s) => s.id === on) ?? services[0];
  return (
    <div className="page" data-v="e">
      <EHeader on="services" />

      <section className="w-top">
        <div className="w-crumb"><Glyph name="work" size={13} /><span>Services</span></div>
        <div className="w-title">
          <span className="e-tile p-big t-amber"><Glyph name="work" size={26} /></span>
          <div>
            <h1>Services</h1>
            <p className="e-line">From a quick bug fix to a full platform. Small jobs are welcome.</p>
            <div className="s-kinds">
              {(Object.keys(kinds) as Kind[]).map((k) => (
                <span key={k} className={`t-${kinds[k].tone}`}><Glyph name={kinds[k].g} size={13} />{kinds[k].label}<em>{services.filter((s) => s.kind === k).length}</em></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="s-board">
        <ol className="s-list" role="tablist" aria-label="Services">
          {services.map((s, n) => {
            const k = kinds[s.kind];
            const sel = s.id === on;
            return (
              <li key={s.id} className={`t-${k.tone}${sel ? " on" : ""}`}>
                <button role="tab" aria-selected={sel} onClick={() => setOn(s.id)} onMouseEnter={() => setOn(s.id)} onFocus={() => setOn(s.id)}>
                  <span className="h-n">{String(n + 1).padStart(2, "0")}</span>
                  <span className="e-tile"><Glyph name={s.g} size={16} /></span>
                  <span className="s-txt">
                    <b>{s.t}</b>
                    <span>{s.d}</span>
                  </span>
                  <span className="s-kind">{k.label}</span>
                </button>
                {sel && <div className="s-inline"><Proof s={s} /></div>}
              </li>
            );
          })}
        </ol>
        <aside className="s-side" aria-live="polite"><Proof s={cur} /></aside>
      </section>

      <section className="s-same">
        <span className="e-tile t-blue"><Glyph name="how" size={16} /></span>
        <div><b>Every job runs the same way.</b><span>Root cause first, tested before hand-over, updates in plain English.</span></div>
        <a className="e-btn e-ghost" href="/how-i-work"><Glyph name="how" size={15} />How I work</a>
      </section>

      <EFooter />
      <ETabbar on="services" />
    </div>
  );
}
