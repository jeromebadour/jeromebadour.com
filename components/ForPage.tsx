import { EFooter, EHeader, ETabbar } from "./Shell";
import { Brand, Glyph } from "./Glyph";

// /for/<job> (plan §2, §8): a page made in the console for one Upwork proposal: the job's title and link, a two-line
// note, three proofs from the registry. No message box, no email, no Ask (it leads to a message): every way to reach
// Jerome directly is gone, the footer keeps only Upwork and GitHub. "Reply on Upwork" with the fact that the
// conversation stays there (BUILD-RULES 2.26). Not indexed by search engines.
import type { ProofCard } from "./W3Part";
import type { Proposal } from "@/lib/server/proposals";

export function ForPage({ p, cards }: { p: Proposal; cards: ProofCard[] }) {
  return (
    <div className="page" data-v="e">
      <EHeader upwork on="none" />

      <section className="f-top">
        <div className="f-job">
          <span className="f-for">For your job</span>
          <h1>{p.title}</h1>
          <a className="f-link" href={p.job_url}><Brand name="upwork" size={14} />The job on Upwork</a>
        </div>
        <div className="f-note">
          <img src="/jerome.jpg" alt="Jerome Badour" className="f-photo" />
          <div>
            <p>{p.note}</p>
            <span className="f-sig">Jerome Badour</span>
          </div>
        </div>
      </section>

      <section className="f-proofs">
        {cards.map((c, n) => (
          <article key={c.id} className={`f-proof t-${c.tone}`}>
            <div className="f-img"><img src={c.img} alt="" className={c.fit ? "fit" : undefined} /></div>
            <div className="f-txt">
              <div className="f-n"><span className="h-n">{String(n + 1).padStart(2, "0")}</span><span className="e-tile"><Glyph name={c.g} size={15} /></span></div>
              <b>{p.headlines[n] || c.title}</b>
              <p>{c.line}</p>
              <div className="e-pc">
                <a href={c.href} className="pc-page"><Glyph name="arrow" size={12} />{c.title}</a>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="f-reply">
        <a className="e-btn e-hire" href={p.job_url}><Brand name="upwork" size={15} />Reply on Upwork</a>
        <span>Our conversation stays on Upwork.</span>
        <div className="f-more">
          <a href="/work/w3arena"><Glyph name="arrow" size={13} />W3Arena</a>
          <a href="/services"><Glyph name="arrow" size={13} />Services</a>
          <a href="/how-i-work"><Glyph name="arrow" size={13} />How I work</a>
        </div>
      </section>

      <EFooter upwork />
      <ETabbar upwork on="none" />
    </div>
  );
}
