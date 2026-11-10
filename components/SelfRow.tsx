"use client";
import { useState } from "react";
import { NMark } from "./Shell";

// The service board's row for this site (Kami 2026-11-10): laid out like the apps' rows, with the site's real deploy
// ticks, but it links nowhere: a click only says "Already here." for a moment.
export function SelfRow({ note, ticks }: { note: string; ticks: React.ReactNode }) {
  const [here, setHere] = useState(false);
  return (
    <button type="button" className={`n-svc n-self${here ? " here" : ""}`} onClick={() => { setHere(true); setTimeout(() => setHere(false), 1600); }}>
      <span className="n-svc-mark n-self-mark"><NMark size={30} /></span>
      <span className="n-svc-t">
        <span><b>This site</b><em>jeromebadour.com</em></span>
        <small>Websites like this one. I&apos;d link it, but you&apos;re on it.</small>
      </span>
      <span className="n-svc-r">
        <span className="n-svc-k"><span className="n-ok"><span className="dot" />{here ? "Already here." : "live"}</span><span>{note}</span></span>
        {ticks}
      </span>
    </button>
  );
}
