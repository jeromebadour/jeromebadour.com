"""Messages end to end: the brief, the emails, the status page, the Inbox, the reply, limits, brakes and the trap."""
import re
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, OWNER_EMAIL, check, finish, sign_in, sql
from outbox import emails_to, link, newest

NOTIFY = "jerome@jeromebadour.com"


def fill(pg, name="Daniel Moreau", email="Daniel@Example.com", brief="Payments for my web app: a checkout, receipts and refunds."):
    pg.goto(BASE + "/message")
    pg.fill("input[name=name]", name)
    pg.fill("input[name=email]", email)
    pg.fill("textarea[name=brief]", brief)


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)

    # 1. A sender's brief goes in, both emails go out, and the status page opens.
    ctx = b.new_context(); pg = ctx.new_page()
    fill(pg)
    pg.click("button:has-text('React / Next.js')")
    pg.click("button:has-text('This week')")
    pg.click("button[type=submit]")
    pg.wait_for_url(re.compile(r".*/m/[A-Za-z0-9_-]{43}$"), timeout=15000)
    status_url = pg.url
    check("sending lands on the status page", "/m/" in status_url)
    row = sql("select name, email, built_with, how_soon, status from messages")
    check("the message is stored, email lowercased", row == "Daniel Moreau|daniel@example.com|{\"React / Next.js\"}|this_week|new", row)
    check("only the link token's hash is stored", sql("select count(*) from messages where token_hash = sha256(convert_to('%s','utf8'))" % status_url.rsplit("/", 1)[1]) == "1")
    got = newest("daniel@example.com")
    check("the sender gets an email with the status link", link(got, "/m/") is not None)
    check("the sender's email links the same page", (link(got, "/m/") or "").endswith(status_url.rsplit("/", 1)[1]))
    check("replies to it go to jerome@", got.get("replyTo") == "jerome@jeromebadour.com", str(got.get("replyTo")))
    note = newest(NOTIFY)
    check("Jerome gets the brief with the Inbox link", "Payments for my web app" in note["text"] and "/admin?tab=inbox" in note["text"])
    check("Jerome's copy replies to the sender", note.get("replyTo") == "daniel@example.com")
    # The emails wear the Night shift look: the mark from the site's own domain with JB when images are blocked,
    # the dark colours, and the one-person footer (2026-11-13).
    for who, m in (("sender", got), ("Jerome", note)):
        h = m["html"]
        check(f"{who}'s email: the mark, JB if blocked, dark, the footer line",
              'src="https://jeromebadour.com/email/mark.png"' in h and 'alt="JB"' in h and "#0c0e0f" in h
              and 'content="dark"' in h and "Built and run by one person. Including this email." in h)
    mk = ctx.request.get(BASE + "/email/mark.png")
    check("the email mark is served as a PNG", mk.status == 200 and mk.headers.get("content-type") == "image/png")
    check("the page shows Received with its time", pg.is_visible(".st-step.done:has-text('Received')"))
    check("Read and Replied wait", pg.locator(".st-step:not(.done)").count() == 2)
    check("the page shows the brief", pg.is_visible("text=Payments for my web app"))

    # 2. Mistakes are named at their field; nothing is stored.
    pg2 = ctx.new_page()
    fill(pg2, name="", email="not-an-email", brief="short")
    pg2.evaluate("document.querySelectorAll('[required]').forEach(e => e.removeAttribute('required'))")
    pg2.evaluate("document.querySelector('input[name=email]').type = 'text'")
    pg2.click("button[type=submit]")
    pg2.wait_for_selector(".m-err", timeout=10000)
    errs = pg2.inner_text(".m-form")
    check("each mistake is named", "Your name" in errs and "An email address" in errs and "A sentence or two" in errs)
    check("nothing was stored", sql("select count(*) from messages") == "1")
    check("what was typed stays", pg2.input_value("input[name=email]") == "not-an-email")

    # 3. The Inbox: opening marks it Read, and the sender's page shows it.
    octx = b.new_context(); op = octx.new_page()
    sign_in(op); op.wait_for_url(BASE + "/admin", timeout=10000)
    check("the sidebar counts one new message", op.inner_text(".c-side nav a.on em") == "1")
    check("the row is marked new", op.is_visible("tr.c-new:has-text('Daniel Moreau')"))
    op.click("a.c-who:has-text('Daniel Moreau')")
    op.wait_for_selector(".c-dlg", timeout=10000)
    check("the dialog shows the brief", "Payments for my web app" in op.inner_text(".c-dlg"))
    check("opening marks it Read", sql("select status, read_at is not null from messages") == "read|t")
    check("the read is on record", sql("select count(*) from audit_log where action = 'message.read'") == "1")
    pg.reload()
    check("the sender's page shows Read", pg.is_visible(".st-step.done:has-text('Read')"))

    # 4. The reply: an email with its own link, the status page, and one reply only.
    op.fill("textarea[name=reply]", "Hi Daniel, thanks.\n\nThis is close to the W3Arena shop: jeromebadour.com/work/w3arena/shop")
    op.click("button:has-text('Send reply')")
    op.wait_for_selector(".c-replied", timeout=15000)
    check("the dialog shows the reply as sent", "Your reply" in op.inner_text(".c-dlg"))
    check("stored as replied", sql("select status from messages") == "replied")
    mail = newest("daniel@example.com", after=1)
    check("the reply goes out by email", "This is close to the W3Arena shop" in mail["text"])
    reply_link = link(mail, "/m/")
    check("the reply email has its own link", reply_link and not reply_link.endswith(status_url.rsplit("/", 1)[1]))
    pg.reload()
    check("the first link shows the reply", pg.is_visible(".st-reply:has-text('This is close to the W3Arena shop')"))
    check("a page the reply names becomes a chip", pg.is_visible(".st-reply a.pc-page[href='/work/w3arena/shop']"))
    pg3 = ctx.new_page(); pg3.goto(BASE + "/m/" + reply_link.rsplit("/", 1)[1])
    check("the reply's link opens the same page", pg3.is_visible("text=This is close to the W3Arena shop"))
    check("the reply is on record", sql("select count(*) from audit_log where action = 'message.reply'") == "1")

    # 5. Links: an unknown one is the 404; one past 90 days says closed.
    r = pg3.goto(BASE + "/m/" + "A" * 43)
    check("an unknown link is the 404", r.status == 404)
    sql("update messages set link_until = now() - interval '1 minute'")
    pg.reload()
    check("a link past 90 days says the message is closed", pg.is_visible("text=This status page retired") or "closed" in pg.inner_text("main, body").lower())
    sql("update messages set link_until = now() + interval '90 days'")

    # 6. Limits: 3 an hour per visitor, said calmly; the trap stores nothing.
    sql("delete from limit_hits")
    for i in range(3):
        fill(pg2, brief=f"Message number {i} for the limit test.")
        pg2.click("button[type=submit]")
        pg2.wait_for_url(re.compile(r".*/m/"), timeout=15000)
    fill(pg2, brief="The fourth message this hour.")
    pg2.click("button[type=submit]")
    pg2.wait_for_selector(".m-err-form", timeout=10000)
    check("the fourth this hour waits, with the time it opens", "most messages for this hour" in pg2.inner_text(".m-err-form"))
    check("the fourth isn't stored", sql("select count(*) from messages where brief like 'The fourth%'") == "0")
    sql("delete from limit_hits")
    before = sql("select count(*) from messages")
    fill(pg2, brief="A bot filled the hidden field.")
    pg2.evaluate("document.querySelector('input[name=website]').value = 'spam.example'")
    pg2.click("button[type=submit]")
    pg2.wait_for_url(BASE + "/", timeout=10000)
    check("a filled trap stores nothing", sql("select count(*) from messages") == before)

    # 7. The brake: paused, the form says so and nothing is sent.
    sql("update brakes set paused = true, reason = 'Away' where name = 'messages'")
    fill(pg2, brief="Sent while messages are paused.")
    check("the form shows the pause", pg2.is_visible(".m-paused"))
    pg2.click("button[type=submit]")
    pg2.wait_for_selector(".m-err-form", timeout=10000)
    check("a paused form sends nothing", sql("select count(*) from messages where brief like 'Sent while%'") == "0")
    sql("update brakes set paused = false, reason = null")

    # 8. From an Ask question: the bar shows it and the message keeps it.
    qid = sql("insert into questions (question, points) values ('Have you built a payment system?', 4) returning id").splitlines()[0]
    pg2.goto(f"{BASE}/message?from={qid}")
    check("the bar shows the question", pg2.is_visible(".m-from:has-text('Have you built a payment system?')"))
    pg2.fill("input[name=name]", "Priya Nair"); pg2.fill("input[name=email]", "priya@example.com")
    pg2.fill("textarea[name=brief]", "Payments for a booking site, with refunds.")
    pg2.click("button[type=submit]"); pg2.wait_for_url(re.compile(r".*/m/"), timeout=15000)
    check("the message keeps the question", sql("select from_question from messages where name = 'Priya Nair'") == "Have you built a payment system?")
    pg2.goto(f"{BASE}/message?from=00000000-0000-0000-0000-000000000000")
    check("an unknown question shows no bar", not pg2.is_visible(".m-from"))

    # Email hints: common domains while typing, a fix for a likely typo, nothing changes until a hint is clicked.
    h = b.new_page(viewport={"width": 1440, "height": 900}); h.goto(BASE + "/message")
    h.click("#m-email"); h.keyboard.type("alex")
    check("typing a name before @ offers 3 domains", h.locator(".m-hint").all_inner_texts() == ["@gmail.com", "@outlook.com", "@icloud.com"], str(h.locator(".m-hint").all_inner_texts()))
    h.keyboard.type("@ic")
    check("the domain typed so far narrows them", h.locator(".m-hint").all_inner_texts() == ["@icloud.com"])
    h.click(".m-hint")
    check("a click finishes the address and keeps the field", h.input_value("#m-email") == "alex@icloud.com" and h.evaluate("document.activeElement.id") == "m-email")
    check("a finished address shows the tick and no hints", h.is_visible(".m-ok") and h.locator(".m-hint").count() == 0)
    h.fill("#m-email", "alex@gmial.com")
    check("a likely typo offers its fix", "alex@gmail.com" in h.inner_text(".m-hint.fix") and not h.is_visible(".m-ok"))
    check("nothing is changed until it is clicked", h.input_value("#m-email") == "alex@gmial.com")
    h.click(".m-hint.fix")
    check("the fix is applied on click", h.input_value("#m-email") == "alex@gmail.com")
    h.fill("#m-email", "alex@company.io"); h.click("textarea[name=brief]")
    check("a work address gets no hints", h.locator(".m-hint").count() == 0)
    widths = h.evaluate("[...document.querySelectorAll('.m-two .m-field')].map(e => Math.round(e.getBoundingClientRect().width))")
    check("the name field is narrower than the email field, neither over 420px", widths[0] < widths[1] <= 420, str(widths))
    b.close()

finish()
