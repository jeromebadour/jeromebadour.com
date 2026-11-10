"use client";
import { useState } from "react";
import { NMark } from "./Shell";

// The service board's row for this site (Kami 2026-11-10): laid out like the apps' rows, with the site's real deploy
// ticks and "You're here" for a status; it links nowhere, a click says "Already here." for a moment.
export function SelfRow({ note, ticks }: { note: string; ticks: React.ReactNode }) {
  const [here, setHere] = useState(false);
  return (
    <button type="button" className={`n-svc n-self${here ? " here" : ""}`} onClick={() => { setHere(true); setTimeout(() => setHere(false), 1600); }}>
      <span className="n-svc-mark n-self-mark"><NMark size={30} /></span>
      <span className="n-svc-t">
        <span><b>This site</b><em>jeromebadour.com</em></span>
        <small>Websites like this one. Yes, this one.</small>
      </span>
      <span className="n-svc-r">
        <span className="n-svc-k"><span className="n-ok"><span className="dot" />{here ? "Already here." : "You\u2019re here"}</span><span>{note}</span></span>
        {ticks}
      </span>
    </button>
  );
}
