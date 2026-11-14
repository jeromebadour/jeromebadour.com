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

const g = globalThis as unknown as { w3aFeed?: { at: number; p: Promise<Release[] | null> } };

async function readW3a(): Promise<Release[] | null> {
  const row = (await q<{ body: unknown; fresh: boolean }>("select body, fetched_at > now() - make_interval(secs => $1::float8 / 1000) as fresh from feeds where name = 'w3arena'", [EVERY]))[0];
  const kept = row ? parseW3aFeed(row.body) : null;
  if (row?.fresh && kept) return kept;
  try {
    const res = await fetch(FEED, { signal: AbortSignal.timeout(8_000), headers: { accept: "application/json", "user-agent": "jeromebadour.com service board" } });
    if (!res.ok) throw new Error(`answered ${res.status}`);
    const body = await res.json();
    const got = parseW3aFeed(body);
    if (!got) throw new Error("not the agreed shape");
    await q("insert into feeds (name, body, fetched_at) values ('w3arena', $1, now()) on conflict (name) do update set body = excluded.body, fetched_at = now()", [JSON.stringify(body)]);
    return got;
  } catch (e) {
    console.error(`service board: W3Arena feed: ${(e as Error).message}; keeping the last good copy`);
    return kept;
  }
}

/** W3Arena's releases, refreshed at most once an hour per server (a failed read waits the hour too). */
function w3a(): Promise<Release[] | null> {
  if (!g.w3aFeed || Date.now() - g.w3aFeed.at > EVERY) g.w3aFeed = { at: Date.now(), p: readW3a().catch(() => null) };
  return g.w3aFeed.p;
}

async function siteDays(): Promise<string[]> {
  const rows = await q<{ d: string }>("select distinct to_char(at at time zone 'UTC', 'YYYY-MM-DD') as d from deploys order by d");
  return rows.map((r) => r.d);
}

const short = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** The board as it stands now: the typed list, with each part replaced by what could be read. */
export async function board(): Promise<Board> {
  const b: Board = structuredClone(RELEASES);
  const [w, days] = await Promise.all([w3a().catch(() => null), siteDays().catch(() => [] as string[])]);
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
