import { notFound } from "next/navigation";
import { PostPage } from "@/components/PostPage";
import { POSTS, postBySlug } from "@/lib/posts";
import { postMeta } from "@/lib/meta";

export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = postBySlug((await params).slug);
  return p ? postMeta(p) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = postBySlug((await params).slug);
  if (!p) notFound();
  return <PostPage post={p} />;
}
