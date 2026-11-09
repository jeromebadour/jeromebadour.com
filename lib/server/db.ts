import "server-only";
import { Pool, type PoolClient } from "pg";

// The only way the site talks to Postgres. It connects as `site_app` (db/migrations/001_schema.sql), which owns
// nothing and can only do what its grants allow.
const globalForPool = globalThis as unknown as { sitePool?: Pool };

function pool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  globalForPool.sitePool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 30_000 });
  return globalForPool.sitePool;
}

export type Db = PoolClient;

/** Runs `work` in one transaction. */
export async function tx<T>(work: (db: Db) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    const result = await work(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** One query outside a transaction. */
export async function q<T extends object = Record<string, unknown>>(text: string, values: unknown[] = []): Promise<T[]> {
  return (await pool().query<T>(text, values)).rows;
}

/** Postgres' unique-violation code, with the constraint that fired. */
export function uniqueViolation(error: unknown): string | null {
  const e = error as { code?: string; constraint?: string };
  return e?.code === "23505" ? (e.constraint ?? "") : null;
}
