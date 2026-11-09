import type { Metadata } from "next";
import { HOW_COUNT } from "@/components/HowPage";
import { W3A_LINE } from "@/components/W3Page";
import { proofCard, type PartId } from "@/components/W3Part";
import { LEGAL_UPDATED } from "@/lib/legal";
import { appById } from "@/lib/apps";

// Link previews (plan §11): each public page's title and line, and the card shown when its address is shared. Every
// line is the page's own approved header line, so a preview never says anything the page doesn't.
// chips: a row at the bottom (home); list: numbered rows under the title (a proposal's three proofs).
export type Card = { kicker: string; title: string; accent?: string; line: string; chips?: string[]; list?: string[] };

const site = "Jerome Badour";
const pages: Record<string, Card & { path: string; tab: string }> = {
  home: {
    path: "/", tab: site, kicker: "Full-stack developer: web, desktop, AI and servers",
    title: "I build live products", accent: "and keep them running.",
    line: "Websites, web apps, Windows desktop apps, AI features and the servers behind them, from a quick bug fix to a full platform.",
    chips: ["80+ servers in 6+ regions", "17,000+ games hosted", "Tested before every release"],
  },
  w3arena: {
    path: "/work/w3arena", tab: "W3Arena", kicker: "Case study · w3arena.pro", title: "W3Arena",
    line: W3A_LINE,
  },
  services: { path: "/services", tab: "Services", kicker: "Services", title: "Services", line: "From a quick bug fix to a full platform. Small jobs are welcome." },
  "how-i-work": { path: "/how-i-work", tab: "How I work", kicker: "How I work", title: "How I work", line: `${HOW_COUNT} things I do on every job, each with the proof it happened.` },
  about: { path: "/about", tab: "About", kicker: "About", title: site, line: "I build and run live products: websites, web apps, Windows desktop apps, AI features and the servers behind them." },
  ask: { path: "/ask", tab: "Ask about my work", kicker: "Ask", title: "Ask about my work", line: "Answers come from this site's own pages, and every point links to its proof." },
  message: { path: "/message", tab: "Message", kicker: "Message", title: "Message", line: "A short brief, written from your questions. Nothing is sent until you press Send." },
  // The legal pages have no header line: their preview says only what the page itself says at the top.
  privacy: { path: "/privacy", tab: "Privacy Policy", kicker: "Legal", title: "Privacy Policy", line: `Last updated ${LEGAL_UPDATED}` },
  terms: { path: "/terms", tab: "Terms of Use", kicker: "Legal", title: "Terms of Use", line: `Last updated ${LEGAL_UPDATED}` },
};

/** The card for a key: a page above, a W3Arena part, or an app's own page ("part-<id>"). Null when there's none. */
export function cardFor(key: string): Card | null {
  if (pages[key]) return pages[key];
  if (key.startsWith("part-")) {
    const c = proofCard(key.slice(5));
    if (!c) return null;
    // An app's own page is a case study; a W3Arena part shows the address next to its title on its page.
    const app = appById(c.id);
    return { kicker: app ? `Case study · ${app.name}` : `W3Arena · ${c.app === "W3Arena" ? "w3arena.pro" : c.app}`, title: c.title, line: c.line };
  }
  return null;
}

function meta(tab: string, path: string, key: string, card: Card): Metadata {
  const title = tab === site ? site : `${tab} · ${site}`;
  const image = { url: `/og/${key}`, width: 1200, height: 630, alt: card.accent ? `${card.title} ${card.accent}` : card.title };
  return {
    title, description: card.line, alternates: { canonical: path },
    openGraph: { type: "website", siteName: site, title, description: card.line, url: path, images: [image] },
    twitter: { card: "summary_large_image", title, description: card.line, images: [image.url] },
  };
}

/** A public page's title, description and link preview. */
export function pageMeta(key: keyof typeof pages): Metadata {
  const p = pages[key];
  return meta(p.tab, p.path, key, p);
}

/** A W3Arena part's or an app's own page: its own title and line. */
export function partMeta(id: PartId, path: string): Metadata {
  const c = cardFor(`part-${id}`)!;
  return meta(c.title, path, `part-${id}`, c);
}
