"""Proposal pages end to end: made in the console, opened by a client, counted, switched off, paused."""
import re
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish, sign_in, sql

JOB = "https://www.upwork.com/jobs/~021987654321"

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    octx = b.new_context(); op = octx.new_page()
    sign_in(op); op.wait_for_url(BASE + "/admin", timeout=10000)

    # 1. The New page dialog checks its fields on the server.
    op.goto(BASE + "/admin?tab=proposals")
    check("an empty list says so", op.is_visible("text=No proposal pages yet."))
    op.click("text=New page")
    op.wait_for_selector(".c-dlg", timeout=10000)
    op.evaluate("document.querySelectorAll('.c-dlg [required]').forEach(e => e.removeAttribute('required')); document.querySelector('input[name=job_url]').type = 'text'")
    op.fill("input[name=title]", "Booking payments for a clinic")
    op.fill("input[name=job_url]", "https://example.com/job")
    op.click("button:has-text('Make page')")
    op.wait_for_selector(".c-dlg .m-err", timeout=10000)
    errs = op.inner_text(".c-dlg")
    check("a job link off Upwork is refused", "link on Upwork" in errs)
    check("a missing note is named", "Two lines for the client" in errs)
    check("fewer than three proofs is refused", "exactly three" in errs)
    check("what was typed stays", op.input_value("input[name=title]") == "Booking payments for a clinic")
    check("nothing was stored", sql("select count(*) from proposals") == "0")

    # 2. Three proofs, no more; the address follows the title.
    op.fill("input[name=job_url]", JOB)
    op.fill("textarea[name=note]", "Hi, I read your post about bookings and payments. Below are three pieces of my own work that match it.")
    for t in ["Shop", "Admin console", "Distill"]:
        op.click(f".c-dlg .m-chips button:has-text('{t}')")
    check("a fourth proof can't be picked", op.is_disabled(".c-dlg .m-chips button:has-text('Forum')"))
    check("the counter says 3 of 3", op.inner_text(".c-picked") == "3 of 3")
    check("the address follows the title", op.inner_text(".c-addr b") == "booking-payments-for-a-clinic")
    op.click("button:has-text('Make page')")
    op.wait_for_url(re.compile(r".*made=booking-payments-for-a-clinic"), timeout=10000)
    check("the page is made and linked", op.is_visible(".c-made a[href='/for/booking-payments-for-a-clinic']"))
    row = sql("select slug, proofs, is_on, opens from proposals")
    check("stored with its three proofs, on, no opens", row == "booking-payments-for-a-clinic|{shop,console,distill}|t|0", row)
    check("making it is on record", sql("select count(*) from audit_log where action = 'proposal.create'") == "1")

    # 3. The owner's own look isn't counted.
    op.goto(BASE + "/for/booking-payments-for-a-clinic")
    check("the owner sees the page", op.inner_text("h1") == "Booking payments for a clinic")
    check("the owner's view isn't counted", sql("select opens from proposals") == "0")

    # 4. The client's page: the job, the note, three proofs, and Upwork only.
    ctx = b.new_context(); pg = ctx.new_page()
    r = pg.goto(BASE + "/for/booking-payments-for-a-clinic")
    check("the client gets the page", r.status == 200)
    check("the job's title and the note show", pg.inner_text("h1") == "Booking payments for a clinic" and "three pieces of my own work" in pg.inner_text(".f-note"))
    titles = [t.strip() for t in pg.locator(".f-proof b").all_inner_texts()]
    check("three proofs, in the order picked", titles == ["Shop", "Admin console", "Distill"], str(titles))
    check("each proof links its page", pg.locator(".f-proof a[href='/work/w3arena/shop']").count() == 1 and pg.locator(".f-proof a[href='/work/distill']").count() == 1)
    check("Reply on Upwork goes to the job", pg.get_attribute("a:has-text('Reply on Upwork')", "href") == JOB)
    check("no Message button, no email, no Ask", pg.locator("a[href='/message']").count() == 0 and pg.locator("a[href^='mailto:']").count() == 0 and pg.locator("a[href='/ask']").count() == 0)
    check("not indexed by search engines", "noindex" in (pg.get_attribute("meta[name=robots]", "content") or ""))
    check("the open is counted", sql("select opens from proposals") == "1")
    check("no cookie is set", not ctx.cookies())

    # 5. The same title again gets its own address.
    op.goto(BASE + "/admin?tab=proposals&new=1")
    op.fill("input[name=title]", "Booking payments for a clinic")
    op.fill("input[name=job_url]", JOB + "2")
    op.fill("textarea[name=note]", "A second proposal for a similar job, with three proofs below.")
    for t in ["Game servers", "Standby server", "Windows app"]:
        op.click(f".c-dlg .m-chips button:has-text('{t}')")
    op.click("button:has-text('Make page')")
    op.wait_for_url(re.compile(r".*made=booking-payments-for-a-clinic-2"), timeout=10000)
    check("a repeated title gets -2", sql("select count(*) from proposals where slug = 'booking-payments-for-a-clinic-2'") == "1")

    # 6. Off, it's the 404; on again, it's back.
    op.goto(BASE + "/admin?tab=proposals")
    row1 = op.locator("tr:has-text('/for/booking-payments-for-a-clinic'):not(:has-text('-2'))")
    row1.locator(".c-toggle button").click()
    op.wait_for_function("() => document.body.innerText.includes('Off')", timeout=10000)
    check("switched off in the console", sql("select is_on from proposals where slug = 'booking-payments-for-a-clinic'") == "f")
    r = pg.goto(BASE + "/for/booking-payments-for-a-clinic")
    check("an off page is the 404", r.status == 404)
    check("switching is on record", sql("select count(*) from audit_log where action = 'proposal.off'") == "1")
    op.locator("tr:has-text('/for/booking-payments-for-a-clinic'):not(:has-text('-2')) .c-toggle button").click()
    op.wait_for_timeout(800)
    r = pg.goto(BASE + "/for/booking-payments-for-a-clinic")
    check("on again, it's back", r.status == 200)

    # 7. The brake stops every page at once; unknown pages are the 404.
    sql("update brakes set paused = true, reason = 'Taking a break' where name = 'proposals'")
    r = pg.goto(BASE + "/for/booking-payments-for-a-clinic-2")
    check("paused, every page is the 404", r.status == 404)
    sql("update brakes set paused = false, reason = null")
    r = pg.goto(BASE + "/for/no-such-page")
    check("an unknown page is the 404", r.status == 404)
    b.close()

finish()
