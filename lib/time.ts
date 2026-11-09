// Times as the site shows them, in Istanbul time: "Mon 08:55" within the last week, "3 Nov" before that.
export const ZONE = "Europe/Istanbul";

const weekdayTime = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false });
const dayMonth = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, day: "numeric", month: "short" });
const full = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });

export function when(d: Date, now = new Date()): string {
  if (now.getTime() - d.getTime() < 6 * 86_400_000) return weekdayTime.format(d).replace(",", "");
  return dayMonth.format(d);
}

/** "Mon 9 Nov, 09:40" */
export function nowLabel(d = new Date()): string {
  const p = Object.fromEntries(full.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.weekday} ${p.day} ${p.month}, ${p.hour}:${p.minute}`;
}

/** "Tue" for a yyyy-mm-dd day. */
export function weekday(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short" }).format(new Date(`${day}T12:00:00Z`));
}
