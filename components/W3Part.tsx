import { EFooter, EHeader, ETabbar } from "./Shell";
import { Brand, brandColour, Glyph, type GlyphName } from "./Glyph";
import { B, G, stack, type Tech } from "./W3Page";
import { ScreenViewer, type Shot } from "./ScreenViewer";
import { out, page, proofHref, w3aPart } from "@/lib/links";

type Part = {
  title: string; g: GlyphName; tone: string; line: string;
  need: string; built: string; result: string;
  stats: { v: string; l: string; g: GlyphName; tone: string }[];
  screens: Shot[];
  gives: { g: GlyphName; t: string }[];
  tech: Tech[];
  proofs: { kind: "live" | "release" | "demo" | "code"; label: string }[];
  prev: string; next: string;
  // An app of its own (Distill), not a W3Arena part: its own crumb, mark, address and links.
  app?: { host: string; mark: string; links: { g: GlyphName; label: string; href: string; primary?: boolean }[] };
};

const website: Part = {
  title: "Website", g: "web", tone: "sage",
  line: "The landing page and the live stats pages of w3arena.pro.",
  need: "A gaming platform needed a website that brings in new players and shows real results from its game servers.",
  built: "A landing page in 6+ languages, plus live stats pages: a history of every game with its full scoreboard and replay, season ladders, player profiles and head-to-head comparisons. One design system across every page, built to work on phones too.",
  result: "Live at w3arena.pro, with 9,400+ registered accounts and 4,300+ players who have played.",
  stats: [
    { v: "17,000+", l: "games, each with its scoreboard and replay", g: "pulse", tone: "amber" },
    { v: "6+", l: "languages on the landing page", g: "translate", tone: "blue" },
    { v: "9,400+", l: "registered accounts", g: "about", tone: "sage" },
  ],
  screens: [
    { src: "/p/web/home.jpg", thumb: "/p/web/home-t.jpg", cap: "Home", g: "web", path: "/" },
    { src: "/p/web/find.jpg", thumb: "/p/web/find-t.jpg", cap: "Find match", g: "live", path: "/#find" },
    { src: "/p/web/games.jpg", thumb: "/p/web/games-t.jpg", cap: "Games", g: "pulse", path: "/games" },
    { src: "/p/web/game.jpg", thumb: "/p/web/game-t.jpg", cap: "Game page", g: "screen", path: "/games" },
    { src: "/p/web/ladder.jpg", thumb: "/p/web/ladder-t.jpg", cap: "Ladder", g: "grid", path: "/ladder" },
    { src: "/p/web/profile.jpg", thumb: "/p/web/profile-t.jpg", cap: "Player profile", g: "about", path: "/player" },
    { src: "/p/web/discover.jpg", thumb: "/p/web/discover-t.jpg", cap: "Discover", g: "search", path: "/discover" },
    { src: "/p/web/heroes.jpg", thumb: "/p/web/heroes-t.jpg", cap: "Meta heroes", g: "grid", path: "/heroes" },
    { src: "/p/web/hero.jpg", thumb: "/p/web/hero-t.jpg", cap: "Hero page", g: "about", path: "/heroes" },
    { src: "/p/web/compare.jpg", thumb: "/p/web/compare-t.jpg", cap: "Compare", g: "about", path: "/compare" },
    { src: "/p/web/changelog.jpg", thumb: "/p/web/changelog-t.jpg", cap: "Changelog", g: "release", path: "/changelog" },
    { src: "/p/web/shop.jpg", thumb: "/p/web/shop-t.jpg", cap: "Shop", g: "shop", path: "/shop" },
    { src: "/p/web/about.jpg", thumb: "/p/web/about-t.jpg", cap: "About", g: "about", path: "/about" },
    { src: "/p/web/privacy.jpg", thumb: "/p/web/privacy-t.jpg", cap: "Privacy and terms", g: "shield", path: "/privacy" },
  ],
  gives: [
    { g: "web", t: "A landing page that explains the product in one screen" },
    { g: "live", t: "Pages fed by live data from your own servers, never typed by hand" },
    { g: "grid", t: "Dense data made readable: ladders, profiles, side-by-side comparisons" },
    { g: "desktop", t: "One design system that holds from phone to desktop" },
  ],
  tech: stack[0].tech,
  proofs: [{ kind: "live", label: "w3arena.pro" }, { kind: "release", label: "Changelog" }],
  prev: "W3Arena", next: "Forum",
};

