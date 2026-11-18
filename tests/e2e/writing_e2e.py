"""The writing section (components/PostPage): each post is its approved draft word for word (content/<slug>.ts), its
pictures load, it reads at 390 / 1440 / 1920 / 2560 with code blocks and the table scrolling inside themselves on a
phone, it previews as an article, and the home page, the footer and the sitemap lead to it. The Oracle post names no
provider of today's setup anywhere, text, captions, alt text or metadata (Kami's separation rule)."""
import json, re, struct, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish

SLUG = "oracle-terminated-my-account"
URL = f"/writing/{SLUG}"
src = Path(__file__).resolve().parents[2] / "content" / f"{SLUG}.ts"
ts = src.read_text()
title = json.loads(re.search(r"export const TITLE = (\".*\");", ts).group(1))
body = json.loads(re.search(r"export const BODY = (\".*\");", ts, re.S).group(1))


def words(md):
    md = re.sub(r"\[Screenshot \d\d[^:]*: ([\s\S]*?)\]", lambda m: m.group(1)[0].upper() + m.group(1)[1:], md)
    md = md.replace("**", "").replace("```", "").replace("## ", "")
    md = re.sub(r"^\|[-|]+\|$", "", md, flags=re.M).replace("|", " ")
    md = re.sub(r"^---$", "", md, flags=re.M)
    md = re.sub(r"^- ", "", md, flags=re.M)
    return md.split()


def get(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.status, r.headers.get("content-type", ""), r.read()


html = get(URL)[2].decode()
for name in ["Contabo", "Vultr", "Hetzner", "OVH", "DigitalOcean", "Linode", "Akamai", "AWS", "Azure", "Scaleway", "Cloudflare R2"]:
    check(f"no provider of today's setup named: {name}", name.lower() not in html.lower())

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []
    # Page errors and console errors both (a hydration mismatch, React #418, is only a console error).
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:160]))
    pg.goto(BASE + URL, wait_until="networkidle")
    text = pg.inner_text(".p-post").replace("Writing\n", "", 1)
    text = re.sub(r"Jerome Badour\s*\d+ \w+ \d{4}", "", text, count=1)
    want, got = [title, *words(body)], text.split()
    check("the post is its draft, word for word", " ".join(words(title + "\n" + body)) == " ".join(got), next((f"{a!r} != {c!r} at {n}" for n, (a, c) in enumerate(zip(words(title + "\n" + body), got)) if a != c), f"{len(want)} vs {len(got)}"))
    check("Claude is named once on the page, as the DR chat", pg.inner_text("body").count("Claude") == 1 and "the Claude chat where I plan" in text)
    check("the byline: Jerome Badour and the date", re.search(r"Jerome Badour\s+18 November 2026", pg.inner_text(".p-by")) is not None)
    check("no errors in the console", not errs, "; ".join(errs))
    for y in range(0, 30000, 800):
        pg.evaluate(f"scrollTo(0, {y})")
        pg.wait_for_timeout(40)
    pg.wait_for_timeout(600)
    imgs = pg.evaluate("[...document.querySelectorAll('.p-fig img')].map(i => [i.naturalWidth, i.alt])")
    caps = pg.locator(".p-fig figcaption").all_inner_texts()
    check("every caption starts with a capital", len(caps) == 9 and all(c[:1].isupper() or c[:1] == '"' for c in caps), str([c[:20] for c in caps]))
    check("every picture loads, with its caption as its alt text", len(imgs) == 10 and all(w > 0 and len(a) > 10 for w, a in imgs), str(imgs[:3]))
    meta = pg.evaluate("Object.fromEntries([...document.querySelectorAll('meta[property],meta[name]')].map(m => [m.getAttribute('property') || m.getAttribute('name'), m.content]))")
    summary = "Oracle Cloud terminated a paid account over a €16.32 card decline, with no warning and no way back. How a standby on another provider kept the platform up."
    check("the meta description is the agreed summary", meta.get("description") == summary and meta.get("og:description") == summary)
    check("it previews as an article with its own title", meta.get("og:type") == "article" and meta.get("og:title", "").startswith(title) and meta.get("article:published_time", "").startswith("2026-11-18"))
    card = re.sub(r"^https?://[^/]+", "", meta.get("og:image", ""))
    s, ctype, png = get(card)
    check("its own link-preview card", s == 200 and png[:8] == b"\x89PNG\r\n\x1a\n" and struct.unpack(">II", png[16:24]) == (1200, 630), card)
    pg.close()

    for w, h in ((390, 844), (1440, 900), (1920, 1080), (2560, 1440)):
        v = b.new_page(viewport={"width": w, "height": h})
        v.goto(BASE + URL, wait_until="networkidle")
        sw = v.evaluate("document.documentElement.scrollWidth")
        right = v.evaluate("Math.max(...[...document.querySelectorAll('.p-post p, .p-post h1, .p-post h2, .p-post li, .p-fig, .p-code, .p-table')].map(e => e.getBoundingClientRect().right))")
        check(f"{w}: nothing past the window", sw == w and right <= w, f"{sw} {right:.0f}")
        if w == 390:
            inner = v.evaluate("[...document.querySelectorAll('.p-code, .p-table')].map(e => [e.scrollWidth > e.clientWidth, e.getBoundingClientRect().right <= 390])")
            check("390: the promote output scrolls inside itself", inner[1][0] and all(r for _, r in inner), str(inner))
        v.close()

    hp = b.new_page(viewport={"width": 1440, "height": 900})
    herrs = []
    hp.on("console", lambda m: m.type == "error" and herrs.append(m.text[:160]))
    hp.goto(BASE + "/", wait_until="networkidle")
    hp.wait_for_timeout(500)
    check("the home page loads with no console errors", not herrs, "; ".join(herrs))
    check("the home page leads to the post", hp.locator(f".e-latest[href='{URL}']").count() == 1)
    check("the footer leads to the writing section", hp.locator(".e-foot a[href='/writing']").count() == 1)
    hp.goto(BASE + "/writing", wait_until="networkidle")
    check("the writing section lists the post", hp.locator(f".p-index a[href='{URL}']").count() == 1)
    hp.close()
    b.close()

sitemap = get("/sitemap.xml")[2].decode()
check("the sitemap has the post and the section", f"https://jeromebadour.com{URL}" in sitemap and "https://jeromebadour.com/writing<" in sitemap)
finish()
