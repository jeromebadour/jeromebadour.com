import { EFooter, EHeader, ETabbar } from "./Shell";
import { Glyph, type GlyphName } from "./Glyph";

// 404 and error pages (plan §2, BUILD-RULES 2.26): styled, with ways back as buttons, never an order to the viewer.
// One component for both kinds and the closed status link (plan §7).
type Kind = "404" | "error" | "closed";
const copy: Record<Kind, { code: string; tone: string; g: GlyphName; t: string; d: string }> = {
  "404": { code: "404", tone: "amber", g: "search", t: "This page doesn't exist", d: "The address may be mistyped, or the page has moved." },
  error: { code: "500", tone: "red", g: "pulse", t: "Something broke on my side", d: "It is logged and I see it. The page works again as soon as it is fixed." },
  closed: { code: "Closed", tone: "blue", g: "mail", t: "This message is closed", d: "Status links stay open for 90 days. The conversation itself is still in your email." },
};
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
        <h1>{c.t}</h1>
        <p className="e-line">{c.d}</p>
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
