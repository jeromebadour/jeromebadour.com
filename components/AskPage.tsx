"use client";
import { useState } from "react";
import { EFooter, EHeader, ETabbar } from "./Shell";
import { w3aPart } from "@/lib/links";
import { Glyph, type GlyphName } from "./Glyph";

// /ask (plan §2, §6): Ask about my work, full size. The home field opens here with the question in.
// Answers come only from the site's pages and the proof registry; each point carries proof chips; a point without a
// valid proof is not shown. Limits: 10 an hour, 30 a day, 500 characters (plan §6). Kept 30 days (privacy page).
// The conversation below is the design picture: one real question with an answer built from approved page facts.
type Proof = { kind: "live" | "release" | "code" | "demo" | "screen" | "page"; label: string; href: string };
type Point = { t: string; proofs: Proof[] };

const example: { q: string; stages: string[]; points: Point[]; close: string } = {
  q: "Have you built a payment system?",
  stages: ["Read the question", "Found 3 pages", "Wrote 4 points"],
  points: [
    { t: "Yes. W3Arena's shop takes payments 3+ ways: crypto, PayPal, and local sellers in 6+ countries.", proofs: [{ kind: "page", label: "Shop", href: "/work/w3arena/shop" }, { kind: "screen", label: "Top up", href: w3aPart.shop }] },
    { t: "Every purchase gets a receipt and waits in the inventory until it is activated; until then it can be refunded within 14 days.", proofs: [{ kind: "screen", label: "Receipt", href: w3aPart.shop }] },
    { t: "Behind it, the admin console sets the payment methods and the catalogue, and every staff action is on record.", proofs: [{ kind: "page", label: "Admin console", href: "/work/w3arena/console" }, { kind: "screen", label: "Payments", href: w3aPart.console }] },
    { t: "Before that, the shop ran on Tebex, a hosted payment provider, so both kinds are covered: a provider that hosts the checkout, and payments built into the app.", proofs: [{ kind: "page", label: "Built with", href: "/work/w3arena" }] },
  ],
  close: "Your project isn't tied to W3Arena's methods: I connect whichever provider fits it, such as Stripe, PayPal, Paddle or a local one, with the same receipts, refunds and admin view.",
};

const starters: [GlyphName, string][] = [
  ["ai", "Can you add AI to my app?"],
  ["server", "How do you keep a server running?"],
  ["console", "Have you built an admin dashboard?"],
  ["search", "How do you fix a bug you can't see?"],
  ["desktop", "Have you built a Windows app?"],
];

export function AskPage() {
  const [q, setQ] = useState("");
  return (
    <div className="page" data-v="e">
      <EHeader on="ask" />

      <section className="w-top">
        <div className="w-crumb"><Glyph name="ask" size={13} /><span>Ask</span></div>
        <div className="w-title">
          <span className="e-tile p-big t-sage"><Glyph name="ask" size={26} /></span>
          <div>
            <h1>Ask about my work</h1>
            <p className="e-line">Answers come from this site's own pages, and every point links to its proof.</p>
          </div>
        </div>
      </section>

      <section className="k-board">
        <div className="k-chat">
          <div className="k-q"><span className="k-who"><Glyph name="about" size={14} /></span><p>{example.q}</p></div>
          <div className="k-a">
            <div className="k-stages">
              {example.stages.map((s) => (<span key={s}><Glyph name="tested" size={13} />{s}</span>))}
            </div>
            <ol>
              {example.points.map((p, n) => (
                <li key={p.t}>
                  <span className="h-n">{String(n + 1).padStart(2, "0")}</span>
                  <div>
                    <p>{p.t}</p>
                    <div className="e-pc">
                      {p.proofs.map((x) => (<a key={x.label} href={x.href} className={`pc-${x.kind}`}><Glyph name={x.kind === "page" ? "arrow" : x.kind} size={12} />{x.label}</a>))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="k-close">{example.close}</p>
            <div className="k-next">
              <a className="e-btn e-hire" href="/message"><Glyph name="message" size={15} />Turn this into a message</a>
              <span>The brief is written from this conversation, and you check it before it is sent.</span>
            </div>
          </div>

          <form className="k-field" action="#" onSubmit={(e) => e.preventDefault()}>
            <Glyph name="ask" size={17} />
            <textarea rows={1} maxLength={500} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Have you built a booking system?" aria-label="Ask about my work" />
            <span className="k-count">{q.length} / 500</span>
            <button className="e-btn e-askb" type="submit"><Glyph name="arrow" size={15} />Ask</button>
          </form>
        </div>

        <aside className="k-side">
          <div className="h-k t-sage"><span className="e-tile"><Glyph name="ask" size={15} /></span>Questions to start with</div>
          <div className="k-starters">
            {starters.map(([g, t]) => (<button key={t} type="button" onClick={() => setQ(t)}><Glyph name={g} size={14} />{t}</button>))}
          </div>

          <div className="h-k t-blue k-gap"><span className="e-tile"><Glyph name="shield" size={15} /></span>How answers work</div>
          <ul className="a-list">
            <li><b>Only from this site</b><span>Every point comes from these pages and links to its proof; a point without one is not shown.</span></li>
            <li><b>About my work only</b><span>Other questions get a short, polite no.</span></li>
            <li><b>10 an hour, 30 a day</b><span>Up to 500 characters each; a failed answer doesn't count.</span></li>
            <li><b>Kept 30 days</b><span>Questions and answers, then deleted. <a href="/privacy">Privacy</a></span></li>
          </ul>
        </aside>
      </section>

      <EFooter />
      <ETabbar on="ask" />
    </div>
  );
}
