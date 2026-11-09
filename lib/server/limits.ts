import "server-only";
import type { Db } from "./db";

export type Limit = { perHour: number; perDay: number };
export const LIMITS = {
  ask: { perHour: 10, perDay: 30 },
  message: { perHour: 3, perDay: 10 },
} satisfies Record<"ask" | "message", Limit>;

export type UseResult = { ok: true } | { ok: false; window: "hour" | "day"; freeAt: Date };

/**
 * Takes one use of `kind` for a visitor, counted on every key they carry (cookie and IP), so clearing cookies doesn't
 * reset the count. Locks the keys first so two quick requests can't both take the last use.
 */
export async function takeUse(db: Db, kind: keyof typeof LIMITS, keys: string[]): Promise<UseResult> {
  const { perHour, perDay } = LIMITS[kind];
  for (const key of [...keys].sort()) {
    await db.query("select pg_advisory_xact_lock(hashtext($1))", [`${kind}:${key}`]);
  }
  const { rows } = await db.query<{ hour: number; day: number; hour_free: Date | null; day_free: Date | null }>(
    `select
       count(*) filter (where at > now() - interval '1 hour')::int as hour,
       count(*)::int as day,
       min(at) filter (where at > now() - interval '1 hour') + interval '1 hour' as hour_free,
       min(at) + interval '1 day' as day_free
     from limit_hits where kind = $1 and visitor_key = any($2) and at > now() - interval '1 day'`,
    [kind, keys],
  );
  const r = rows[0];
  if (r.day >= perDay) return { ok: false, window: "day", freeAt: r.day_free! };
  if (r.hour >= perHour) return { ok: false, window: "hour", freeAt: r.hour_free! };
  for (const key of keys) await db.query("insert into limit_hits (kind, visitor_key) values ($1, $2)", [kind, key]);
  return { ok: true };
}

/** Gives a use back (a failed answer doesn't count, plan §6). */
export async function giveBack(db: Db, kind: keyof typeof LIMITS, keys: string[]) {
  await db.query(
    `delete from limit_hits where ctid in (
       select distinct on (visitor_key) ctid from limit_hits
       where kind = $1 and visitor_key = any($2) order by visitor_key, at desc)`,
    [kind, keys],
  );
}
