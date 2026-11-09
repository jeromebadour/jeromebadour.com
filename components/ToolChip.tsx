"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Brand, brandColour, Glyph } from "./Glyph";
import type { Tech } from "./W3Page";
import type { ToolPlace } from "./W3Part";

// A tool in the home toolbox. Used on one page: a link to it. Used on several: a short list of those pages.
// Used on no page of its own: a link to the W3Arena Built with table, where every tool is listed by part.
const fallback: ToolPlace = { title: "W3Arena, built with", g: "code", tone: "sage", href: "/work/w3arena#built-with", app: "Every part and its tools" };

export function ToolChip({ t, places }: { t: Tech; places: ToolPlace[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLSpanElement>(null);
  // Keep the list on screen: shift it left when the tool sits near the right edge.
  useLayoutEffect(() => {
    const m = menu.current; if (!open || !m) return;
    m.style.left = "0px"; m.style.top = ""; m.style.bottom = "";
    const r = m.getBoundingClientRect(), edge = document.documentElement.clientWidth - 12;
    if (r.right > edge) m.style.left = `${Math.max(edge - r.right, 12 - r.left)}px`;
    // Open upward when the list would reach the phone tab bar or the bottom of the window.
    const bar = document.querySelector(".e-tabbar")?.getBoundingClientRect().top ?? window.innerHeight;
    if (r.bottom > Math.min(bar, window.innerHeight) - 8) { m.style.top = "auto"; m.style.bottom = "calc(100% + 4px)"; }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const face = (
    <>
      {t.brand ? <span style={{ color: brandColour(t.brand) }}><Brand name={t.brand} size={16} /></span> : <Glyph name={t.g!} size={14} />}
      {t.name}
    </>
  );
  const list = places.length ? places : [fallback];
  if (list.length === 1) return <a className="w-tech tl-go" href={list[0].href} title={list[0].title}>{face}</a>;
  return (
    <span className={`tl-dd${open ? " open" : ""}`} ref={ref}>
      <button type="button" className="w-tech tl-go" aria-expanded={open} onClick={() => setOpen(!open)}>
        {face}<em className="tl-n">{list.length}</em>
      </button>
      {open && (
        <span className="tl-menu" role="menu" ref={menu}>
          <span className="e-k">Used in</span>
          {list.map((p) => (
            <a key={p.href} className={`e-mi t-${p.tone}`} href={p.href} role="menuitem">
              <span className="e-tile"><Glyph name={p.g} size={15} /></span>
              <span><b>{p.title}</b><small>{p.app}</small></span>
            </a>
          ))}
        </span>
      )}
    </span>
  );
}
