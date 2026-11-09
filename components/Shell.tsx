import { Brand, Glyph } from "./Glyph";
import { out, page } from "@/lib/links";
import { SocialChips } from "./Socials";

// The header, footer and phone tab bar every page shares, the home page included.
export type NavKey = "apps" | "services" | "how" | "about" | "ask" | "message" | "none";

const W3Mark = () => <img src="/w3a-round-48.png" alt="" className="e-w3a" />;
const DistillMark = () => <img src="/distill-mark.svg" alt="" className="e-dm" />;

const appsMenu = [
  { mark: <W3Mark />, title: "W3Arena", dom: "w3arena.pro", sub: "Gaming and community platform: website, forum, Windows app, shop, console", tone: "red", href: page.w3arena },
  { mark: <DistillMark />, title: "Distill", sub: "AI summaries traced to their source", tone: "blue", href: page.distill },
  { mark: <Glyph name="services" size={17} />, title: "What I build", sub: "Websites, web apps, desktop apps, AI, servers", tone: "sage", href: page.services },
];

export function EHeader({ on = "apps", upwork = false }: { on?: NavKey; upwork?: boolean }) {
  return (
  <header className="e-hdr">
    <a className="e-brand" href={page.home}><span className="e-mono">JB</span>Jerome Badour</a>
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
      {!upwork && <a className={`e-nl${on === "ask" ? " on" : ""} t-sage`} href={page.ask}><span className="e-nt"><Glyph name="ask" size={14} /></span>Ask<span className="e-live">Live</span></a>}
    </nav>
    <div className="e-hdr-r">
      {!upwork && <a className={`e-btn e-ghost${on === "message" ? " on" : ""}`} href={page.message}><Glyph name="message" size={15} />Message</a>}
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
      <a className="e-brand" href={page.home}><span className="e-mono">JB</span>Jerome Badour</a>
      {!upwork && <a className="e-foot-mail" href={out.mail}><Glyph name="mail" size={15} />jerome@jeromebadour.com</a>}
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
      {!upwork && <a className={`t-sage${on === "ask" ? " on" : ""}`} href={page.ask}><span className="e-nt"><Glyph name="ask" size={14} /></span>Ask</a>}
    </nav>
  );
}
