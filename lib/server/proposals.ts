import "server-only";
import { q, tx, uniqueViolation } from "./db";
import { audit } from "./audit";
import { PROOF_PARTS } from "@/components/W3Part";
import { slugify } from "@/lib/slug";

// Proposal pages (plan §8): made in the console in about a minute, one per Upwork job, three proofs each.
// headlines: an optional headline per proof id, shown on the page instead of the proof's own title.
export type NewProposal = { title: string; jobUrl: string; note: string; proofs: string[]; headlines: Record<string, string> };
export type ProposalErrors = Partial<Record<"title" | "jobUrl" | "note" | "proofs" | "headlines" | "form", string>>;

export async function createProposal(input: NewProposal): Promise<{ ok: true; slug: string } | { ok: false; errors: ProposalErrors }> {
  const title = input.title.trim().replace(/\s+/g, " ");
  const jobUrl = input.jobUrl.trim();
  const note = input.note.trim();
  const proofs = [...new Set(input.proofs)].filter((p) => (PROOF_PARTS as string[]).includes(p));
  const headlines = proofs.map((p) => (input.headlines[p] ?? "").trim().replace(/\s+/g, " "));
  const errors: ProposalErrors = {};
  if (title.length < 3 || title.length > 120) errors.title = "The job's title, 3 to 120 characters.";
  if (!/^https:\/\/www\.upwork\.com\/\S+$/.test(jobUrl)) errors.jobUrl = "The job's link on Upwork (https://www.upwork.com/…).";
  if (note.length < 10 || note.length > 400) errors.note = "Two lines for the client, 10 to 400 characters.";
  if (proofs.length !== 3) errors.proofs = "Pick exactly three proofs.";
  if (headlines.some((h) => h.length > 80)) errors.headlines = "A headline is at most 80 characters.";
  if (Object.keys(errors).length) return { ok: false, errors };

  const base = slugify(title);
  for (let n = 1; n <= 20; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    try {
      await tx(async (db) => {
        await db.query("insert into proposals (slug, title, job_url, note, proofs, headlines) values ($1, $2, $3, $4, $5, $6)", [slug, title, jobUrl, note, proofs, headlines]);
        await audit(db, "proposal.create", slug);
      });
      return { ok: true, slug };
    } catch (e) {
      if (uniqueViolation(e) !== "proposals_slug_key") throw e;
    }
  }
  return { ok: false, errors: { form: "Too many pages with this title; change it a little." } };
}

export async function setProposalOn(id: string, on: boolean) {
  await tx(async (db) => {
    const { rows } = await db.query<{ slug: string }>("update proposals set is_on = $2 where id = $1 returning slug", [id, on]);
    if (rows[0]) await audit(db, on ? "proposal.on" : "proposal.off", rows[0].slug);
  });
}

export type Proposal = { slug: string; title: string; job_url: string; note: string; proofs: string[]; headlines: string[] };

/** A page as a visitor sees it, counting the open; null when it doesn't exist, is off, or every page is paused. */
export async function openProposal(slug: string, count: boolean): Promise<Proposal | null> {
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) return null;
  const rows = await q<Proposal>(
    `${count ? "update proposals set opens = opens + 1" : "select slug, title, job_url, note, proofs, headlines from proposals"}
     where slug = $1 and is_on and not (select paused from brakes where name = 'proposals')
     ${count ? "returning slug, title, job_url, note, proofs, headlines" : ""}`,
    [slug],
  );
  return rows[0] ?? null;
}
