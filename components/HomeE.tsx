import { Brand, brandColour, Glyph, type GlyphName } from "./Glyph";
import { EFooter, EHeader, ESocials, ETabbar } from "./Shell";
import { out, page, w3aPart } from "@/lib/links";
import { B, G, type Tech } from "./W3Page";
import { usedIn } from "./W3Part";
import { ToolChip } from "./ToolChip";


const W3Mark = () => <img src="/w3a-round-48.png" alt="" className="e-w3a" />;
const DistillMark = () => <img src="/distill-mark.svg" alt="" className="e-dm" />;


type Part = { g: GlyphName; tone: string; title: string; sub: string; href: string };
const w3aParts: Part[] = [
  { g: "web", tone: "sage", title: "Website", sub: "Public pages, live stats", href: w3aPart.website },
  { g: "forum", tone: "blue", title: "Forum", sub: "Community, reports, moderation", href: w3aPart.forum },
  { g: "desktop", tone: "red", title: "Windows app", sub: "Chat, voice, matchmaking", href: w3aPart.desktop },
  { g: "shop", tone: "amber", title: "Shop", sub: "Payments, wallet, receipts", href: w3aPart.shop },
  { g: "console", tone: "violet", title: "Admin console", sub: "Roles, permissions, audit log", href: w3aPart.console },
  { g: "server", tone: "green", title: "Servers", sub: "80+ servers in 6+ regions", href: w3aPart.servers },
];
const distillParts: Part[] = [
  { g: "about", tone: "blue", title: "Accounts", sub: "Sign-in, saved library", href: page.distill },
  { g: "ai", tone: "violet", title: "AI summaries", sub: "Every point linked to its source", href: page.distill },
  { g: "how", tone: "sage", title: "Checked figures", sub: "Every number checked by code", href: page.distill },
  { g: "console", tone: "amber", title: "Owner console", sub: "Roles, spend caps, audit log", href: out.distillDemo },
  { g: "code", tone: "green", title: "Tests", sub: "Run on every push", href: out.distillTests },
  { g: "server", tone: "red", title: "Backups", sub: "Restored every week", href: page.distill },
];
const allShots: { img: string; g: GlyphName; tone: string; label: string; pos?: string; href: string }[] = [
  { img: "/p/dash-games.jpg", g: "console", tone: "violet", label: "Admin dashboard", href: w3aPart.console, pos: "0 0" },
  { img: "/p/2-checked-summaries.jpg", g: "ai", tone: "blue", label: "AI you can check", href: page.distill },
  { img: "/p/shop-store.jpg", g: "shop", tone: "amber", label: "In-app shop", href: w3aPart.shop, pos: "0 30%" },
  { img: "/p/5-game-server-fleet.jpg", g: "server", tone: "green", label: "Server fleet", href: w3aPart.servers },
];

const builds: { g: GlyphName; tone: string; title: string; sub: string; img: string; pos: string; href: string }[] = [
  { g: "web", tone: "sage", title: "Websites", sub: "Landing pages, live stats, forums", img: "/p/2-website-ladder.jpg", pos: "50% 0", href: w3aPart.website },
  { g: "app", tone: "blue", title: "Web apps", sub: "Accounts, saved libraries, admin consoles", img: "/p/3-usage-and-cost.jpg", pos: "50% 62%", href: page.distill },
  { g: "desktop", tone: "red", title: "Windows desktop apps", sub: "Chat, voice, shop, auto-update, 6+ languages", img: "/p/2-app-shop.jpg", pos: "0 30%", href: w3aPart.desktop },
  { g: "ai", tone: "violet", title: "AI features", sub: "Chatbots, translation and checked summaries, with spend caps", img: "/p/1-cover-ai-catalog.jpg", pos: "50% 45%", href: w3aPart.ai },
  { g: "server", tone: "green", title: "Servers", sub: "Releases that disconnect nobody, backups that are tested", img: "/p/6-reliability.jpg", pos: "50% 40%", href: w3aPart.servers },
];

const stats: { g: GlyphName; tone: string; v: string; l: string }[] = [
  { g: "server", tone: "green", v: "80+ servers", l: "in 6+ regions" },
  { g: "pulse", tone: "amber", v: "17,000+", l: "games hosted" },
  { g: "how", tone: "sage", v: "Tested", l: "before every release" },
];


