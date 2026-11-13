"""Light mode (2026-11-13): with no pick the site follows the computer; the header switch cycles System, Light, Dark,
keeps the choice in this browser and applies it before the page paints; the light palette reads at 4.5:1 or more;
the Privacy Policy says where the choice is kept."""
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish

BG = "getComputedStyle(document.querySelector('.page')).backgroundColor"
def lum(rgb):
    def ch(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)
def parse(s):
    return tuple(int(x) for x in s[s.index("(") + 1:s.index(")")].split(",")[:3])

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    for scheme, want in (("dark", "rgb(12, 14, 15)"), ("light", "rgb(243, 244, 241)")):
        pg = b.new_page(color_scheme=scheme)
        pg.goto(BASE + "/", wait_until="networkidle")
        check(f"no pick, a {scheme} computer gets the {scheme} site", pg.evaluate(BG) == want, pg.evaluate(BG))
        pg.close()

    ctx = b.new_context(color_scheme="dark"); pg = ctx.new_page()
    pg.goto(BASE + "/", wait_until="networkidle")
    sw = ".e-hdr .e-theme"
    check("the switch starts on System", pg.get_attribute(sw, "data-theme-now") == "system")
    pg.click(sw)
    check("one click: Light, and the page turns light", pg.get_attribute(sw, "data-theme-now") == "light" and pg.evaluate(BG) == "rgb(243, 244, 241)")
    seen = []
    pg.on("domcontentloaded", lambda: seen.append(pg.evaluate("document.documentElement.getAttribute('data-theme')")))
    pg.reload(wait_until="networkidle")
    check("the choice survives a reload, set before paint", seen and seen[-1] == "light" and pg.evaluate(BG) == "rgb(243, 244, 241)", str(seen))
    pg.click(sw)
    check("two clicks: Dark", pg.get_attribute(sw, "data-theme-now") == "dark" and pg.evaluate(BG) == "rgb(12, 14, 15)")
    pg.click(sw)
    check("three clicks: back to System, nothing stored",
          pg.get_attribute(sw, "data-theme-now") == "system" and pg.evaluate("localStorage.getItem('theme')") is None and pg.evaluate("document.documentElement.hasAttribute('data-theme')") is False)
    ctx.close()

    # The home stage is a dark screen in light mode too: its text stays light on it (phones show the art behind it).
    for w, h in ((1440, 900), (390, 844)):
        pg = b.new_page(viewport={"width": w, "height": h}, color_scheme="light")
        pg.goto(BASE + "/", wait_until="networkidle")
        c = [pg.evaluate(f"getComputedStyle(document.querySelector('{sel}')).color") for sel in (".n-stage h1", ".n-stage .n-stats b, .n-stage .n-stats strong, .n-stage .e-stat b, .n-stage .e-stat")]
        check(f"light {w}: the stage's headline and stats stay light", all(sum(parse(x)) > 600 for x in c), str(c))
        pg.close()

    # Light palette contrast on the page background.
    pg = b.new_page(color_scheme="light")
    pg.goto(BASE + "/work/w3arena/console", wait_until="networkidle")
    bg = parse(pg.evaluate(BG))
    for name in ("--ink", "--muted", "--faint", "--accent", "--t-red", "--t-blue", "--t-amber", "--t-violet", "--t-green"):
        c = pg.evaluate(f"(()=>{{const e=document.createElement('i');e.style.color='var({name})';document.querySelector('.page').append(e);const v=getComputedStyle(e).color;e.remove();return v}})()")
        r = ratio(parse(c), bg)
        check(f"light {name} reads at 4.5:1 or more", r >= 4.5, f"{r:.2f}")
    pg.goto(BASE + "/privacy", wait_until="networkidle")
    check("the Privacy Policy says where the choice is kept", "that choice is kept in your own browser" in pg.inner_text("main, .page"))
    pg.close()
    b.close()

finish()
