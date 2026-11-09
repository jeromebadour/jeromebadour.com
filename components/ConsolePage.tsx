import { Brand, Glyph, type GlyphName } from "./Glyph";
import { page } from "@/lib/links";

// /admin (plan §9): Jerome's own console. Hidden: anyone else gets 404. Every table starts with #, pages of 15, every
// column carries its meaning in colour and glyph (BUILD-RULES §3). Edits open in dialogs. Every action is on record.
// The design pictures use one invented set of data with one "now": Mon 9 Nov 2026, 09:40.
export type Tab = "inbox" | "questions" | "proposals" | "visits" | "spend" | "brakes" | "socials";
const tabs: [Tab, GlyphName, string, string, string?][] = [
  ["inbox", "message", "Inbox", "violet", "2"],
  ["questions", "ask", "Questions", "sage"],
  ["proposals", "release", "Proposal pages", "amber"],
  ["visits", "pulse", "Visits", "blue"],
  ["spend", "ai", "Spend", "green"],
  ["brakes", "pause", "Brakes", "red"],
  ["socials", "about", "Socials", "blue"],
];

const St = ({ k }: { k: "new" | "read" | "replied" | "closed" }) => {
  const m = { new: ["amber", "mail", "New"], read: ["blue", "search", "Read"], replied: ["green", "message", "Replied"], closed: ["red", "close", "Closed"] } as const;
  const [t, g, l] = m[k];
  return <span className={`c-tag t-${t}`}><Glyph name={g} size={12} />{l}</span>;
};
const Soon = ({ s }: { s: string }) => <span className={`c-tag t-${s === "This week" ? "amber" : s === "This month" ? "blue" : "green"}`}><Glyph name="pulse" size={12} />{s}</span>;

