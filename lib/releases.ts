// Release dates shown on the home service board, one list per app (BUILD-RULES 4.1: one source). W3Arena's come from
// its public changelog (https://w3arena.pro/changelog, read 2026-11-09); Distill's from its launch. The board marks
// each date on a timeline that starts at `since`.
export const BOARD_SINCE = "2026-08-01";
// Since 2026-11-14 the board reads W3Arena's releases and this site's deploys by itself (lib/server/board.ts); these
// lists are only what it shows when a read fails, and the start that the deploy records add to.
export type BoardRow = { latest: string; dates: string[]; note: string; latestDate?: string; latestChanges?: number; latestUrl?: string };
export type Board = Record<string, BoardRow>;
export const RELEASES: Board = {
  w3arena: {
    latest: "5.1.10",
    note: "20 releases since 10 Aug",
    dates: ["2026-08-10", "2026-09-10", "2026-09-25", "2026-09-27", "2026-09-30", "2026-10-01", "2026-10-10", "2026-10-15",
      "2026-10-24", "2026-10-25", "2026-10-28", "2026-10-30", "2026-10-31", "2026-11-03", "2026-11-06", "2026-11-08",
      "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-14"],
    latestDate: "2026-11-14", latestChanges: 34, latestUrl: "https://w3arena.pro/changelog/5.1.10",
  },
  // Fernway's and Alder & Pike's: the days they were deployed (GHL-BUILD.md; Fernway's own changelog has every deploy).
  fernway: { latest: "live", note: "Live since 9 Nov", dates: ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"] },
  alderpike: { latest: "live", note: "Live since 14 Nov", dates: ["2026-11-14"] },
  distill: { latest: "live", note: "Live since 7 Nov", dates: ["2026-11-07", "2026-11-08"] },
  // This site: its first deploy days; the rest come from the deploy records (scripts/deploy.sh).
  site: { latest: "live", note: "Live since 9 Nov", dates: ["2026-11-09", "2026-11-10"] },
};
