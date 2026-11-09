// Email hints on the Message page: the common domains to finish an address with, and a fix for a likely typo in the
// domain (one or two letters off a common one). Nothing is changed until the visitor clicks a hint.
export const DOMAINS = ["gmail.com", "outlook.com", "icloud.com", "yahoo.com", "hotmail.com", "proton.me", "live.com", "aol.com"];

function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export type Hints = { finish: string[]; fix: string | null };

/** Up to 3 completions while the domain is being typed, or a fix once a domain that looks mistyped is there. */
export function emailHints(value: string): Hints {
  const v = value.trim();
  const at = v.indexOf("@");
  if (!v || /\s/.test(v) || v.indexOf("@", at + 1) !== -1) return { finish: [], fix: null };
  const local = at === -1 ? v : v.slice(0, at);
  const domain = at === -1 ? "" : v.slice(at + 1).toLowerCase();
  if (!local) return { finish: [], fix: null };
  if (DOMAINS.includes(domain)) return { finish: [], fix: null };
  if (domain.includes(".")) {
    const near = DOMAINS.map((d) => [d, distance(domain, d)] as const).filter(([, n]) => n > 0 && n <= 2).sort((x, y) => x[1] - y[1])[0];
    if (near) return { finish: [], fix: `${local}@${near[0]}` };
  }
  const finish = DOMAINS.filter((d) => d.startsWith(domain)).slice(0, 3).map((d) => `${local}@${d}`);
  return { finish: domain.includes(".") && finish.length === 0 ? [] : finish, fix: null };
}
