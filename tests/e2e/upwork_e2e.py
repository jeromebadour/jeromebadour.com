"""Upwork mode (Upwork's rule on contact details): a visit that came from Upwork (a proposal page, or a link carrying
?via=upwork) shows no way to reach Jerome off Upwork on any page it clicks through to: no Message button, no email
address, no socials but those marked for proposal pages, no handoff from Ask to Message, and the Upwork line in
their place. A normal visit is unchanged. No cookie is set for it."""
from playwright.sync_api import sync_playwright
from common import BASE, CHROME, check, finish, sql

def routes(pg):
    """The contact routes a visitor can see on the page right now."""
    return pg.evaluate("""() => {
      const seen = (e) => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
      const links = [...document.querySelectorAll('a')].filter(seen).map(a => a.getAttribute('href') || '');
      return {
        message: links.filter(h => h.split('?')[0] === '/message').length,
        mail: links.filter(h => h.startsWith('mailto:')).length,
        discord: links.filter(h => h.includes('discord.com')).length,
        upworkLine: [...document.querySelectorAll('.on-up')].filter(seen).length,
        text: document.body.innerText,
      };
    }""")

def clean(name, pg):
    r = routes(pg)
    check(f"{name}: no Message, email or Discord", r["message"] == 0 and r["mail"] == 0 and r["discord"] == 0, str({k: v for k, v in r.items() if k != "text"}))
    check(f"{name}: no email address in the text", "@jeromebadour.com" not in r["text"])
    return r

sql("delete from proposals")
sql("insert into proposals (slug, title, job_url, note, proofs) values ('upwork-rule-check', 'Upwork rule check', "
    "'https://www.upwork.com/jobs/~09', 'A short note for the client.', '{shop,console,distill}')")

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)

    # 1. A normal visit keeps every contact route.
    n = b.new_page(viewport={"width": 1440, "height": 900})
    n.goto(BASE + "/work/w3arena/shop")
    r = routes(n)
    check("a normal visit: Message, email and Discord all there", r["message"] >= 1 and r["mail"] >= 1 and r["discord"] >= 1, str({k: v for k, v in r.items() if k != "text"}))
    check("a normal visit: no Upwork line", r["upworkLine"] == 0)
    n.goto(BASE + "/message")
    check("a normal visit: the Message form is there", n.is_visible("form.m-form"))

    # 2. From a proposal page, clicking through.
    ctx = b.new_context(viewport={"width": 1440, "height": 900}); u = ctx.new_page()
    u.goto(BASE + "/for/upwork-rule-check")
    clean("the proposal page", u)
    u.click(".f-proof a[href='/work/w3arena/shop']"); u.wait_for_load_state()
    check("a proof link carries the mode on", "via=upwork" in u.url, u.url)
    r = clean("a work page reached from it", u)
    check("a work page reached from it: the Upwork line in the footer", r["upworkLine"] >= 1)
    u.click(".e-crumb a[href^='/work/w3arena'], .w-crumb a[href^='/work/w3arena']"); u.wait_for_load_state()
    clean("the next page, one more click on", u)
    u.click(".e-brand"); u.wait_for_load_state()
    check("the mode survives back to the home page", "via=upwork" in u.url, u.url)
    clean("the home page in Upwork mode", u)
    u.fill(".e-ask input", "Have you built a shop?"); u.click(".e-ask button"); u.wait_for_url("**/ask**")
    check("Ask from the home box keeps the mode", "via=upwork" in u.url, u.url)
    u.wait_for_selector(".k-next, .k-note", timeout=30000)
    r = clean("Ask's answer", u)
    check("Ask's answer: Hire on Upwork in place of the handoff to Message", r["upworkLine"] >= 1 and not u.is_visible("a[href^='/message']"))
    u.goto(BASE + "/message?via=upwork")
    clean("the Message page in Upwork mode", u)
    check("the Message page in Upwork mode: no form, the Upwork line", not u.is_visible("form.m-form") and u.is_visible(".m-upwork"))
    u.goto(BASE + "/about?via=upwork")
    clean("About in Upwork mode", u)

    # 3. The link for the Upwork portfolio piece.
    v = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
    v.goto(BASE + "/?via=upwork")
    clean("the home page from the portfolio link", v)
    for path in ["/work/w3arena", "/work/distill", "/services", "/how-i-work"]:
        v.goto(BASE + path + "?via=upwork"); clean(path + " in Upwork mode", v)

    # 4. On a phone too, and without a cookie.
    ph = b.new_context(viewport={"width": 390, "height": 844}).new_page()
    ph.goto(BASE + "/work/w3arena/forum?via=upwork")
    clean("a phone in Upwork mode", ph)
    check("Upwork mode sets no cookie", not ctx.cookies() or all(c["name"] == "__Host-v" for c in ctx.cookies()), str([c["name"] for c in ctx.cookies()]))
    b.close()

finish()
