"""The home page's service board reads itself (lib/server/board.ts): W3Arena's releases from its public changelog
feed (the fake answers for it here), and this site's deploy days from the deploy records. A feed that goes down or
changes shape keeps the last good copy; nothing the board reads is typed by hand."""
import json, os, re, time, urllib.request
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish, sql

FAKE = os.environ.get("FAKE_CLAUDE", "http://127.0.0.1:4010")


def feed(**answer):
    urllib.request.urlopen(urllib.request.Request(FAKE + "/__w3a", data=json.dumps(answer).encode(), method="POST"))


def home(pg):
    time.sleep(1.2)  # the feed is read at most once a second in the test stack
    pg.goto(BASE + "/", wait_until="networkidle")
    pg.goto(BASE + "/", wait_until="networkidle")  # the first visit after a change starts the read; the second shows it
    return pg.inner_text(".n-board"), pg.eval_on_selector(".n-board-f", "a => a.href")


GOOD = {"success": True, "versions": [
    {"version": "9.9.9", "date": "2026-11-13", "intro": "x", "sections": [{"title": "Launcher", "items": [{"text": "a"}, {"text": "b", "tag": "Fixed"}]}, {"title": "Site", "items": [{"text": "c"}]}]},
    {"version": "9.9.8", "date": None, "intro": "x", "sections": []},
    {"version": "9.9.7", "date": "2026-09-01", "intro": "x", "sections": [{"title": "Site", "items": [{"text": "d"}]}]},
]}

sql("delete from feeds; delete from deploys")
feed(status=200, body=GOOD)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    pg = b.new_page(viewport={"width": 1440, "height": 900})

    text, href = home(pg)
    check("the board shows W3Arena's newest release from the feed", "Latest W3Arena 9.9.9" in text, text[-160:])
    check("its date and link come from the feed", "13 Nov 2026" in text and href.endswith("/changelog/9.9.9"), href)
    check("dated releases since August are counted, the undated one skipped", "2 RELEASES SINCE 1 SEP" in text.upper(), text[:400])
    pg.click("a.e-tab[data-tab=w3a]")
    foot = pg.inner_text(".e-panel.on .e-board-foot")
    check("the W3Arena tab's footer: version, date, changes added up", "Release W3Arena 9.9.9" in foot and "13 Nov 2026" in foot and "3 changes" in foot, foot)
    check("the copy is kept", sql("select body->'versions'->0->>'version' from feeds where name = 'w3arena'") == "9.9.9")

    feed(status=500, body="down")
    text, _ = home(pg)
    check("feed down: the last good copy stays", "Latest W3Arena 9.9.9" in text, text[-160:])
    feed(status=200, body={"success": True, "versions": [{"version": "<b>x</b>", "date": "soon"}]})
    text, _ = home(pg)
    check("feed in another shape: the last good copy stays", "Latest W3Arena 9.9.9" in text and "<b>" not in text)
    feed(status=200, body=GOOD)

    sql("insert into deploys (commit, at) values ('aaaaaaa', now()), ('bbbbbbb', now() - interval '3 days')")
    pg.goto(BASE + "/", wait_until="networkidle")
    self_row = pg.inner_text(".n-board")
    n = pg.eval_on_selector_all(".n-board .n-tick", "e => e.length")
    sql("delete from deploys")
    pg.goto(BASE + "/", wait_until="networkidle")
    n0 = pg.eval_on_selector_all(".n-board .n-tick", "e => e.length")
    check("this site's deploy days come from the deploy records", n >= n0 + 2, f"{n0} -> {n}")
    check("the site row still says when it went live", "Live since 9 Nov" in self_row or "LIVE SINCE 9 NOV" in self_row.upper())
    b.close()

sql("delete from feeds; delete from deploys")
finish()
