import { EFooter, EHeader, ETabbar } from "./Shell";
import { fwPart, out, page } from "@/lib/links";
import { Brand, brandColour, Glyph, type GlyphName } from "./Glyph";
import { ScreenViewer, type Shot } from "./ScreenViewer";
import { B, G, type Tech } from "@/lib/tech";

// Fernway's overview, the second platform with parts of its own (the first is W3Arena, components/W3Page). Every
// number here is one GHL Build proved live or read from the repo (claude/FERNWAY-EXPLAINED.md §13), and the honest
// note says what is a demo (§14): there are no customers, payments are Stripe test mode, GoHighLevel is a sandbox.
export const FW_LINE = "A SaaS that carries every lead from a website into GoHighLevel: re-sent when GHL is busy or down, never doubled, with a receipt for every hand-off. A GoHighLevel integration I built and run on my own.";
export const FW_ASIDE = "GHL can say no. Fernway asks again, up to 8 times, and keeps the receipt.";
const FW_HONEST = "A portfolio product: the business is invented, the engineering isn't. No customers, payments in Stripe's test mode, and GoHighLevel is a developer sandbox; every lead sent from the live site is real.";

const live: Shot = { src: "/p/fernway/live.jpg", thumb: "/p/fernway/live-t.jpg", cap: "The landing page, live", g: "web", fit: "contain" };

const stats: { g: GlyphName; tone: string; v: string; l: string }[] = [
  { g: "retry", tone: "amber", v: "8 tries", l: "over 24 h when GHL says no" },
  { g: "shield", tone: "green", v: "0 duplicates", l: "matched by email, then phone" },
  { g: "tested", tone: "violet", v: "260+ tests", l: "and the whole stack end to end in CI" },
  { g: "route", tone: "blue", v: "1.6 s", l: "the first live lead, signed for in GHL" },
];

// The route map: ways in on the left, the four scans in the middle, GoHighLevel and what goes back out on the right,
// what the sender and the owner see underneath. Positions in a 1000 x 720 box, used by both the lines and the nodes.
type Node = { id: string; g: GlyphName; tone: string; title: string; sub: string; x: number; y: number; href: string; side: "in" | "out" | "see" };
const core = { x: 500, y: 330 };
const nodes: Node[] = [
  { id: "forms", g: "web", tone: "sage", title: "Forms and embed", sub: "Trial, demo, contact; any site's iframe", x: 130, y: 110, href: fwPart.site, side: "in" },
  { id: "wordpress", g: "code", tone: "blue", title: "WordPress plugin", sub: "A block and an Elementor widget", x: 130, y: 230, href: fwPart.wordpress, side: "in" },
  { id: "api", g: "console", tone: "violet", title: "API and Laravel", sub: "OpenAPI docs, a Packagist package", x: 130, y: 350, href: fwPart.laravel, side: "in" },
  { id: "sheets-in", g: "sheet", tone: "green", title: "Sheets and Stripe", sub: "New rows and paid checkouts", x: 130, y: 470, href: fwPart.automations, side: "in" },
  { id: "workflow", g: "app", tone: "amber", title: "A GHL workflow", sub: "\"Track with Fernway\", a step in GHL", x: 130, y: 590, href: fwPart.ghl, side: "in" },
  { id: "ghl", g: "route", tone: "green", title: "GoHighLevel", sub: "Contact, note, meeting, stage", x: 870, y: 110, href: fwPart.engine, side: "out" },
  { id: "inside", g: "app", tone: "blue", title: "Fernway inside GHL", sub: "Its own page, a workflow trigger", x: 870, y: 230, href: fwPart.ghl, side: "out" },
  { id: "hooks", g: "hook", tone: "red", title: "Signed webhooks", sub: "Flows in n8n and Make", x: 870, y: 470, href: fwPart.automations, side: "out" },
  { id: "score", g: "ai", tone: "violet", title: "Sheets and a Claude score", sub: "A row per lead, a score 1 to 5", x: 870, y: 590, href: fwPart.automations, side: "out" },
  { id: "receipt", g: "receipt", tone: "sage", title: "A live receipt", sub: "The sender watches their own lead", x: 360, y: 660, href: fwPart.site, side: "see" },
  { id: "consoles", g: "console", tone: "violet", title: "Two consoles", sub: "The owner's, and Fernway's own staff", x: 640, y: 660, href: fwPart.consoles, side: "see" },
];
const scans: { g: GlyphName; t: string; s: string }[] = [
  { g: "release", t: "Picked up", s: "written down before anything else" },
  { g: "tested", t: "Checked", s: "a lead GHL can't match is refused in words" },
  { g: "arrow", t: "Handed to GHL", s: "contact found or made, never twice" },
  { g: "shield", t: "Signed for", s: "in its pipeline stage, with its tags" },
];