const forum: Part = {
  title: "Forum", g: "forum", tone: "blue",
  line: "A forum for 5+ regions, where a report sent from the game becomes a case staff close on record.",
  need: "A growing player base needed one place for news, help and reports, in each region's own language, with every report handled fairly and on record.",
  built: "A forum for 5+ regions with a rich editor: images, video, polls, live game and player embeds. Reports sent from inside the game arrive as ready cases with the match and replay attached, and staff close them with a decision block linked to the ban.",
  result: "1,100+ topics and 2,800+ posts, including 770+ player reports handled in South America alone.",
  stats: [
    { v: "5+", l: "regions, each in its own language", g: "region", tone: "blue" },
    { v: "2,800+", l: "posts in 1,100+ topics", g: "forum", tone: "sage" },
    { v: "441+", l: "attack inputs the editor's sanitizer is tested on", g: "shield", tone: "green" },
  ],
  screens: [
    { src: "/p/forum/home.jpg", thumb: "/p/forum/home-t.jpg", cap: "Forum", g: "forum", path: "/forum" },
    { src: "/p/forum/region.jpg", thumb: "/p/forum/region-t.jpg", cap: "Region board", g: "region", path: "/forum" },
    { src: "/p/forum/event.jpg", thumb: "/p/forum/event-t.jpg", cap: "Event post", g: "release", path: "/forum/topic" },
    { src: "/p/forum/winners.jpg", thumb: "/p/forum/winners-t.jpg", cap: "Ladder embed", g: "grid", path: "/forum/topic" },
    { src: "/p/forum/editor.jpg", thumb: "/p/forum/editor-t.jpg", cap: "Editor", g: "code", path: "/forum" },
    { src: "/p/forum/form.jpg", thumb: "/p/forum/form-t.jpg", cap: "Report form", g: "search", path: "/forum/topic" },
    { src: "/p/forum/decision.jpg", thumb: "/p/forum/decision-t.jpg", cap: "Decision and ban", g: "shield", path: "/forum/topic" },
    { src: "/p/forum/team.jpg", thumb: "/p/forum/team-t.jpg", cap: "Team", g: "about", path: "/forum" },
  ],
  gives: [
    { g: "region", t: "A community space in each region's own language" },
    { g: "search", t: "Reports that arrive as ready cases, with the match and replay attached" },
    { g: "shield", t: "Moderation on record: every decision linked to the ban it gave" },
    { g: "code", t: "A rich editor that stays safe, its sanitizer tested on 441+ attack inputs" },
  ],
  tech: stack.find((r) => r.part === "Forum")!.tech,
  proofs: [{ kind: "live", label: "w3arena.pro/forum" }, { kind: "release", label: "Changelog" }],
  prev: "Website", next: "Windows app",
};

