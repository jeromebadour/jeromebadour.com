import { EFooter, EHeader, ETabbar } from "./Shell";
import { Glyph, type GlyphName } from "./Glyph";

// /m/<token> (plan §7): the sender's live status page. Received, Read (when Jerome opens it in the console), Replied
// (his answer, also sent by email). Not indexed by search engines. The design picture shows the Replied state for the
// brief from /message; the reply is a sample of the form, not a quote of real correspondence.
const steps: [GlyphName, string, string, string][] = [
  ["mail", "green", "Received", "Mon 9 Nov, 00:31"],
  ["search", "blue", "Read", "Mon 9 Nov, 09:12"],
  ["message", "violet", "Replied", "Mon 9 Nov, 09:40"],
];

export function StatusPage() {
  return (
    <div className="page" data-v="e">
      <EHeader on="message" />

      <section className="w-top">
        <div className="w-crumb"><Glyph name="message" size={13} /><span>Your message</span></div>
        <div className="w-title">
          <span className="e-tile p-big t-violet"><Glyph name="message" size={26} /></span>
          <div>
            <h1>Your message</h1>
            <p className="e-line">This page updates by itself. The same link is in your email.</p>
          </div>
        </div>
      </section>

      <section className="st-track">
        {steps.map(([g, t, k, when], n) => (
          <div key={k} className={`st-step t-${t} done`}>
            <span className="a-dot"><Glyph name={g} size={15} /></span>
            <div><b>{k}</b><span>{when}</span></div>
            {n < steps.length - 1 && <i className="st-line" aria-hidden="true" />}
          </div>
        ))}
      </section>

      <section className="st-body">
        <article className="st-reply">
          <header>
            <img src="/jerome.jpg" alt="" className="st-photo" />
            <div><b>Jerome Badour</b><span>jerome@jeromebadour.com · Mon 9 Nov, 09:40</span></div>
          </header>
          <p>Hi Daniel, thanks for the clear brief.</p>
          <p>Payments like these are close to what runs in the W3Arena shop: a checkout, a receipt for every purchase, refunds, and an admin page that shows all of it. For your app I'd start by agreeing which provider fits, then build the checkout and receipts as the first step, with refunds and the admin page right after.</p>
          <p>Could you share what your app is built with and where it runs today? I'll come back with a short plan and a clear quote.</p>
          <div className="e-pc">
            <a href="/work/w3arena/shop" className="pc-page"><Glyph name="arrow" size={12} />Shop</a>
            <a href="/work/w3arena/console" className="pc-page"><Glyph name="arrow" size={12} />Admin console</a>
          </div>
        </article>

        <aside className="st-brief">
          <div className="h-k t-sage"><span className="e-tile"><Glyph name="release" size={15} /></span>Your brief</div>
          <ul className="a-list">
            <li><b>What you need</b><span>Payments for my web app: a checkout, a receipt for every purchase, refunds, and an admin page to see and manage all of it.</span></li>
            <li><b>Built with</b><span>Not sure yet</span></li>
            <li><b>How soon</b><span>This month</span></li>
            <li><b>From</b><span>Daniel Moreau · daniel@example.com</span></li>
          </ul>
          <p className="st-note"><Glyph name="mail" size={13} />Answering the email reaches me directly.</p>
        </aside>
      </section>

      <EFooter />
      <ETabbar on="message" />
    </div>
  );
}