function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

export const stack: { part: string; g: GlyphName; tone: string; tech: Tech[]; note: string }[] = [
  { part: "App and API", g: "web", tone: "sage", tech: [B("TypeScript", "ts"), B("Next.js", "next"), B("React", "react"), B("Node.js", "node"), B("Zod", "zod"), B("OpenAPI", "openapi")], note: "One set of schemas checks every request and writes the API docs" },
  { part: "Delivery engine", g: "route", tone: "green", tech: [B("Redis", "redis"), G("BullMQ", "retry"), B("PostgreSQL", "postgres"), B("Drizzle", "drizzle")], note: "Paced to GHL's own limit, every scan saved with its state" },
  { part: "GoHighLevel", g: "app", tone: "blue", tech: [G("API v2", "route"), G("OAuth Marketplace app", "shield"), G("Workflow step and trigger", "app"), G("Ed25519 webhooks", "hook")], note: "Connected the way a Marketplace app connects, tokens refreshed under a lock" },
  { part: "Payments", g: "shop", tone: "amber", tech: [B("Stripe", "stripe")], note: "Plans, invoices and the customer portal, test mode only" },
  { part: "WordPress", g: "code", tone: "blue", tech: [B("PHP", "php"), B("WordPress", "wordpress"), B("Elementor", "elementor"), B("MariaDB", "mariadb")], note: "A plugin and a whole site, tested in a real WordPress in CI" },
  { part: "Laravel", g: "code", tone: "red", tech: [B("Laravel", "laravel"), B("Composer", "composer"), B("Packagist", "packagist")], note: "A package that installs into a fresh Laravel 13 app in CI" },
  { part: "Automations", g: "hook", tone: "red", tech: [B("n8n", "n8n"), B("Make", "make"), B("Google Sheets", "sheets"), B("Python", "python")], note: "Signed webhooks out, each signature checked on the other side" },
  { part: "AI", g: "ai", tone: "violet", tech: [B("Claude API", "claude")], note: "A lead score that never sees a name, email or phone, capped each month" },
  { part: "Tests and delivery", g: "tested", tone: "violet", tech: [B("Vitest", "vitest"), B("GitHub Actions", "actions"), B("Docker", "docker"), B("Nginx", "nginx")], note: "A change merges only when both CI jobs pass; the box deploys only those" },
];

function TechChip({ t }: { t: Tech }) {
  return (
    <span className="w-tech">
      {t.brand ? <span style={{ color: brandColour(t.brand) }}><Brand name={t.brand} size={16} /></span> : <Glyph name={t.g!} size={14} />}
      {t.name}
    </span>
  );
}

