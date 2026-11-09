"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Asks the server for the page again every few seconds while the tab is open, so news shows without a reload. */
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
