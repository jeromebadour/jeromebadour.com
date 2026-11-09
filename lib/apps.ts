import type { BrandName, GlyphName } from "@/components/Glyph";
import type { Shot } from "@/components/ScreenViewer";
import { B, G, type Tech } from "./tech";
import { out, page, w3aPart } from "./links";

// Every app shown on the site, in the order the site shows them. Each one appears in the same places: the Apps menu
// (header and phone), its tab on the home board (parts, picture, footer link), its own page under /work/, the proof
// list of proposal pages, the tool chips, Ask's pages and outside proofs, the sitemap, link previews, the "Also live"
// links between apps, and the Privacy Policy and Terms of Use. Adding an app means one entry here (its addresses go
// in links.ts), its pictures in public/, and its text checked by Freelance Strategy; the apps suite checks that it
// shows up everywhere. W3Arena is the one platform with an overview page and parts of its own (components/W3Page,
// components/W3Part); every other app is one case study at /work/<id>. Picked by hand, not per app: the four
// Highlights pictures and the "What I build" tiles on the home page (they show the best proof for each kind of work).

/** A page of its own for an app: the need, what was built, the result, screens, what it gives a client, its tools. */
export type CaseStudy = {
  title: string; g: GlyphName; tone: string; line: string;
  need: string; built: string; result: string;
  stats: { v: string; l: string; g: GlyphName; tone: string }[];
  screens: Shot[];
  gives: { g: GlyphName; t: string }[];
  tech: Tech[];
  proofs: { kind: "live" | "release" | "demo" | "code"; label: string }[];
};

export type AppId = "w3arena" | "distill";
type BoardPart = { g: GlyphName; tone: string; title: string; sub: string; href: string };
type Outside = { label: string; href: string; kind: "release" | "demo" | "code" | "live" };

export type App = {
  id: AppId;
  name: string;
  host: string;
  /** Its mark, and the size it's drawn at in the menu and on its home tab. */
  mark: string; markClass: string;
  tone: string;
  page: string;
  /** The home tab: its address (/?tab=), and the note beside the name (its address, or what kind of app it is). */
  tab: string; tabNote: { dom: string } | { kind: string };
  /** The Apps menu: its line, and whether the address shows beside the name. */
  menu: { sub: string; dom?: string };
  /** The home board when its tab is open: the window's picture, six parts, and the footer link. */
  board: { shot: string; parts: BoardPart[]; foot: { brand?: BrandName; g?: GlyphName; label: string; sub: string; href: string } };
  /** Proofs Ask may cite that live outside this site, by id. */
  outside: Record<string, Outside>;
  /** Its own privacy policy (the site's Privacy Policy points to it). */
  privacy: string;
  /** The buttons on its own page (W3Arena's overview has its own). */
  links: { g: GlyphName; label: string; href: string; primary?: boolean }[];
  /** Its page under /work/<id>; W3Arena has its overview and parts instead. */
  study?: CaseStudy;
};

const w3arena: App = {
  id: "w3arena", name: "W3Arena", host: "w3arena.pro", mark: "/w3a-round-48.png", markClass: "e-w3a", tone: "red",
  page: page.w3arena, tab: "w3a", tabNote: { dom: "w3arena.pro" },
  menu: { sub: "Gaming and community platform: website, forum, Windows app, shop, console", dom: "w3arena.pro" },
  board: {
    shot: "/p/1-website-home.jpg",
    parts: [
      { g: "web", tone: "sage", title: "Website", sub: "Public pages, live stats", href: w3aPart.website },
      { g: "forum", tone: "blue", title: "Forum", sub: "Community, reports, moderation", href: w3aPart.forum },
      { g: "desktop", tone: "red", title: "Windows app", sub: "Chat, voice, matchmaking", href: w3aPart.desktop },
      { g: "shop", tone: "amber", title: "Shop", sub: "Payments, wallet, receipts", href: w3aPart.shop },
      { g: "console", tone: "violet", title: "Admin console", sub: "Roles, permissions, audit log", href: w3aPart.console },
      { g: "server", tone: "green", title: "Servers", sub: "80+ servers in 6+ regions", href: w3aPart.servers },
    ],
    foot: { g: "release", label: "Release W3Arena 5.1.5", sub: "6 Nov 2026 · 6 changes", href: out.w3aChangelog },
  },
  outside: {
    changelog: { label: "Changelog", href: out.w3aChangelog, kind: "release" },
    "w3arena-live": { label: "w3arena.pro", href: out.w3arena, kind: "live" },
  },
  privacy: `${out.w3arena}/privacy`,
  links: [{ g: "live", label: "w3arena.pro", href: out.w3arena, primary: true }],
};

