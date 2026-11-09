import { pageMeta } from "@/lib/meta";
import { HomeE } from "@/components/HomeE";

export const metadata = pageMeta("home");

export default async function Home({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <HomeE tab={tab === "w3a" || tab === "distill" ? tab : "all"} />;
}
