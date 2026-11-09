import "server-only";
import { q } from "./db";
import { ZONE } from "@/lib/time";

// What each console tab shows, read from the database. Days and times in Istanbul time.
export const PAGE_SIZE = 15;

export type MessageRow = {
  id: string; name: string; email: string; brief: string; built_with: string[];
  how_soon: "this_week" | "this_month" | "no_rush"; status: "new" | "read" | "replied"; created_at: Date;
};
export type QuestionRow = { id: string; question: string; points: number; refused: boolean; failed: boolean; created_at: Date };
export type ProposalRow = { id: string; slug: string; title: string; proofs: string[]; opens: number; is_on: boolean; created_at: Date };
export type BrakeRow = { name: "ask" | "messages" | "proposals"; paused: boolean; reason: string | null; changed_at: Date };
export type SocialRow = { id: string; kind: string; label: string; url: string; on_proposals: boolean; sort: number };

export async function newMessageCount(): Promise<number> {
  return (await q<{ n: number }>("select count(*)::int as n from messages where status = 'new'"))[0].n;
}

export async function inbox(page: number) {
  const [counts] = await q<{ new: number; read: number; replied_week: number; total: number }>(
    `select count(*) filter (where status = 'new')::int as new,
            count(*) filter (where status = 'read')::int as read,
            count(*) filter (where status = 'replied' and replied_at > now() - interval '7 days')::int as replied_week,
            count(*)::int as total
     from messages`,
  );
  const rows = await q<MessageRow>(
    `select id, name, email, brief, built_with, how_soon, status, created_at from messages
     order by created_at desc, id desc limit $1 offset $2`,
    [PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  return { counts, rows };
}

export async function questions(page: number) {
  const [counts] = await q<{ week: number; answered: number; refused: number; total: number }>(
    `select count(*) filter (where created_at > now() - interval '7 days')::int as week,
            count(*) filter (where created_at > now() - interval '7 days' and not refused and not failed)::int as answered,
            count(*) filter (where created_at > now() - interval '7 days' and refused)::int as refused,
            count(*)::int as total
     from questions`,
  );
  const rows = await q<QuestionRow>(
    `select id, question, points, refused, failed, created_at from questions
     order by created_at desc, id desc limit $1 offset $2`,
    [PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  return { counts, rows };
}

export async function proposals(page: number) {
  const [{ total }] = await q<{ total: number }>("select count(*)::int as total from proposals");
  const rows = await q<ProposalRow>(
    `select id, slug, title, proofs, opens, is_on, created_at from proposals
     order by created_at desc, id desc limit $1 offset $2`,
    [PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  return { total, rows };
}

/** Spend this month and today (Istanbul days), and per day for the last 14 days. */
export async function spend() {
  const [totals] = await q<{ month: string; today: string }>(
    `select coalesce(sum(usd) filter (where date_trunc('month', at at time zone $1) = date_trunc('month', now() at time zone $1)), 0)::text as month,
            coalesce(sum(usd) filter (where (at at time zone $1)::date = (now() at time zone $1)::date), 0)::text as today
     from ask_spend`,
    [ZONE],
  );
  const days = await q<{ day: string; usd: string }>(
    `select d::date::text as day, coalesce(sum(s.usd), 0)::text as usd
     from generate_series((now() at time zone $1)::date - 13, (now() at time zone $1)::date, interval '1 day') d
     left join ask_spend s on (s.at at time zone $1)::date = d::date
     group by d order by d`,
    [ZONE],
  );
  return { month: Number(totals.month), today: Number(totals.today), days: days.map((d) => ({ day: d.day, usd: Number(d.usd) })) };
}

export async function visits() {
  const days = await q<{ day: string; views: number }>(
    `select d::date::text as day, coalesce(sum(v.views), 0)::int as views
     from generate_series((now() at time zone $1)::date - 6, (now() at time zone $1)::date, interval '1 day') d
     left join visits_daily v on v.day = d::date
     group by d order by d`,
    [ZONE],
  );
  const pages = await q<{ path: string; views: number }>(
    `select path, sum(views)::int as views from visits_daily where day > current_date - 7
     group by path order by views desc, path limit 5`,
  );
  const from = await q<{ referrer: string; views: number }>(
    `select referrer, sum(views)::int as views from visits_daily where day > current_date - 7
     group by referrer order by views desc, referrer limit 5`,
  );
  const [{ messages }] = await q<{ messages: number }>(
    "select count(*)::int as messages from messages where created_at > now() - interval '7 days'",
  );
  return { days, pages, from, messages };
}

export async function brakes() {
  return q<BrakeRow>("select name, paused, reason, changed_at from brakes order by array_position(array['ask','messages','proposals']::brake_name[], name)");
}

export async function socials() {
  return q<SocialRow>("select id, kind::text as kind, label, url, on_proposals, sort from socials order by sort, created_at");
}