const desktop: Part = {
  title: "Windows app", g: "desktop", tone: "red",
  line: "One Windows app to find games, talk, buy and get back into a game after a crash.",
  need: "Players needed one Windows app to find games, talk, buy items and get back into a game after a crash, on PCs from Windows 7 to 11.",
  built: "A desktop app (Electron) with chat channels, matchmaking, team voice chat with an in-game overlay, a built-in shop, crash recovery, signed auto-update and 6+ languages. A small Go starter installs each new version and falls back to the working one.",
  result: "Used daily by the platform's players, with 14+ public releases of the app, and one update cut its network traffic by about 97%.",
  stats: [
    { v: "97%", l: "less network traffic after one update", g: "pulse", tone: "green" },
    { v: "6+", l: "languages, chosen per player", g: "translate", tone: "blue" },
    { v: "7 to 11", l: "every Windows version it runs on", g: "desktop", tone: "red" },
  ],
  screens: [
    { src: "/p/app/lobby.jpg", thumb: "/p/app/lobby-t.jpg", cap: "Lobby and chat", g: "message" },
    { src: "/p/app/find.jpg", thumb: "/p/app/find-t.jpg", cap: "Find match", g: "live" },
    { src: "/p/app/ready.jpg", thumb: "/p/app/ready-t.jpg", cap: "Fair teams", g: "grid" },
    { src: "/p/app/voice.jpg", thumb: "/p/app/voice-t.jpg", cap: "Team voice", g: "message" },
    { src: "/p/app/maps.jpg", thumb: "/p/app/maps-t.jpg", cap: "Map downloader", g: "release" },
    { src: "/p/app/friends.jpg", thumb: "/p/app/friends-t.jpg", cap: "Friends", g: "about" },
    { src: "/p/app/profile.jpg", thumb: "/p/app/profile-t.jpg", cap: "Player card", g: "about" },
    { src: "/p/app/translate.jpg", thumb: "/p/app/translate-t.jpg", cap: "Chat translation", g: "translate" },
    { src: "/p/app/overlay.jpg", thumb: "/p/app/overlay-t.jpg", cap: "Stream overlay", g: "screen" },
    { src: "/p/app/game.jpg", thumb: "/p/app/game-t.jpg", cap: "Settings", g: "console" },
  ],
  gives: [
    { g: "desktop", t: "One app for the whole experience: chat, matches, voice and the shop" },
    { g: "shield", t: "Updates that install themselves, signed and checked before they run" },
    { g: "live", t: "Crash recovery: back into the same match instead of a lost game" },
    { g: "pulse", t: "Light on the network: one update cut its traffic by about 97%" },
  ],
  tech: [...new Map(["Windows app", "Updater", "Native Windows code"].flatMap((n) => stack.find((r) => r.part === n)!.tech).map((t) => [t.name, t])).values()],
  proofs: [{ kind: "release", label: "Changelog" }, { kind: "live", label: "w3arena.pro" }],
  prev: "Forum", next: "Shop",
};

const shop: Part = {
  title: "Shop", g: "shop", tone: "amber",
  line: "A complete shop inside the Windows app: memberships, previews, a wallet, receipts and refunds.",
  need: "Players in many countries needed a safe way to buy memberships and perks, including where cards and PayPal are not the usual way to pay.",
  built: "A shop built into the Windows app: memberships with try-before-you-buy previews, perks, a wallet that records every shard in and out, receipts and refunds. Players pay by crypto, PayPal or a local seller in 6+ countries; earlier, payments ran through Tebex.",
  result: "Live in the app: every purchase has its receipt, waits in the inventory until the player activates it, and can be refunded within 14 days until then.",
  stats: [
    { v: "3+", l: "ways to pay: crypto, PayPal, local sellers", g: "shop", tone: "amber" },
    { v: "6+", l: "countries with a local seller", g: "region", tone: "blue" },
    { v: "14 days", l: "to refund anything not yet activated", g: "shield", tone: "green" },
  ],
  screens: [
    { src: "/p/shop/store.jpg", thumb: "/p/shop/store-t.jpg", cap: "Store", g: "shop" },
    { src: "/p/shop/members.jpg", thumb: "/p/shop/members-t.jpg", cap: "Memberships", g: "about" },
    { src: "/p/shop/items.jpg", thumb: "/p/shop/items-t.jpg", cap: "Perks", g: "grid" },
    { src: "/p/shop/preview.jpg", thumb: "/p/shop/preview-t.jpg", cap: "Try it first", g: "screen" },
    { src: "/p/shop/plan.jpg", thumb: "/p/shop/plan-t.jpg", cap: "Plan details", g: "release" },
    { src: "/p/shop/topup.jpg", thumb: "/p/shop/topup-t.jpg", cap: "Top up", g: "pulse" },
    { src: "/p/shop/wallet.jpg", thumb: "/p/shop/wallet-t.jpg", cap: "Wallet", g: "console" },
    { src: "/p/shop/receipt.jpg", thumb: "/p/shop/receipt-t.jpg", cap: "Receipt", g: "release" },
    { src: "/p/shop/activate.jpg", thumb: "/p/shop/activate-t.jpg", cap: "Activate", g: "live" },
  ],
  gives: [
    { g: "screen", t: "Try before you buy: a player sees a perk on their own profile first" },
    { g: "region", t: "Payments that fit each market: crypto, PayPal and local sellers" },
    { g: "release", t: "A wallet and a receipt for every purchase, with refunds built in" },
    { g: "live", t: "Purchases wait in the inventory until the player starts them" },
  ],
  tech: [...stack.find((r) => r.part === "Payments")!.tech, ...stack.find((r) => r.part === "Windows app")!.tech.slice(0, 1), stack[0].tech[0]],
  proofs: [{ kind: "live", label: "w3arena.pro/shop" }, { kind: "release", label: "Changelog" }],
  prev: "Windows app", next: "Admin console",
};

