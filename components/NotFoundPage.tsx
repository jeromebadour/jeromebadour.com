import { EFooter, EHeader, ETabbar } from "./Shell";
import { Glyph, type GlyphName } from "./Glyph";

// 404 and error pages (plan §2, BUILD-RULES 2.26): styled, with ways back as buttons, never an order to the viewer.
// One component for both kinds and the closed status link (plan §7).
type Kind = "404" | "error" | "closed";
const copy: Record<Kind, { code: string; tone: string; g: GlyphName; t: string; d: string }> = {
  "404": { code: "404", tone: "amber", g: "search", t: "This page doesn't exist", d: "The address may be mistyped, or the page has moved." },
  error: { code: "500", tone: "red", g: "pulse", t: "Something broke, and it's mine", d: "It's logged. I'll find the root cause before I touch anything, even at 3 a.m. Back as soon as it's fixed." },
  closed: { code: "Closed", tone: "blue", g: "mail", t: "This status page retired", d: "It served its 90 days. The conversation itself lives on in your email." },
};
// The 404 says one of these (Kami 2026-11-10: a mix of three), picked on each visit by the inline script before the
// page shows, so no other line flashes first.
export const NF_LINES: [string, string][] = [
  ["This page doesn't exist", "I'd blame the server, but I run the server."],
  ["Root cause: this page never existed", "The address may be mistyped, or the page has moved."],
  ["This page failed review", "So it never shipped."],
];
const pick = `(function(){var L=${JSON.stringify(NF_LINES)};var l=L[Math.floor(Math.random()*L.length)];` +
  `document.getElementById("nf-t").textContent=l[0];document.getElementById("nf-d").textContent=l[1];})()`;

const ways: [GlyphName, string, string, string][] = [
  ["live", "green", "Apps", "/"],
  ["work", "amber", "Services", "/services"],
  ["how", "blue", "How I work", "/how-i-work"],
  ["ask", "sage", "Ask", "/ask"],
];

export function NotFoundPage({ kind = "404" }: { kind?: Kind }) {
  const c = copy[kind];
  return (
    <div className="page" data-v="e">
      <EHeader on="none" />
      <section className={`nf t-${c.tone}`}>
        <span className="nf-code"><Glyph name={c.g} size={18} />{c.code}</span>
        {kind === "404" ? (
          <>
            <h1 id="nf-t" suppressHydrationWarning>{NF_LINES[0][0]}</h1>
            <p id="nf-d" className="e-line" suppressHydrationWarning>{NF_LINES[0][1]}</p>
            <script dangerouslySetInnerHTML={{ __html: pick }} />
          </>
        ) : (
          <>
            <h1>{c.t}</h1>
            <p className="e-line">{c.d}</p>
          </>
        )}
        <div className="nf-ways">
          <a className="e-btn e-hire" href="/"><Glyph name="arrow" size={15} />Home</a>
          {ways.map(([g, t, l, h]) => (<a key={l} className={`nf-w t-${t}`} href={h}><span className="e-nt"><Glyph name={g} size={14} /></span>{l}</a>))}
        </div>
      </section>
      <EFooter />
      <ETabbar on="none" />
    </div>
  );
}
