// Every address on the site and every outside link, in one place.
// Pages and parts link through these, so an address changes here only.

export const page = {
  home: "/",
  w3arena: "/work/w3arena",
  distill: "/work/distill",
  services: "/services",
  how: "/how-i-work",
  about: "/about",
  ask: "/ask",
  message: "/message",
  privacy: "/privacy",
  terms: "/terms",
  admin: "/admin",
} as const;

// W3Arena's parts, in the order the site walks through them.
export const w3aPart = {
  website: "/work/w3arena/website",
  forum: "/work/w3arena/forum",
  desktop: "/work/w3arena/desktop-app",
  shop: "/work/w3arena/shop",
  console: "/work/w3arena/console",
  servers: "/work/w3arena/game-servers",
  ai: "/work/w3arena/ai-translation",
  standby: "/work/w3arena/reliability",
} as const;

export const out = {
  upwork: "https://www.upwork.com/freelancers/~018fb626b478552f9f",
  github: "https://github.com/jeromebadour",
  discord: "https://discord.com/users/792855756872613958",
  mail: "mailto:jerome@jeromebadour.com",
  w3arena: "https://w3arena.pro",
  w3aChangelog: "https://w3arena.pro/changelog",
  distill: "https://distill.jeromebadour.com",
  distillDemo: "https://distill.jeromebadour.com/demo/admin",
  distillCode: "https://github.com/jeromebadour/ai-summarizer",
  distillTests: "https://github.com/jeromebadour/ai-summarizer/actions",
} as const;

// Where each proof chip leads, by its label. A label missing here fails the build's link check.
const proofs: Record<string, string> = {
  "w3arena.pro": out.w3arena,
  "w3arena.pro/forum": `${out.w3arena}/forum`,
  "w3arena.pro/shop": `${out.w3arena}/shop`,
  "w3arena.pro/games": `${out.w3arena}/games`,
  "w3arena.pro/privacy": `${out.w3arena}/privacy`,
  "distill.jeromebadour.com": out.distill,
  Changelog: out.w3aChangelog,
  "W3Arena 5.1.5": out.w3aChangelog,
  "13 s freeze removed": out.w3aChangelog,
  "88% less traffic": out.w3aChangelog,
  "97% less in the app": out.w3aChangelog,
  "80+ servers, 0 games cut": w3aPart.servers,
  "The takeover": w3aPart.standby,
  "2FA per action": w3aPart.console,
  "AI spend": w3aPart.ai,
  "Admin demo": out.distillDemo,
  "Distill admin demo": out.distillDemo,
  "Server and backups": out.distillDemo,
  "Activity log": out.distillDemo,
  "Distill tests": out.distillTests,
  GitHub: out.distillCode,
  Code: out.distillCode,
  "Live apps": page.home,
};
export function proofHref(label: string): string {
  const h = proofs[label];
  if (!h) throw new Error(`No link for the proof "${label}"`);
  return h;
}
