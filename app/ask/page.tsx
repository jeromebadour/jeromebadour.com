import { AskPage } from "@/components/AskPage";
import { isPaused } from "@/lib/server/messages";

// Ask about my work. The home field sends its question here (?q=), and it is asked at once.
export const metadata = { title: "Ask about my work · Jerome Badour" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <AskPage first={(q ?? "").slice(0, 500)} paused={await isPaused("ask")} />;
}
