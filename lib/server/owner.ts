import "server-only";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { q, tx } from "./db";
import { checkPassword } from "./hash";
import { newToken, tokenHash } from "./tokens";
import { audit } from "./audit";

// One owner signs in, to /admin only. Anyone else who opens a console address gets the site's 404 (BUILD-RULES 5.2).
// `__Host-` makes the browser refuse the cookie unless it is Secure, path=/ and set by this exact host.
export const OWNER_COOKIE = process.env.NODE_ENV === "production" ? "__Host-owner" : "owner";
const SESSION_DAYS = 14;
const FAILURES_PER_15_MIN = 5;

export type Owner = { id: string; email: string };

/** The signed-in owner, or null. Moves the session's last-seen time on. */
export async function currentOwner(): Promise<Owner | null> {
  const token = (await cookies()).get(OWNER_COOKIE)?.value;
  if (!token) return null;
  const rows = await q<Owner>(
    `update owner_sessions s set last_seen_at = now()
     from owner_account o
     where s.token_hash = $1 and s.owner_id = o.id and s.expires_at > now()
     returning o.id, o.email`,
    [tokenHash(token)],
  );
  return rows[0] ?? null;
}

/** For console pages and actions: the owner, or the 404 page. */
export async function requireOwner(): Promise<Owner> {
  const owner = await currentOwner();
  if (!owner) notFound();
  return owner;
}

export type SignInResult = { ok: true } | { ok: false; reason: "wrong" | "slow_down" };

export async function signIn(email: string, password: string, visitorKey: string): Promise<SignInResult> {
  const recent = await q<{ n: number }>(
    "select count(*)::int as n from sign_in_failures where visitor_key = $1 and at > now() - interval '15 minutes'",
    [visitorKey],
  );
  if (recent[0].n >= FAILURES_PER_15_MIN) return { ok: false, reason: "slow_down" };

  const rows = await q<{ id: string; password_hash: string }>(
    "select id, password_hash from owner_account where email = $1",
    [email.trim().toLowerCase()],
  );
  const ok = await checkPassword(rows[0]?.password_hash ?? null, password);
  if (!ok || !rows[0]) {
    await q("insert into sign_in_failures (visitor_key) values ($1)", [visitorKey]);
    return { ok: false, reason: "wrong" };
  }
  const { token, hash } = newToken();
  await tx(async (db) => {
    await db.query(
      `insert into owner_sessions (token_hash, owner_id, expires_at) values ($1, $2, now() + make_interval(days => $3))`,
      [hash, rows[0].id, SESSION_DAYS],
    );
    await audit(db, "owner.sign_in", null);
  });
  (await cookies()).set(OWNER_COOKIE, token, {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_DAYS * 86_400,
  });
  return { ok: true };
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(OWNER_COOKIE)?.value;
  if (token) {
    await tx(async (db) => {
      await db.query("delete from owner_sessions where token_hash = $1", [tokenHash(token)]);
      await audit(db, "owner.sign_out", null);
    });
  }
  jar.delete(OWNER_COOKIE);
}
