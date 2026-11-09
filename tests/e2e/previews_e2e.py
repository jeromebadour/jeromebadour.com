"""Link previews: every public page has its own title, line and card; private pages have none; a preview fetch of a
proposal page is not an open, and an off page has no card."""
import re
import struct
import urllib.request
from common import BASE, check, finish, sql

DISCORD = "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)"
BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"


def get(path, ua=BROWSER):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": ua})
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.headers.get("content-type", ""), r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("content-type", ""), b""


def tags(html):
    t = {}
    for k, v in re.findall(rb'<meta (?:property|name)="((?:og|twitter):[a-z:_]+|description)" content="([^"]*)"', html):
        t.setdefault(k.decode(), v.decode())
    return t


def png_size(body):
    return struct.unpack(">II", body[16:24]) if body[:8] == b"\x89PNG\r\n\x1a\n" else None


# 1. Each public page: its own title and line, a card that is a real 1200 x 630 PNG.
pages = {
    "/": "Websites, web apps", "/work/w3arena": "An online gaming", "/work/w3arena/shop": "A complete shop",
    "/work/w3arena/reliability": "A standby kept in sync", "/work/distill": "AI summaries you can check",
    "/services": "From a quick bug fix", "/how-i-work": "things I do on every job", "/about": "I build and run live products",
    "/ask": "Answers come from", "/message": "A short brief", "/privacy": "Last updated", "/terms": "Last updated",
}
titles = set()
for path, line in pages.items():
    status, _, html = get(path)
    t = tags(html)
    titles.add(t.get("og:title"))
    check(f"{path}: its own line", line in t.get("description", "") and t.get("og:description") == t.get("description"), t.get("description", ""))
    img = t.get("og:image", "")
    check(f"{path}: a summary_large_image card", t.get("twitter:card") == "summary_large_image" and "/og/" in img, img)
    s, ctype, body = get(img.replace(re.match(r"https?://[^/]+", img).group(0), "") if img else "/og/none")
    check(f"{path}: the card is a 1200 x 630 PNG", s == 200 and ctype == "image/png" and png_size(body) == (1200, 630), f"{s} {ctype}")
check("every page's preview title is its own", len(titles) == len(pages), str(len(titles)))
check("an unknown card is a 404", get("/og/no-such-card")[0] == 404)

# 2. Private pages have no preview.
for path in ["/sign-in"]:
    check(f"{path}: no preview", "og:image" not in tags(get(path)[2]))

# 3. A proposal page: the job, its note, its own card; a preview fetch is not an open, a person's visit is.
sql("delete from proposals")
sql("insert into proposals (slug, title, job_url, note, proofs, headlines) values ('preview-test-job', 'Preview test job', "
    "'https://www.upwork.com/jobs/~03', 'A short note for the client.', '{shop,console,distill}', '{\"A headline\",\"\",\"\"}')")
status, _, html = get("/for/preview-test-job", DISCORD)
t = tags(html)
check("the preview has the job's title and the note", t.get("og:title") == "For your job: Preview test job" and t.get("og:description") == "A short note for the client.", str(t.get("og:title")))
s, ctype, body = get("/og/for-preview-test-job", DISCORD)
check("the proposal's card is a 1200 x 630 PNG", s == 200 and png_size(body) == (1200, 630), f"{s} {ctype}")
check("preview fetches are not opens", sql("select opens from proposals") == "0", sql("select opens from proposals"))
get("/for/preview-test-job")
check("a person's visit is an open", sql("select opens from proposals") == "1", sql("select opens from proposals"))
sql("update proposals set is_on = false")
check("an off page has no card", get("/og/for-preview-test-job")[0] == 404)
sql("update proposals set is_on = true; update brakes set paused = true, reason = 'Away' where name = 'proposals'")
check("a paused page has no card", get("/og/for-preview-test-job")[0] == 404)
sql("update brakes set paused = false, reason = null")

finish()