const console_: Part = {
  title: "Admin console", g: "console", tone: "violet",
  line: "The back office that runs the platform: roles, rules, payments, and every action confirmed with 2FA.",
  need: "Staff needed one place to run a live platform (players, bans, payments, channels, security), with each admin seeing only what their role allows.",
  built: "An admin console with 28+ sections and 137+ permissions in 13+ role tiers: automatic leaver bans with an editable ban ladder, risk scoring for new signups, multi-account detection, matchmaking and channel settings, a shop back office with its catalogue, ledger and payment providers, and a full audit log. Every staff action is confirmed with an authenticator code (2FA) before it runs.",
  result: "Used by 30+ staff, with 1,900+ games judged automatically and 6,800+ staff actions logged.",
  stats: [
    { v: "137+", l: "permissions in 13+ role tiers", g: "shield", tone: "violet" },
    { v: "28+", l: "sections, each behind its own permission", g: "grid", tone: "blue" },
    { v: "6,800+", l: "staff actions in the audit log", g: "release", tone: "green" },
  ],
  screens: [
    { src: "/p/console/access.jpg", thumb: "/p/console/access-t.jpg", cap: "Access control", g: "shield" },
    { src: "/p/console/twofa.jpg", thumb: "/p/console/twofa-t.jpg", cap: "2FA per action", g: "shield" },
    { src: "/p/console/tier.jpg", thumb: "/p/console/tier-t.jpg", cap: "Edit a role tier", g: "shield" },
    { src: "/p/console/ranks.jpg", thumb: "/p/console/ranks-t.jpg", cap: "Ranks", g: "about" },
    { src: "/p/console/rank.jpg", thumb: "/p/console/rank-t.jpg", cap: "Edit a rank", g: "about" },
    { src: "/p/console/autoban.jpg", thumb: "/p/console/autoban-t.jpg", cap: "Ban ladder", g: "release" },
    { src: "/p/console/trust.jpg", thumb: "/p/console/trust-t.jpg", cap: "Trust rules", g: "search" },
    { src: "/p/console/match.jpg", thumb: "/p/console/match-t.jpg", cap: "Matchmaking", g: "live" },
    { src: "/p/console/channel.jpg", thumb: "/p/console/channel-t.jpg", cap: "Channels", g: "message" },
    { src: "/p/console/catalogue.jpg", thumb: "/p/console/catalogue-t.jpg", cap: "Shop catalogue", g: "shop" },
    { src: "/p/console/perks.jpg", thumb: "/p/console/perks-t.jpg", cap: "Perks by tier", g: "grid" },
    { src: "/p/console/providers.jpg", thumb: "/p/console/providers-t.jpg", cap: "Payments", g: "shop" },
    { src: "/p/console/translation.jpg", thumb: "/p/console/translation-t.jpg", cap: "AI spend", g: "translate" },
    { src: "/p/console/seasons.jpg", thumb: "/p/console/seasons-t.jpg", cap: "Seasons", g: "pulse" },
    { src: "/p/console/forum.jpg", thumb: "/p/console/forum-t.jpg", cap: "Forum access", g: "forum" },
    { src: "/p/console/maps.jpg", thumb: "/p/console/maps-t.jpg", cap: "Maps", g: "release" },
  ],
  gives: [
    { g: "shield", t: "Roles down to each section: staff see only what their role allows" },
    { g: "shop", t: "A back office for money: catalogue, ledger, providers switched on and off" },
    { g: "search", t: "Rules that act on their own: ban ladders, signup risk scoring" },
    { g: "shield", t: "Every action confirmed with 2FA and kept on record, so nothing happens off the books" },
  ],
  tech: [...stack[0].tech, ...stack.find((r) => r.part === "Data")!.tech],
  proofs: [{ kind: "demo", label: "Distill admin demo" }, { kind: "release", label: "Changelog" }],
  prev: "Shop", next: "Game servers",
};

