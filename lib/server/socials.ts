import "server-only";
import { q, tx } from "./db";
import { audit } from "./audit";
import { out } from "@/lib/links";
import type { Social } from "@/components/Socials";

// The socials as the site shows them. Before the database answers (the build), the three accounts on record.
const FALLBACK: Social[] = [
  { kind: "discord", label: "Discord", url: out.discord, onProposals: false },
  { kind: "github", label: "GitHub", url: out.github, onProposals: true },
  { kind: "upwork", label: "Upwork", url: out.upwork, onProposals: true },
];

export async function shownSocials(): Promise<Social[]> {
  if (!process.env.DATABASE_URL) return FALLBACK;
  try {
    return (await q<{ kind: string; label: string; url: string; on_proposals: boolean }>(
      "select kind::text as kind, label, url, on_proposals from socials order by sort, created_at",
    )).map((r) => ({ kind: r.kind, label: r.label, url: r.url, onProposals: r.on_proposals }));
  } catch (e) {
    console.error("socials: falling back to the accounts on record", e instanceof Error ? e.message : e);
    return FALLBACK;
  }
}

export const KINDS = ["discord", "github", "upwork", "linkedin", "x", "youtube", "other"] as const;
export type SocialInput = { id: string | null; kind: string; label: string; url: string; onProposals: boolean };
export type SocialErrors = Partial<Record<"kind" | "label" | "url" | "form", string>>;

export async function saveSocial(input: SocialInput): Promise<{ ok: true } | { ok: false; errors: SocialErrors }> {
  const label = input.label.trim();
  const url = input.url.trim();
  const errors: SocialErrors = {};
  if (!(KINDS as readonly string[]).includes(input.kind)) errors.kind = "Pick what kind of account it is.";
  if (label.length < 1 || label.length > 30) errors.label = "The name on the chip, up to 30 characters.";
  if (!/^https:\/\/[^\s]+\.[^\s]+$/.test(url) || url.length > 300) errors.url = "The account's address, starting https://";
  if (Object.keys(errors).length) return { ok: false, errors };
  await tx(async (db) => {
    if (input.id) {
      await db.query("update socials set kind = $2, label = $3, url = $4, on_proposals = $5 where id = $1", [input.id, input.kind, label, url, input.onProposals]);
      await audit(db, "social.edit", label);
    } else {
      await db.query(
        "insert into socials (kind, label, url, on_proposals, sort) values ($1, $2, $3, $4, (select coalesce(max(sort), 0) + 1 from socials))",
        [input.kind, label, url, input.onProposals],
      );
      await audit(db, "social.add", label);
    }
  });
  return { ok: true };
}

export async function removeSocial(id: string) {
  await tx(async (db) => {
    const { rows } = await db.query<{ label: string }>("delete from socials where id = $1 returning label", [id]);
    if (rows[0]) await audit(db, "social.remove", rows[0].label);
  });
}

