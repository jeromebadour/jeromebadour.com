import { notFound } from "next/navigation";
import { W3Part, type PartId } from "@/components/W3Part";

// The address of each W3Arena part (lib/links.ts, w3aPart) and the part it shows.
const slugs: Record<string, PartId> = {
  website: "website", forum: "forum", "desktop-app": "desktop", shop: "shop", console: "console",
  "game-servers": "servers", "ai-translation": "ai", reliability: "standby",
};

export function generateStaticParams() { return Object.keys(slugs).map((part) => ({ part })); }
export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ part: string }> }) {
  const id = slugs[(await params).part];
  if (!id) notFound();
  return <W3Part id={id} />;
}