const servers: Part = {
  title: "Game servers", g: "server", tone: "green",
  line: "80+ game servers in 6+ regions, built from one source and updated without ending a single game.",
  need: "An online game platform needed servers in 6+ regions, close to its players, updated often without ending games in progress.",
  built: "80+ game servers in C++ on 3+ providers and 2 types of hardware (x86 and ARM), from one source. Every update is tested, proven inside each server and rolled out as each game ends. Plus rejoin after a crash, fair team balancing, and leaver, AFK and desync detection.",
  result: "17,000+ games hosted. Updates reach every server with 0 games cut, and new games start more than twice as fast.",
  stats: [
    { v: "80+", l: "servers in 6+ regions, from one source", g: "server", tone: "green" },
    { v: "0", l: "games cut by an update", g: "shield", tone: "blue" },
    { v: "2×", l: "faster to start a new game", g: "pulse", tone: "amber" },
  ],
  screens: [
    { src: "/p/5-game-server-fleet.jpg", thumb: "/p/5-game-server-fleet-t.jpg", cap: "The fleet", g: "region", fit: "contain" },
    { src: "/p/app/find.jpg", thumb: "/p/app/find-t.jpg", cap: "Find match", g: "live" },
    { src: "/p/app/ready.jpg", thumb: "/p/app/ready-t.jpg", cap: "Fair teams", g: "grid" },
    { src: "/p/web/game.jpg", thumb: "/p/web/game-t.jpg", cap: "Game result", g: "screen" },
    { src: "/p/web/games.jpg", thumb: "/p/web/games-t.jpg", cap: "Every game", g: "pulse" },
    { src: "/p/console/match.jpg", thumb: "/p/console/match-t.jpg", cap: "Match rules", g: "console" },
    { src: "/p/console/autoban.jpg", thumb: "/p/console/autoban-t.jpg", cap: "Leaver ladder", g: "shield" },
  ],
  gives: [
    { g: "region", t: "Servers close to every player, all built from one source" },
    { g: "shield", t: "Updates that wait for each game to end, so nobody is cut off" },
    { g: "live", t: "A dropped player rejoins the same running game" },
    { g: "grid", t: "Fair games: teams balanced, leavers and AFKs caught" },
  ],
  tech: [...new Map(["Game servers", "Reconnect gateway"].flatMap((n) => stack.find((r) => r.part === n)!.tech).map((t) => [t.name, t])).values()],
  proofs: [{ kind: "live", label: "w3arena.pro/games" }, { kind: "release", label: "Changelog" }],
  prev: "Admin console", next: "AI translation",
};

const ai: Part = {
  title: "AI translation", g: "translate", tone: "blue",
  line: "One-click chat translation on the Claude API, live in production, with a hard spend cap.",
  need: "An international gaming community with players writing in Spanish, Thai, Filipino, Russian, Arabic and English needed to understand each other in chat.",
  built: "One-click chat translation on Anthropic's Claude API, in channels and private messages, into the reader's own language. A hard monthly spend cap, hourly limits per user, an admin page to watch spend and pause it, and a privacy policy update covering what is sent.",
  result: "Live in production and used every day, at about $1 of API cost since launch.",
  stats: [
    { v: "6+", l: "languages, into the reader's own", g: "translate", tone: "blue" },
    { v: "1 click", l: "to read a message in your language", g: "message", tone: "sage" },
    { v: "~$1", l: "API cost since launch, under a hard cap", g: "shield", tone: "green" },
  ],
  screens: [
    { src: "/p/4-chat-translation.jpg", thumb: "/p/4-chat-translation-t.jpg", cap: "Live chat", g: "message", fit: "contain" },
    { src: "/p/app/translate.jpg", thumb: "/p/app/translate-t.jpg", cap: "Your language", g: "translate" },
    { src: "/p/console/translation.jpg", thumb: "/p/console/translation-t.jpg", cap: "Spend and cap", g: "console" },
  ],
  gives: [
    { g: "shield", t: "AI with a ceiling: a hard monthly cap and per-user limits" },
    { g: "console", t: "An admin page to watch the spend and pause the AI at any time" },
    { g: "message", t: "Translation where people already talk: channels and private messages" },
    { g: "release", t: "Privacy handled: the policy says exactly what is sent" },
  ],
  tech: [...stack.find((r) => r.part === "AI")!.tech, ...stack[0].tech.slice(0, 2)],
  proofs: [{ kind: "live", label: "w3arena.pro/privacy" }, { kind: "release", label: "Changelog" }],
  prev: "Game servers", next: "Standby server",
};

