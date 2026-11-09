import { Brand, Glyph } from "./Glyph";
import { out, page } from "@/lib/links";
import { APPS } from "@/lib/apps";
import { SocialChips } from "./Socials";
import { LocalTime } from "./LocalTime";

// The Night shift mark: JB inside a status ring with one live segment.
export function NMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden="true" className="n-mark">
      <circle cx="19" cy="19" r="16" fill="none" stroke="var(--rule-strong)" strokeWidth="3" />
      <path d="M19 3a16 16 0 0 1 15.2 11" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <text x="19" y="23.6" textAnchor="middle" fontFamily="Archivo" fontWeight="900" fontSize="12.5" fill="var(--ink)">JB</text>
    </svg>
  );
}

// The header, footer and phone tab bar every page shares, the home page included.
export type NavKey = "apps" | "services" | "how" | "about" | "ask" | "message" | "none";

// Every app (lib/apps.ts), then what I build.
const appsMenu = [
  ...APPS.map((a) => ({ mark: <img src={a.mark} alt="" className={a.markClass} />, title: a.name, dom: a.menu.dom, sub: a.menu.sub, tone: a.tone, href: a.page })),
  { mark: <Glyph name="services" size={17} />, title: "What I build", dom: undefined, sub: "Websites, web apps, desktop apps, AI, servers", tone: "sage", href: page.services },
];

export function EHeader({ on = "apps", upwork = false }: { on?: NavKey; upwork?: boolean }) {
  return (
  <header className="e-hdr">
    <a className="e-brand" href={page.home}><NMark /><span className="n-wm">Jerome Badour</span></a>
    <nav className="e-nav">
      <div className="e-dd">
        <a className={`e-nl${on === "apps" ? " on" : ""} t-green`} href={page.home} aria-haspopup="true"><span className="e-nt"><span className="dot" /></span>Apps<Glyph name="chevron" size={13} /></a>
        <div className="e-menu">
          <span className="e-k"><span className="dot" />Apps running live</span>
          {appsMenu.map((m) => (
            <a key={m.title} className={`e-mi t-${m.tone}`} href={m.href}>
              <span className="e-tile">{m.mark}</span>
              <span><b>{m.title}{m.dom ? <span className="e-dom">{m.dom}</span> : null}</b><small>{m.sub}</small></span>
            </a>
          ))}
        </div>
      </div>
      <a className={`e-nl${on === "services" ? " on" : ""} t-amber`} href={page.services}><span className="e-nt"><Glyph name="work" size={14} /></span>Services</a>
      <a className={`e-nl${on === "how" ? " on" : ""} t-blue`} href={page.how}><span className="e-nt"><Glyph name="how" size={14} /></span>How I work</a>
      <a className={`e-nl${on === "about" ? " on" : ""} t-violet`} href={page.about}><span className="e-nt"><Glyph name="about" size={14} /></span>About</a>
      {!upwork && <a className={`e-nl${on === "ask" ? " on" : ""} t-sage off-up`} href={page.ask}><span className="e-nt"><Glyph name="ask" size={14} /></span>Ask<span className="e-live">Live</span></a>}
    </nav>
    <div className="e-hdr-r">
      <span className="n-status"><span className="dot" /><span className="n-live">{APPS.length} products live · </span><LocalTime prefix="local time " /></span>
      {!upwork && <a className={`e-btn e-ghost off-up${on === "message" ? " on" : ""}`} href={page.message}><Glyph name="message" size={15} />Message</a>}
      {upwork
        ? <a className="e-btn e-hire" href={out.upwork}><Brand name="upwork" size={15} />Reply<span className="e-long">on Upwork</span></a>
        : <a className="e-btn e-hire" href={out.upwork}><Brand name="upwork" size={15} />Hire<span className="e-long">on Upwork</span></a>}
    </div>
  </header>
  );
}

export function ESocials({ upwork = false }: { upwork?: boolean }) {
  return <SocialChips upwork={upwork} />;
}

export function EFooter({ upwork = false }: { upwork?: boolean }) {
  return (
  <footer className="e-foot">
    <div className="e-foot-l">
      <a className="e-brand" href={page.home}><NMark size={30} /><span className="n-wm">Jerome Badour</span></a>
      {!upwork && <a className="e-foot-mail off-up" href={out.mail}><Glyph name="mail" size={15} />jerome@jeromebadour.com</a>}
      <span className="e-foot-up on-up"><Brand name="upwork" size={14} />Our conversation stays on Upwork.</span>
    </div>
    <div className="e-soc"><ESocials upwork={upwork} /></div>
    <div className="e-foot-r"><a href={page.privacy}><Glyph name="shield" size={14} />Privacy</a><a href={page.terms}><Glyph name="release" size={14} />Terms</a><span>© 2026 Jerome Badour</span></div>
  </footer>
  );
}

export function ETabbar({ on = "apps", upwork = false }: { on?: NavKey; upwork?: boolean }) {
  return (
    <nav className="e-tabbar" aria-label="Main">
      <a className={`t-green${on === "apps" ? " on" : ""}`} href={page.home}><span className="e-nt"><span className="dot" /></span>Apps</a>
      <a className={`t-amber${on === "services" ? " on" : ""}`} href={page.services}><span className="e-nt"><Glyph name="work" size={14} /></span>Services</a>
      <a className={`t-blue${on === "how" ? " on" : ""}`} href={page.how}><span className="e-nt"><Glyph name="how" size={14} /></span>How I work</a>
      <a className={`t-violet${on === "about" ? " on" : ""}`} href={page.about}><span className="e-nt"><Glyph name="about" size={14} /></span>About</a>
      {!upwork && <a className={`t-sage off-up${on === "ask" ? " on" : ""}`} href={page.ask}><span className="e-nt"><Glyph name="ask" size={14} /></span>Ask</a>}
    </nav>
  );
}
