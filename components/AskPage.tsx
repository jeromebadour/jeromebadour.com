"use client";
import { useEffect, useRef, useState } from "react";
import { EFooter, EHeader, ETabbar } from "./Shell";
import { Brand, Glyph, type GlyphName } from "./Glyph";
import { out } from "@/lib/links";

// /ask (plan §2, §6): Ask about my work, full size. The home field opens here with the question in (?q=).
// Answers come only from the site's pages; each point carries proof chips; a point without a valid proof is not shown.
// The stages are real: each one shows when the server reaches it. Limits: 10 an hour, 30 a day, 500 characters.
type Proof = { kind: "live" | "release" | "code" | "demo" | "page"; label: string; href: string };
type Turn = {
  q: string; live: boolean; read: boolean; found: number; wrote: number;
  points: { text: string; proofs: Proof[] }[]; close: string; refused: string; stopped: string; id: string;
};
type AskEvent =
  | { type: "stage"; stage: "read" | "found" | "wrote"; n?: number }
  | { type: "point"; text: string; proofs: Proof[] }
  | { type: "close"; text: string }
  | { type: "refused"; text: string }
  | { type: "done"; id: string; points: number }
  | { type: "stopped"; reason: string; text: string };

const starters: [GlyphName, string][] = [
  ["ai", "Can you add AI to my app?"],
  ["server", "How do you keep a server running?"],
  ["console", "Have you built an admin dashboard?"],
  ["search", "How do you fix a bug you can't see?"],
  ["desktop", "Have you built a Windows app?"],
];
const WENT_WRONG = "Something went wrong writing this answer, and it didn't count. Ask again in a moment.";

function Stages({ t }: { t: Turn }) {
  const stages: [boolean, string][] = [
    [t.read, t.read ? "Read the question" : "Reading the question"],
    [t.found > 0, t.found > 0 ? `Found ${t.found} page${t.found === 1 ? "" : "s"}` : "Finding the work"],
    [t.wrote > 0, t.wrote > 0 ? `Wrote ${t.wrote} point${t.wrote === 1 ? "" : "s"}` : "Writing"],
  ];
  const next = stages.findIndex(([done]) => !done);
  const shown = t.live ? stages.slice(0, next === -1 ? 3 : next + 1) : stages.filter(([done]) => done);
  return (
    <div className="k-stages" aria-live="polite">
      {shown.map(([done, label]) => (<span key={label} className={done ? "" : "k-now"}><Glyph name={done ? "tested" : "pulse"} size={13} />{label}</span>))}
    </div>
  );
}

