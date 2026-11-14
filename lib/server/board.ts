import "server-only";
import { q } from "./db";
import { BOARD_SINCE, RELEASES, type Board } from "@/lib/releases";

// The home page's service board, read by itself instead of typed by hand:
// - this site's deploy days from `deploys` (written by scripts/deploy.sh from its deploy logs);
// - W3Arena's releases from its public changelog feed (https://w3arena.pro/public/changelog: newest first, date
//   YYYY-MM-DD or null, changes = every section's items added up; its shape agreed with W3Arena Website 2026-11-14).
// The feed is read at most once an hour; the last good copy is kept in `feeds`, so a feed that is down or changes shape
// never empties the board. Anything unreadable falls back to the typed list in lib/releases.ts.

const FEED = process.env.W3A_FEED_URL ?? "https://w3arena.pro/public/changelog";
// The apps' own deploy days (GHL Build and Freelance Distill, 2026-11-14): {live_since, deploys: [YYYY-MM-DD], commit}.
// Tests point them all at the fake with DEPLOY_FEEDS_BASE (<base>/<name>).
const BASE = process.env.DEPLOY_FEEDS_BASE;
const DEPLOY_FEEDS: Record<string, string> = BASE
  ? { fernway: `${BASE}/fernway`, alderpike: `${BASE}/alderpike`, distill: `${BASE}/distill` }
  : {
      fernway: "https://fernway.jeromebadour.com/api/public/deploys",
      alderpike: "https://fernway.jeromebadour.com/api/public/deploys?site=alderpike",
      distill: "https://distill.jeromebadour.com/api/public/deploys",
    };
// How often the feed is read: an hour; CI shortens it to test a feed going down and coming back.
const EVERY = Number(process.env.W3A_FEED_EVERY_MS) || 3_600_000;
type Release = { version: string; date: string; changes: number; url: string };

/** The feed's releases with a date, newest first; null when the body isn't the agreed shape. */
export function parseW3aFeed(body: unknown): Release[] | null {
  const v = (body as { success?: boolean; versions?: unknown })?.versions;
  if (!(body as { success?: boolean })?.success || !Array.isArray(v)) return null;
  const out: Release[] = [];
  for (const r of v as { version?: unknown; date?: unknown; sections?: unknown }[]) {
    if (typeof r?.version !== "string" || !/^[0-9][0-9.]{0,15}$/.test(r.version)) return null;
    if (r.date === null) continue;
    if (typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return null;
    const changes = Array.isArray(r.sections) ? r.sections.reduce((n: number, s: { items?: unknown[] }) => n + (Array.isArray(s?.items) ? s.items.length : 0), 0) : 0;
    out.push({ version: r.version, date: r.date, changes, url: `https://w3arena.pro/changelog/${r.version}` });
  }
  return out.length ? out : null;
}

/** An app's deploy days, oldest first; null when the body isn't the agreed shape. */
export function parseDeploys(body: unknown): { since: string; days: string[] } | null {
  const b = body as { live_since?: unknown; deploys?: unknown };
  const day = (d: unknown) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
  if (!day(b?.live_since) || !Array.isArray(b.deploys) || !b.deploys.length || !b.deploys.every(day)) return null;
  return { since: b.live_since as string, days: [...(b.deploys as string[])].sort() };
}

const g = globalThis as unknown as { boardFeeds?: Record<string, { at: number; p: Promise<unknown> }> };

/** One outside feed, read at most once per EVERY per server, its last good copy kept in `feeds`. */
async function readFeed<T>(name: string, url: string, parse: (b: unknown) => T | null): Promise<T | null> {
  const row = (await q<{ body: unknown; fresh: boolean }>("select body, fetched_at > now() - make_interval(secs => $2::float8 / 1000) as fresh from feeds where name = $1", [name, EVERY]))[0];
  const kept = row ? parse(row.body) : null;
  if (row?.fresh && kept) return kept;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000), headers: { accept: "application/json", "user-agent": "jeromebadour.com service board" } });
    if (!res.ok) throw new Error(`answered ${res.status}`);
    const body = await res.json();
    const got = parse(body);
    if (!got) throw new Error("not the agreed shape");
    await q("insert into feeds (name, body, fetched_at) values ($1, $2, now()) on conflict (name) do update set body = excluded.body, fetched_at = now()", [name, JSON.stringify(body)]);
    return got;
  } catch (e) {
    console.error(`service board: ${name} feed: ${(e as Error).message}; keeping the last good copy`);
    return kept;
  }
}

function feed<T>(name: string, url: string, parse: (b: unknown) => T | null): Promise<T | null> {
  g.boardFeeds ??= {};
  const c = g.boardFeeds[name];
  if (!c || Date.now() - c.at > EVERY) g.boardFeeds[name] = { at: Date.now(), p: readFeed(name, url, parse).catch(() => null) };
  return g.boardFeeds[name].p as Promise<T | null>;
}

const w3a = () => feed("w3arena", FEED, parseW3aFeed);

async function siteDays(): Promise<string[]> {
  const rows = await q<{ d: string }>("select distinct to_char(at at time zone 'UTC', 'YYYY-MM-DD') as d from deploys order by d");
  return rows.map((r) => r.d);
}

const short = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** The board as it stands now: the typed list, with each part replaced by what could be read. */
export async function board(): Promise<Board> {
  const b: Board = structuredClone(RELEASES);
  const ids = Object.keys(DEPLOY_FEEDS);
  const [w, days, ...apps] = await Promise.all([
    w3a().catch(() => null), siteDays().catch(() => [] as string[]),
    ...ids.map((id) => feed(id, DEPLOY_FEEDS[id], parseDeploys).catch(() => null)),
  ]);
  // An app's feed adds to its typed days, never replaces them: a feed whose records start late (Distill's said live
  // since 14 Nov on its first day) can't make the board say an app is newer than it is.
  ids.forEach((id, i) => {
    const f = apps[i] as { since: string; days: string[] } | null;
    if (!f || !b[id]) return;
    const all = [...new Set([...b[id].dates, ...f.days])].sort();
    const since = [all[0], f.since].sort()[0];
    b[id] = { ...b[id], dates: all, note: `Live since ${short(since)}` };
  });
  if (w) {
    const since = w.filter((r) => r.date >= BOARD_SINCE);
    const first = since[since.length - 1];
    b.w3arena = {
      ...b.w3arena, latest: w[0].version, dates: since.map((r) => r.date).reverse(),
      note: first ? `${since.length} releases since ${short(first.date)}` : b.w3arena.note,
      latestDate: w[0].date, latestChanges: w[0].changes, latestUrl: w[0].url,
    };
  }
  if (days.length) {
    const all = [...new Set([...b.site.dates, ...days])].sort();
    b.site = { ...b.site, dates: all, note: `Live since ${short(all[0])}` };
  }
  return b;
}
