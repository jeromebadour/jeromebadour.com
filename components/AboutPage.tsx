import { EFooter, EHeader, ESocials, ETabbar } from "./Shell";
import { Brand, Glyph, type GlyphName } from "./Glyph";
import { APPS } from "@/lib/apps";
import { board } from "@/lib/server/board";

type Kind = "learn" | "work" | "ship";
const kinds: Record<Kind, { label: string; tone: string; g: GlyphName }> = {
  learn: { label: "Learning", tone: "blue", g: "code" },
  work: { label: "Client work", tone: "sage", g: "work" },
  ship: { label: "Shipped", tone: "green", g: "live" },
};

type Step = { when: string; kind: Kind; t: string; d: string; link?: [string, string, "page" | "release"] };
// The typed steps; each app's own "goes live" step is added from lib/apps.ts, in the order they went live.
const typed: Step[] = [
  { when: "2018", kind: "learn", t: "Started teaching myself to code", d: "By building small things to see how they work: a calculator, tic-tac-toe, mock-up forums and many more." },
  { when: "2018 to 2025", kind: "learn", t: "From small apps to full web apps", d: "Each project a step bigger than the last, with Harvard's CS50 and online courses along the way: HTML, CSS, JavaScript, Python, then Node.js and full-stack development." },
  { when: "Before W3Arena", kind: "work", t: "Local clients in Turkey and Lebanon", d: "Bug fixes and web apps for companies there, shipping and logistics firms among them, found locally rather than on Upwork." },
  { when: "May 2026", kind: "ship", t: "Founded W3Arena", d: "An online gaming and community platform, built end to end and run on my own: website, forum, Windows app, shop, admin console and game servers.", link: ["W3Arena", "/work/w3arena", "page"] },
  { when: "August 2026", kind: "ship", t: "W3Arena's releases go public", d: "RELEASES", link: ["Changelog", "https://w3arena.pro/changelog", "release"] },
];

export async function AboutPage() {
  // W3Arena's release count as the service board reads it from the changelog (lib/server/board.ts).
  const w = (await board()).w3arena;
  const releases = `Every release since is on its public changelog, written for the people who use it: ${w.dates.length} since August.`;
  const apps: Step[] = APPS.filter((a) => a.story).sort((a, b) => a.story!.at.localeCompare(b.story!.at))
    .map((a) => ({ when: a.story!.when, kind: "ship", t: a.story!.t, d: a.story!.d, link: [a.name, a.page, "page"] }));
  const story = [...typed.map((s) => (s.d === "RELEASES" ? { ...s, d: releases } : s)), ...apps];
  return (
    <div className="page" data-v="e">
      <EHeader on="about" />

      <section className="a-top">
        <div className="w-crumb"><Glyph name="about" size={13} /><span>About</span></div>
        <div className="a-id">
          <img src="/jerome.jpg" alt="Jerome Badour" className="a-photo" />
          <div>
            <h1>Jerome Badour</h1>
            <span className="a-role">Founder and Lead Developer of W3Arena</span>
            <p className="e-line">I build and run live products: websites, web apps, Windows desktop apps, AI features and the servers behind them.</p>
            <div className="e-soc">
              <a href="mailto:jerome@jeromebadour.com" className="t-mail off-up"><Glyph name="mail" size={14} />jerome@jeromebadour.com</a>
              <ESocials />
            </div>
          </div>
        </div>
      </section>

      <section className="a-body">
        <div className="a-story">
          <div className="h-k t-blue"><span className="e-tile"><Glyph name="how" size={15} /></span>The story so far</div>
          <div className="s-kinds">
            {(Object.keys(kinds) as Kind[]).map((k) => (
              <span key={k} className={`t-${kinds[k].tone}`}><Glyph name={kinds[k].g} size={13} />{kinds[k].label}</span>
            ))}
          </div>
          <ol className="a-line">
            {story.map((s) => {
              const k = kinds[s.kind];
              return (
                <li key={s.t} className={`t-${k.tone}`}>
                  <span className="a-when">{s.when}</span>
                  <span className="a-dot"><Glyph name={k.g} size={14} /></span>
                  <div><b>{s.t}</b><p>{s.d}</p>{s.link && <div className="e-pc"><a href={s.link[1]} className={`pc-${s.link[2]}`}><Glyph name={s.link[2] === "page" ? "arrow" : "release"} size={12} />{s.link[0]}</a></div>}</div>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="a-side">
          <div className="a-block">
            <div className="h-k t-violet"><span className="e-tile"><Glyph name="about" size={15} /></span>Education and certificates</div>
            <ul className="a-list">
              <li><b>BS, Actuarial Mathematics</b><span>Université Saint-Esprit de Kaslik (USEK), 2023 to 2026</span></li>
              <li><b>SOA Exam P</b><span>Probability, Society of Actuaries, passed</span></li>
              <li><b>SOA Exam FM</b><span>Financial Mathematics, Society of Actuaries, passed</span></li>
              <li><b>SOA Exam SRM</b><span>Statistics for Risk Modeling, Society of Actuaries, passed</span></li>
            </ul>
          </div>

          <div className="a-block">
            <div className="h-k t-sage"><span className="e-tile"><Glyph name="translate" size={15} /></span>Languages and places</div>
            <ul className="a-list a-two">
              <li><b>English</b><span>Fluent</span></li>
              <li><b>Arabic</b><span>Native</span></li>
              <li><b>Turkish</b><span>Native</span></li>
              <li><b>Turkey and Lebanon</b><span>Works remotely</span></li>
            </ul>
          </div>
        </aside>
      </section>

      <EFooter />
      <ETabbar on="about" />
    </div>
  );
}
