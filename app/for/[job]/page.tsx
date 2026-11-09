import type { Metadata } from "next";
import { headers } from "next/headers";
import { isPreviewBot } from "@/lib/bots";
import { notFound } from "next/navigation";
import { ForPage } from "@/components/ForPage";
import { proofCard, type ProofCard } from "@/components/W3Part";
import { openProposal } from "@/lib/server/proposals";
import { currentOwner } from "@/lib/server/owner";

// A page made for one Upwork proposal. Off, paused or unknown pages are the 404. Opens are a count (the owner's own
// views aren't counted); no cookies are set.
// The preview shows the job's title and its three proofs (/og/for-<slug>), and the note as its line. Reading the page
// for its preview never counts as an open.
export async function generateMetadata({ params }: { params: Promise<{ job: string }> }): Promise<Metadata> {
  const slug = (await params).job;
  const p = await openProposal(slug, false);
  const base = { title: "For your job · Jerome Badour", robots: { index: false } };
  if (!p) return base;
  const image = { url: `/og/for-${p.slug}`, width: 1200, height: 630, alt: p.title };
  return {
    ...base, description: p.note,
    openGraph: { type: "website", siteName: "Jerome Badour", title: `For your job: ${p.title}`, description: p.note, url: `/for/${p.slug}`, images: [image] },
    twitter: { card: "summary_large_image", title: `For your job: ${p.title}`, description: p.note, images: [image.url] },
  };
}
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ job: string }> }) {
  // Neither the owner's own look nor a link-preview fetch is a client opening the page.
  const count = !(await currentOwner()) && !isPreviewBot((await headers()).get("user-agent"));
  const p = await openProposal((await params).job, count);
  if (!p) notFound();
  return <ForPage p={p} cards={p.proofs.map(proofCard).filter((c): c is ProofCard => !!c)} />;
}
