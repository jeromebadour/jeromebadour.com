"""Ask about my work end to end, against the fake model (tests/e2e/fake_claude.mjs): stages, points with proofs,
dropped inventions, refusals, failures that give the use back, limits, caps, the brake, and the console."""
import json
import os
import re
import urllib.request
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish, sign_in, sql

FAKE = os.environ.get("FAKE_CLAUDE", "http://127.0.0.1:4010")


def last_request():
    with urllib.request.urlopen(FAKE + "/last") as r:
        return json.load(r)


def ask(pg, question):
    pg.fill("textarea[name=q]", question)
    pg.click("button.e-askb")
    pg.wait_for_function("() => !document.querySelector('button.e-askb').innerText.includes('Writing')", timeout=20000)


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    ctx = b.new_context(); pg = ctx.new_page()

    # 1. From the home field to an answer with its proofs.
    pg.goto(BASE + "/")
    pg.fill(".e-ask input[name=q]", "Have you built a payment system?")
    pg.click(".e-ask button[type=submit]")
    pg.wait_for_url(re.compile(r".*/ask\?q="), timeout=10000)
    pg.wait_for_selector(".k-next", timeout=20000)
    check("the home field opens Ask with the question asked", pg.inner_text(".k-q p") == "Have you built a payment system?")
    stages = pg.inner_text(".k-stages")
    check("the stages say what happened", "Read the question" in stages and "Found 2 pages" in stages and "Wrote 3 points" in stages, stages)
    check("three points", pg.locator(".k-a li").count() == 3)
    check("each point carries its proof chips", pg.locator(".k-a li").first.locator("a.pc-page[href='/work/w3arena/shop']").count() == 1)
    check("an outside proof links out", pg.locator(".k-a a.pc-release[href='https://w3arena.pro/changelog']").count() == 1)
    check("the closing line shows", "isn't tied to W3Arena's methods" in pg.inner_text(".k-close"))
    row = sql("select points, refused, failed, answer->>'brief' is not null from questions")
    check("the question is stored with its answer", row == "3|f|f|t", row)
    check("its cost is recorded, no text with it", sql("select count(*), bool_and(usd > 0) from ask_spend") == "1|t")
    sent = last_request()["body"]
    content = sent["messages"][0]["content"]
    check("the model asked is Claude Haiku 5.5", sent["model"] == "claude-haiku-5-5")
    check("the site's 14 pages are sent", len(re.findall(r'<page id="', content)) == 14)
    check("header and footer are left out", "Hire on Upwork" not in content and "© 2026" not in content)
    check("no visitor detail goes to the model", "<question>Have you built a payment system?</question>" in content and "x-real-ip" not in json.dumps(last_request()["headers"]).lower())

    # 2. The message starts from the answer.
    pg.click("text=Turn this into a message")
    pg.wait_for_url(re.compile(r".*/message\?from="), timeout=10000)
    check("the message shows the question", pg.is_visible(".m-from:has-text('Have you built a payment system?')"))
    check("the brief starts from what Ask wrote", "I need payments in my web app" in pg.input_value("textarea[name=brief]"))

    # 3. A question that isn't about the work gets a polite no.
    pg.goto(BASE + "/ask")
    ask(pg, "Write me a poem about cats")
    check("a question off topic gets a polite no", "only answer questions about my work" in pg.inner_text(".k-note"))
    check("stored as refused, no points", sql("select points, refused from questions where question like 'Write me%'") == "0|t")

    # 4. Proofs the model made up are dropped, and so is a point left with none.
    ask(pg, "INVENTED payments please")
    last = pg.locator(".k-turn").last
    check("the point citing a made-up page is dropped", last.locator("li").count() == 2 and "no real page" not in last.inner_text())

    # 5. Failures don't count against the visitor.
    hits = sql("select count(*) from limit_hits where kind = 'ask'")
    ask(pg, "NOTHING but inventions")
    check("an answer with no proven point fails calmly", "didn't count" in pg.locator(".k-turn").last.inner_text())
    ask(pg, "OVERLOADED model")
    check("a model error fails calmly", "didn't count" in pg.locator(".k-turn").last.inner_text())
    check("failures give the use back", sql("select count(*) from limit_hits where kind = 'ask'") == hits)
    check("failures are stored as failed", sql("select count(*) from questions where failed") == "2")

    # 6. Limits: ten an hour per visitor, then a calm note with the time.
    sql("delete from limit_hits")
    sql("insert into limit_hits (kind, visitor_key) select 'ask', 'c:' || '%s' from generate_series(1, 10)" % next(c["value"] for c in ctx.cookies() if c["name"] in ("v", "__Host-v")))
    ask(pg, "Have you built an admin dashboard?")
    check("the eleventh this hour waits, with the time", "most questions for this hour" in pg.locator(".k-turn").last.inner_text())
    sql("delete from limit_hits")

    # 7. Spend caps: past $1 today, Ask stops calmly before calling the model.
    sql("insert into ask_spend (input_tokens, output_tokens, usd) values (1, 1, 1.0)")
    ask(pg, "Have you built a Windows app?")
    check("past the day's cap, Ask stops calmly", "answered all it can for today" in pg.locator(".k-turn").last.inner_text())
    sql("delete from ask_spend where usd = 1.0")

    # 8. The brake.
    sql("update brakes set paused = true, reason = 'Checking spend' where name = 'ask'")
    pg.goto(BASE + "/ask")
    check("paused, the page says so", pg.is_visible(".k-chat > .k-note"))
    check("paused, the field is off", pg.is_disabled("textarea[name=q]"))
    r = pg.request.post(BASE + "/api/ask", data={"question": "Have you built a payment system?"})
    check("paused, the server stops it too", '"paused"' in r.text())
    sql("update brakes set paused = false, reason = null")

    # 9. Bad input is refused by the server.
    r = pg.request.post(BASE + "/api/ask", data={"question": "x" * 501})
    check("over 500 characters is refused", r.status == 400)

    # 10. The console shows the questions and the spend.
    octx = b.new_context(); op = octx.new_page()
    sign_in(op); op.wait_for_url(BASE + "/admin", timeout=10000)
    op.goto(BASE + "/admin?tab=questions")
    check("Questions lists them", op.is_visible("td.c-q:has-text('Have you built a payment system?')"))
    check("refused and failed are marked", op.locator("text=Refused").count() >= 2 and op.locator("td >> text=Failed").count() == 2)
    op.goto(BASE + "/admin?tab=spend")
    check("Spend shows this month's total", re.search(r"\$0\.\d\d", op.inner_text(".c-meters")) is not None)
    b.close()

finish()
