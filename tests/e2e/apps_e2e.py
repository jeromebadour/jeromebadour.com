"""Every app shows up in every place an app belongs (lib/apps.ts): the Apps menu, its home tab with its board, its own
page with its title and link preview, the proof list of proposal pages, the Privacy Policy and the Terms of Use. The
apps are read from the sitemap, so a new app is checked without touching this file."""
import re
import struct
import urllib.request
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish, sign_in


def get(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.status, r.headers.get("content-type", ""), r.read()


sitemap = get("/sitemap.xml")[2].decode()
pages = [re.sub(r"^https://jeromebadour\.com", "", u) for u in re.findall(r"<loc>([^<]+)</loc>", sitemap)]
apps = [p for p in pages if re.fullmatch(r"/work/[a-z0-9-]+", p)]
check("the sitemap lists the apps", len(apps) >= 2, str(apps))

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(BASE + "/")
    menu = {a.get_attribute("href"): a.inner_text() for a in pg.locator(".e-menu a").all()}
    tabs = [(a.get_attribute("href"), a.inner_text()) for a in pg.locator(".e-tabs a").all()]
    pg.goto(BASE + "/privacy"); privacy = pg.inner_text("body")
    pg.goto(BASE + "/terms"); terms = pg.inner_text("body")

    op = b.new_page(viewport={"width": 1440, "height": 900}); sign_in(op); op.wait_for_url(BASE + "/admin", timeout=10000)
    op.goto(BASE + "/admin?tab=proposals&new=1"); op.wait_for_selector(".c-dlg")
    proof_chips = [t.strip() for t in op.locator(".c-dlg .m-chips button").all_inner_texts()]

    for path in apps:
        pg.goto(BASE + path)
        name = pg.inner_text("h1").split("\n")[0].strip()
        name = re.sub(r"\s+\S+\.\S+$", "", name)  # the address shown beside the name
        check(f"{path}: in the Apps menu", path in menu and name in menu[path], name)
        tab = next((h for h, t in tabs if name in t), None)
        check(f"{path}: its own home tab", tab is not None and tab.startswith("/?tab="), str(tabs))
        if tab:
            pg.goto(BASE + tab)
            check(f"{path}: its tab opens its board (picture, parts, footer link)",
                  pg.locator(".e-win img:visible").count() == 1 and pg.locator(".e-part:visible").count() >= 4 and pg.locator(".e-board-foot:visible").count() == 1)
        pg.goto(BASE + path)
        meta = {m.get_attribute("property") or m.get_attribute("name"): m.get_attribute("content") for m in pg.locator("meta[property], meta[name]").all()}
        check(f"{path}: its title and its own line", name in pg.title() and bool(meta.get("description")), pg.title())
        card = (meta.get("og:image") or "")
        s, ctype, body = get(re.sub(r"^https?://[^/]+", "", card)) if card else (0, "", b"")
        check(f"{path}: its link-preview card", s == 200 and body[:8] == b"\x89PNG\r\n\x1a\n" and struct.unpack(">II", body[16:24]) == (1200, 630), card)
        check(f"{path}: named in the Privacy Policy and the Terms of Use", name in privacy and name in terms)
        if path != "/work/w3arena":
            check(f"{path}: a proof for proposal pages", name in proof_chips, str(proof_chips))
    # Picture viewers never move on their own (Kami 2026-11-09): no autoplay, no zoom when a picture changes.
    vp = b.new_page(viewport={"width": 1440, "height": 900})
    vp.goto(BASE + "/work/w3arena/shop")
    first = vp.locator(".sv-stage img.on").first.get_attribute("src")
    vp.wait_for_timeout(6500)
    check("viewer: no autoplay (same picture after 6.5 s)", vp.locator(".sv-stage img.on").first.get_attribute("src") == first)
    check("viewer: no progress bar", vp.locator(".sv-bar").count() == 0)
    vp.locator(".sv-strip button").nth(1).click()
    tf = vp.evaluate("() => { const i = document.querySelector('.sv-stage img.on'); return [getComputedStyle(i).animationName, getComputedStyle(i).transform]; }")
    check("viewer: a picked picture fades in without a zoom", tf[0] in ("sv-fade", "none") and tf[1] in ("none", "matrix(1, 0, 0, 1, 0, 0)"), str(tf))
    check("viewer: the picked picture is shown", vp.locator(".sv-stage img.on").first.get_attribute("src") != first)
    # The home board's tabs switch in place: no reload, no jump to the top, the address follows (Kami 2026-11-10).
    for start in ("/", "/?via=upwork"):
        h = b.new_page(viewport={"width": 1440, "height": 900})
        h.goto(BASE + start, wait_until="networkidle")
        h.evaluate("window.__stay = 1")
        h.locator(".n-apps .e-board").scroll_into_view_if_needed()
        h.mouse.wheel(0, 200); h.wait_for_timeout(200)
        y0 = h.evaluate("scrollY")
        for t in ["w3a", "distill", "all"]:
            h.click(f".n-apps a.e-tab[data-tab={t}]"); h.wait_for_timeout(250)
            st = h.evaluate("""(t) => ({ stay: window.__stay === 1, y: scrollY,
                shown: [...document.querySelectorAll('.n-apps [data-panel]')].filter(e => e.checkVisibility()).map(e => e.dataset.panel),
                on: document.querySelector('.n-apps a.e-tab.on')?.dataset.tab, url: location.search })""", t)
            check(f"home board {start} -> {t}: no reload", st["stay"])
            check(f"home board {start} -> {t}: stays where it was scrolled", abs(st["y"] - y0) <= 1, f"{y0} -> {st['y']}")
            check(f"home board {start} -> {t}: only its panel shows, its tab is on", st["shown"] == [t] and st["on"] == t, str(st))
            want_tab = "" if t == "all" else f"tab={t}"
            check(f"home board {start} -> {t}: the address follows", (want_tab in st["url"]) and (("via=upwork" in st["url"]) == ("via" in start)), st["url"])
        h.close()
    d = b.new_page(viewport={"width": 1440, "height": 900})
    d.goto(BASE + "/?tab=distill", wait_until="networkidle")
    check("home ?tab=distill opens on Distill's panel", d.evaluate("[...document.querySelectorAll('.n-apps [data-panel]')].filter(e => e.checkVisibility()).map(e => e.dataset.panel).join()") == "distill")
    d.close()
    # The service board's row for this site: like the apps' rows, links nowhere, "You're here", a click "Already here.".
    sb = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []; sb.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    sb.goto(BASE + "/", wait_until="networkidle"); sb.evaluate("window.__stay = 1")
    rows = sb.locator(".n-board .n-svc"); apps_n = sb.locator(".n-board a.n-svc").count()
    check("service board: the apps plus this site, last", apps_n >= 2 and rows.count() == apps_n + 1 and "This site" in rows.nth(apps_n).inner_text(), str(rows.count()))
    check("service board: this site's row is not a link", sb.locator(".n-board a.n-self, .n-self a").count() == 0 and sb.locator(".n-board button.n-self").count() == 1)
    check("service board: this site's row says you're here", "you\u2019re here" in sb.inner_text(".n-self").lower())
    sb.click(".n-board .n-self"); sb.wait_for_timeout(150)
    check("service board: a click says Already here. and stays", "already here." in sb.inner_text(".n-self").lower() and sb.evaluate("window.__stay === 1"))
    sb.wait_for_timeout(1800)
    check("service board: the note goes after a moment", "already here." not in sb.inner_text(".n-self").lower())
    check("home: no errors in the console", not errs, "; ".join(errs[:3]))
    sb.close()

    # The awake band says "Jerome: also awake." only at night in Istanbul (01:00 to 06:00).
    for utc, want in [("2026-11-10T00:30:00Z", True), ("2026-11-10T09:00:00Z", False)]:
        ab = b.new_page(viewport={"width": 1440, "height": 900})
        ms = __import__("calendar").timegm(__import__("time").strptime(utc, "%Y-%m-%dT%H:%M:%SZ")) * 1000
        ab.add_init_script("{const T=%d;const D=Date;Date=class extends D{constructor(...a){super(...(a.length?a:[T]))}static now(){return T}}}" % ms)
        ab.goto(BASE + "/", wait_until="networkidle"); ab.wait_for_selector(".n-awake-now")
        check(f"awake band at {utc[11:16]} UTC: also awake {'shown' if want else 'hidden'}", ("jerome: also awake." in ab.inner_text(".n-awake").lower()) == want)
        ab.close()

    # The footer's one-person line, on every page.
    ft = b.new_page(viewport={"width": 1440, "height": 900})
    for path in ["/", "/work/w3arena", "/services", "/?via=upwork"]:
        ft.goto(BASE + path)
        check(f"footer {path}: the one-person line", "Built and run by one person. Including this footer." in ft.inner_text(".e-foot"))
    ft.close()

    # The 404 says one of three lines, picked per visit, with no error in the console.
    LINES = {"This page doesn't exist": "I'd blame the server, but I run the server.",
             "Root cause: this page never existed": "The address may be mistyped, or the page has moved.",
             "This page failed review": "So it never shipped."}
    nf = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []; nf.on("console", lambda m: errs.append(m.text) if m.type == "error" and "404" not in m.text else None)
    seen = set(); ok = True
    for _ in range(18):
        r = nf.goto(BASE + "/no-such-page", wait_until="networkidle")
        t, d = nf.inner_text("#nf-t"), nf.inner_text("#nf-d")
        ok = ok and r.status == 404 and LINES.get(t) == d
        seen.add(t)
    check("404: always one of the three lines, title and line together", ok)
    check("404: visits get different lines", len(seen) >= 2, str(seen))
    check("404: no errors in the console", not errs, "; ".join(errs[:3]))
    nf.close()
    # Each case study has one aside in the site's voice under its plain intro; the preview keeps the plain line.
    cs = b.new_page(viewport={"width": 1440, "height": 900})
    for path in ["/work/w3arena", "/work/w3arena/website", "/work/w3arena/forum", "/work/w3arena/desktop-app",
                 "/work/w3arena/shop", "/work/w3arena/console", "/work/w3arena/game-servers",
                 "/work/w3arena/ai-translation", "/work/w3arena/reliability", "/work/distill"]:
        cs.goto(BASE + path, wait_until="networkidle")
        aside = cs.locator(".w-top .w-aside")
        ok = aside.count() == 1 and aside.is_visible() and len(aside.inner_text().strip()) > 10
        desc = cs.get_attribute('meta[name="description"]', "content") or ""
        check(f"{path}: one aside under the intro, not in the preview", ok and aside.inner_text().lstrip("› ").strip() not in desc and desc == cs.inner_text(".w-top .e-line").strip(), desc[:60])
    cs.close()
    b.close()

finish()
