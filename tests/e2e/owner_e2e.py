"""The owner's sign-in and the console's gate: a real browser against the built site and a real Postgres."""
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish, sign_in, sql

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)

    # 1. Signed out, the console doesn't exist.
    ctx = b.new_context(); pg = ctx.new_page()
    for path in ["/admin", "/admin?tab=spend", "/admin?tab=brakes"]:
        r = pg.goto(BASE + path)
        check(f"{path} answers 404 when signed out", r.status == 404, str(r.status))
    check("the 404 is the site's own page", pg.is_visible(".nf-code") and pg.inner_text("#nf-t") in
          ("This page doesn't exist", "Root cause: this page never existed", "This page failed review"))

    # 2. A wrong password is refused with a calm line, and counted.
    sign_in(pg, "not-the-password")
    pg.wait_for_selector(".si-err", timeout=10000)
    check("a wrong password is refused", "don't match" in pg.inner_text(".si-err"))
    check("the email stays in the field", pg.input_value("input[name=email]") != "")
    check("the failure is counted", sql("select count(*) from sign_in_failures") == "1")
    check("a refused sign-in opens no session", sql("select count(*) from owner_sessions") == "0")

    # 3. Five wrong tries in 15 minutes stop the sixth, even with the right password.
    for _ in range(4):
        sign_in(pg, "still-wrong")
        pg.wait_for_selector(".si-err", timeout=10000)
    sign_in(pg)
    pg.wait_for_function("() => document.querySelector('.si-err')?.innerText.includes('Too many')", timeout=10000)
    check("the sixth try waits, even with the right password", "Too many" in pg.inner_text(".si-err"))
    sql("delete from sign_in_failures")

    # 4. The right password opens the console, with a safe cookie.
    sign_in(pg)
    pg.wait_for_url(BASE + "/admin", timeout=10000)
    check("the right password opens /admin", pg.url == BASE + "/admin")
    cookie = next((c for c in ctx.cookies() if c["name"] in ("owner", "__Host-owner")), None)
    check("the cookie is httpOnly and SameSite=Strict", bool(cookie and cookie["httpOnly"] and cookie["sameSite"] == "Strict"), str(cookie))
    check("only the token's hash is stored", sql("select count(*) from owner_sessions where token_hash = sha256(convert_to('%s','utf8'))" % cookie["value"]) == "1")
    check("the sign-in is on record", sql("select count(*) from audit_log where action = 'owner.sign_in'") == "1")
    for tab, title in [("inbox", "Inbox"), ("questions", "Questions"), ("proposals", "Proposal pages"), ("visits", "Visits"), ("spend", "Spend"), ("brakes", "Brakes"), ("socials", "Socials")]:
        pg.goto(f"{BASE}/admin?tab={tab}")
        check(f"the {title} tab opens", pg.inner_text(".c-head h1").strip() == title, pg.inner_text(".c-head h1"))
    pg.goto(BASE + "/admin?tab=nope")
    check("an unknown tab falls back to Inbox", pg.inner_text(".c-head h1").strip() == "Inbox")
    check("empty tables say so", pg.is_visible("text=No messages yet."))
    pg.goto(BASE + "/sign-in")
    pg.wait_for_url(BASE + "/admin", timeout=10000)
    check("a signed-in visit to /sign-in goes to the console", pg.url == BASE + "/admin")

    # 5. Signing out ends the session; the console is a 404 again.
    pg.click("button[aria-label='Sign out']")
    pg.wait_for_url(BASE + "/", timeout=10000)
    check("sign out lands on the home page", pg.url == BASE + "/")
    check("the session is gone", sql("select count(*) from owner_sessions") == "0")
    r = pg.goto(BASE + "/admin")
    check("the console is a 404 again", r.status == 404)

    # 6. An expired session doesn't open the console.
    sign_in(pg)
    pg.wait_for_url(BASE + "/admin", timeout=10000)
    sql("update owner_sessions set expires_at = now() - interval '1 minute'")
    r = pg.goto(BASE + "/admin")
    check("an expired session gets the 404", r.status == 404)
    ctx.close()
    b.close()

finish()
