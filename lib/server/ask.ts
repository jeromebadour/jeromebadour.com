import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { q, tx } from "./db";
import { giveBack, LIMITS, takeUse } from "./limits";
import { isPaused } from "./messages";
import { OUTSIDE, PAGES, proofFor, siteKnowledge, type Proof } from "./knowledge";
import { ZONE } from "@/lib/time";

// Ask about my work (plan §6). Answers come only from the site's own pages; each point carries proofs by id, ids the
// model invents are dropped, and a point left with no proof isn't shown. Limits per visitor, two spend caps, a brake.

export const MODEL = "claude-haiku-5-5";
// Anthropic's list price for Claude Haiku 5.5, prompts up to 100,000 tokens (checked 2026-11-09): $0.10 per million
// input tokens, $0.50 per million output. Ask's prompts stay far under 100,000 tokens.
const USD_PER_INPUT = 0.10 / 1_000_000;
const USD_PER_OUTPUT = 0.50 / 1_000_000;
export const MONTH_CAP_USD = 8;
export const DAY_CAP_USD = 1;
const MAX_OUTPUT_TOKENS = 900;

export type AskEvent =
  | { type: "stage"; stage: "read" | "found" | "wrote"; n?: number }
  | { type: "point"; text: string; proofs: Proof[] }
  | { type: "close"; text: string }
  | { type: "refused"; text: string }
  | { type: "hello"; text: string }
  | { type: "done"; id: string; points: number }
  | { type: "stopped"; reason: "paused" | "cap" | "limit" | "failed"; text: string };

const SYSTEM = `You answer questions about Jerome Badour's work, for visitors to his site jeromebadour.com: mostly people who may hire him.

Use only the site's pages given between <site> tags. Never add a fact, number, client, tool or project that isn't on them.

Answer in this exact form, one JSON object per line and nothing else:
{"point": "<one or two short sentences>", "proofs": ["<page id>", ...]}
...two to five point lines...
{"close": "<one sentence>"}
{"brief": "<one or two sentences, in the visitor's own voice, saying what they need, for a message they may send>"}

Rules:
- Every point names the pages that prove it, by the page id given in its <page id="..."> tag (such as /work/w3arena/shop). You may also use these outside proofs: ${Object.keys(OUTSIDE).join(", ")}.
- Plain, warm, direct English, written as Jerome ("I"). No marketing words. No prices, rates or quotes, ever.
- Points never joke: they are facts with proofs. The close may carry one dry, light line from Jerome's own world (one person who builds and runs everything, releases that ship while players stay in the game, late nights, root cause first), never at the visitor.
- Never answer "no" or "only these two apps". When the site shows no project of exactly that kind, say what Jerome would build for it and point to the closest real proof (for example the shop for payments, the admin console for roles and permissions).
- Every count that can grow keeps its "+" as the site writes it.
- Don't describe how Jerome uses AI tools in his own work, and don't name any game or game file.
- If the question isn't about Jerome's work, skills or services (small talk, "are you funny?", "are you a bot?", a poem, homework, general help, anything else), answer with exactly one line: {"refuse": "<one or two sentences>"}. Here you are the part of the site that talks, and you speak about Jerome as "he". Your voice: dry, quick, confident, with a real sense of humour. Play along with the small talk in one sentence, then land on his work with one thing they could ask. Say a joke once and straight; never explain it, never use emoji, never mock the visitor, never claim anything that isn't on the site. You only know what is on this site: no passwords, no visitor data. Examples of the voice: "are you funny?" -> "Funnier than a server log at 3 a.m., which is where Jerome spends his evenings. Want to see what he builds?"; "are you a bot?" -> "Yes. Jerome built me and lets me talk to his clients, which tells you how much he trusts his own tests. What are you building?"; "write me a poem" -> "Jerome ships code, not poems. I can tell you about the shop he built, with receipts, a wallet and four membership tiers. Close enough?"`;

