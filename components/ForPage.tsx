import { EFooter, EHeader, ETabbar } from "./Shell";
import { out } from "@/lib/links";
import { Brand, Glyph, type GlyphName } from "./Glyph";

// /for/<job> (plan §2, §8): a page made in the console for one Upwork proposal: the job's title and link, a two-line
// note, three proofs from the registry. No message box, no email, no Ask (it leads to a message): every way to reach
// Jerome directly is gone, the footer keeps only Upwork and GitHub. "Reply on Upwork" with the fact that the
// conversation stays there (BUILD-RULES 2.26). Not indexed by search engines. The design picture uses an invented job.
type Proof = { kind: "page" | "screen" | "release" | "code"; label: string; href: string };
const proofs: { src: string; g: GlyphName; tone: string; t: string; d: string; fit?: boolean; links: Proof[] }[] = [
  {
    src: "/p/shop/receipt.jpg", g: "shop", tone: "sage", t: "Payments with receipts and refunds",
    d: "W3Arena's shop: 3+ ways to pay, local sellers in 6+ countries, a receipt for every purchase and refunds within 14 days.",
    links: [{ kind: "page", label: "Shop", href: "/work/w3arena/shop" }],
  },
  {
    src: "/p/console/catalogue.jpg", g: "console", tone: "blue", t: "An admin view of every payment",
    d: "Payment methods and the catalogue set from the console, every staff action confirmed with 2FA and on record.",
    links: [{ kind: "page", label: "Admin console", href: "/work/w3arena/console" }],
  },
  {
    src: "/p/distill/server.jpg", g: "tested", tone: "green", t: "Tested before it reaches you", fit: true,
    d: "Distill's tests run on every push and a change that fails them can't be deployed; its backups are restored weekly.",
    links: [{ kind: "page", label: "Distill", href: "/work/distill" }, { kind: "code", label: "Code", href: out.distillCode }],
  },
];

export function ForPage() {
  return (
    <div className="page" data-v="e">
      <EHeader upwork on="none" />

      <section className="f-top">
        <div className="f-job">
          <span className="f-for">For your job</span>
          <h1>Payments for a booking web app</h1>
          <a className="f-link" href={out.upwork}><Brand name="upwork" size={14} />The job on Upwork</a>
        </div>
        <div className="f-note">
          <img src="/jerome.jpg" alt="Jerome Badour" className="f-photo" />
          <div>
            <p>Hi, I read your post about taking payments in your booking app. Below are three pieces of my own work that match it, each live and open to check.</p>
            <span className="f-sig">Jerome Badour</span>
          </div>
        </div>
      </section>

      <section className="f-proofs">
        {proofs.map((p, n) => (
          <article key={p.t} className={`f-proof t-${p.tone}`}>
            <div className="f-img"><img src={p.src} alt="" className={p.fit ? "fit" : undefined} /></div>
            <div className="f-txt">
              <div className="f-n"><span className="h-n">{String(n + 1).padStart(2, "0")}</span><span className="e-tile"><Glyph name={p.g} size={15} /></span></div>
              <b>{p.t}</b>
              <p>{p.d}</p>
              <div className="e-pc">
                {p.links.map((x) => (<a key={x.label} href={x.href} className={`pc-${x.kind}`}><Glyph name={x.kind === "page" ? "arrow" : x.kind} size={12} />{x.label}</a>))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="f-reply">
        <a className="e-btn e-hire" href={out.upwork}><Brand name="upwork" size={15} />Reply on Upwork</a>
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
