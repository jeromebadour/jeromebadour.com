import type { MetadataRoute } from "next";
import { page, w3aPart } from "@/lib/links";
import { STUDY_APPS } from "@/lib/apps";

// The public pages, for search engines. Proposal pages and status links are left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [page.home, page.w3arena, ...Object.values(w3aPart), ...STUDY_APPS.map((a) => a.page), page.services, page.how, page.about, page.ask, page.message, page.privacy, page.terms];
  return paths.map((p) => ({ url: `https://jeromebadour.com${p === "/" ? "" : p}` }));
}
