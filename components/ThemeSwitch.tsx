"use client";
import { useEffect, useState } from "react";
import { Glyph } from "./Glyph";

// Light, dark, or following the computer (2026-11-13). The choice is kept in this browser only (localStorage, never
// sent to the server); with none, the site follows the computer. THEME_SCRIPT sets it before the page paints, so a
// light page never flashes dark first.
export type Theme = "system" | "light" | "dark";
const KEY = "theme";
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<Theme, string> = { system: "Theme: following your computer", light: "Theme: light", dark: "Theme: dark" };

export function ThemeSwitch() {
  const [t, setT] = useState<Theme>("system");
  useEffect(() => {
    const v = document.documentElement.getAttribute("data-theme");
    setT(v === "light" || v === "dark" ? v : "system");
  }, []);
  const pick = () => {
    const n = NEXT[t];
    setT(n);
    try { if (n === "system") localStorage.removeItem(KEY); else localStorage.setItem(KEY, n); } catch { /* storage off: this visit only */ }
    if (n === "system") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", n);
  };
  return (
    <button type="button" className="e-theme" onClick={pick} aria-label={LABEL[t]} title={LABEL[t]} data-theme-now={t}>
      <Glyph name={t === "light" ? "sun" : t === "dark" ? "moon" : "system"} size={16} />
    </button>
  );
}
