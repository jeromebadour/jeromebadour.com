import { siDiscord, siGithub, siUpwork, siNodedotjs, siJavascript, siElectron, siCplusplus, siMysql, siRedis, siDocker, siNginx, siCloudflare, siClaude, siPaypal, siLinux, siSocketdotio, siHtml5, siCss, siGnubash, siC, siNsis, siGo, siPython, siWebrtc, siWireguard, siPm2, siGit, siTypescript, siReact, siNextdotjs, siPostgresql } from "simple-icons";
// One glyph set for the whole site (BUILD-RULES 2.1): every clickable thing starts with one.
type Name =
  | "upwork" | "message" | "ask" | "live" | "release" | "demo" | "code" | "screen"
  | "work" | "how" | "services" | "about" | "arrow" | "github" | "discord" | "pulse"
  | "chevron" | "web" | "app" | "desktop" | "ai" | "server" | "grid"
  | "forum" | "shop" | "console" | "translate" | "region"
  | "search" | "tested" | "mail" | "shield" | "expand" | "close" | "pause";

const paths: Record<Name, string> = {
  upwork: "M4 5v6a4 4 0 0 0 8 0V5M12 11c1-3 3-5 5-5a3 3 0 0 1 0 6c-2 0-4-1-5-3M12 12l-1 7",
  message: "M4 5h16v11H9l-5 4z",
  ask: "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17.5v.01M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0",
  live: "M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0",
  release: "M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h5",
  demo: "M3 5h18v11H3zM8 20h8M12 16v4",
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14",
  screen: "M4 5h16v14H4zM4 15l5-4 4 3 3-2 4 3",
  work: "M4 8h16v11H4zM9 8V5h6v3",
  how: "M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16",
  services: "M4 7h16M4 12h16M4 17h10",
  about: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 20c1-4 4-6 8-6s7 2 8 6",
  arrow: "M5 12h14M13 6l6 6-6 6",
  github: "M9 19c-4 1-4-2-6-2m12 4v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  discord: "M7.5 6.5c3-1 6-1 9 0 1.7 2.5 2.6 5.3 2.5 8.6-1.4 1.2-3 2-4.6 2.5l-1-1.8M7.5 6.5C5.8 9 4.9 11.8 5 15.1c1.4 1.2 3 2 4.6 2.5l1-1.8M8 15c2.6 1.3 5.4 1.3 8 0M9.2 11.2a.8.8 0 1 0 0 1.6.8.8 0 1 0 0-1.6M14.8 11.2a.8.8 0 1 0 0 1.6.8.8 0 1 0 0-1.6",
  pulse: "M3 12h4l2-5 4 10 2-5h6",
  chevron: "M7 10l5 5 5-5",
  web: "M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0M4 12h16M12 4c2.5 2.5 2.5 13.5 0 16M12 4c-2.5 2.5-2.5 13.5 0 16",
  app: "M4 5h16v14H4zM4 9h16M7 7h.01M10 7h.01",
  desktop: "M3 4h18v12H3zM9 20h6M12 16v4M6 8h5M6 11h8",
  ai: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z",
  server: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01M12 7h4M12 17h4",
  forum: "M4 5h12v8H9l-4 3zM9 16h7l3 3v-9h-3",
  shop: "M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0",
  console: "M4 5h16v14H4zM8 10l3 2-3 2M13 15h3",
  translate: "M4 6h9M8.5 4v2M6 6c.5 3 2.5 5.5 5 7M11 6c-.5 3-2.5 5.5-5 7M13 20l4-9 4 9M14.5 17h5",
  region: "M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10zM10 11a2 2 0 1 0 4 0 2 2 0 1 0-4 0",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4",
  tested: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M8 12.5l2.7 2.7L16 9.8",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  shield: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6zM9.5 12l2 2 3.5-3.5",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  close: "M6 6l12 12M18 6L6 18",
  pause: "M9 6v12M15 6v12",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
};

export function Glyph({ name, size = 16 }: { name: Name; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
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
