"use client";
import { useEffect } from "react";

// The home board's tabs switch in place: every panel is already on the page, so a click shows its panel, keeps the
// scroll where it is and updates the address (?tab=..., any ?via=upwork kept) without loading the page again. The
// tabs stay real links, so with no script, or a click that opens a new tab, they still work.
export function BoardTabs() {
  useEffect(() => {
    const board = document.querySelector<HTMLElement>(".n-apps .e-board");
    if (!board) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>("a.e-tab[data-tab]");
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const t = a.dataset.tab!;
      board.querySelectorAll<HTMLElement>("[data-tab]").forEach((x) => {
        x.classList.toggle("on", x.dataset.tab === t);
        x.setAttribute("aria-selected", String(x.dataset.tab === t));
      });
      board.querySelectorAll<HTMLElement>("[data-panel]").forEach((x) => x.classList.toggle("on", x.dataset.panel === t));
      const u = new URL(location.href);
      if (t === "all") u.searchParams.delete("tab"); else u.searchParams.set("tab", t);
      history.replaceState(history.state, "", u);
    };
    board.addEventListener("click", onClick);
    return () => board.removeEventListener("click", onClick);
  }, []);
  return null;
}
