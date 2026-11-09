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
                  pg.locator(".e-win img").count() == 1 and pg.locator(".e-part").count() >= 4 and pg.locator(".e-board-foot").count() == 1)
        pg.goto(BASE + path)
        meta = {m.get_attribute("property") or m.get_attribute("name"): m.get_attribute("content") for m in pg.locator("meta[property], meta[name]").all()}
        check(f"{path}: its title and its own line", name in pg.title() and bool(meta.get("description")), pg.title())
        card = (meta.get("og:image") or "")
        s, ctype, body = get(re.sub(r"^https?://[^/]+", "", card)) if card else (0, "", b"")
        check(f"{path}: its link-preview card", s == 200 and body[:8] == b"\x89PNG\r\n\x1a\n" and struct.unpack(">II", body[16:24]) == (1200, 630), card)
        check(f"{path}: named in the Privacy Policy and the Terms of Use", name in privacy and name in terms)
        if path != "/work/w3arena":
            check(f"{path}: a proof for proposal pages", name in proof_chips, str(proof_chips))
    b.close()

finish()
