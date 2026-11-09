import { MessagePage } from "@/components/MessagePage";
import { isPaused, questionText } from "@/lib/server/messages";
import { briefFor } from "@/lib/server/ask";

// The brief: empty, or written from an Ask question (/message?from=<question id>).
export const metadata = { title: "Message · Jerome Badour" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const question = await questionText(from ?? null);
  const draft = question && from ? (await briefFor(from)) ?? "" : "";
  return <MessagePage from={question && from ? { id: from, question } : null} draft={draft} paused={await isPaused("messages")} />;
}