const standby: Part = {
  title: "Standby server", g: "shield", tone: "violet",
  line: "A standby kept in sync that took over the whole platform on the first try, with zero data lost.",
  need: "A live platform with players online at every hour needed to survive outages, updates and growth without losing data or dropping anyone.",
  built: "A standby server kept in sync with production, with a tested switchover and switchback, rehearsed with players online: running games keep going and no data is lost. Automatic restore tests of the backups, releases that move players over with nobody disconnected, and measurements that find slowdowns before players do.",
  result: "When the hosting provider shut down the whole account without warning, the standby took over on the first try with zero data lost. It runs the platform today.",
  stats: [
    { v: "0", l: "data lost when the provider shut the account", g: "shield", tone: "green" },
    { v: "1st try", l: "standby promoted, rehearsed before", g: "live", tone: "violet" },
    { v: "0", l: "players disconnected by a release", g: "release", tone: "blue" },
  ],
  screens: [
    { src: "/p/6-reliability.jpg", thumb: "/p/6-reliability-t.jpg", cap: "The takeover", g: "shield", fit: "contain" },
  ],
  gives: [
    { g: "shield", t: "A standby that can take over at any time, rehearsed with players online" },
    { g: "release", t: "Backups proven by restoring them, not assumed to work" },
    { g: "live", t: "Releases that move users over without disconnecting anyone" },
    { g: "pulse", t: "Slowdowns found by measuring, before users notice them" },
  ],
  tech: [...new Map(["Data", "Network and delivery", "Ops", "Clouds"].flatMap((n) => stack.find((r) => r.part === n)!.tech).map((t) => [t.name, t])).values()],
  proofs: [{ kind: "release", label: "Changelog" }],
  prev: "AI translation", next: "W3Arena",
};

const distill: Part = {
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
  prev: "W3Arena", next: "",
  app: { host: "distill.jeromebadour.com", mark: "/distill-mark.svg", links: [{ g: "live", label: "Open Distill", href: out.distill, primary: true }, { g: "demo", label: "Admin demo", href: out.distillDemo }, { g: "code", label: "Code", href: out.distillCode }] },
};

const parts = { website, forum, desktop, shop, console: console_, servers, ai, standby, distill };
export type PartId = keyof typeof parts;

// Where a tool is used: read from each page's own Built with row, so the home toolbox never drifts from the pages.
const partHref: Record<PartId, string> = { ...w3aPart, distill: page.distill };
// Prev and next name a part by its title, or W3Arena for the overview.
function partHrefByTitle(title: string): string {
  if (title === "W3Arena") return page.w3arena;
  const id = (Object.keys(parts) as PartId[]).find((k) => parts[k].title === title);
  if (!id) throw new Error(`No part titled "${title}"`);
  return partHref[id];
}
const sameTool: Record<string, string[]> = { "Ed25519 signing": ["Ed25519"], Tebex: ["Tebex (before)"], Bash: ["Shell"] };
// Tools a page describes in its text but does not list in its Built with row.
const toolOnPage: Record<string, PartId[]> = { "2FA": ["console"], "Ed25519 signing": ["desktop"], WebRTC: ["desktop"], coturn: ["desktop"], "Server-Sent Events": ["desktop"] };
export type ToolPlace = { title: string; g: GlyphName; tone: string; href: string; app: string };
export function usedIn(name: string): ToolPlace[] {
  const names = [name, ...(sameTool[name] ?? [])];
  return (Object.keys(parts) as PartId[])
    .filter((id) => parts[id].tech.some((t) => names.includes(t.name)) || toolOnPage[name]?.includes(id))
    .map((id) => ({ title: parts[id].title, g: parts[id].g, tone: parts[id].tone, href: partHref[id], app: parts[id].app ? parts[id].app!.host : "W3Arena" }));
}