function Inbox() {
  const rows: [string, string, string, string, string, "new" | "read" | "replied" | "closed", string][] = [
    ["Daniel Moreau", "daniel@example.com", "Payments for my web app: a checkout, a receipt for every purchase, refunds…", "Not sure yet", "This month", "replied", "Mon 00:31"],
    ["Priya Nair", "priya@example.com", "Our Next.js dashboard is slow on the reports page; it takes 20 s to load.", "React / Next.js", "This week", "new", "Mon 08:55"],
    ["Tomás Herrera", "tomas@example.com", "Add a chatbot to our support page that answers from our docs.", "Node.js", "This month", "new", "Mon 07:12"],
    ["Hannah Weber", "hannah@example.com", "Move our app from shared hosting to a server with backups.", "PHP", "No rush", "read", "Sun 21:40"],
    ["Lucas Martin", "lucas@example.com", "A desktop app for our warehouse team to scan and track stock.", "Not sure yet", "This month", "replied", "Sat 16:03"],
  ];
  return (
    <>
      <div className="c-cards">
        <div className="t-amber"><span><Glyph name="mail" size={14} />New</span><b>2</b><em>waiting for you</em></div>
        <div className="t-blue"><span><Glyph name="search" size={14} />Read</span><b>1</b><em>not answered yet</em></div>
        <div className="t-green"><span><Glyph name="message" size={14} />Replied</span><b>2</b><em>this week</em></div>
      </div>
      <table className="c-table">
        <thead><tr><th>#</th><th>From</th><th>What they need</th><th>Built with</th><th>How soon</th><th>Status</th><th>Received</th></tr></thead>
        <tbody>
          {rows.map(([n, e, b, s, w, st, t], i) => (
            <tr key={n} className={st === "new" ? "c-new" : ""}>
              <td className="c-n">{i + 1}</td>
              <td><span className="c-who"><span className="c-av t-violet">{n.split(" ").map((x) => x[0]).join("")}</span><span><b>{n}</b><em>{e}</em></span></span></td>
              <td className="c-brief">{b}</td>
              <td><span className="c-tag t-sage"><Glyph name="code" size={12} />{s}</span></td>
              <td><Soon s={w} /></td>
              <td><St k={st} /></td>
              <td className="c-time">{t}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Questions() {
  const rows: [string, number, "answered" | "refused", string][] = [
    ["Have you built a booking system?", 4, "answered", "Mon 09:12"],
    ["Can you add Stripe to a Next.js app?", 3, "answered", "Mon 08:47"],
    ["Have you built a payment system?", 4, "answered", "Mon 00:24"],
    ["Write me a poem about cats", 0, "refused", "Sun 23:10"],
    ["Do you work with Python and FastAPI?", 3, "answered", "Sun 19:31"],
    ["How do you keep a server running?", 5, "answered", "Sun 14:02"],
  ];
  return (
    <>
      <div className="c-cards">
        <div className="t-sage"><span><Glyph name="ask" size={14} />Questions</span><b>23</b><em>this week</em></div>
        <div className="t-green"><span><Glyph name="tested" size={14} />Answered</span><b>21</b><em>this week</em></div>
        <div className="t-red"><span><Glyph name="shield" size={14} />Refused</span><b>2</b><em>not about my work</em></div>
      </div>
      <table className="c-table">
        <thead><tr><th>#</th><th>Question</th><th>Points</th><th>Answer</th><th>Asked</th></tr></thead>
        <tbody>
          {rows.map(([q, p, a, t], i) => (
            <tr key={q}>
              <td className="c-n">{i + 1}</td>
              <td className="c-q"><Glyph name="ask" size={13} />{q}</td>
              <td><span className="c-num t-blue">{p}</span></td>
              <td>{a === "answered" ? <span className="c-tag t-green"><Glyph name="tested" size={12} />Answered</span> : <span className="c-tag t-red"><Glyph name="shield" size={12} />Refused</span>}</td>
              <td className="c-time">{t}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="c-foot"><Glyph name="shield" size={13} />Kept 30 days, then deleted.</p>
    </>
  );
}

const proofIds: [GlyphName, string][] = [["shop", "Shop"], ["console", "Admin console"], ["tested", "Distill tests"], ["server", "Game servers"], ["ai", "AI translation"], ["desktop", "Windows app"], ["web", "W3Arena website"], ["shield", "Standby server"]];

function Proposals({ dialog }: { dialog: boolean }) {
  const rows: [string, string, string[], number, boolean, string][] = [
    ["Payments for a booking web app", "payments-booking-app", ["Shop", "Admin console", "Distill tests"], 6, true, "Mon 00:40"],
    ["Fix a slow Next.js dashboard", "slow-nextjs-dashboard", ["Game servers", "Distill tests", "Admin console"], 3, true, "Sun 18:22"],
    ["Support chatbot for a SaaS", "support-chatbot", ["AI translation", "Distill tests", "Admin console"], 0, true, "Sun 11:05"],
    ["Electron app for a warehouse", "electron-warehouse", ["Windows app", "Shop", "Standby server"], 9, false, "Fri 10:47"],
  ];
  return (
    <>
      <div className="c-bar"><span className="c-sub">Pages made for one proposal each. Not indexed; opens are a count, no cookies.</span><a className="e-btn e-hire" href="?tab=proposals&new=1"><Glyph name="release" size={15} />New page</a></div>
      <table className="c-table">
        <thead><tr><th>#</th><th>Job</th><th>Address</th><th>Proofs</th><th>Opens</th><th>Page</th><th>Made</th></tr></thead>
        <tbody>
          {rows.map(([t, s, p, o, on, d], i) => (
            <tr key={s}>
              <td className="c-n">{i + 1}</td>
              <td><b className="c-strong">{t}</b></td>
              <td className="c-mono">/for/{s}</td>
              <td><span className="c-proofs">{p.map((x) => <span key={x} className="c-tag t-sage"><Glyph name="arrow" size={11} />{x}</span>)}</span></td>
              <td><span className={`c-num t-${o ? "blue" : "amber"}`}>{o}</span></td>
              <td>{on ? <span className="c-tag t-green"><Glyph name="live" size={12} />On</span> : <span className="c-tag t-red"><Glyph name="pause" size={12} />Off</span>}</td>
              <td className="c-time">{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {dialog && (
        <div className="c-dlg-wrap">
          <div className="c-dlg" role="dialog" aria-label="New proposal page">
            <header><span className="e-tile t-amber"><Glyph name="release" size={15} /></span><b>New proposal page</b><a href="?tab=proposals" aria-label="Close"><Glyph name="close" size={16} /></a></header>
            <label className="m-field"><span className="m-l"><Glyph name="release" size={14} />Job title</span><input defaultValue="Booking system with payments for a clinic" /></label>
            <label className="m-field"><span className="m-l"><Brand name="upwork" size={14} />Job on Upwork</span><input defaultValue="https://www.upwork.com/jobs/~021987…" /></label>
            <label className="m-field"><span className="m-l"><Glyph name="message" size={14} />Note (two lines)</span><textarea rows={2} defaultValue="Hi, I read your post about bookings and payments for your clinic. Below are three pieces of my own work that match it." /></label>
            <div className="m-field"><span className="m-l"><Glyph name="tested" size={14} />Proofs (pick 3)</span>
              <div className="m-chips">{proofIds.map(([g, l]) => { const on = ["Shop", "Admin console", "Distill tests"].includes(l); return <button key={l} type="button" className={on ? "on" : ""}><Glyph name={on ? "tested" : g} size={13} />{l}</button>; })}</div>
            </div>
            <div className="c-addr"><Glyph name="web" size={13} />jeromebadour.com/for/<b>booking-payments-clinic</b></div>
            <footer><a className="e-btn e-ghost" href="?tab=proposals">Cancel</a><a className="e-btn e-hire" href="?tab=proposals"><Glyph name="tested" size={15} />Make page</a></footer>
          </div>
        </div>
      )}
    </>
  );
}

function Visits() {
  const days = [38, 52, 41, 66, 58, 74, 90];
  const max = Math.max(...days);
  const pages: [string, number][] = [["/", 182], ["/work/w3arena", 96], ["/services", 54], ["/ask", 41], ["/for/payments-booking-app", 6]];
  const from: [string, number][] = [["Direct", 193], ["upwork.com", 141], ["github.com", 63], ["discord.com", 22]];
  return (
    <>
      <div className="c-cards">
        <div className="t-blue"><span><Glyph name="pulse" size={14} />Visits</span><b>419</b><em>last 7 days</em></div>
        <div className="t-sage"><span><Glyph name="web" size={14} />Pages read</span><b>1,124</b><em>last 7 days</em></div>
        <div className="t-violet"><span><Glyph name="message" size={14} />Messages</span><b>5</b><em>last 7 days</em></div>
      </div>
      <div className="c-two">
        <div className="c-box">
          <div className="c-k"><Glyph name="pulse" size={13} />Visits per day, last 7 days</div>
          <div className="c-bars">{days.map((d, i) => (<div key={i}><i style={{ height: `${(d / max) * 100}%` }} /><span>{d}</span><em>{["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"][i]}</em></div>))}</div>
        </div>
        <div className="c-box">
          <div className="c-k"><Glyph name="arrow" size={13} />Where they came from, last 7 days</div>
          <table className="c-table c-mini"><tbody>{from.map(([s, n], i) => (<tr key={s}><td className="c-n">{i + 1}</td><td><span className="c-tag t-blue"><Glyph name="web" size={12} />{s}</span></td><td className="c-r"><span className="c-num t-blue">{n}</span></td></tr>))}</tbody></table>
          <div className="c-k c-k2"><Glyph name="web" size={13} />Top pages, last 7 days</div>
          <table className="c-table c-mini"><tbody>{pages.map(([p, n], i) => (<tr key={p}><td className="c-n">{i + 1}</td><td className="c-mono">{p}</td><td className="c-r"><span className="c-num t-sage">{n}</span></td></tr>))}</tbody></table>
        </div>
      </div>
      <p className="c-foot"><Glyph name="shield" size={13} />Read from the server's own log: no cookies, no tracker, sites by name only.</p>
    </>
  );
}

function Spend() {
  const days = [0.04, 0.07, 0.03, 0.11, 0.09, 0.06, 0.12, 0.05, 0.08, 0.14, 0.1, 0.07, 0.09, 0.06];
  return (
    <>
      <div className="c-meters">
        <div className="c-meter t-green"><span><Glyph name="ai" size={14} />This month</span><b>$0.77 <em>of $8.00</em></b><div className="c-track"><i style={{ width: "9.6%" }} /></div><em>The app stops calmly at $8; the provider's hard limit is $10.</em></div>
        <div className="c-meter t-green"><span><Glyph name="pulse" size={14} />Today</span><b>$0.06 <em>of $1.00</em></b><div className="c-track"><i style={{ width: "6%" }} /></div><em>Resets at midnight, Istanbul time.</em></div>
      </div>
      <div className="c-box">
        <div className="c-k"><Glyph name="ai" size={13} />Spend per day, last 14 days</div>
        <div className="c-bars c-bars14">{days.map((d, i) => (<div key={i}><i style={{ height: `${(d / 0.14) * 100}%` }} /><span>{d.toFixed(2)}</span><em>{27 + i > 31 ? 27 + i - 31 : 27 + i}</em></div>))}</div>
      </div>
    </>
  );
}

function Brakes() {
  const rows: [GlyphName, string, string, boolean, string][] = [
    ["ask", "Ask about my work", "Answers from Claude Haiku 5.5, inside both caps.", true, ""],
    ["message", "Messages", "The brief form and its emails.", true, ""],
    ["release", "Proposal pages", "Every /for/ page at once; one page is switched off in its own row.", true, ""],
  ];
  return (
    <>
      <table className="c-table">
        <thead><tr><th>#</th><th>Part</th><th>What it stops</th><th>Now</th><th></th></tr></thead>
        <tbody>
          {rows.map(([g, t, d, on], i) => (
            <tr key={t}>
              <td className="c-n">{i + 1}</td>
              <td><span className="c-q"><Glyph name={g} size={14} /><b className="c-strong">{t}</b></span></td>
              <td className="c-brief">{d}</td>
              <td>{on ? <span className="c-tag t-green"><Glyph name="live" size={12} />Running</span> : <span className="c-tag t-red"><Glyph name="pause" size={12} />Paused</span>}</td>
              <td className="c-r"><button type="button" className="e-btn e-ghost c-sm"><Glyph name="pause" size={13} />Pause</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="c-foot"><Glyph name="shield" size={13} />A pause asks for a reason; visitors see a calm note, never an error.</p>
    </>
  );
}

function Socials() {
  const rows: [string, "discord" | "github" | "upwork", string, string, boolean][] = [
    ["Discord", "discord", "t-discord", "discord.com/users/792855756872613958", true],
    ["GitHub", "github", "t-gh", "github.com/jeromebadour", true],
    ["Upwork", "upwork", "t-up", "upwork.com/freelancers/…", true],
  ];
  return (
    <>
      <div className="c-bar"><span className="c-sub">Shown under the name, in the footer and on About. Proposal pages show GitHub and Upwork only.</span><button type="button" className="e-btn e-hire"><Glyph name="about" size={15} />Add account</button></div>
      <table className="c-table">
        <thead><tr><th>#</th><th>Account</th><th>Link</th><th>On proposal pages</th><th></th></tr></thead>
        <tbody>
          {rows.map(([n, b, t, l, on], i) => (
            <tr key={n}>
              <td className="c-n">{i + 1}</td>
              <td><span className={`c-soc ${t}`}><Brand name={b} size={14} />{n}</span></td>
              <td className="c-mono">{l}</td>
              <td>{n === "Discord" ? <span className="c-tag t-red"><Glyph name="close" size={12} />Hidden</span> : <span className="c-tag t-green"><Glyph name="tested" size={12} />Shown</span>}</td>
              <td className="c-r"><button type="button" className="e-btn e-ghost c-sm"><Glyph name="code" size={13} />Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function ConsolePage({ tab = "inbox", dialog = false }: { tab?: Tab; dialog?: boolean }) {
  const cur = tabs.find((t) => t[0] === tab) ?? tabs[0];
  return (
    <div className="page c-page" data-v="e">
      <aside className="c-side">
        <a className="e-brand" href={page.home}><span className="e-mono">JB</span>Console</a>
        <nav>
          {tabs.map(([k, g, l, t, n]) => (
            <a key={k} href={`?tab=${k}`} className={`t-${t}${k === tab ? " on" : ""}`}><span className="e-nt"><Glyph name={g} size={14} /></span>{l}{n && <em>{n}</em>}</a>
          ))}
        </nav>
        <div className="c-me"><img src="/jerome.jpg" alt="" /><span><b>Jerome Badour</b><em>Owner</em></span></div>
      </aside>
      <main className="c-main">
        <header className="c-head">
          <h1><span className={`e-tile t-${cur[3]}`}><Glyph name={cur[1]} size={18} /></span>{cur[2]}</h1>
          <span className="c-now"><Glyph name="live" size={13} />Mon 9 Nov, 09:40</span>
        </header>
        {tab === "inbox" && <Inbox />}
        {tab === "questions" && <Questions />}
        {tab === "proposals" && <Proposals dialog={dialog} />}
        {tab === "visits" && <Visits />}
        {tab === "spend" && <Spend />}
        {tab === "brakes" && <Brakes />}
        {tab === "socials" && <Socials />}
      </main>
    </div>
  );
}
