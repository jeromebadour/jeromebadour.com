"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { EFooter, EHeader, ETabbar } from "./Shell";
import { out } from "@/lib/links";
import { Glyph, type GlyphName } from "./Glyph";
import { sendMessageAction, type MessageState } from "@/app/actions/message";

// /message (plan §7): the brief, written from the Ask conversation (or empty without one), checked and edited by the
// client, then sent. 3 messages an hour per visitor, a hidden trap field, no captcha. Sending lands on /m/<token>.
const stacks = ["Node.js", "React / Next.js", "Python", "PHP", "WordPress", "Not sure yet"];
const urgency: [string, string, string][] = [["amber", "this_week", "This week"], ["blue", "this_month", "This month"], ["green", "no_rush", "No rush"]];
const next: [GlyphName, string, string, string][] = [
  ["mail", "green", "Received", "Right away: a status page, and an email with its link."],
  ["search", "blue", "Read", "When I open it. The status page shows the time."],
  ["message", "violet", "Replied", "My answer by email, and on the same status page."],
];

function Send() {
  const { pending } = useFormStatus();
  return <button className="e-btn e-hire" type="submit" disabled={pending}><Glyph name="arrow" size={15} />{pending ? "Sending" : "Send"}</button>;
}

const Err = ({ text }: { text?: string }) => (text ? <span className="m-err"><Glyph name="close" size={13} />{text}</span> : null);

export function MessagePage({ from, draft = "", paused = false }: { from?: { id: string; question: string } | null; draft?: string; paused?: boolean }) {
  const [state, action] = useActionState<MessageState, FormData>(sendMessageAction, {});
  const v = state.values ?? {};
  const [stack, setStack] = useState<string[]>(Array.isArray(v.built_with) && v.built_with.length ? v.built_with : ["Not sure yet"]);
  const [when, setWhen] = useState(typeof v.how_soon === "string" && v.how_soon ? v.how_soon : "this_month");
  const e = state.errors ?? {};
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
        <form className="m-form" action={action}>
          {from && (
            <div className="m-from">
              <Glyph name="ask" size={14} />
              <span>Written from your question</span>
              <b>“{from.question}”</b>
              <a href="/ask"><Glyph name="arrow" size={12} />Back to Ask</a>
              <input type="hidden" name="from" value={from.id} />
            </div>
          )}
          {paused && <p className="m-paused"><Glyph name="pause" size={14} />Messages are paused for a short while. Upwork reaches me in the meantime.</p>}

          <label className="m-field">
            <span className="m-l"><Glyph name="release" size={14} />What you need</span>
            <textarea name="brief" rows={4} maxLength={4000} required defaultValue={typeof v.brief === "string" ? v.brief : draft} aria-invalid={!!e.brief} />
            <Err text={e.brief} />
          </label>

          <div className="m-field">
            <span className="m-l"><Glyph name="code" size={14} />Built with</span>
            <div className="m-chips">
              {stack.map((s) => <input key={s} type="hidden" name="built_with" value={s} />)}
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
              <input type="hidden" name="how_soon" value={when} />
              {urgency.map(([t, k, s]) => (
                <button key={k} type="button" className={`t-${t}${when === k ? " on" : ""}`} aria-pressed={when === k} onClick={() => setWhen(k)}>
                  {when === k && <Glyph name="tested" size={13} />}{s}
                </button>
              ))}
            </div>
          </div>

          <div className="m-two">
            <label className="m-field"><span className="m-l"><Glyph name="about" size={14} />Your name</span><input name="name" autoComplete="name" maxLength={80} required defaultValue={typeof v.name === "string" ? v.name : ""} aria-invalid={!!e.name} /><Err text={e.name} /></label>
            <label className="m-field"><span className="m-l"><Glyph name="mail" size={14} />Your email</span><input name="email" type="email" autoComplete="email" maxLength={200} required defaultValue={typeof v.email === "string" ? v.email : ""} aria-invalid={!!e.email} /><Err text={e.email} /></label>
          </div>
          <input className="m-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" />

          {e.form && <p className="m-err m-err-form"><Glyph name="pause" size={14} />{e.form}</p>}
          <div className="m-send">
            <Send />
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
