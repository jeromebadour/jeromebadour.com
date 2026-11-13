/**
 * The site's emails: a message received (to the sender), a new message (to Jerome), and Jerome's reply (to the
 * sender). Written for email apps, not browsers: tables and inline styles (Gmail and Outlook drop <style> rules and
 * never run scripts), no images, and a plain-text twin for apps that show text only. Each says why it came, carries a
 * button and the same link written out, and ends with a footer.
 */

export type SiteEmail = { subject: string; html: string; text: string };

// The site's colours for a light email (email apps don't read CSS variables; most show light backgrounds).
const c = {
  page: "#f3f4f1", card: "#ffffff", line: "#e2e4de", text: "#1b1f22", muted: "#535a57", faint: "#7a817d",
  accent: "#6f7d3f", accentSoft: "#eef1e3", accentLine: "#d3dabb", onAccent: "#ffffff",
};
const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const paras = (text: string) =>
  text.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px;font:400 15px/1.6 ${font};color:${c.text};">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");

type Row = [string, string];

function layout(o: { title: string; preheader: string; lead: string; body?: string; rows?: Row[]; button: { label: string; url: string }; why: string }): string {
  const rows = (o.rows ?? []).map(([k, v]) => `
    <tr><td style="padding:10px 0;border-top:1px solid ${c.line};font:600 13px ${font};color:${c.muted};width:120px;vertical-align:top;">${esc(k)}</td>
    <td style="padding:10px 0;border-top:1px solid ${c.line};font:400 14px/1.55 ${font};color:${c.text};vertical-align:top;">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(o.title)}</title>
</head>
<body style="margin:0;padding:0;background:${c.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.page};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

<tr><td style="padding:0 4px 20px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="width:34px;height:34px;background:${c.accent};border-radius:9px;text-align:center;vertical-align:middle;font:600 13px ${font};color:${c.onAccent};">JB</td>
    <td style="vertical-align:middle;padding-left:10px;font:600 17px ${font};color:${c.text};">Jerome Badour</td>
  </tr></table>
</td></tr>

<tr><td style="background:${c.card};border:1px solid ${c.line};border-radius:12px;padding:28px;">
  <h1 style="margin:0 0 10px;font:600 21px/1.3 ${font};color:${c.text};">${esc(o.title)}</h1>
  <p style="margin:0 0 18px;font:400 15px/1.6 ${font};color:${c.muted};">${esc(o.lead)}</p>
  ${o.body ? `<div style="margin:0 0 6px;padding:18px 20px;background:${c.accentSoft};border:1px solid ${c.accentLine};border-radius:10px;">${o.body}</div>` : ""}
  ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 6px;">${rows}</table>` : ""}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 14px;"><tr>
    <td style="background:${c.accent};border-radius:8px;"><a href="${esc(o.button.url)}" style="display:inline-block;padding:11px 20px;font:600 14px ${font};color:${c.onAccent};text-decoration:none;">${esc(o.button.label)}</a></td>
  </tr></table>
  <p style="margin:0;font:400 12.5px/1.6 ${font};color:${c.faint};word-break:break-all;">${esc(o.button.url)}</p>
</td></tr>

<tr><td style="padding:18px 4px 0;font:400 12.5px/1.6 ${font};color:${c.faint};">
  ${esc(o.why)}<br>
  Jerome Badour · <a href="https://jeromebadour.com" style="color:${c.faint};">jeromebadour.com</a> · <a href="https://jeromebadour.com/privacy" style="color:${c.faint};">Privacy</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

const SOON = { this_week: "This week", this_month: "This month", no_rush: "No rush" } as const;
export type BriefFacts = { name: string; email: string; brief: string; builtWith: string[]; howSoon: keyof typeof SOON };

/** To the sender, right after sending: the status link. */
export function receivedEmail(m: BriefFacts, statusUrl: string): SiteEmail {
  const first = m.name.split(/\s+/)[0];
  const title = "Your message reached me";
  const lead = `Hi ${first}, it landed. I read every message myself: no assistant, no autoresponder (this email excepted). The status page shows when I've read it and when I've replied.`;
  const rows: Row[] = [["What you need", m.brief], ["Built with", m.builtWith.join(", ") || "Not said"], ["How soon", SOON[m.howSoon]]];
  const why = "You got this email because this address was given with a message on jeromebadour.com. The status link stays open for 90 days.";
  return {
    subject: "Your message reached Jerome Badour",
    html: layout({ title, preheader: "The status page shows when it's read and when it's answered.", lead, rows, button: { label: "See the status", url: statusUrl }, why }),
    text: `${title}\n\n${lead}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nStatus: ${statusUrl}\n\n${why}\nJerome Badour · https://jeromebadour.com`,
  };
}

/** To Jerome, right after sending: the brief and the way to the console. */
export function newMessageEmail(m: BriefFacts, fromQuestion: string | null, consoleUrl: string): SiteEmail {
  const title = `New message from ${m.name}`;
  const lead = "A new brief came in through the site.";
  const rows: Row[] = [["From", `${m.name} · ${m.email}`], ["What they need", m.brief], ["Built with", m.builtWith.join(", ") || "Not said"], ["How soon", SOON[m.howSoon]]];
  if (fromQuestion) rows.push(["Asked first", fromQuestion]);
  const why = "You got this email because a visitor sent a message on jeromebadour.com.";
  return {
    subject: `New message: ${m.brief.slice(0, 60)}${m.brief.length > 60 ? "…" : ""}`,
    html: layout({ title, preheader: m.brief.slice(0, 120), lead, rows, button: { label: "Open the Inbox", url: consoleUrl }, why }),
    text: `${title}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nInbox: ${consoleUrl}\n\n${why}`,
  };
}

/** To the sender, when Jerome replies: the reply, and the same status link. Replies to it reach jerome@. */
export function replyEmail(m: { name: string; brief: string }, reply: string, statusUrl: string): SiteEmail {
  const title = "My reply to your message";
  const lead = `Hi ${m.name.split(/\s+/)[0]}, here is my answer. Replying to this email reaches me directly.`;
  const why = "You got this email because you sent a message on jeromebadour.com. The status page shows this reply too.";
  return {
    subject: `Re: ${m.brief.slice(0, 60)}${m.brief.length > 60 ? "…" : ""}`,
    html: layout({ title, preheader: reply.slice(0, 120), lead, body: paras(reply), rows: [["Your brief", m.brief]], button: { label: "See the status page", url: statusUrl }, why }),
    text: `${reply}\n\nYour brief: ${m.brief}\n\nStatus: ${statusUrl}\n\n${why}\nJerome Badour · https://jeromebadour.com`,
  };
}
