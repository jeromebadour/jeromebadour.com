import { cardFor } from "@/lib/meta";
import { cardImage } from "@/lib/og";
import { openProposal } from "@/lib/server/proposals";
import { proofCard } from "@/components/W3Part";

// /og/<key>: the link-preview card of a page (lib/meta.ts), or of a proposal page ("for-<slug>"). Reading a proposal
// for its card never counts as an open; an off, paused or unknown page has no card.
export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const key = (await params).key;
  if (key.startsWith("for-")) {
    const p = await openProposal(key.slice(4), false);
    if (!p) return new Response("Not found", { status: 404 });
    // The job's title and the three proofs as the page shows them (a headline where one was given).
    const list = p.proofs.map((id, n) => p.headlines[n] || proofCard(id)?.title || id);
    return cardImage({ kicker: "For your job", title: p.title, line: "", list }, 300);
  }
  const card = cardFor(key);
  if (!card) return new Response("Not found", { status: 404 });
  return cardImage(card, 86400);
}