export function FwPage() {
  const groups: { side: Node["side"]; k: string }[] = [
    { side: "in", k: "Ways in" }, { side: "out", k: "Into GoHighLevel, and back out" }, { side: "see", k: "What people see" },
  ];
  return (
    <div className="page" data-v="e">
      <EHeader />

      <section className="w-top">
        <div className="w-crumb"><a href={page.home}><Glyph name="grid" size={13} />Apps</a><span>/</span><span>Fernway</span></div>
        <div className="w-title">
          <img src="/fernway-mark.svg" alt="" className="w-logo" />
          <div>
            <h1>Fernway <span className="e-dom">fernway.jeromebadour.com</span></h1>
            <p className="e-line">{FW_LINE}</p>
            <p className="w-aside"><span>›</span>{FW_ASIDE}</p>
          </div>
          <div className="w-links">
            <a className="e-btn e-hire" href={out.fernway}><Glyph name="live" size={15} />Open Fernway</a>
            <a className="e-btn e-ghost" href={out.fernwayBreak}><Glyph name="retry" size={15} />Break it</a>
            <a className="e-btn e-ghost" href={out.fernwayDemo}><Glyph name="demo" size={15} />Console demo</a>
            <a className="e-btn e-ghost" href={out.fernwayCode}><Glyph name="code" size={15} />Code</a>
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
        <p className="f-honest"><Glyph name="shield" size={14} />{FW_HONEST}</p>
      </section>

      <section className="w-live">
        <div className="e-how-head"><span className="e-k"><Glyph name="live" size={13} />Live now</span></div>
        <ScreenViewer shots={[live]} label="Fernway live" host="fernway.jeromebadour.com" frame="browser" icon="web" />
      </section>

      <section className="w-mapsec">
        <div className="e-how-head"><span className="e-k"><Glyph name="route" size={13} />How one lead travels</span></div>
        <div className="w-map f-map">
          <svg viewBox="0 0 1000 720" preserveAspectRatio="none" className="w-lines f-lines" aria-hidden="true">
            {nodes.map((n) => {
              const d = n.side === "in" ? curve(n, core) : n.side === "out" ? curve(core, n) : `M${core.x} ${core.y + 120} C ${core.x} ${n.y - 40}, ${n.x} ${core.y + 160}, ${n.x} ${n.y}`;
              return (
                <g key={n.id} className={`t-${n.tone}`}>
                  <path d={d} />
                  <path d={d} className="flow" />
                </g>
              );
            })}
          </svg>
          <span className="f-col" style={{ left: "13%", top: `${(40 / 720) * 100}%` }}>Ways in</span>
          <span className="f-col" style={{ left: "87%", top: `${(40 / 720) * 100}%` }}>Into GoHighLevel</span>
          <span className="f-col" style={{ left: "87%", top: `${(400 / 720) * 100}%` }}>And back out</span>
          <a className="w-core f-core t-green" href={fwPart.engine} style={{ left: `${core.x / 10}%`, top: `${(core.y / 720) * 100}%` }}>
            <span className="f-core-h"><img src="/fernway-mark.svg" alt="" /><b>Fernway</b><Glyph name="arrow" size={13} /></span>
            <ol className="f-scans">
              {scans.map((s) => (
                <li key={s.t}><span className="e-tile"><Glyph name={s.g} size={13} /></span><span><b>{s.t}</b><small>{s.s}</small></span></li>
              ))}
            </ol>
            <span className="f-retry"><Glyph name="retry" size={13} />GHL busy, down or silent: re-sent on a clock, 8 tries over 24 h</span>
          </a>
          {nodes.map((n) => (
            <a key={n.id} href={n.href} className={`w-node t-${n.tone}`} style={{ left: `${n.x / 10}%`, top: `${(n.y / 720) * 100}%` }}>
              <span className="e-tile"><Glyph name={n.g} size={16} /></span>
              <span><b>{n.title}</b><small>{n.sub}</small></span>
              <Glyph name="arrow" size={13} />
            </a>
          ))}
        </div>
        <div className="w-chain f-chain">
          <a className="f-chain-core t-green" href={fwPart.engine}>
            <span className="f-core-h"><img src="/fernway-mark.svg" alt="" /><b>Fernway</b><Glyph name="arrow" size={13} /></span>
            <ol className="f-scans">
              {scans.map((s) => (
                <li key={s.t}><span className="e-tile"><Glyph name={s.g} size={13} /></span><span><b>{s.t}</b><small>{s.s}</small></span></li>
              ))}
            </ol>
          </a>
          {groups.map((gr) => (
            <div key={gr.side}>
              <span className="f-chain-k">{gr.k}</span>
              <ol>
                {nodes.filter((n) => n.side === gr.side).map((n) => (
                  <li key={n.id}><a href={n.href} className={`t-${n.tone}`}><span className="e-tile"><Glyph name={n.g} size={16} /></span><span><b>{n.title}</b><small>{n.sub}</small></span><Glyph name="arrow" size={13} /></a></li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="w-stack" id="built-with">
        <div className="e-how-head"><span className="e-k"><Glyph name="code" size={13} />Built with</span></div>
        <ul className="w-rows">
          {stack.map((r) => (
            <li key={r.part} className={`t-${r.tone}`}>
              <span className="w-part"><span className="e-tile"><Glyph name={r.g} size={16} /></span><b>{r.part}</b></span>
              <span className="w-techs">{r.tech.map((t) => <TechChip key={t.name} t={t} />)}</span>
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
