import { page, w3aPart } from "./links";
import { STUDY_APPS } from "./apps";

// Pages a reply or an answer can point to, by address, with the title its chip shows.
export const pageTitles: Record<string, string> = {
  [page.w3arena]: "W3Arena", ...Object.fromEntries(STUDY_APPS.map((a) => [a.page, a.name])), [page.services]: "Services", [page.how]: "How I work", [page.about]: "About",
  [w3aPart.website]: "Website", [w3aPart.forum]: "Forum", [w3aPart.desktop]: "Windows app", [w3aPart.shop]: "Shop",
  [w3aPart.console]: "Admin console", [w3aPart.servers]: "Game servers", [w3aPart.ai]: "AI translation", [w3aPart.standby]: "Standby server",
};

/** The site's pages a text mentions (as jeromebadour.com/<path> or /<path>), in the order they appear, once each. */
export function pagesIn(text: string): { href: string; title: string }[] {
  const found: { at: number; href: string }[] = [];
  for (const href of Object.keys(pageTitles)) {
    const m = new RegExp(`(?:jeromebadour\\.com)?${href.replace(/[/.-]/g, "\\$&")}(?![\\w/-])`).exec(text);
    if (m) found.push({ at: m.index, href });
  }
  return found.sort((a, b) => a.at - b.at).map(({ href }) => ({ href, title: pageTitles[href] }));
}