export function W3Part({ id = "website" }: { id?: PartId }) {
  const p = parts[id];
  return (
    <div className="page" data-v="e">
      <EHeader />

      <section className="w-top">
        <div className="w-crumb"><a href={page.home}><Glyph name="grid" size={13} />Apps</a><span>/</span>{!p.app && <><a href={page.w3arena}>W3Arena</a><span>/</span></>}<span>{p.title}</span></div>
        <div className="w-title">
          {p.app ? <img src={p.app.mark} alt="" className="w-logo" /> : <span className={`e-tile p-big t-${p.tone}`}><Glyph name={p.g} size={26} /></span>}
          <div>
            <h1>{p.title} <span className="e-dom">{p.app ? p.app.host : "w3arena.pro"}</span></h1>
            <p className="e-line">{p.line}</p>
          </div>
          <div className="w-links">
            {p.app ? p.app.links.map((l) => <a key={l.label} className={`e-btn ${l.primary ? "e-hire" : "e-ghost"}`} href={l.href}><Glyph name={l.g} size={15} />{l.label}</a>)
              : <a className="e-btn e-hire" href={out.w3arena}><Glyph name="live" size={15} />w3arena.pro</a>}
          </div>
        </div>
        <div className="w-stats">
          {p.stats.map((s) => (
            <div key={s.l} className={`e-stat t-${s.tone}`}>
              <span className="e-tile"><Glyph name={s.g} size={17} /></span>
              <span><b>{s.v}</b><small>{s.l}</small></span>
            </div>
          ))}
        </div>
      </section>

      <section className="p-main">
        <ol className="p-nbr">
          <li className="t-amber"><span className="p-k"><Glyph name="search" size={14} />Need</span><p>{p.need}</p></li>
          <li className="t-blue"><span className="p-k"><Glyph name="code" size={14} />Built</span><p>{p.built}</p></li>
          <li className="t-green"><span className="p-k"><Glyph name="live" size={14} />Result</span><p>{p.result}</p>
            <div className="e-pc">
              {p.proofs.map((x) => (
                <a key={x.label} href={proofHref(x.label)} className={`pc-${x.kind}`}><Glyph name={x.kind} size={12} />{x.label}</a>
              ))}
            </div>
          </li>
        </ol>
        <ScreenViewer key={id} shots={p.screens} label={`${p.title} screens`} host={p.app ? p.app.host : id === "desktop" || id === "servers" || id === "ai" || id === "standby" ? "W3Arena" : id === "shop" ? "W3Arena Shop" : id === "console" ? "W3Arena Console" : "w3arena.pro"} frame={id === "website" || id === "forum" || p.app ? "browser" : "app"} icon={id === "console" ? "console" : id === "servers" ? "server" : id === "ai" ? "translate" : id === "standby" ? "shield" : "desktop"} />
      </section>

      <section className="p-gives">
        <div className="e-how-head"><span className="e-k"><Glyph name="work" size={13} />What this gives a client</span></div>
        <ul>
          {p.gives.map((x) => (
            <li key={x.t}><span className="e-tile t-sage"><Glyph name={x.g} size={15} /></span>{x.t}</li>
          ))}
        </ul>
      </section>

      <section className="w-stack">
        <div className="e-how-head"><span className="e-k"><Glyph name="code" size={13} />Built with</span></div>
        <div className="w-techs p-techs">
          {p.tech.map((t) => (
            <span key={t.name} className="w-tech">
              {t.brand ? <span style={{ color: brandColour(t.brand) }}><Brand name={t.brand} size={16} /></span> : <Glyph name={t.g!} size={14} />}
              {t.name}
            </span>
          ))}
        </div>
      </section>

      <nav className="p-next">
        <a href={partHrefByTitle(p.prev)}><Glyph name="arrow" size={14} /><span><small>{p.app ? "Also live" : p.prev === "W3Arena" ? "Back to" : "Previous part"}</small><b>{p.prev}</b></span></a>
        {p.next && <a href={partHrefByTitle(p.next)} className="r"><span><small>{p.next === "W3Arena" ? "Back to" : "Next part"}</small><b>{p.next}</b></span><Glyph name="arrow" size={14} /></a>}
      </nav>

      <EFooter />
      <ETabbar />
    </div>
  );
}
