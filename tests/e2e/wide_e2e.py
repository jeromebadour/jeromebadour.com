"""Wide screens (BUILD-RULES 2.17): on a wide monitor every page is the 1440 layout, centred, with only more
background around it. Checked at 1920 x 1080, 2560 x 1440 and a 1920 screen zoomed out to 33% (5818 x 3273 CSS
pixels): no sideways scroll; every visible element inside the centred 1440 column, only the header and footer bars
wider; the brand, the page title and Hire on Upwork at the same place in the column as at 1440; and the first
section no taller than at 1440. Public pages, Upwork mode and a proposal page."""
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish, sql

COL = 1440
PAGES = ["/", "/work/w3arena", "/work/w3arena/website", "/work/w3arena/shop", "/work/w3arena/reliability",
         "/work/distill", "/services", "/how-i-work", "/about", "/ask", "/message", "/privacy", "/terms",
         "/?via=upwork", "/work/w3arena?via=upwork", "/for/wide-check", "/no-such-page"]
SIZES = [("1920", 1920, 1080, 1), ("2560", 2560, 1440, 1), ("33% zoom", 5818, 3273, 0.33)]

sql("delete from proposals")
sql("insert into proposals (slug, title, job_url, note, proofs) values ('wide-check', 'Wide check', "
    "'https://www.upwork.com/jobs/~11', 'A short note for the client.', '{shop,console,distill}')")

MEASURE = """(col) => {
  const W = document.documentElement.clientWidth, lo = (W - col) / 2 - 1, hi = (W + col) / 2 + 1;
  const bar = (e) => e.closest('.e-hdr, .e-foot');
  const out = [];
  for (const e of document.querySelectorAll('.page *')) {
    if (!e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if ((e.matches('.e-hdr, .e-foot')) || (bar(e) && r.width > col)) continue;
    if (r.left < lo || r.right > hi) out.push((e.className.baseVal ?? e.className ?? e.tagName) + ' ' + Math.round(r.left) + '-' + Math.round(r.right));
  }
  const x = (s) => { const e = document.querySelector(s); if (!e || !e.checkVisibility()) return null; return Math.round(e.getBoundingClientRect().left - (W - Math.min(W, col)) / 2); };
  const first = document.querySelector('.page > .e-hdr + *');
  return { outside: out.slice(0, 6), overflow: document.documentElement.scrollWidth - W,
           brand: x('.e-hdr .e-brand'), title: x('.page h1'), hire: x('.e-hdr .e-hire'),
           firstH: first ? Math.round(first.getBoundingClientRect().height) : 0 };
}"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    ref = {}
    base = b.new_page(viewport={"width": 1440, "height": 900})
    for path in PAGES:
        base.goto(BASE + path, wait_until="networkidle")
        ref[path] = base.evaluate(MEASURE, COL)
    for label, w, h, z in SIZES:
        pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=z)
        for path in PAGES:
            pg.goto(BASE + path, wait_until="networkidle")
            m = pg.evaluate(MEASURE, COL)
            r = ref[path]
            check(f"{label} {path}: no sideways scroll", m["overflow"] <= 0, str(m["overflow"]))
            check(f"{label} {path}: everything inside the centred column", not m["outside"], ", ".join(m["outside"]))
            same = all(m[k] == r[k] for k in ("brand", "title", "hire"))
            check(f"{label} {path}: laid out as at 1440", same, f"{ {k: (r[k], m[k]) for k in ('brand', 'title', 'hire')} }")
            check(f"{label} {path}: first section no taller than at 1440", m["firstH"] <= r["firstH"], f"{r['firstH']} -> {m['firstH']}")
        pg.close()
    b.close()

finish()
