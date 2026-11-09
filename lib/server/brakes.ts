import "server-only";
import { tx } from "./db";
import { audit } from "./audit";

// Brakes (plan §9): pause Ask, messages or every proposal page at once, with a reason that goes on record.
export async function setBrake(name: string, paused: boolean, reason: string): Promise<string | null> {
  if (!["ask", "messages", "proposals"].includes(name)) return "Unknown part.";
  const r = reason.trim();
  if (paused && (r.length < 3 || r.length > 200)) return "A short reason, 3 to 200 characters.";
  await tx(async (db) => {
    await db.query("update brakes set paused = $2, reason = $3, changed_at = now() where name = $1", [name, paused, paused ? r : null]);
    await audit(db, paused ? "brake.pause" : "brake.resume", name, paused ? { reason: r } : {});
  });
  return null;
}
