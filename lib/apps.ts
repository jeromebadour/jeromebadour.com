import type { BrandName, GlyphName } from "@/components/Glyph";
import type { Shot } from "@/components/ScreenViewer";
import { B, G, type Tech } from "./tech";
import { fwPart, out, page, w3aPart } from "./links";

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
  /** One line in the site's voice under the intro, on the case-study page only: never in link previews or proposal
   *  cards, which keep the plain line (claude/VOICE-jeromebadour.md). */
  aside: string;
  need: string; built: string; result: string;
  stats: { v: string; l: string; g: GlyphName; tone: string }[];
  screens: Shot[];
  gives: { g: GlyphName; t: string }[];
  tech: Tech[];
  proofs: { kind: "live" | "release" | "demo" | "code"; label: string }[];
};

export type AppId = "w3arena" | "fernway" | "alderpike" | "distill";
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

// Fernway is the second platform with an overview and parts of its own (components/FwPage, /work/fernway/<part>).
const fernway: App = {
  id: "fernway", name: "Fernway", host: "fernway.jeromebadour.com", mark: "/fernway-mark.svg", markClass: "e-fw", tone: "green",
  page: page.fernway, tab: "fernway", tabNote: { kind: "SaaS for GoHighLevel" },
  menu: { sub: "Every lead from a website into GoHighLevel, retried, never doubled, with a receipt" },
  board: {
    shot: "/p/fernway/board.jpg",
    parts: [
      { g: "route", tone: "green", title: "Delivery engine", sub: "8 tries over 24 h, 0 duplicates", href: fwPart.engine },
      { g: "retry", tone: "amber", title: "Break it", sub: "Make GHL fail, watch the lead arrive", href: out.fernwayBreak },
      { g: "console", tone: "violet", title: "Two consoles", sub: "Customer and operator, public demos", href: fwPart.consoles },
      { g: "app", tone: "blue", title: "Inside GoHighLevel", sub: "Workflow step, trigger, its own page", href: fwPart.ghl },
      { g: "code", tone: "sage", title: "WordPress and Laravel", sub: "A plugin, a package on Packagist", href: fwPart.wordpress },
      { g: "hook", tone: "red", title: "Automations", sub: "Signed webhooks, n8n, Make, Sheets", href: fwPart.automations },
    ],
    foot: { brand: "github", label: "Code on GitHub", sub: "260+ tests, every change through CI", href: out.fernwayCode },
  },
  outside: {
    "fernway-live": { label: "fernway.jeromebadour.com", href: out.fernway, kind: "live" },
    "fernway-break": { label: "Break it", href: out.fernwayBreak, kind: "demo" },
    "fernway-demo": { label: "Console demo", href: out.fernwayDemo, kind: "demo" },
    "fernway-code": { label: "Fernway code", href: out.fernwayCode, kind: "code" },
  },
  privacy: `${out.fernway}/privacy`,
  links: [{ g: "live", label: "Open Fernway", href: out.fernway, primary: true }, { g: "retry", label: "Break it", href: out.fernwayBreak }, { g: "demo", label: "Console demo", href: out.fernwayDemo }, { g: "code", label: "Code", href: out.fernwayCode }],
};

