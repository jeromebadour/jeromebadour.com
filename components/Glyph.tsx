import { siDiscord, siGithub, siUpwork, siNodedotjs, siJavascript, siElectron, siCplusplus, siMysql, siRedis, siDocker, siNginx, siCloudflare, siClaude, siPaypal, siLinux, siSocketdotio, siHtml5, siCss, siGnubash, siC, siNsis, siGo, siPython, siWebrtc, siWireguard, siPm2, siGit, siTypescript, siReact, siNextdotjs, siPostgresql } from "simple-icons";
// One glyph set for the whole site (BUILD-RULES 2.1): every clickable thing starts with one.
type Name =
  | "upwork" | "message" | "ask" | "live" | "release" | "demo" | "code" | "screen"
  | "work" | "how" | "services" | "about" | "arrow" | "github" | "discord" | "pulse"
  | "chevron" | "web" | "app" | "desktop" | "ai" | "server" | "grid"
  | "forum" | "shop" | "console" | "translate" | "region"
  | "search" | "tested" | "mail" | "shield" | "expand" | "close" | "pause" | "signout"
  | "sun" | "moon" | "system";

// Night shift glyphs (BUILD-RULES 2.27): drawn for this site on a 24 grid, 1.8 stroke, round caps and joins, soft
// 2-unit corners, and on most glyphs one filled "signal" dot that marks the live or active part. Each action keeps its
// own glyph (2.1). The brand marks below stay the official logos.
type G = { d: string; dot?: [number, number] };
const paths: Record<Name, G> = {
  upwork: { d: "M5 6v5.5a3.5 3.5 0 0 0 7 0V6M12 11.5c1-3 2.6-4.5 4.6-4.5a3 3 0 0 1 0 6c-2 0-3.6-.9-4.6-2.4M12 13l-1 6" },
  message: { d: "M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-5 4V6a1 1 0 0 1 1-1z", dot: [15.5, 10.5] },
  ask: { d: "M12 20a8 8 0 1 0-6.9-4L4 20l4-1.1A8 8 0 0 0 12 20zM9.8 9.6a2.3 2.3 0 1 1 3 2.2c-.6.2-.8.6-.8 1.2", dot: [12, 15.6] },
  live: { d: "M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4M9 9a4.2 4.2 0 0 0 0 6M15 9a4.2 4.2 0 0 1 0 6", dot: [12, 12] },
  release: { d: "M12 4v10M8 10.5l4 4 4-4M5 19h14" , dot: [19, 19] },
  demo: { d: "M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 20h6M12 16v4M10 8.5v4l3.5-2z" },
  code: { d: "M8.5 8l-4 4 4 4M15.5 8l4 4-4 4", dot: [12, 12] },
  screen: { d: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM4 15l4.5-3.5 3.5 3 3-2 5 3.5", dot: [15.5, 8.5] },
  work: { d: "M5 8h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 13h16" },
  how: { d: "M4 19h5v-5h5V9h5", dot: [19, 5.5] },
  services: { d: "M4 6.5h16M4 12h11M4 17.5h7", dot: [19, 17.5] },
  about: { d: "M12 11.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM5 20c.9-3.6 3.6-5.5 7-5.5s6.1 1.9 7 5.5" },
  arrow: { d: "M5 12h13M13.5 7l5 5-5 5" },
  github: { d: "M9 19c-4 1-4-2-6-2m12 4v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" },
  discord: { d: "M7.5 6.5c3-1 6-1 9 0 1.7 2.5 2.6 5.3 2.5 8.6-1.4 1.2-3 2-4.6 2.5l-1-1.8M7.5 6.5C5.8 9 4.9 11.8 5 15.1c1.4 1.2 3 2 4.6 2.5l1-1.8M8 15c2.6 1.3 5.4 1.3 8 0M9.2 11.2a.8.8 0 1 0 0 1.6.8.8 0 1 0 0-1.6M14.8 11.2a.8.8 0 1 0 0 1.6.8.8 0 1 0 0-1.6" },
  pulse: { d: "M3 13h3.5l2-5 3.5 9 2.5-6.5 1.5 2.5H21", dot: [21, 13] },
  chevron: { d: "M7.5 10l4.5 4.5 4.5-4.5" },
  web: { d: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM4 9h16M8 13.5h8M8 16.5h5", dot: [7, 6.5] },
  app: { d: "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM4 9h16M9 9v11", dot: [6.8, 6.5] },
  desktop: { d: "M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM9 20h6M12 16v4M6.5 8h6M6.5 11.5h9" },
  ai: { d: "M12 4l1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7z", dot: [18.5, 17.5] },
  server: { d: "M5 4h14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM5 14h14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM12 7h4.5M12 17h4.5", dot: [7.5, 7] },
  grid: { d: "M5 4h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM14 4h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM5 13h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z", dot: [16.5, 16.5] },
  forum: { d: "M5 4h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3V5a1 1 0 0 1 1-1zM16 9h3a1 1 0 0 1 1 1v10l-3-2.5h-6a1 1 0 0 1-1-1V16" },
  shop: { d: "M5.5 8h13l-1 11a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1zM9 8V7a3 3 0 0 1 6 0v1", dot: [12, 13.5] },
  console: { d: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 9.5l3 2.5-3 2.5", dot: [15.5, 14.5] },
  translate: { d: "M4 6h9M8.5 4v2M6 6c.5 3 2.5 5.5 5 7M11 6c-.5 3-2.5 5.5-5 7M13 20l4-9 4 9M14.5 17h5" },
  region: { d: "M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z", dot: [12, 10.5] },
  search: { d: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4", dot: [11, 11] },
  tested: { d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.8 2.8L16 10" },
  mail: { d: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3.5 7l8.5 6 8.5-6" },
  shield: { d: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6zM9.5 12l2 2 3.5-3.5" },
  expand: { d: "M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" },
  close: { d: "M6.5 6.5l11 11M17.5 6.5l-11 11" },
  pause: { d: "M9 6v12M15 6v12" },
  signout: { d: "M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10" },
  // The theme switch (2026-11-13): light, dark, and following the computer.
  sun: { d: "M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" },
  moon: { d: "M19.5 14.6A7.5 7.5 0 0 1 9.4 4.5a7.5 7.5 0 1 0 10.1 10.1z", dot: [17.5, 6.5] },
  system: { d: "M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM9 20h6M12 16v4M12 4v12", dot: [8, 10] },
};

export function Glyph({ name, size = 16 }: { name: Name; size?: number }) {
  const g = paths[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={g.d} />
      {g.dot && <circle cx={g.dot[0]} cy={g.dot[1]} r="1.7" fill="currentColor" stroke="none" />}
    </svg>
  );
}
export type GlyphName = Name;

// Brand marks: the official logos (simple-icons, CC0), unaltered, filled, never redrawn by hand.
const brands = {
  discord: siDiscord, github: siGithub, upwork: siUpwork,
  node: siNodedotjs, js: siJavascript, electron: siElectron, cpp: siCplusplus, mysql: siMysql, redis: siRedis,
  docker: siDocker, nginx: siNginx, cloudflare: siCloudflare, claude: siClaude, paypal: siPaypal, linux: siLinux,
  socketio: siSocketdotio, html: siHtml5, css: siCss, bash: siGnubash, c: siC, nsis: siNsis, go: siGo, python: siPython,
  webrtc: siWebrtc, wireguard: siWireguard, pm2: siPm2, git: siGit,
  ts: siTypescript, react: siReact, next: siNextdotjs, postgres: siPostgresql,
} as const;
// The brand's own colour when it reads on the dark cards (4.5:1 or more on the chip, measured); otherwise the ink colour.
function lum(hex: string) {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function brandColour(name: BrandName) {
  const hex = brands[name].hex;
  return (lum(hex) + 0.05) / (lum("181c20") + 0.05) >= 4.5 ? `#${hex}` : "var(--ink)";
}
export type BrandName = keyof typeof brands;
export function Brand({ name, size = 16 }: { name: BrandName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={brands[name].path} />
    </svg>
  );
}
