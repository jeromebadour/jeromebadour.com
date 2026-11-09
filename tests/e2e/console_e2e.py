"""The console's other tabs end to end: Brakes (pause with a reason, resume), Socials (add, edit, remove, shown on
the site at once), and Visits (counted from a sample Nginx log by ops/visits.py, the script the box runs)."""
import os
import subprocess
import tempfile
from datetime import datetime, timedelta, timezone
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish, sign_in, sql

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    octx = b.new_context(); op = octx.new_page()
    sign_in(op); op.wait_for_url(BASE + "/admin", timeout=10000)
    ctx = b.new_context(); pg = ctx.new_page()

    # 1. Brakes: a pause needs a reason, visitors see a calm note, resume undoes it.
    op.goto(BASE + "/admin?tab=brakes")
    check("three parts, all running", op.locator("text=Running").count() == 3)
    op.locator("tr:has-text('Ask about my work') a:has-text('Pause')").click()
    op.wait_for_selector(".c-dlg", timeout=10000)
    op.evaluate("document.querySelector('input[name=reason]').removeAttribute('required')")
    op.click(".c-dlg button[type=submit]")
    op.wait_for_selector(".c-dlg .m-err", timeout=10000)
    check("a pause without a reason is refused", "short reason" in op.inner_text(".c-dlg .m-err"))
    op.fill("input[name=reason]", "Checking spend")
    op.click(".c-dlg button[type=submit]")
    op.wait_for_url(BASE + "/admin?tab=brakes", timeout=10000)
    check("Ask shows Paused with its reason", op.is_visible("tr:has-text('Ask about my work'):has-text('Paused'):has-text('Checking spend')"))
    check("the pause is on record with its reason", sql("select detail->>'reason' from audit_log where action = 'brake.pause'") == "Checking spend")
    pg.goto(BASE + "/ask")
    check("visitors see a calm note on Ask", pg.is_visible(".k-chat > .k-note"))
    op.locator("tr:has-text('Ask about my work') button:has-text('Resume')").click()
    op.wait_for_timeout(800); op.reload()
    check("resume runs it again", op.locator("text=Running").count() == 3)
    check("the resume is on record", sql("select count(*) from audit_log where action = 'brake.resume'") == "1")

    # 2. Socials: add, shown on the site at once; hidden on proposal pages unless marked.
    op.goto(BASE + "/admin?tab=socials")
    check("the three accounts on record", op.locator(".c-table tbody tr").count() == 3)
    op.click("text=Add account")
    op.wait_for_selector(".c-dlg", timeout=10000)
    op.click(".c-dlg .m-chips button:has-text('LinkedIn')")
    op.fill("input[name=label]", "LinkedIn")
    op.evaluate("document.querySelector('input[name=url]').type = 'text'")
    op.fill("input[name=url]", "http://not-https.example")
    op.click(".c-dlg button[type=submit]")
    op.wait_for_selector(".c-dlg .m-err", timeout=10000)
    check("an address without https is refused", "https://" in op.inner_text(".c-dlg .m-err"))
    op.fill("input[name=url]", "https://www.linkedin.com/in/jerome-badour")
    op.click(".c-dlg button[type=submit]")
    op.wait_for_url(BASE + "/admin?tab=socials", timeout=10000)
    check("the new account is listed", op.locator(".c-table tbody tr").count() == 4)
    pg.goto(BASE + "/")
    check("the home page shows it at once", pg.locator(".e-soc a[href='https://www.linkedin.com/in/jerome-badour']").count() >= 1)
    pg.goto(BASE + "/about")
    check("the footer and About show it", pg.locator("a[href='https://www.linkedin.com/in/jerome-badour']").count() == 2)
    sql("insert into proposals (slug, title, job_url, note, proofs) values ('socials-check', 'Socials check', 'https://www.upwork.com/jobs/~1', 'A note for the client here.', '{shop,console,distill}')")
    pg.goto(BASE + "/for/socials-check")
    foot = pg.inner_text("footer")
    check("proposal pages show only the marked ones", "LinkedIn" not in foot and "Discord" not in foot and "GitHub" in foot and "Upwork" in foot)

    # 3. Edit and remove.
    op.locator("tr:has-text('LinkedIn') a:has-text('Edit')").click()
    op.wait_for_selector(".c-dlg", timeout=10000)
    op.fill("input[name=label]", "LinkedIn profile")
    op.check("input[name=on_proposals]")
    op.click(".c-dlg button[type=submit]")
    op.wait_for_url(BASE + "/admin?tab=socials", timeout=10000)
    pg.goto(BASE + "/for/socials-check")
    check("an edit shows at once, now on proposal pages too", "LinkedIn profile" in pg.inner_text("footer"))
    op.locator("tr:has-text('LinkedIn profile') a:has-text('Edit')").click()
    op.wait_for_selector(".c-remove", timeout=10000)
    op.click(".c-remove button")
    op.wait_for_url(BASE + "/admin?tab=socials", timeout=10000)
    pg.goto(BASE + "/")
    check("removed, it's gone from the site", pg.locator("a[href='https://www.linkedin.com/in/jerome-badour']").count() == 0)
    check("add, edit and remove are on record", sql("select string_agg(action, ',' order by id) from audit_log where action like 'social.%'") == "social.add,social.edit,social.remove")

    # 4. Visits: the box's script counts a sample log; private and bot traffic is left out.
    now = datetime.now(timezone.utc)
    ua = "Mozilla/5.0 Chrome/130"
    log = [
        *[f"{(now - timedelta(minutes=i)).isoformat()}\tGET\t/\t200\thttps://www.upwork.com/x\t{ua}" for i in range(4)],
        f"{now.isoformat()}\tGET\t/work/w3arena\t200\t-\t{ua}",
        f"{now.isoformat()}\tGET\t/m/PRIVATE\t200\t-\t{ua}",
        f"{now.isoformat()}\tGET\t/admin\t200\t-\t{ua}",
        f"{now.isoformat()}\tGET\t/\t200\t-\tGooglebot/2.1",
        f"{now.isoformat()}\tGET\t/jerome.jpg\t200\t-\t{ua}",
    ]
    folder = tempfile.mkdtemp()
    with open(os.path.join(folder, "jeromebadour.access.log"), "w") as f:
        f.write("\n".join(log) + "\n")
    env = dict(os.environ, VISITS_LOGS=os.path.join(folder, "jeromebadour.access.log*"), VISITS_PSQL="psql")
    run = subprocess.run(["python3", "ops/visits.py"], env=env, capture_output=True, text=True)
    check("the script counts the log", run.returncode == 0 and "5 pages read" in run.stdout, run.stdout + run.stderr)
    check("private links, the console, bots and files aren't counted", sql("select count(*) from visits_daily where path in ('/m/PRIVATE', '/admin', '/jerome.jpg')") == "0")
    subprocess.run(["python3", "ops/visits.py"], env=env, capture_output=True, text=True)
    check("running it again changes nothing", sql("select sum(views) from visits_daily") == "5")
    op.goto(BASE + "/admin?tab=visits")
    check("Visits shows the week's pages read", op.inner_text(".c-cards > div:first-child b") == "5")
    check("where they came from, as a site name", op.is_visible(".c-two >> text=upwork.com"))
    check("top pages", op.is_visible(".c-two td.c-mono:has-text('/work/w3arena')"))
    b.close()

finish()