// A plain greeting gets a hello from the site itself: no model call, and it doesn't use up the visitor's questions
// (Kami 2026-11-10: "Hi" was answered coldly).
const GREETING = /^(hi+|hello+|hey+|hiya|yo|sup|howdy|greetings|hola|bonjour|salam|salaam|selam|merhaba|marhaba|ahlan|as+alamu? ?alaikum|salam alaikum|good (morning|afternoon|evening|day)|what'?s up|how are you( doing)?|مرحبا|اهلا|أهلا|السلام عليكم|سلام)( there| jerome| bot| claude)?[\s!.,?~]*$/i;
export const HELLO = "Hi. I'm the part of this site that talks. Jerome built me, so ask me about his work: what he's built, how he works, or whether he can build yours.";

function costOf(input: number, output: number): number {
  return input * USD_PER_INPUT + output * USD_PER_OUTPUT;
}

async function overCap(): Promise<boolean> {
  const [r] = await q<{ month: string; today: string }>(
    `select coalesce(sum(usd) filter (where date_trunc('month', at at time zone $1) = date_trunc('month', now() at time zone $1)), 0)::text as month,
            coalesce(sum(usd) filter (where (at at time zone $1)::date = (now() at time zone $1)::date), 0)::text as today
     from ask_spend where at > now() - interval '32 days'`,
    [ZONE],
  );
  return Number(r.month) >= MONTH_CAP_USD || Number(r.today) >= DAY_CAP_USD;
}

/** Splits a stream into whole lines as they arrive. */
class Lines {
  private buf = "";
  push(text: string): string[] {
    this.buf += text;
    const parts = this.buf.split("\n");
    this.buf = parts.pop() ?? "";
    return parts;
  }
  end(): string[] { const rest = this.buf; this.buf = ""; return rest.trim() ? [rest] : []; }
}

type Line = { point?: string; proofs?: unknown; close?: string; brief?: string; refuse?: string };
function parse(line: string): Line | null {
  const t = line.trim().replace(/^```(json)?$/, "");
  if (!t.startsWith("{")) return null;
  try { return JSON.parse(t) as Line; } catch { return null; }
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/** Answers one question, sending events as they happen. Never throws: every way out sends one final event. */
export async function ask(question: string, keys: string[], send: (e: AskEvent) => void, signal?: AbortSignal): Promise<void> {
  const text = question.trim();
  if (GREETING.test(text)) return send({ type: "hello", text: HELLO });
  if (await isPaused("ask")) return send({ type: "stopped", reason: "paused", text: "Ask is on a short break. Unlike W3Arena, it's allowed one. Every page is still here, and Upwork reaches me." });
  if (await overCap()) return send({ type: "stopped", reason: "cap", text: "Ask has spent today's budget. I keep it small on purpose; the pages are free. Upwork reaches me." });
  const use = await tx((db) => takeUse(db, "ask", keys));
  if (!use.ok) {
    const at = use.freeAt.toLocaleTimeString("en-GB", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" });
    const n = use.window === "hour" ? `${LIMITS.ask.perHour} questions this hour` : `${LIMITS.ask.perDay} questions today`;
    return send({ type: "stopped", reason: "limit", text: `That's ${n}. Even I take breaks. Asking opens again at ${at}, Istanbul time.` });
  }
  send({ type: "stage", stage: "read" });

  const points: { t: string; proofs: string[] }[] = [];
  let close = "";
  let brief = "";
  let refused = "";
  let priced = false;
  const pagesSeen = new Set<string>();
  const take = (raw: string) => {
    const l = parse(raw);
    if (!l) return;
    if (typeof l.refuse === "string" && !points.length) { refused = clip(l.refuse, 300); return; }
    if (typeof l.point === "string" && Array.isArray(l.proofs) && points.length < 5) {
      const proofs = [...new Set(l.proofs.filter((x): x is string => typeof x === "string"))].map(proofFor).filter((p): p is Proof => !!p);
      if (!proofs.length || !l.point.trim()) return;
      const fresh = proofs.filter((p) => p.kind === "page" && !pagesSeen.has(p.id));
      fresh.forEach((p) => pagesSeen.add(p.id));
      if (!points.length || fresh.length) send({ type: "stage", stage: "found", n: Math.max(1, pagesSeen.size) });
      const t = clip(l.point.trim(), 400);
      points.push({ t, proofs: proofs.map((p) => p.id) });
      send({ type: "point", text: t, proofs });
    } else if (typeof l.close === "string") close = clip(l.close.trim(), 300);
    else if (typeof l.brief === "string") brief = clip(l.brief.trim(), 600);
  };

  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
    const knowledge = await siteKnowledge();
    const client = new Anthropic({ maxRetries: 1, timeout: 45_000 });
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM,
      messages: [{ role: "user", content: `<site>\n${knowledge}\n</site>\n\nThe visitor's question:\n<question>${text}</question>` }],
    }, { signal });
    const lines = new Lines();
    stream.on("text", (delta) => { for (const l of lines.push(delta)) take(l); });
    const message = await stream.finalMessage();
    for (const l of lines.end()) take(l);
    await q("insert into ask_spend (input_tokens, output_tokens, usd) values ($1, $2, $3)",
      [message.usage.input_tokens, message.usage.output_tokens, costOf(message.usage.input_tokens, message.usage.output_tokens)]);
    priced = true;
  } catch (error) {
    if (!priced) console.error("ask: the model call failed", error instanceof Error ? error.message : error);
  }

  if (refused) {
    const [{ id }] = await q<{ id: string }>("insert into questions (question, refused) values ($1, true) returning id", [text]);
    send({ type: "refused", text: refused });
    return send({ type: "done", id, points: 0 });
  }
  if (!points.length) {
    await tx((db) => giveBack(db, "ask", keys));
    await q("insert into questions (question, failed) values ($1, true)", [text]);
    return send({ type: "stopped", reason: "failed", text: "That answer crashed before it shipped. It didn't count, so ask again." });
  }
  if (close) send({ type: "close", text: close });
  send({ type: "stage", stage: "wrote", n: points.length });
  const [{ id }] = await q<{ id: string }>(
    "insert into questions (question, answer, points) values ($1, $2, $3) returning id",
    [text, { points, close, brief }, points.length],
  );
  send({ type: "done", id, points: points.length });
}

/** The brief Ask wrote for a question, to start the message form with. */
export async function briefFor(id: string): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const r = await q<{ brief: string | null }>("select answer->>'brief' as brief from questions where id = $1", [id]);
  return r[0]?.brief || null;
}

export { PAGES };
