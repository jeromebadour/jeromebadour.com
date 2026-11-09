import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Card } from "./meta";

// The link-preview card (1200 × 630), drawn from the site's own theme: its colours, its three fonts (static copies in
// og/, as the renderer can't read variable or woff2 fonts) and the profile photo.
const C = { bg: "#121518", card: "#181c20", rule: "#252b30", strong: "#353d43", ink: "#eaede9", muted: "#a7afab", accent: "#a7b37a", onAccent: "#141a0c" };

let assets: Promise<{ fonts: { name: string; data: Buffer; weight: 400 | 500 | 600 }[]; photo: string }> | null = null;
function load() {
  assets ??= (async () => {
    const f = (n: string) => readFile(join(process.cwd(), "og", n));
    const [display, body, mono, photo] = await Promise.all([
      f("manrope-latin-600-normal.woff"), f("ibm-plex-sans-latin-400-normal.woff"), f("jetbrains-mono-latin-500-normal.woff"),
      readFile(join(process.cwd(), "public", "jerome.jpg")),
    ]);
    return {
      fonts: [
        { name: "Manrope", data: display, weight: 600 as const },
        { name: "Plex", data: body, weight: 400 as const },
        { name: "Mono", data: mono, weight: 500 as const },
      ],
      photo: `data:image/jpeg;base64,${photo.toString("base64")}`,
    };
  })();
  return assets;
}

export async function cardImage(card: Card, maxAge: number) {
  const { fonts, photo } = await load();
  // The title steps down as it grows, so the longest proposal title (120 characters) and three 80-character headlines
  // still fit above the bottom row.
  const n = (card.title + (card.accent ?? "")).length;
  const size = n > 80 ? 42 : n > 40 ? 56 : 72;
  const tight = n > 80;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.bg, padding: "56px 64px", fontFamily: "Plex", color: C.ink }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 12, background: C.accent, color: C.onAccent, fontFamily: "Mono", fontSize: 21 }}>JB</div>
            <div style={{ fontFamily: "Manrope", fontSize: 30, letterSpacing: -0.3 }}>Jerome Badour</div>
          </div>
          <div style={{ fontFamily: "Mono", fontSize: 22, color: C.muted }}>jeromebadour.com</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: tight ? 34 : 54, flexGrow: 1 }}>
          <div style={{ fontFamily: "Mono", fontSize: 20, letterSpacing: 2, textTransform: "uppercase", color: C.accent }}>{card.kicker}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 18, fontFamily: "Manrope", fontSize: size, lineHeight: 1.08, letterSpacing: -2 }}>
            <span>{card.title}</span>
            {card.accent && <span style={{ color: C.accent }}>{card.accent}</span>}
          </div>
          {card.line && <div style={{ display: "flex", marginTop: 26, fontSize: 27, lineHeight: 1.45, color: C.muted, maxWidth: 1020 }}>{card.line}</div>}
          {card.list && (
            <div style={{ display: "flex", flexDirection: "column", gap: tight ? 8 : 12, marginTop: tight ? 22 : 30 }}>
              {card.list.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: tight ? 22 : 26 }}>
                  <span style={{ fontFamily: "Mono", fontSize: 20, color: C.accent }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 26, borderTop: `1px solid ${C.rule}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} width={56} height={56} style={{ borderRadius: 28 }} alt="" />
            <div style={{ display: "flex", fontSize: 22, color: C.muted }}>Jerome Badour</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {(card.chips ?? []).map((c) => (
              <div key={c} style={{ display: "flex", padding: "8px 16px", border: `1px solid ${C.strong}`, borderRadius: 10, background: C.card, fontSize: 20 }}>{c}</div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts, headers: { "Cache-Control": `public, max-age=${maxAge}` } },
  );
}
