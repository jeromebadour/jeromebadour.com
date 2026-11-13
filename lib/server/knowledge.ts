import "server-only";
import { page, w3aPart } from "@/lib/links";
import { pageTitles } from "@/lib/pages";
import { OUTSIDE_PROOFS, STUDY_APPS } from "@/lib/apps";

// What Ask knows: the text of the site's own public pages, read from this same server the first time it's needed
// and kept in memory, so answers always come from exactly what visitors can read. Header, footer and the phone tab bar
// are left out. Every page is a proof by its address; a few outside proofs have ids of their own.

export const PAGES: string[] = [page.home, page.w3arena, ...Object.values(w3aPart), ...STUDY_APPS.map((a) => a.page), page.services, page.how, page.about];

// Proofs outside this site, from every app (lib/apps.ts).
export const OUTSIDE = OUTSIDE_PROOFS;

export type Proof = { id: string; label: string; href: string; kind: "page" | "release" | "demo" | "code" | "live" };

/** A proof id the model gave, as a chip; null for an id that doesn't exist (the model made it up). */
export function proofFor(id: string): Proof | null {
  if (id in pageTitles) return { id, label: pageTitles[id], href: id, kind: "page" };
  if (id === page.home) return null;
  const o = OUTSIDE[id];
  return o ? { id, ...o } : null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<header class="e-hdr"[\s\S]*?<\/header>/g, "")
    .replace(/<footer class="e-foot"[\s\S]*?<\/footer>/g, "")
    .replace(/<nav class="e-tabbar"[\s\S]*?<\/nav>/g, "")
    // The case studies' asides are the site's voice, not facts: Ask never quotes them as proof.
    .replace(/<p class="w-aside"[\s\S]*?<\/p>/g, "")
    .replace(/<(script|style|svg|noscript|template)[\s\S]*?<\/\1>/g, "")
    .replace(/<(br|\/p|\/li|\/h[1-6]|\/div|\/tr|\/section)[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

const globalForKnowledge = globalThis as unknown as { siteKnowledge?: Promise<string> };

async function read(): Promise<string> {
  const base = process.env.SELF_URL ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`;
  const parts = await Promise.all(PAGES.map(async (path) => {
    const res = await fetch(base + path, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`knowledge: ${path} answered ${res.status}`);
    return `<page id="${path}" title="${pageTitles[path] ?? "Home"}">\n${htmlToText(await res.text())}\n</page>`;
  }));
  return parts.join("\n\n");
}

/** The site's text, one <page> per address. A failed read isn't kept, so the next question tries again. */
export function siteKnowledge(): Promise<string> {
  globalForKnowledge.siteKnowledge ??= read().catch((e) => { globalForKnowledge.siteKnowledge = undefined; throw e; });
  return globalForKnowledge.siteKnowledge;
}
