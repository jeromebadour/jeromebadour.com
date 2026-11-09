"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Glyph, type GlyphName } from "./Glyph";

export type Shot = { src: string; thumb: string; cap: string; g: GlyphName; path?: string; fit?: "contain" };

export function ScreenViewer({ shots, label, host, frame = "browser", icon = "desktop" }: {
  shots: Shot[]; label: string; host: string; frame?: "browser" | "app"; icon?: GlyphName;
}) {
  // One picture: no strip, counter or arrows, the picture takes the whole width.
  const one = shots.length === 1;
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [still, setStill] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const boxStrip = useRef<HTMLDivElement>(null);

  const show = useCallback((n: number) => {
    setI((cur) => { if (n !== cur) setPrev(cur); return n; });
  }, []);
  const go = useCallback((d: number) => setI((cur) => { setPrev(cur); return (cur + d + shots.length) % shots.length; }), [shots.length]);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(m.matches);
    const f = () => setStill(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);

  // Pictures change only when the visitor picks one (Kami 2026-11-09: nothing moves on its own).

  // Keep the open screen's thumbnail in view without moving the page.
  useEffect(() => {
    for (const el of [strip.current, boxStrip.current]) {
      const t = el?.children[i] as HTMLElement | undefined;
      if (!el || !t) continue;
      const tall = el.scrollHeight > el.clientHeight + 1;
      el.scrollTo(tall ? { top: t.offsetTop - el.clientHeight / 2 + t.clientHeight / 2, behavior: still ? "auto" : "smooth" }
        : { left: t.offsetLeft - el.clientWidth / 2 + t.clientWidth / 2, behavior: still ? "auto" : "smooth" });
    }
  }, [i, open, still]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, go]);

  const s = shots[i];

  const chrome = (
    <div className="sv-chrome">
      {frame === "browser" ? (
        <>
          <span className="sv-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="sv-addr"><Glyph name="shield" size={13} /><b>{host}</b><span>{s.path ?? ""}</span></span>
        </>
      ) : (
        <span className="sv-addr app"><Glyph name={icon} size={13} /><b>{host}</b><span>{s.cap}</span></span>
      )}
      <span className="sv-meta">
        <span className="sv-live"><span className="dot" />Live</span>
        {!one && <span className="sv-n">{String(i + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}</span>}
      </span>
    </div>
  );

  const stage = (big: boolean) => (
    <div className={`sv-stage${still ? " still" : ""}`}>
      {shots.map((x, n) => (
        <img key={x.src} src={x.src} alt={n === i ? x.cap : ""} aria-hidden={n !== i}
          className={`${n === i ? "on" : n === prev ? "prev" : ""}${x.fit ? " fit" : ""}`} loading={n < 2 || big ? "eager" : "lazy"} />
      ))}
    </div>
  );

  const thumbs = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div className="sv-strip" role="tablist" aria-label={label} ref={ref}>
      {shots.map((x, n) => (
        <button key={x.src} role="tab" aria-selected={n === i} className={n === i ? "on" : ""}
          onClick={(e) => { e.stopPropagation(); show(n); }}>
          <span className="sv-th"><img src={x.thumb} alt="" loading="lazy" className={x.fit ? "fit" : undefined} /></span>
          <span className="sv-tl"><Glyph name={x.g} size={12} /><span>{x.cap}</span></span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={one ? "sv one" : "sv"}>
      {chrome}
      <div className="sv-body">
        <button className="sv-open" onClick={() => setOpen(true)} aria-label={`Open ${s.cap} full size`}>
          {stage(false)}
          <span className="sv-zoom"><Glyph name="expand" size={15} /></span>
        </button>
        {!one && <div className="sv-side">{thumbs(strip)}</div>}
      </div>

      {open && (
        <div className="sv-box" role="dialog" aria-modal="true" aria-label={s.cap} onClick={() => setOpen(false)}>
          <div className="sv-box-in" onClick={(e) => e.stopPropagation()}>
            <div className="sv-box-bar">
              {chrome}
              <button className="sv-x" onClick={() => setOpen(false)} aria-label="Close"><Glyph name="close" size={17} /></button>
            </div>
            <div className="sv-box-stage">
              {stage(true)}
              {!one && <button className="sv-arrow l" onClick={() => go(-1)} aria-label="Previous"><Glyph name="arrow" size={20} /></button>}
              {!one && <button className="sv-arrow r" onClick={() => go(1)} aria-label="Next"><Glyph name="arrow" size={20} /></button>}
            </div>
            {!one && thumbs(boxStrip)}
          </div>
        </div>
      )}
    </div>
  );
}
