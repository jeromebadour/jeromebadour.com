import { EFooter, EHeader, ETabbar } from "./Shell";
import { proofHref } from "@/lib/links";
import { Glyph, type GlyphName } from "./Glyph";

type Proof = { kind: "live" | "release" | "code" | "demo" | "screen"; label: string };
type Promise = { g: GlyphName; t: string; d: string; proofs: Proof[] };
type Group = { k: string; g: GlyphName; tone: string; items: Promise[] };

const groups: Group[] = [
  {
    k: "Finding the problem", g: "search", tone: "amber", items: [
      { g: "search", t: "I find the root cause before I change anything.", d: "A freeze that stopped the server for 13 seconds every hour was traced to its cause and removed, not worked around.", proofs: [{ kind: "release", label: "13 s freeze removed" }] },
      { g: "pulse", t: "I measure before I guess.", d: "The server's live data traffic was measured, then cut by 88%; one app update cut its network traffic by about 97%.", proofs: [{ kind: "release", label: "88% less traffic" }, { kind: "release", label: "97% less in the app" }] },
    ],
  },
  {
    k: "Shipping", g: "release", tone: "blue", items: [
      { g: "tested", t: "I test before I hand anything over.", d: "W3Arena runs automated tests before every update; Distill's tests run on every push.", proofs: [{ kind: "code", label: "Distill tests" }, { kind: "release", label: "Changelog" }] },
      { g: "live", t: "Updates ship without stopping your users.", d: "80+ game servers update as each game ends, and releases move players over with nobody disconnected.", proofs: [{ kind: "release", label: "80+ servers, 0 games cut" }] },
      { g: "shield", t: "When something breaks, the fix ships the same day.", d: "When an update locked a paying user out, the updater was rebuilt to repair itself and released the same day.", proofs: [{ kind: "release", label: "W3Arena 5.1.5" }] },
    ],
  },
  {
    k: "Running it", g: "server", tone: "green", items: [
      { g: "server", t: "A standby stays in sync and can take over at any time.", d: "When a provider shut down the whole account without warning, the standby took over on the first try with zero data lost.", proofs: [{ kind: "screen", label: "The takeover" }] },
      { g: "release", t: "Backups count only once they have been restored.", d: "Distill's backups are restored every week; W3Arena's are restore-tested automatically.", proofs: [{ kind: "demo", label: "Server and backups" }] },
      { g: "ai", t: "Every running cost has a ceiling.", d: "AI features get a hard monthly cap and per-user limits, with a page to watch the spend and pause it.", proofs: [{ kind: "screen", label: "AI spend" }] },
    ],
  },
  {
    k: "Working with you", g: "about", tone: "violet", items: [
      { g: "shield", t: "Access is locked down to each role.", d: "Staff see only what their role allows, and every console action is confirmed with a 2FA code.", proofs: [{ kind: "screen", label: "2FA per action" }] },
      { g: "console", t: "Every action is on record.", d: "Both consoles keep a full audit log: 6,800+ staff actions logged on W3Arena alone.", proofs: [{ kind: "demo", label: "Activity log" }] },
      { g: "code", t: "You can check my work before you hire me.", d: "The apps are live, Distill's code is public, and its admin console has a public demo.", proofs: [{ kind: "live", label: "Live apps" }, { kind: "code", label: "Code" }, { kind: "demo", label: "Admin demo" }] },
      { g: "message", t: "Clear updates in plain English, and no surprises on price.", d: "Every W3Arena release is public, written for the people who use it, not for other developers.", proofs: [{ kind: "release", label: "Changelog" }] },
    ],
  },
];

/** How many things the page lists (its header line and its link preview both say it). */
export const HOW_COUNT = groups.reduce((n, g) => n + g.items.length, 0);

export function HowPage() {
  const count = HOW_COUNT;
  let i = 0;
  return (
    <div className="page" data-v="e">
      <EHeader on="how" />

      <section className="w-top">
        <div className="w-crumb"><Glyph name="how" size={13} /><span>How I work</span></div>
        <div className="w-title">
          <span className="e-tile p-big t-blue"><Glyph name="how" size={26} /></span>
          <div>
            <h1>How I work</h1>
            <p className="e-line">{count} things I do on every job, each with the proof it happened.</p>
          </div>
        </div>
      </section>

      <section className="h-list">
        {groups.map((g) => (
          <div key={g.k} className={`h-group t-${g.tone}`}>
            <div className="h-k"><span className="e-tile"><Glyph name={g.g} size={15} /></span>{g.k}</div>
            <ol>
              {g.items.map((p) => {
                i += 1;
                return (
                  <li key={p.t}>
                    <span className="h-n">{String(i).padStart(2, "0")}</span>
                    <div className="h-body">
                      <b>{p.t}</b>
                      <p>{p.d}</p>
                    </div>
                    <div className="e-pc h-pc">
                      {p.proofs.map((x) => (
                        <a key={x.label} href={proofHref(x.label)} className={`pc-${x.kind}`}><Glyph name={x.kind} size={12} />{x.label}</a>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </section>

      <EFooter />
      <ETabbar on="how" />
    </div>
  );
}
