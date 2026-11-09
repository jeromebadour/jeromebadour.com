import type { MetadataRoute } from "next";

// Proposal pages, status links and the console are never indexed (plan §2, §11).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/for/", "/m/", "/admin", "/sign-in", "/api/"] },
    sitemap: "https://jeromebadour.com/sitemap.xml",
  };
}
