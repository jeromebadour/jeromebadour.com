import "server-only";
import { q, tx } from "./db";
import { takeUse } from "./limits";
import { newToken, tokenHash } from "./tokens";
import { sendMail, siteUrl } from "./mailer";
import { audit } from "./audit";
import { newMessageEmail, receivedEmail, replyEmail } from "@/lib/email/site-email";

// Messages (plan §7): the brief, its status page, and the emails around it.
export const STACKS = ["Node.js", "React / Next.js", "Python", "PHP", "WordPress", "Not sure yet"] as const;
export const SOONS = ["this_week", "this_month", "no_rush"] as const;
export type Soon = (typeof SOONS)[number];
const OWNER_INBOX = () => process.env.OWNER_NOTIFY ?? "jerome@jeromebadour.com";

export type MessageInput = { name: string; email: string; brief: string; builtWith: string[]; howSoon: string; fromQuestionId: string | null; trap: string };
export type FieldErrors = Partial<Record<"name" | "email" | "brief" | "form", string>>;
export type SendResult = { ok: true; token: string } | { ok: false; errors: FieldErrors };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function isPaused(name: "ask" | "messages" | "proposals"): Promise<boolean> {
  return (await q<{ paused: boolean }>("select paused from brakes where name = $1", [name]))[0]?.paused ?? false;
}

/** The question a brief was written from, if the id is real and the question still kept. */
export async function questionText(id: string | null): Promise<string | null> {
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return null;
  return (await q<{ question: string }>("select question from questions where id = $1", [id]))[0]?.question ?? null;
}

export async function sendMessage(input: MessageInput, keys: string[]): Promise<SendResult> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  const brief = input.brief.trim();
  const builtWith = [...new Set(input.builtWith)].filter((s): s is (typeof STACKS)[number] => (STACKS as readonly string[]).includes(s));
  const howSoon = (SOONS as readonly string[]).includes(input.howSoon) ? (input.howSoon as Soon) : "this_month";

  const errors: FieldErrors = {};
  if (!name) errors.name = "Your name, so I know who to answer.";
  else if (name.length > 80) errors.name = "Up to 80 characters.";
  if (!EMAIL.test(email) || email.length > 200) errors.email = "An email address I can reply to.";
  if (brief.length < 10) errors.brief = "A sentence or two about what you need.";
  else if (brief.length > 4000) errors.brief = "Up to 4,000 characters.";
  if (Object.keys(errors).length) return { ok: false, errors };
  if (await isPaused("messages")) return { ok: false, errors: { form: "Messages are paused for a short while. Upwork reaches me in the meantime." } };

  const fromQuestion = await questionText(input.fromQuestionId);
  const { token, hash } = newToken();
  const limited = await tx(async (db) => {
    const use = await takeUse(db, "message", keys);
    if (!use.ok) return use;
    await db.query(
      `insert into messages (token_hash, name, email, brief, built_with, how_soon, from_question) values ($1, $2, $3, $4, $5, $6, $7)`,
      [hash, name, email, brief, builtWith, howSoon, fromQuestion],
    );
    return null;
  });
  if (limited) {
    const at = limited.freeAt.toLocaleTimeString("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" });
    return { ok: false, errors: { form: `That's the most messages for ${limited.window === "hour" ? "this hour" : "today"}. Sending opens again at ${at}, Istanbul time.` } };
  }

  const base = await siteUrl();
  const facts = { name, email, brief, builtWith, howSoon };
  await sendMail({ to: email, replyTo: "jerome@jeromebadour.com", ...receivedEmail(facts, `${base}/m/${token}`) });
  await sendMail({ to: OWNER_INBOX(), replyTo: email, ...newMessageEmail(facts, fromQuestion, `${base}/admin?tab=inbox`) });
  return { ok: true, token };
}

export type Status = {
  name: string; email: string; brief: string; built_with: string[]; how_soon: Soon;
  status: "new" | "read" | "replied"; created_at: Date; read_at: Date | null; replied_at: Date | null; reply: string | null;
  open: boolean;
};

/** A sender's message by the token in their link; `open` is false once the link's 90 days are over. */
export async function statusByToken(token: string): Promise<Status | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const rows = await q<Status>(
    `select name, email, brief, built_with, how_soon, status, created_at, read_at, replied_at, reply, link_until > now() as open
     from messages where token_hash = $1 or reply_token_hash = $1`,
    [tokenHash(token)],
  );
  return rows[0] ?? null;
}

// ---- The owner's side (the console's Inbox) ----

export type MessageDetail = Status & { id: string; from_question: string | null };

/** Opens a message in the console: the first open marks it Read (the sender's page shows the time). */
export async function openMessage(id: string): Promise<MessageDetail | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  return tx(async (db) => {
    const { rows } = await db.query<{ status: string }>(
      `update messages set status = 'read', read_at = now() where id = $1 and status = 'new' returning status`, [id]);
    if (rows.length) await audit(db, "message.read", id);
    const r = await db.query<MessageDetail>(
      `select id, name, email, brief, built_with, how_soon, status, created_at, read_at, replied_at, reply, from_question,
              link_until > now() as open
       from messages where id = $1`, [id]);
    return r.rows[0] ?? null;
  });
}

export type ReplyResult = { ok: true } | { ok: false; error: string };

/** Sends the reply by email and shows it on the sender's status page. One reply per message. */
export async function replyTo(id: string, text: string): Promise<ReplyResult> {
  const reply = text.trim();
  if (reply.length < 1) return { ok: false, error: "Write the reply first." };
  if (reply.length > 8000) return { ok: false, error: "Up to 8,000 characters." };
  // The first link's token isn't stored, so the reply email gets a second link to the same page; both keep working.
  const { token, hash } = newToken();
  const updated = await tx(async (db) => {
    const { rows } = await db.query<{ name: string; email: string; brief: string }>(
      `update messages set status = 'replied', reply = $2, replied_at = now(), read_at = coalesce(read_at, now()), reply_token_hash = $3
       where id = $1 and status <> 'replied' returning name, email, brief`, [id, reply, hash]);
    if (rows.length) await audit(db, "message.reply", id);
    return rows[0] ?? null;
  });
  if (!updated) return { ok: false, error: "This message already has a reply." };
  const base = await siteUrl();
  const sent = await sendMail({ to: updated.email, replyTo: "jerome@jeromebadour.com", ...replyEmail(updated, reply, `${base}/m/${token}`) });
  if (!sent) return { ok: false, error: "The reply is saved and on the status page, but the email didn't go out. Answer from your own mail too." };
  return { ok: true };
}
