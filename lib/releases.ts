// Release dates shown on the home service board, one list per app (BUILD-RULES 4.1: one source). W3Arena's come from
// its public changelog (https://w3arena.pro/changelog, read 2026-11-09); Distill's from its launch. The board marks
// each date on a timeline that starts at `since`.
export const BOARD_SINCE = "2026-08-01";
export const RELEASES: Record<string, { latest: string; dates: string[]; note: string }> = {
  w3arena: {
    latest: "5.1.6",
    note: "16 releases since 10 Aug",
    dates: ["2026-08-10", "2026-09-10", "2026-09-25", "2026-09-27", "2026-09-30", "2026-10-01", "2026-10-10", "2026-10-15",
      "2026-10-24", "2026-10-25", "2026-10-28", "2026-10-30", "2026-10-31", "2026-11-03", "2026-11-06", "2026-11-08"],
  },
  distill: { latest: "live", note: "Live since 7 Nov", dates: ["2026-11-07", "2026-11-08"] },
  // This site: the days it was deployed (the deploy log on the box; add the day with each deploy).
  site: { latest: "live", note: "Live since 9 Nov", dates: ["2026-11-09", "2026-11-10"] },
};
