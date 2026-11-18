import { BODY, TITLE } from "@/content/oracle-terminated-my-account";

// The writing section (/writing): each post's address, date and summary. The body lives in content/<slug>.ts, word
// for word from its approved draft. Dates are the day it was published (Istanbul).
export type Post = { slug: string; title: string; published: string; summary: string; body: string };

export const POSTS: Post[] = [
  {
    slug: "oracle-terminated-my-account", title: TITLE, published: "2026-11-18", body: BODY,
    summary: "Oracle Cloud terminated a paid account over a €16.32 card decline, with no warning and no way back. How a standby on another provider kept the platform up.",
  },
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug) ?? null;
export const postPath = (p: Post) => `/writing/${p.slug}`;
export const postDate = (p: Post) => new Date(`${p.published}T12:00:00Z`).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
