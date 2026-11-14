import { notFound } from "next/navigation";
import { W3Part } from "@/components/W3Part";
import type { FwPartId } from "@/components/FwParts";
import { partMeta } from "@/lib/meta";

// The address of each Fernway part (lib/links.ts, fwPart) and the part it shows.
const slugs: Record<string, FwPartId> = {
  "delivery-engine": "fw-engine", "public-site": "fw-site", "inside-ghl": "fw-ghl", wordpress: "fw-wordpress",
  "api-and-laravel": "fw-api", automations: "fw-automations", consoles: "fw-consoles", "accounts-and-billing": "fw-billing",
};

export async function generateMetadata({ params }: { params: Promise<{ part: string }> }) {
  const part = (await params).part;
  return slugs[part] ? partMeta(slugs[part], `/work/fernway/${part}`) : {};
}

export function generateStaticParams() { return Object.keys(slugs).map((part) => ({ part })); }
export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ part: string }> }) {
  const id = slugs[(await params).part];
  if (!id) notFound();
  return <W3Part id={id} />;
}