const toolbox: { part: string; g: GlyphName; tone: string; tech: Tech[]; note: string }[] = [
  { part: "Languages", g: "code", tone: "blue", tech: [B("JavaScript","js"), B("TypeScript","ts"), B("Python","python"), B("C","c"), B("C++","cpp"), B("Go","go"), G("SQL","grid"), G("PL/pgSQL","code"), G("JASS","code"), B("HTML","html"), B("CSS","css"), B("Bash","bash"), G("PowerShell","console")], note: "From game servers in C++ to web apps in TypeScript" },
  { part: "Web and realtime", g: "web", tone: "sage", tech: [B("Node.js","node"), B("React","react"), B("Next.js","next"), B("Socket.IO","socketio"), G("Server-Sent Events","live"), B("WebRTC","webrtc"), G("TipTap","code")], note: "Live pages, chat and voice that update without a reload" },
  { part: "Desktop", g: "desktop", tone: "red", tech: [B("Electron","electron"), B("NSIS","nsis"), G("koffi","code"), G("capstone","code")], note: "A Windows app that installs, updates and repairs itself" },
  { part: "Data", g: "grid", tone: "blue", tech: [B("PostgreSQL","postgres"), B("MySQL","mysql"), B("Redis","redis"), G("ProxySQL","grid")], note: "A standby copy kept in sync, backups restore-tested" },
  { part: "AI", g: "ai", tone: "violet", tech: [B("Claude API","claude")], note: "Translation and checked summaries, with spend caps" },
  { part: "Servers and delivery", g: "server", tone: "green", tech: [B("Linux","linux"), B("Docker","docker"), B("Nginx","nginx"), B("Cloudflare","cloudflare"), B("WireGuard","wireguard"), B("PM2","pm2"), G("coturn","server"), B("Git","git")], note: "Releases that disconnect nobody, across 3+ providers" },
  { part: "Security", g: "shield", tone: "green", tech: [G("Ed25519 signing","shield"), G("Row-level security","shield"), G("2FA","shield")], note: "Signed updates, access by row and role, 2FA on every console action" },
  { part: "Payments", g: "shop", tone: "amber", tech: [B("PayPal","paypal"), G("Crypto","shop"), G("Tebex","shop"), G("Local sellers","region")], note: "Wallets, receipts and refunds in 6+ countries" },
];
const toolCount = new Set(toolbox.flatMap((r) => r.tech.map((t) => t.name))).size;

