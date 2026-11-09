import { Brand, Glyph, type BrandName, type GlyphName } from "./Glyph";
import { page } from "@/lib/links";
import { nowLabel, weekday, when } from "@/lib/time";
import type { BrakeRow, MessageRow, ProposalRow, QuestionRow, SocialRow } from "@/lib/server/console";

// /admin (plan §9): Jerome's own console. Hidden: anyone else gets 404. Every table starts with #, pages of 15, every
// column carries its meaning in colour and glyph (BUILD-RULES §3). Edits open in dialogs. Every action is on record.
export type Tab = "inbox" | "questions" | "proposals" | "visits" | "spend" | "brakes" | "socials";
export const TABS: Tab[] = ["inbox", "questions", "proposals", "visits", "spend", "brakes", "socials"];
const tabs: [Tab, GlyphName, string, string][] = [
  ["inbox", "message", "Inbox", "violet"],
  ["questions", "ask", "Questions", "sage"],
  ["proposals", "release", "Proposal pages", "amber"],
  ["visits", "pulse", "Visits", "blue"],
  ["spend", "ai", "Spend", "green"],
  ["brakes", "pause", "Brakes", "red"],
  ["socials", "about", "Socials", "blue"],
];

export type ConsoleData =
  | { tab: "inbox"; counts: { new: number; read: number; replied_week: number; total: number }; rows: MessageRow[] }
  | { tab: "questions"; counts: { week: number; answered: number; refused: number; total: number }; rows: QuestionRow[] }
  | { tab: "proposals"; total: number; rows: ProposalRow[] }
  | { tab: "visits"; days: { day: string; views: number }[]; pages: { path: string; views: number }[]; from: { referrer: string; views: number }[]; messages: number }
  | { tab: "spend"; month: number; today: number; days: { day: string; usd: number }[] }
  | { tab: "brakes"; rows: BrakeRow[] }
  | { tab: "socials"; rows: SocialRow[] };

const SOON = { this_week: ["amber", "This week"], this_month: ["blue", "This month"], no_rush: ["green", "No rush"] } as const;
export const MONTH_CAP = 8;
export const DAY_CAP = 1;

const St = ({ k }: { k: "new" | "read" | "replied" }) => {
  const m = { new: ["amber", "mail", "New"], read: ["blue", "search", "Read"], replied: ["green", "message", "Replied"] } as const;
  const [t, g, l] = m[k];
  return <span className={`c-tag t-${t}`}><Glyph name={g} size={12} />{l}</span>;
};

function Empty({ cols, g, text }: { cols: number; g: GlyphName; text: string }) {
  return <tr className="c-empty"><td colSpan={cols}><Glyph name={g} size={14} />{text}</td></tr>;
}

/** One pager for every table; hidden when everything fits on one page. Numbers run on across pages. */
function Pager({ tab, pageNo, total }: { tab: Tab; pageNo: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / 15));
  if (pages === 1) return null;
  return (
    <nav className="c-pager" aria-label="Pages">
      <span>{(pageNo - 1) * 15 + 1} to {Math.min(pageNo * 15, total)} of {total}</span>
      {pageNo > 1 ? <a className="newer" href={`?tab=${tab}&page=${pageNo - 1}`}><Glyph name="arrow" size={13} />Newer</a> : <span className="newer off"><Glyph name="arrow" size={13} />Newer</span>}
      {pageNo < pages ? <a href={`?tab=${tab}&page=${pageNo + 1}`}>Older<Glyph name="arrow" size={13} /></a> : <span className="off">Older<Glyph name="arrow" size={13} /></span>}
    </nav>
  );
}

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]!.toUpperCase()).join("");

