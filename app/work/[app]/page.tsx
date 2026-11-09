import { notFound } from "next/navigation";
import { W3Part } from "@/components/W3Part";
import { STUDY_APPS } from "@/lib/apps";
import { partMeta } from "@/lib/meta";

// Every app's own page (lib/apps.ts), at /work/<id>. W3Arena has its own overview at /work/w3arena instead.
export function generateStaticParams() { return STUDY_APPS.map((a) => ({ app: a.id })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ app: string }> }) {
  const id = (await params).app;
  const a = STUDY_APPS.find((x) => x.id === id);
  return a ? partMeta(a.id, a.page) : {};
}

export default async function Page({ params }: { params: Promise<{ app: string }> }) {
  const id = (await params).app;
  const a = STUDY_APPS.find((x) => x.id === id);
  if (!a) notFound();
  return <W3Part id={a.id} />;
}
