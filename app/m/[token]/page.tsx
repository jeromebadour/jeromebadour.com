import { notFound } from "next/navigation";
import { StatusPage } from "@/components/StatusPage";
import { NotFoundPage } from "@/components/NotFoundPage";
import { statusByToken } from "@/lib/server/messages";

// A sender's status page. An unknown link is the 404; a link past its 90 days says the message is closed (plan §7).
export const metadata = { title: "Your message · Jerome Badour", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const m = await statusByToken((await params).token);
  if (!m) notFound();
  if (!m.open) return <NotFoundPage kind="closed" />;
  return <StatusPage m={m} />;
}
