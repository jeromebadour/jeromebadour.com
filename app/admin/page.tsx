import { ConsolePage, type Tab } from "@/components/ConsolePage";

// The owner console. Shows the approved sample with invented data until sign-in and the database are wired.
export const metadata = { title: "Console · Jerome Badour", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string; new?: string }> }) {
  const { tab, new: dlg } = await searchParams;
  return <ConsolePage tab={(tab ?? "inbox") as Tab} dialog={dlg === "1"} />;
}
