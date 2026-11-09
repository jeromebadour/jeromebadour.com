import "server-only";
import type { Db } from "./db";

/** Puts an owner action on record (audit_log is append-only for the app). */
export async function audit(db: Db, action: string, target: string | null, detail: Record<string, unknown> = {}) {
  await db.query("insert into audit_log (action, target, detail) values ($1, $2, $3)", [action, target, detail]);
}