export function HomeE({ tab = "all" }: { tab?: "all" | "w3a" | "distill" }) {
  const parts = tab === "distill" ? distillParts : w3aParts;
  return (
    <div className="page" data-v="e">
      <EHeader on="apps" />

      <section className="e-hero">
        <div className="e-left">
          <div className="e-id">
            <img src="/jerome.jpg" alt="Jerome Badour" className="e-photo" />
            <div>
              <span className="e-role">Full-stack developer: web, desktop, AI and servers</span>
              <div className="e-soc">
                <ESocials />
              </div>
            </div>
          </div>
          <h1>I build live products <span>and keep them running.</span></h1>
          <p className="e-line">Websites, web apps, Windows desktop apps, AI features and the servers behind them, from a quick bug fix to a full platform.</p>
          <form className="e-ask" action={page.ask} method="get">
            <Glyph name="ask" size={17} />
            <input name="q" maxLength={500} required placeholder="Have you built a payment system?" aria-label="Ask about my work" />
            <button type="submit" className="e-btn e-askb"><Glyph name="arrow" size={15} />Ask</button>
          </form>
          <div className="e-stats">
            {stats.map((s) => (
              <div key={s.l} className={`e-stat t-${s.tone}`}>
                <span className="e-tile"><Glyph name={s.g} size={17} /></span>
                <span><b>{s.v}</b><small>{s.l}</small></span>
              </div>
            ))}
          </div>
        </div>

        <div className="e-board">
          <div className="e-tabs">
            <a className={`e-tab t-sage${tab === "all" ? " on" : ""}`} href={page.home}><Glyph name="ai" size={15} />Highlights</a>
            <a className={`e-tab t-red${tab === "w3a" ? " on" : ""}`} href="/?tab=w3a"><W3Mark /><span className="e-tab-n">W3Arena<span className="e-dom">w3arena.pro</span></span></a>
            <a className={`e-tab t-blue${tab === "distill" ? " on" : ""}`} href="/?tab=distill"><DistillMark />Distill<span className="e-tab-k">Web app</span></a>
          </div>
          {tab === "all" ? (
            <div className="e-mosaic">
              {allShots.map((m) => (
                <a key={m.label} className={`e-shot t-${m.tone}`} href={m.href}>
                  <img src={m.img} alt="" style={m.pos ? { objectPosition: m.pos } : undefined} />
                  <span className="e-cap"><span className="e-tile"><Glyph name={m.g} size={14} /></span>{m.label}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="e-board-body">
              <div className="e-win">
                <div className="e-win-bar"><span className="dot" />{tab === "distill" ? "distill.jeromebadour.com" : "w3arena.pro"}<Glyph name="live" size={13} /></div>
                <img src={tab === "distill" ? "/p/2-checked-summaries.jpg" : "/p/1-website-home.jpg"} alt="" />
              </div>
              <div className="e-parts">
                {parts.map((p) => (
                  <a key={p.title} className={`e-part t-${p.tone}`} href={p.href}>
                    <span className="e-tile"><Glyph name={p.g} size={16} /></span>
                    <span><b>{p.title}</b><small>{p.sub}</small></span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {tab === "distill" ? (
            <a className="e-board-foot" href={out.distillCode}>
              <Brand name="github" size={14} />Code on GitHub<span>tests run on every push</span><Glyph name="arrow" size={14} />
            </a>
          ) : (
            <a className="e-board-foot" href={out.w3aChangelog}>
              <Glyph name="release" size={14} />Latest release W3Arena 5.1.5<span>6 Nov 2026 · 6 changes</span><Glyph name="arrow" size={14} />
            </a>
          )}
        </div>
      </section>

      <ETabbar on="apps" />

      <section className="w-stack e-tools">
        <div className="e-how-head"><span className="e-k"><Glyph name="code" size={13} />What I work with<em className="e-count">{toolCount}+</em></span></div>
        <ul className="w-rows">
          {toolbox.map((r) => (
            <li key={r.part} className={`t-${r.tone}`}>
              <span className="w-part"><span className="e-tile"><Glyph name={r.g} size={16} /></span><b>{r.part}</b></span>
              <span className="w-techs">
                {r.tech.map((t) => <ToolChip key={t.name} t={t} places={usedIn(t.name)} />)}
              </span>
              <small>{r.note}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="e-builds">
        <div className="e-k"><Glyph name="services" size={13} />What I build</div>
        <div className="e-row">
          {builds.map((b) => (
            <a key={b.title} className={`e-b t-${b.tone}`} href={b.href}>
              <span className="e-thumb"><img src={b.img} alt="" style={{ objectPosition: b.pos }} /></span>
              <span className="e-b-txt">
                <span className="e-tile"><Glyph name={b.g} size={17} /></span>
                <span><b>{b.title}</b><small>{b.sub}</small></span>
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="e-how">
        <div className="e-how-head">
          <span className="e-k"><Glyph name="how" size={13} />How I work</span>
          <a className="e-btn e-ghost" href={page.how}><Glyph name="how" size={15} />How I work<Glyph name="arrow" size={14} /></a>
        </div>
        <div className="e-how-row">
          <div className="e-how-i t-amber"><span className="e-tile"><Glyph name="search" size={17} /></span><div><p>I find the root cause before I change anything.</p><span className="e-pc"><a className="pc-release" href={out.w3aChangelog}><Glyph name="release" size={12} />Hourly 13 s freeze removed</a></span></div></div>
          <div className="e-how-i t-green"><span className="e-tile"><Glyph name="server" size={17} /></span><div><p>Updates ship without stopping your users.</p><span className="e-pc"><a className="pc-release" href={w3aPart.servers}><Glyph name="release" size={12} />80+ servers, 0 games cut</a></span></div></div>
          <div className="e-how-i t-violet"><span className="e-tile"><Glyph name="shield" size={17} /></span><div><p>A standby server stays in sync and can take over at any time.</p><span className="e-pc"><a className="pc-live" href={w3aPart.standby}><Glyph name="live" size={12} />Took over with zero data lost</a></span></div></div>
          <div className="e-how-i t-blue"><span className="e-tile"><Glyph name="live" size={17} /></span><div><p>You can check my work before you hire me.</p><span className="e-pc"><a className="pc-live" href={page.w3arena}><Glyph name="live" size={12} />Live apps</a><a className="pc-code" href={out.github}><Glyph name="code" size={12} />Code</a><a className="pc-demo" href={out.distillDemo}><Glyph name="demo" size={12} />Admin demo</a></span></div></div>
        </div>
      </section>

      <EFooter />
    </div>
  );
}