function Answer({ t }: { t: Turn }) {
  return (
    <div className="k-turn">
      <div className="k-q"><span className="k-who"><Glyph name="about" size={14} /></span><p>{t.q}</p></div>
      <div className="k-a">
        {!t.refused && !(t.stopped && !t.read) && <Stages t={t} />}
        {t.points.length > 0 && (
          <ol>
            {t.points.map((p, n) => (
              <li key={n}>
                <span className="h-n">{String(n + 1).padStart(2, "0")}</span>
                <div>
                  <p>{p.text}</p>
                  <div className="e-pc">
                    {p.proofs.map((x) => (<a key={x.href} href={x.href} className={`pc-${x.kind}`}><Glyph name={x.kind === "page" ? "arrow" : x.kind} size={12} />{x.label}</a>))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
        {t.close && <p className="k-close">{t.close}</p>}
        {t.refused && <p className="k-note"><Glyph name="shield" size={14} />{t.refused}</p>}
        {t.stopped && <p className="k-note"><Glyph name="pause" size={14} />{t.stopped}</p>}
        {!t.live && t.points.length > 0 && t.id && (
          <div className="k-next">
            <a className="e-btn e-hire off-up" href={`/message?from=${t.id}`}><Glyph name="message" size={15} />Turn this into a message</a>
            <span className="off-up">The brief is written from this conversation, and you check it before it is sent.</span>
            <a className="e-btn e-hire on-up" href={out.upwork}><Brand name="upwork" size={15} />Hire on Upwork</a>
            <span className="on-up">Our conversation stays on Upwork.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AskPage({ first = "", paused = false }: { first?: string; paused?: boolean }) {
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const busy = turns.some((t) => t.live);
  const started = useRef(false);

  async function run(question: string) {
    const text = question.trim().slice(0, 500);
    if (!text || busy) return;
    setQ("");
    setTurns((x) => [...x, { q: text, live: true, read: false, found: 0, wrote: 0, points: [], close: "", refused: "", stopped: "", id: "" }]);
    const patch = (f: (t: Turn) => Turn) => setTurns((x) => x.map((t, i) => (i === x.length - 1 ? f(t) : t)));
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: text }) });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const e = JSON.parse(line) as AskEvent;
          patch((t) => {
            switch (e.type) {
              case "stage": return e.stage === "read" ? { ...t, read: true } : e.stage === "found" ? { ...t, found: e.n ?? 1 } : { ...t, wrote: e.n ?? t.points.length };
              case "point": return { ...t, points: [...t.points, { text: e.text, proofs: e.proofs }] };
              case "close": return { ...t, close: e.text };
              case "refused": return { ...t, refused: e.text };
              case "stopped": return { ...t, stopped: e.text, live: false };
              case "done": return { ...t, id: e.id, live: false };
            }
          });
        }
      }
      patch((t) => (t.live ? { ...t, live: false, stopped: t.points.length ? "" : WENT_WRONG } : t));
    } catch {
      patch((t) => ({ ...t, live: false, stopped: WENT_WRONG }));
    }
  }

  useEffect(() => {
    if (first && !paused && !started.current) { started.current = true; void run(first); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first]);

  return (
    <div className="page" data-v="e">
      <EHeader on="ask" />

      <section className="w-top">
        <div className="w-crumb"><Glyph name="ask" size={13} /><span>Ask</span></div>
        <div className="w-title">
          <span className="e-tile p-big t-sage"><Glyph name="ask" size={26} /></span>
          <div>
            <h1>Ask about my work</h1>
            <p className="e-line">Answers come from this site&apos;s own pages, and every point links to its proof.</p>
          </div>
        </div>
      </section>

      <section className="k-board">
        <div className="k-chat">
          {paused && <p className="k-note"><Glyph name="pause" size={14} />Ask is paused for a short while. Every page is still here, and Upwork reaches me.</p>}
          {turns.map((t, n) => <Answer key={n} t={t} />)}
          <form className="k-field" onSubmit={(e) => { e.preventDefault(); void run(q); }}>
            <Glyph name="ask" size={17} />
            <textarea name="q" rows={1} maxLength={500} value={q} disabled={paused}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void run(q); } }}
              placeholder="Have you built a booking system?" aria-label="Ask about my work" />
            <span className="k-count">{q.length} / 500</span>
            <button className="e-btn e-askb" type="submit" disabled={busy || paused || !q.trim()}><Glyph name="arrow" size={15} />{busy ? "Writing" : "Ask"}</button>
          </form>
        </div>

        <aside className="k-side">
          <div className="h-k t-sage"><span className="e-tile"><Glyph name="ask" size={15} /></span>Questions to start with</div>
          <div className="k-starters">
            {starters.map(([g, t]) => (<button key={t} type="button" onClick={() => setQ(t)} disabled={paused}><Glyph name={g} size={14} />{t}</button>))}
          </div>

          <div className="h-k t-blue k-gap"><span className="e-tile"><Glyph name="shield" size={15} /></span>How answers work</div>
          <ul className="a-list">
            <li><b>Only from this site</b><span>Every point comes from these pages and links to its proof; a point without one is not shown.</span></li>
            <li><b>About my work only</b><span>Other questions get a short, polite no.</span></li>
            <li><b>10 an hour, 30 a day</b><span>Up to 500 characters each; a failed answer doesn&apos;t count.</span></li>
            <li><b>Kept 30 days</b><span>Questions and answers, then deleted. <a href="/privacy">Privacy</a></span></li>
          </ul>
        </aside>
      </section>

      <EFooter />
      <ETabbar on="ask" />
    </div>
  );
}
