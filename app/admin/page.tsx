import { ConsolePage, TABS, type ConsoleData, type Tab } from "@/components/ConsolePage";
import { requireOwner } from "@/lib/server/owner";
import * as load from "@/lib/server/console";
import { signOutAction } from "@/app/actions/owner";
import { openMessage } from "@/lib/server/messages";
import { PROOF_PARTS, proofCard } from "@/components/W3Part";

// The owner console. Anyone who isn't the signed-in owner gets the site's 404 (BUILD-RULES 5.2).
export const metadata = { title: "Console · Jerome Badour", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string; page?: string; open?: string; new?: string; made?: string; pause?: string; edit?: string }> }) {
  await requireOwner();
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "inbox";
  const pageNo = Math.max(1, Math.min(10_000, Number.parseInt(sp.page ?? "1", 10) || 1));
  let data: ConsoleData;
  switch (tab) {
    case "inbox": { const open = sp.open ? await openMessage(sp.open) : null; data = { tab, ...(await load.inbox(pageNo)), open }; break; }
    case "questions": data = { tab, ...(await load.questions(pageNo)) }; break;
    case "proposals": data = { tab, ...(await load.proposals(pageNo)), dialog: sp.new === "1", made: sp.made && /^[a-z0-9-]{3,60}$/.test(sp.made) ? sp.made : null, choices: PROOF_PARTS.map((id) => { const c = proofCard(id)!; return { id, title: c.title, g: c.g }; }) }; break;
    case "visits": data = { tab, ...(await load.visits()) }; break;
    case "spend": data = { tab, ...(await load.spend()) }; break;
    case "brakes": data = { tab, rows: await load.brakes(), pause: sp.pause === "ask" || sp.pause === "messages" || sp.pause === "proposals" ? sp.pause : null }; break;
    case "socials": data = { tab, rows: await load.socials(), edit: sp.edit && /^(new|[0-9a-f-]{36})$/.test(sp.edit) ? sp.edit : null }; break;
  }
  return <ConsolePage data={data} pageNo={pageNo} newCount={await load.newMessageCount()} signOut={signOutAction} />;
}
