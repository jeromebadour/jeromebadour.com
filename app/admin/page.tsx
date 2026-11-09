import { ConsolePage, TABS, type ConsoleData, type Tab } from "@/components/ConsolePage";
import { requireOwner } from "@/lib/server/owner";
import * as load from "@/lib/server/console";
import { signOutAction } from "@/app/actions/owner";

// The owner console. Anyone who isn't the signed-in owner gets the site's 404 (BUILD-RULES 5.2).
export const metadata = { title: "Console · Jerome Badour", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string; page?: string }> }) {
  await requireOwner();
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "inbox";
  const pageNo = Math.max(1, Math.min(10_000, Number.parseInt(sp.page ?? "1", 10) || 1));
  let data: ConsoleData;
  switch (tab) {
    case "inbox": data = { tab, ...(await load.inbox(pageNo)) }; break;
    case "questions": data = { tab, ...(await load.questions(pageNo)) }; break;
    case "proposals": data = { tab, ...(await load.proposals(pageNo)) }; break;
    case "visits": data = { tab, ...(await load.visits()) }; break;
    case "spend": data = { tab, ...(await load.spend()) }; break;
    case "brakes": data = { tab, rows: await load.brakes() }; break;
    case "socials": data = { tab, rows: await load.socials() }; break;
  }
  return <ConsolePage data={data} pageNo={pageNo} newCount={await load.newMessageCount()} signOut={signOutAction} />;
}
