import { APPS } from "@/lib/apps";
import { pageMeta } from "@/lib/meta";
import { HomeE } from "@/components/HomeE";

export const metadata = pageMeta("home");

export default async function Home({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <HomeE tab={APPS.some((a) => a.tab === tab) ? tab : "all"} />;
}