const distill: App = {
  id: "distill", name: "Distill", host: "distill.jeromebadour.com", mark: "/distill-mark.svg", markClass: "e-dm", tone: "blue",
  page: page.distill, tab: "distill", tabNote: { kind: "Web app" },
  menu: { sub: "AI summaries traced to their source" },
  board: {
    shot: "/p/2-checked-summaries.jpg",
    parts: [
      { g: "about", tone: "blue", title: "Accounts", sub: "Sign-in, saved library", href: page.distill },
      { g: "ai", tone: "violet", title: "AI summaries", sub: "Every point linked to its source", href: page.distill },
      { g: "how", tone: "sage", title: "Checked figures", sub: "Every number checked by code", href: page.distill },
      { g: "console", tone: "amber", title: "Owner console", sub: "Roles, spend caps, audit log", href: out.distillDemo },
      { g: "code", tone: "green", title: "Tests", sub: "Run on every push", href: out.distillTests },
      { g: "server", tone: "red", title: "Backups", sub: "Restored every week", href: page.distill },
    ],
    foot: { brand: "github", label: "Code on GitHub", sub: "tests run on every push", href: out.distillCode },
  },
  outside: {
    "distill-live": { label: "distill.jeromebadour.com", href: out.distill, kind: "live" },
    "distill-demo": { label: "Admin demo", href: out.distillDemo, kind: "demo" },
    "distill-code": { label: "Code", href: out.distillCode, kind: "code" },
    "distill-tests": { label: "Distill tests", href: out.distillTests, kind: "code" },
  },
  privacy: `${out.distill}/privacy`,
  links: [{ g: "live", label: "Open Distill", href: out.distill, primary: true }, { g: "demo", label: "Admin demo", href: out.distillDemo }, { g: "code", label: "Code", href: out.distillCode }],
  study: {
    title: "Distill", g: "ai", tone: "blue",
    line: "AI summaries you can check: every point links to the sentences it came from, and every number is checked by code.",
    need: "AI summaries read well even when a number is wrong, so the reader still has to check everything.",
    built: "A web app on Anthropic's Claude API where every point links to the sentences it came from and every number is checked by code. Accounts, a saved library, phone layouts, dark and light themes, plus an owner's console with roles, an audit log, spend caps and live server health.",
    result: "Live at distill.jeromebadour.com with a public admin demo, code on GitHub, tests on every push and backups restored every week.",
    stats: [
      { v: "Every point", l: "linked to the sentences it came from", g: "search", tone: "blue" },
      { v: "Every push", l: "runs the tests before it ships", g: "tested", tone: "green" },
      { v: "Weekly", l: "backups restored to prove they work", g: "shield", tone: "violet" },
    ],
    screens: [
      { src: "/p/distill/summary.jpg", thumb: "/p/distill/summary-t.jpg", cap: "Traced summary", g: "search", fit: "contain" },
      { src: "/p/distill/column.jpg", thumb: "/p/distill/column-t.jpg", cap: "Column view", g: "grid", fit: "contain" },
      { src: "/p/distill/library.jpg", thumb: "/p/distill/library-t.jpg", cap: "Saved library", g: "release", fit: "contain" },
      { src: "/p/distill/phone.jpg", thumb: "/p/distill/phone-t.jpg", cap: "On a phone", g: "app", fit: "contain" },
      { src: "/p/distill/admin.jpg", thumb: "/p/distill/admin-t.jpg", cap: "Admin overview", g: "console", fit: "contain" },
      { src: "/p/distill/server.jpg", thumb: "/p/distill/server-t.jpg", cap: "Server, backups", g: "server", fit: "contain" },
      { src: "/p/distill/activity.jpg", thumb: "/p/distill/activity-t.jpg", cap: "Activity", g: "pulse", fit: "contain" },
    ],
    gives: [
      { g: "search", t: "AI output a reader can check, every point linked to its source" },
      { g: "tested", t: "Numbers verified by code, not taken on trust from the model" },
      { g: "console", t: "An owner's console: roles, audit log, spend caps, server health" },
      { g: "shield", t: "Built to run: tests on every push, backups restored every week" },
    ],
    tech: [B("TypeScript", "ts"), B("React", "react"), B("Next.js", "next"), B("PostgreSQL", "postgres"), G("PL/pgSQL", "code"), G("Row-level security", "shield"), B("Python", "python"), B("Docker", "docker"), B("Claude API", "claude")],
    proofs: [{ kind: "live", label: "distill.jeromebadour.com" }, { kind: "demo", label: "Admin demo" }, { kind: "code", label: "GitHub" }],
  },
};

export const APPS: App[] = [w3arena, distill];

/** Apps with a page of their own at /work/<id> (every app but W3Arena). */
export const STUDY_APPS = APPS.filter((a): a is App & { study: CaseStudy } => !!a.study);

export function appById(id: string): App | undefined {
  return APPS.find((a) => a.id === id);
}

/** "W3Arena and Distill"; "W3Arena, Distill and X". */
export function appNames(): string {
  const n = APPS.map((a) => a.name);
  return n.length < 2 ? n.join("") : `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`;
}

/** Every app's outside proofs, in app order. */
export const OUTSIDE_PROOFS: Record<string, Outside> = Object.assign({}, ...APPS.map((a) => a.outside));
