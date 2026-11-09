import { ask, type AskEvent } from "@/lib/server/ask";
import { visitorKeys } from "@/lib/server/visitor";

// POST { question } → one JSON event per line, as the answer is written (lib/server/ask.ts).
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let question = "";
  try { question = String((await request.json())?.question ?? ""); } catch { /* answered below */ }
  question = question.trim();
  if (!question || question.length > 500) {
    return Response.json({ error: "A question of 1 to 500 characters." }, { status: 400 });
  }
  const keys = await visitorKeys();
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (e: AskEvent) => { try { controller.enqueue(encoder.encode(JSON.stringify(e) + "\n")); } catch { /* the visitor left */ } };
      try {
        await ask(question, keys, send, request.signal);
      } catch (error) {
        console.error("ask:", error);
        send({ type: "stopped", reason: "failed", text: "Something went wrong writing this answer. Ask again in a moment." });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });
  return new Response(body, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
}
