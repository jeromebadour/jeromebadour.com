import { EFooter, EHeader, ETabbar } from "./Shell";
import { Glyph, type GlyphName } from "./Glyph";
import { AutoRefresh } from "./AutoRefresh";
import { pagesIn } from "@/lib/pages";
import { nowLabel } from "@/lib/time";
import type { Status } from "@/lib/server/messages";

// /m/<token> (plan §7): the sender's live status page. Received, Read (when Jerome opens it in the console), Replied
// (his answer, also sent by email). Not indexed by search engines. Checks for news every 30 seconds until replied.
const SOON = { this_week: "This week", this_month: "This month", no_rush: "No rush" } as const;

export function StatusPage({ m }: { m: Status }) {
  const steps: [GlyphName, string, string, Date | null][] = [
    ["mail", "green", "Received", m.created_at],
    ["search", "blue", "Read", m.read_at],
    ["message", "violet", "Replied", m.replied_at],
  ];
  const first = m.name.split(/\s+/)[0];
  return (
    <div className="page" data-v="e">
      <EHeader on="message" />
      {m.status !== "replied" && <AutoRefresh seconds={30} />}

      <section className="w-top">
        <div className="w-crumb"><Glyph name="message" size={13} /><span>Your message</span></div>
        <div className="w-title">
          <span className="e-tile p-big t-violet"><Glyph name="message" size={26} /></span>
          <div>
            <h1>Your message</h1>
            <p className="e-line">This page updates by itself, so you don&apos;t have to refresh it. I refresh my inbox enough for both of us.</p>
          </div>
        </div>
      </section>

      <section className="st-track">
        {steps.map(([g, t, k, at], n) => (
          <div key={k} className={`st-step t-${t}${at ? " done" : ""}`}>
            <span className="a-dot"><Glyph name={g} size={15} /></span>
            <div><b>{k}</b><span>{at ? nowLabel(at) : "Not yet"}</span></div>
            {n < steps.length - 1 && <i className={`st-line${steps[n + 1][3] ? "" : " wait"}`} aria-hidden="true" />}
          </div>
        ))}
      </section>

      <section className="st-body">
        {m.reply ? (
          <article className="st-reply">
            <header>
              <img src="/jerome.jpg" alt="" className="st-photo" />
              <div><b>Jerome Badour</b><span>jerome@jeromebadour.com · {nowLabel(m.replied_at!)}</span></div>
            </header>
            {m.reply.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            {pagesIn(m.reply).length > 0 && (
              <div className="e-pc">
                {pagesIn(m.reply).map((x) => <a key={x.href} href={x.href} className="pc-page"><Glyph name="arrow" size={12} />{x.title}</a>)}
              </div>
            )}
          </article>
        ) : (
          <article className="st-reply st-wait">
            <header>
              <img src="/jerome.jpg" alt="" className="st-photo" />
              <div><b>Jerome Badour</b><span>{m.read_at ? "Read. Answer being written, then rewritten." : "Not read yet"}</span></div>
            </header>
            <p>Thanks, {first}. My answer will show here and come to {m.email}.</p>
          </article>
        )}

        <aside className="st-brief">
          <div className="h-k t-sage"><span className="e-tile"><Glyph name="release" size={15} /></span>Your brief</div>
          <ul className="a-list">
            <li><b>What you need</b><span>{m.brief}</span></li>
            <li><b>Built with</b><span>{m.built_with.length ? m.built_with.join(", ") : "Not said"}</span></li>
            <li><b>How soon</b><span>{SOON[m.how_soon]}</span></li>
            <li><b>From</b><span>{m.name} · {m.email}</span></li>
          </ul>
          <p className="st-note"><Glyph name="mail" size={13} />Answering the email reaches me directly.</p>
        </aside>
      </section>

      <EFooter />
      <ETabbar on="message" />
    </div>
  );
}
