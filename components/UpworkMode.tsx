"use client";
import { useEffect } from "react";

// Carries Upwork mode (proxy.ts) to the next page: while it's on, every click on a link to this site, and every form
// sent to this site by GET, gets ?via=upwork. Pages outside the site are left alone.
export function UpworkMode() {
  useEffect(() => {
    if (document.documentElement.dataset.via !== "upwork") return;
    const carry = (raw: string): string | null => {
      const u = new URL(raw, location.href);
      if (u.origin !== location.origin || u.searchParams.get("via") === "upwork") return null;
      u.searchParams.set("via", "upwork");
      return u.pathname + u.search + u.hash;
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href")!;
      if (href.startsWith("#") || href.startsWith("mailto:")) return;
      const next = carry(a.href);
      if (next) a.setAttribute("href", next);
    };
    const onSubmit = (e: SubmitEvent) => {
      const f = e.target as HTMLFormElement;
      if ((f.method || "get").toLowerCase() !== "get" || new URL(f.action, location.href).origin !== location.origin) return;
      if (!f.querySelector("input[name=via]")) {
        const i = document.createElement("input");
        i.type = "hidden"; i.name = "via"; i.value = "upwork";
        f.appendChild(i);
      }
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}