function Inbox({ d, pageNo }: { d: Extract<ConsoleData, { tab: "inbox" }>; pageNo: number }) {
  const first = (pageNo - 1) * 15;
  return (
    <>
      <div className="c-cards">
        <div className="t-amber"><span><Glyph name="mail" size={14} />New</span><b>{d.counts.new}</b><em>waiting for you</em></div>
        <div className="t-blue"><span><Glyph name="search" size={14} />Read</span><b>{d.counts.read}</b><em>not answered yet</em></div>
        <div className="t-green"><span><Glyph name="message" size={14} />Replied</span><b>{d.counts.replied_week}</b><em>this week</em></div>
      </div>
      <table className="c-table">
        <thead><tr><th>#</th><th>From</th><th>What they need</th><th>Built with</th><th>How soon</th><th>Status</th><th>Received</th></tr></thead>
        <tbody>
          {d.rows.length === 0 && <Empty cols={7} g="message" text="No messages yet." />}
          {d.rows.map((r, i) => (
            <tr key={r.id} className={r.status === "new" ? "c-new" : ""}>
              <td className="c-n">{first + i + 1}</td>
              <td><span className="c-who"><span className="c-av t-violet">{initials(r.name)}</span><span><b>{r.name}</b><em>{r.email}</em></span></span></td>
              <td className="c-brief">{r.brief}</td>
              <td><span className="c-tag t-sage"><Glyph name="code" size={12} />{r.built_with.length ? r.built_with.join(", ") : "Not said"}</span></td>
              <td><span className={`c-tag t-${SOON[r.how_soon][0]}`}><Glyph name="pulse" size={12} />{SOON[r.how_soon][1]}</span></td>
              <td><St k={r.status} /></td>
              <td className="c-time">{when(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager tab="inbox" pageNo={pageNo} total={d.counts.total} />
    </>
  );
}

function Questions({ d, pageNo }: { d: Extract<ConsoleData, { tab: "questions" }>; pageNo: number }) {
  const first = (pageNo - 1) * 15;
  return (
    <>
      <div className="c-cards">
        <div className="t-sage"><span><Glyph name="ask" size={14} />Questions</span><b>{d.counts.week}</b><em>this week</em></div>
        <div className="t-green"><span><Glyph name="tested" size={14} />Answered</span><b>{d.counts.answered}</b><em>this week</em></div>
        <div className="t-red"><span><Glyph name="shield" size={14} />Refused</span><b>{d.counts.refused}</b><em>not about my work</em></div>
      </div>
      <table className="c-table">
        <thead><tr><th>#</th><th>Question</th><th>Points</th><th>Answer</th><th>Asked</th></tr></thead>
        <tbody>
          {d.rows.length === 0 && <Empty cols={5} g="ask" text="No questions yet." />}
          {d.rows.map((r, i) => (
            <tr key={r.id}>
              <td className="c-n">{first + i + 1}</td>
              <td className="c-q"><Glyph name="ask" size={13} />{r.question}</td>
              <td><span className="c-num t-blue">{r.points}</span></td>
              <td>{r.refused ? <span className="c-tag t-red"><Glyph name="shield" size={12} />Refused</span>
                : r.failed ? <span className="c-tag t-amber"><Glyph name="close" size={12} />Failed</span>
                : <span className="c-tag t-green"><Glyph name="tested" size={12} />Answered</span>}</td>
              <td className="c-time">{when(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager tab="questions" pageNo={pageNo} total={d.counts.total} />
      <p className="c-foot"><Glyph name="shield" size={13} />Kept 30 days, then deleted.</p>
    </>
  );
}

function Proposals({ d, pageNo }: { d: Extract<ConsoleData, { tab: "proposals" }>; pageNo: number }) {
  const first = (pageNo - 1) * 15;
  return (
    <>
      <div className="c-bar"><span className="c-sub">Pages made for one proposal each. Not indexed; opens are a count, no cookies.</span><a className="e-btn e-hire" href="?tab=proposals&new=1"><Glyph name="release" size={15} />New page</a></div>
      <table className="c-table">
        <thead><tr><th>#</th><th>Job</th><th>Address</th><th>Proofs</th><th>Opens</th><th>Page</th><th>Made</th></tr></thead>
        <tbody>
          {d.rows.length === 0 && <Empty cols={7} g="release" text="No proposal pages yet." />}
          {d.rows.map((r, i) => (
            <tr key={r.id}>
              <td className="c-n">{first + i + 1}</td>
              <td><b className="c-strong">{r.title}</b></td>
              <td className="c-mono">/for/{r.slug}</td>
              <td><span className="c-proofs">{r.proofs.map((x) => <span key={x} className="c-tag t-sage"><Glyph name="arrow" size={11} />{x}</span>)}</span></td>
              <td><span className={`c-num t-${r.opens ? "blue" : "amber"}`}>{r.opens}</span></td>
              <td>{r.is_on ? <span className="c-tag t-green"><Glyph name="live" size={12} />On</span> : <span className="c-tag t-red"><Glyph name="pause" size={12} />Off</span>}</td>
              <td className="c-time">{when(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager tab="proposals" pageNo={pageNo} total={d.total} />
    </>
  );
}

function Visits({ d }: { d: Extract<ConsoleData, { tab: "visits" }> }) {
  const max = Math.max(1, ...d.days.map((x) => x.views));
  const week = d.days.reduce((s, x) => s + x.views, 0);
  return (
    <>
      <div className="c-cards">
        <div className="t-blue"><span><Glyph name="pulse" size={14} />Pages read</span><b>{week.toLocaleString("en-US")}</b><em>last 7 days</em></div>
        <div className="t-sage"><span><Glyph name="web" size={14} />Today</span><b>{(d.days.at(-1)?.views ?? 0).toLocaleString("en-US")}</b><em>pages read</em></div>
        <div className="t-violet"><span><Glyph name="message" size={14} />Messages</span><b>{d.messages}</b><em>last 7 days</em></div>
      </div>
      <div className="c-two">
        <div className="c-box">
          <div className="c-k"><Glyph name="pulse" size={13} />Pages read per day, last 7 days</div>
          <div className="c-bars">{d.days.map((x) => (<div key={x.day}><i style={{ height: `${(x.views / max) * 100}%` }} /><span>{x.views}</span><em>{weekday(x.day)}</em></div>))}</div>
        </div>
        <div className="c-box">
          <div className="c-k"><Glyph name="arrow" size={13} />Where they came from, last 7 days</div>
          <table className="c-table c-mini"><tbody>
            {d.from.length === 0 && <Empty cols={3} g="web" text="Nothing yet." />}
            {d.from.map((x, i) => (<tr key={x.referrer}><td className="c-n">{i + 1}</td><td><span className="c-tag t-blue"><Glyph name="web" size={12} />{x.referrer || "Direct"}</span></td><td className="c-r"><span className="c-num t-blue">{x.views}</span></td></tr>))}
          </tbody></table>
          <div className="c-k c-k2"><Glyph name="web" size={13} />Top pages, last 7 days</div>
          <table className="c-table c-mini"><tbody>
            {d.pages.length === 0 && <Empty cols={3} g="web" text="Nothing yet." />}
            {d.pages.map((x, i) => (<tr key={x.path}><td className="c-n">{i + 1}</td><td className="c-mono">{x.path}</td><td className="c-r"><span className="c-num t-sage">{x.views}</span></td></tr>))}
          </tbody></table>
        </div>
      </div>
      <p className="c-foot"><Glyph name="shield" size={13} />Read from the server&apos;s own log: no cookies, no tracker, sites by name only.</p>
    </>
  );
}

const usd = (n: number) => `$${n.toFixed(2)}`;

function Spend({ d }: { d: Extract<ConsoleData, { tab: "spend" }> }) {
  const max = Math.max(0.01, ...d.days.map((x) => x.usd));
  return (
    <>
      <div className="c-meters">
        <div className="c-meter t-green"><span><Glyph name="ai" size={14} />This month</span><b>{usd(d.month)} <em>of {usd(MONTH_CAP)}</em></b><div className="c-track"><i style={{ width: `${Math.min(100, (d.month / MONTH_CAP) * 100)}%` }} /></div><em>The site stops calmly at {usd(MONTH_CAP)}; the provider&apos;s hard limit is $10.</em></div>
        <div className="c-meter t-green"><span><Glyph name="pulse" size={14} />Today</span><b>{usd(d.today)} <em>of {usd(DAY_CAP)}</em></b><div className="c-track"><i style={{ width: `${Math.min(100, (d.today / DAY_CAP) * 100)}%` }} /></div><em>Resets at midnight, Istanbul time.</em></div>
      </div>
      <div className="c-box">
        <div className="c-k"><Glyph name="ai" size={13} />Spend per day, last 14 days</div>
        <div className="c-bars c-bars14">{d.days.map((x) => (<div key={x.day}><i style={{ height: `${(x.usd / max) * 100}%` }} /><span>{x.usd.toFixed(2)}</span><em>{Number(x.day.slice(8))}</em></div>))}</div>
      </div>
    </>
  );
}

const BRAKE: Record<BrakeRow["name"], [GlyphName, string, string]> = {
  ask: ["ask", "Ask about my work", "Answers from Claude Haiku 5.5, inside both caps."],
  messages: ["message", "Messages", "The brief form and its emails."],
  proposals: ["release", "Proposal pages", "Every /for/ page at once; one page is switched off in its own row."],
};

function Brakes({ d }: { d: Extract<ConsoleData, { tab: "brakes" }> }) {
  return (
    <>
      <table className="c-table">
        <thead><tr><th>#</th><th>Part</th><th>What it stops</th><th>Now</th><th></th></tr></thead>
        <tbody>
          {d.rows.map((r, i) => {
            const [g, t, what] = BRAKE[r.name];
            return (
              <tr key={r.name}>
                <td className="c-n">{i + 1}</td>
                <td><span className="c-q"><Glyph name={g} size={14} /><b className="c-strong">{t}</b></span></td>
                <td className="c-brief">{r.paused ? r.reason : what}</td>
                <td>{r.paused ? <span className="c-tag t-red"><Glyph name="pause" size={12} />Paused</span> : <span className="c-tag t-green"><Glyph name="live" size={12} />Running</span>}</td>
                <td className="c-r"><button type="button" className="e-btn e-ghost c-sm"><Glyph name={r.paused ? "live" : "pause"} size={13} />{r.paused ? "Resume" : "Pause"}</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="c-foot"><Glyph name="shield" size={13} />A pause asks for a reason; visitors see a calm note, never an error.</p>
    </>
  );
}

const SOCIAL_CLASS: Record<string, string> = { discord: "t-discord", github: "t-gh", upwork: "t-up" };

function Socials({ d }: { d: Extract<ConsoleData, { tab: "socials" }> }) {
  return (
    <>
      <div className="c-bar"><span className="c-sub">Shown under the name, in the footer and on About. Proposal pages show only the ones marked.</span><button type="button" className="e-btn e-hire"><Glyph name="about" size={15} />Add account</button></div>
      <table className="c-table">
        <thead><tr><th>#</th><th>Account</th><th>Link</th><th>On proposal pages</th><th></th></tr></thead>
        <tbody>
          {d.rows.length === 0 && <Empty cols={5} g="about" text="No accounts yet." />}
          {d.rows.map((r, i) => (
            <tr key={r.id}>
              <td className="c-n">{i + 1}</td>
              <td><span className={`c-soc ${SOCIAL_CLASS[r.kind] ?? "t-blue"}`}>{r.kind in SOCIAL_CLASS ? <Brand name={r.kind as BrandName} size={14} /> : <Glyph name="web" size={14} />}{r.label}</span></td>
              <td className="c-mono">{r.url.replace(/^https:\/\/(www\.)?/, "")}</td>
              <td>{r.on_proposals ? <span className="c-tag t-green"><Glyph name="tested" size={12} />Shown</span> : <span className="c-tag t-red"><Glyph name="close" size={12} />Hidden</span>}</td>
              <td className="c-r"><button type="button" className="e-btn e-ghost c-sm"><Glyph name="code" size={13} />Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function ConsolePage({ data, pageNo = 1, newCount, signOut }: { data: ConsoleData; pageNo?: number; newCount: number; signOut: () => Promise<void> }) {
  const tab = data.tab;
  const cur = tabs.find((t) => t[0] === tab) ?? tabs[0];
  return (
    <div className="page c-page" data-v="e">
      <aside className="c-side">
        <a className="e-brand" href={page.home}><span className="e-mono">JB</span>Console</a>
        <nav>
          {tabs.map(([k, g, l, t]) => (
            <a key={k} href={`?tab=${k}`} className={`t-${t}${k === tab ? " on" : ""}`}><span className="e-nt"><Glyph name={g} size={14} /></span>{l}{k === "inbox" && newCount > 0 && <em>{newCount}</em>}</a>
          ))}
        </nav>
        <div className="c-me">
          <img src="/jerome.jpg" alt="" /><span><b>Jerome Badour</b><em>Owner</em></span>
          <form action={signOut}><button type="submit" className="c-out" aria-label="Sign out" title="Sign out"><Glyph name="signout" size={15} /></button></form>
        </div>
      </aside>
      <main className="c-main">
        <header className="c-head">
          <h1><span className={`e-tile t-${cur[3]}`}><Glyph name={cur[1]} size={18} /></span>{cur[2]}</h1>
          <span className="c-now"><Glyph name="live" size={13} />{nowLabel()}</span>
        </header>
        {data.tab === "inbox" && <Inbox d={data} pageNo={pageNo} />}
        {data.tab === "questions" && <Questions d={data} pageNo={pageNo} />}
        {data.tab === "proposals" && <Proposals d={data} pageNo={pageNo} />}
        {data.tab === "visits" && <Visits d={data} />}
        {data.tab === "spend" && <Spend d={data} />}
        {data.tab === "brakes" && <Brakes d={data} />}
        {data.tab === "socials" && <Socials d={data} />}
      </main>
    </div>
  );
}
