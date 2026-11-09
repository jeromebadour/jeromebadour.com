"use client";
import { createContext, useContext } from "react";
import { Brand, Glyph, type BrandName } from "./Glyph";

// The accounts shown under the name, in the footer and on About, as kept in the console's Socials tab. The root
// layout reads them once per request and hands them down, so server and client pages draw the same list.
export type Social = { kind: string; label: string; url: string; onProposals: boolean };
const Ctx = createContext<Social[]>([]);

export function SocialsProvider({ value, children }: { value: Social[]; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const CLASS: Record<string, string> = { discord: "t-discord", github: "t-gh", upwork: "t-up" };
const BRANDS = new Set(["discord", "github", "upwork"]);

/** The socials as chips. On proposal pages (upwork) only the ones marked for them; in Upwork mode (proxy.ts) the
 *  others are hidden too (off-up). */
export function SocialChips({ upwork = false }: { upwork?: boolean }) {
  const list = useContext(Ctx).filter((s) => !upwork || s.onProposals);
  return (
    <>
      {list.map((s) => (
        <a key={s.url} href={s.url} className={`${CLASS[s.kind] ?? "t-blue"}${s.onProposals ? "" : " off-up"}`}>
          {BRANDS.has(s.kind) ? <Brand name={s.kind as BrandName} size={14} /> : <Glyph name="web" size={14} />}{s.label}
        </a>
      ))}
    </>
  );
}