const alderpike: App = {
  id: "alderpike", name: "Alder & Pike", host: "alderpike.jeromebadour.com", mark: "/alderpike-mark.svg", markClass: "e-ap", tone: "amber",
  page: page.alderpike, tab: "alderpike", tabNote: { kind: "WordPress site" },
  menu: { sub: "A roofer's website on WordPress, built from scratch: every roof gets a report card" },
  board: {
    shot: "/p/alderpike/board.jpg",
    parts: [
      { g: "web", tone: "amber", title: "Its own idea", sub: "Every roof gets a report card", href: page.alderpike },
      { g: "code", tone: "blue", title: "Block theme", sub: "From scratch, edited in the Site Editor", href: page.alderpike },
      { g: "route", tone: "green", title: "Booking form", sub: "Real free times, into GoHighLevel", href: page.alderpike },
      { g: "live", tone: "sage", title: "Storm countdown", sub: "Live, so it never goes stale", href: page.alderpike },
      { g: "tested", tone: "violet", title: "Lighthouse", sub: "91+ speed, 100 accessibility, mobile", href: page.alderpike },
      { g: "server", tone: "red", title: "Backups", sub: "Nightly, off the box, restore tested", href: page.alderpike },
    ],
    foot: { g: "live", label: "alderpike.jeromebadour.com", sub: "an invented business, a real site", href: out.alderpike },
  },
  outside: {
    "alderpike-live": { label: "alderpike.jeromebadour.com", href: out.alderpike, kind: "live" },
  },
  privacy: `${out.alderpike}/privacy`,
  links: [{ g: "live", label: "Open the site", href: out.alderpike, primary: true }, { g: "code", label: "Code", href: out.fernwayCode }],
  study: {
    title: "Alder & Pike", g: "web", tone: "amber",
    line: "A complete WordPress site for an invented Tacoma roofer, built from scratch, that books roof checks straight into GoHighLevel.",
    aside: "This page has a leak. Only the 404, though.",
    need: "WordPress jobs ask for a finished site to look at, not a theme demo: a real-looking business, its own look, a form that actually goes somewhere.",
    built: "A block theme made from scratch (theme.json, templates, patterns of core blocks), so the owner edits words and pictures in the Site Editor without breaking the design. Its idea: every roof gets a report card, each part graded A to F with a photo. A live storm-season countdown, Tacoma's rain by month, and a booking form that picks a real free time and sends the lead into GoHighLevel through Fernway's plugin.",
    result: "Live at alderpike.jeromebadour.com. A real booking from the live site was signed for in GoHighLevel in 2.1 s on the first try. Kept out of search on purpose: the roofer is invented.",
    stats: [
      { v: "91+", l: "Lighthouse mobile speed on every page", g: "tested", tone: "green" },
      { v: "100", l: "accessibility and best practices", g: "shield", tone: "violet" },
      { v: "2.1 s", l: "a live booking signed for in GoHighLevel", g: "route", tone: "amber" },
    ],
    screens: [
      { src: "/p/alderpike/home.jpg", thumb: "/p/alderpike/home-t.jpg", cap: "Home", g: "web", fit: "contain" },
      { src: "/p/alderpike/ladder.jpg", thumb: "/p/alderpike/ladder-t.jpg", cap: "How a check works", g: "how", fit: "contain" },
      { src: "/p/alderpike/card.jpg", thumb: "/p/alderpike/card-t.jpg", cap: "A whole report card", g: "tested", fit: "contain" },
      { src: "/p/alderpike/rain.jpg", thumb: "/p/alderpike/rain-t.jpg", cap: "Rain and the countdown", g: "live", fit: "contain" },
      { src: "/p/alderpike/services.jpg", thumb: "/p/alderpike/services-t.jpg", cap: "Services", g: "services", fit: "contain" },
      { src: "/p/alderpike/check.jpg", thumb: "/p/alderpike/check-t.jpg", cap: "Book a roof check", g: "route", fit: "contain" },
      { src: "/p/alderpike/about.jpg", thumb: "/p/alderpike/about-t.jpg", cap: "About", g: "about", fit: "contain" },
      { src: "/p/alderpike/404.jpg", thumb: "/p/alderpike/404-t.jpg", cap: "404", g: "web", fit: "contain" },
      { src: "/p/alderpike/phone.jpg", thumb: "/p/alderpike/phone-t.jpg", cap: "On a phone", g: "app", fit: "contain" },
    ],
    gives: [
      { g: "web", t: "A site with its own idea and look, never stock theme pages" },
      { g: "code", t: "A block theme you edit in WordPress itself, without breaking the design" },
      { g: "route", t: "Forms that reach your CRM, with real free times and a receipt" },
      { g: "tested", t: "Fast on phones, measured, and backed up every night" },
    ],
    tech: [B("WordPress", "wordpress"), B("PHP", "php"), G("Block theme", "code"), B("Elementor widget", "elementor"), B("MariaDB", "mariadb"), B("Docker", "docker"), B("Nginx", "nginx")],
    proofs: [{ kind: "live", label: "alderpike.jeromebadour.com" }],
  },
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
    aside: "Because \"trust me\" isn't a source.",
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

export const APPS: App[] = [w3arena, fernway, alderpike, distill];

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
