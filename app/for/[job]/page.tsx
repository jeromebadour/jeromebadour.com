import { notFound } from "next/navigation";
import { ForPage } from "@/components/ForPage";
import { proofCard, type ProofCard } from "@/components/W3Part";
import { openProposal } from "@/lib/server/proposals";
import { currentOwner } from "@/lib/server/owner";

// A page made for one Upwork proposal. Off, paused or unknown pages are the 404. Opens are a count (the owner's own
// views aren't counted); no cookies are set.
export const metadata = { title: "For your job · Jerome Badour", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ job: string }> }) {
  const p = await openProposal((await params).job, !(await currentOwner()));
  if (!p) notFound();
  return <ForPage p={p} cards={p.proofs.map(proofCard).filter((c): c is ProofCard => !!c)} />;
}
