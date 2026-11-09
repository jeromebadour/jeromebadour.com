// A stand-in for Anthropic's Messages API, speaking its real streaming (SSE) format, so Ask can be tested without a
// key or spend. Start: node tests/e2e/fake_claude.mjs 4010, then run the site with
// ANTHROPIC_BASE_URL=http://127.0.0.1:4010 ANTHROPIC_API_KEY=test-key.
// The scenario is picked by a word in the question: poem (refuse), OVERLOADED (an error), INVENTED (one point cites
// a page that doesn't exist), NOTHING (every point does), SLOW (real pauses), else a faithful answer.
// GET /last returns the last request (headers + body) so tests can check what the site sent.
import http from "node:http";

const port = Number(process.argv[2] || 4010);
const host = process.argv[3] || "127.0.0.1";
let last = null;

async function sse(res, lines, delayMs, inputTokens) {
  res.writeHead(200, { "content-type": "text/event-stream", "request-id": "req_fake" });
  const text = lines.join("\n");
  const chunks = text.match(/[\s\S]{1,23}/g) ?? [];
  const events = [
    ["message_start", { message: { id: "msg_fake", type: "message", role: "assistant", model: "claude-haiku-5-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: inputTokens, output_tokens: 1 } } }],
    ["content_block_start", { index: 0, content_block: { type: "text", text: "" } }],
    ...chunks.map((c) => ["content_block_delta", { index: 0, delta: { type: "text_delta", text: c } }]),
    ["content_block_stop", { index: 0 }],
    ["message_delta", { delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 240 } }],
    ["message_stop", {}],
  ];
  for (const [type, data] of events) {
    res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
  }
  res.end();
}

const PAYMENTS = [
  '{"point": "Yes. W3Arena\'s shop takes payments 3+ ways: crypto, PayPal, and local sellers in 6+ countries.", "proofs": ["/work/w3arena/shop"]}',
  '{"point": "Every purchase gets a receipt and can be refunded within 14 days until it is used.", "proofs": ["/work/w3arena/shop", "changelog"]}',
  '{"point": "Behind it, the admin console sets the payment methods and the catalogue, and every staff action is on record.", "proofs": ["/work/w3arena/console"]}',
  '{"close": "Your project isn\'t tied to W3Arena\'s methods: I connect whichever provider fits it."}',
  '{"brief": "I need payments in my web app: a checkout, receipts, refunds and an admin view of every payment."}',
];

http
  .createServer((req, res) => {
    if (req.method === "GET" && req.url === "/last") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify(last));
    }
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const body = JSON.parse(raw || "{}");
      last = { headers: req.headers, body };
      const content = body.messages?.[0]?.content ?? "";
      const question = (content.match(/<question>([\s\S]*)<\/question>/) ?? [])[1] ?? "";
      const delay = question.includes("SLOW") ? 120 : Number(process.env.FAKE_DELAY_MS || 0);
      const input = Math.round(content.length / 4);
      if (question.includes("OVERLOADED")) {
        res.writeHead(529, { "content-type": "application/json", "request-id": "req_fake" });
        return res.end(JSON.stringify({ type: "error", error: { type: "overloaded_error", message: "Overloaded" } }));
      }
      if (/poem/i.test(question)) return sse(res, ['{"refuse": "I only answer questions about my work, skills and services."}'], delay, input);
      if (question.includes("NOTHING")) {
        return sse(res, ['{"point": "A made-up claim.", "proofs": ["/work/nowhere"]}', '{"point": "Another.", "proofs": ["made-up-proof"]}'], delay, input);
      }
      if (question.includes("INVENTED")) {
        return sse(res, [PAYMENTS[0], '{"point": "A claim with no real page behind it.", "proofs": ["/work/booking-system"]}', PAYMENTS[2], PAYMENTS[3], PAYMENTS[4]], delay, input);
      }
      return sse(res, PAYMENTS, delay, input);
    });
  })
  .listen(port, host, () => console.log(`fake Claude on http://${host}:${port}`));
