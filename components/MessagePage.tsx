"use client";
import { useState } from "react";
import { EFooter, EHeader, ETabbar } from "./Shell";
import { out } from "@/lib/links";
import { Glyph, type GlyphName } from "./Glyph";

// /message (plan §7): the brief, written from the Ask conversation (or empty without one), checked and edited by the
// client, then sent. 3 messages an hour per visitor, a hidden trap field, no captcha. Sending lands on /m/<token>.
// The design picture shows the brief written from the Ask page's example question.
const stacks = ["Node.js", "React / Next.js", "Python", "PHP", "WordPress", "Not sure yet"];
const urgency: [string, string][] = [["amber", "This week"], ["blue", "This month"], ["green", "No rush"]];
const next: [GlyphName, string, string, string][] = [
  ["mail", "green", "Received", "Right away: a status page, and an email with its link."],
  ["search", "blue", "Read", "When I open it. The status page shows the time."],
  ["message", "violet", "Replied", "My answer by email, and on the same status page."],
];

export function MessagePage() {
  const [stack, setStack] = useState<string[]>(["Not sure yet"]);
  const [when, setWhen] = useState("This month");
  const flip = (s: string) => setStack((x) => {
    if (s === "Not sure yet") return [s];
    const y = x.includes(s) ? x.filter((v) => v !== s) : [...x.filter((v) => v !== "Not sure yet"), s];
    return y.length ? y : ["Not sure yet"];
  });
  return (
    <div className="page" data-v="e">
      <EHeader on="message" />

      <section className="w-top">
        <div className="w-crumb"><Glyph name="message" size={13} /><span>Message</span></div>
        <div className="w-title">
          <span className="e-tile p-big t-violet"><Glyph name="message" size={26} /></span>
          <div>
            <h1>Message</h1>
            <p className="e-line">A short brief, written from your questions. Nothing is sent until you press Send.</p>
          </div>
        </div>
      </section>

      <section className="m-board">
        <form className="m-form" action="#" onSubmit={(e) => e.preventDefault()}>
          <div className="m-from">
            <Glyph name="ask" size={14} />
            <span>Written from your question</span>
            <b>“Have you built a payment system?”</b>
            <a href="/ask"><Glyph name="arrow" size={12} />Back to Ask</a>
          </div>

          <label className="m-field">
            <span className="m-l"><Glyph name="release" size={14} />What you need</span>
            <textarea rows={4} defaultValue="Payments for my web app: a checkout, a receipt for every purchase, refunds, and an admin page to see and manage all of it." />
          </label>

          <div className="m-field">
            <span className="m-l"><Glyph name="code" size={14} />Built with</span>
            <div className="m-chips">
              {stacks.map((s) => (
                <button key={s} type="button" className={stack.includes(s) ? "on" : ""} aria-pressed={stack.includes(s)} onClick={() => flip(s)}>
                  {stack.includes(s) && <Glyph name="tested" size={13} />}{s}
                </button>
              ))}
            </div>
          </div>

          <div className="m-field">
            <span className="m-l"><Glyph name="pulse" size={14} />How soon</span>
            <div className="m-chips">
              {urgency.map(([t, s]) => (
                <button key={s} type="button" className={`t-${t}${when === s ? " on" : ""}`} aria-pressed={when === s} onClick={() => setWhen(s)}>
                  {when === s && <Glyph name="tested" size={13} />}{s}
                </button>
              ))}
            </div>
          </div>

          <div className="m-two">
            <label className="m-field"><span className="m-l"><Glyph name="about" size={14} />Your name</span><input defaultValue="Daniel Moreau" /></label>
            <label className="m-field"><span className="m-l"><Glyph name="mail" size={14} />Your email</span><input type="email" defaultValue="daniel@example.com" /></label>
          </div>
          <input className="m-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" />

          <div className="m-send">
            <button className="e-btn e-hire" type="submit"><Glyph name="arrow" size={15} />Send</button>
            <span>Replies come from jerome@jeromebadour.com.</span>
          </div>
        </form>

        <aside className="m-side">
          <div className="h-k t-violet"><span className="e-tile"><Glyph name="message" size={15} /></span>After you send</div>
          <ol className="m-steps">
            {next.map(([g, t, k, d]) => (
              <li key={k} className={`t-${t}`}>
                <span className="a-dot"><Glyph name={g} size={14} /></span>
                <div><b>{k}</b><p>{d}</p></div>
              </li>
            ))}
          </ol>
          <ul className="a-list m-facts">
            <li><b>Kept private</b><span>Your brief is read by me only. <a href="/privacy">Privacy</a></span></li>
            <li><b>On Upwork too</b><span>Hiring through Upwork works the same way. <a href={out.upwork}>Upwork profile</a></span></li>
          </ul>
        </aside>
      </section>

      <EFooter />
      <ETabbar on="message" />
    </div>
  );
}
