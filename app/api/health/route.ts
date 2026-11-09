import { q } from "@/lib/server/db";

// The container's health check: the site answers and reaches its database.
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await q("select 1");
    return Response.json({ ok: true, commit: process.env.APP_COMMIT ?? "dev" });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
