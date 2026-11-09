#!/usr/bin/env python3
"""Counts the site's visits from Nginx's own log, for the console's Visits tab. Runs on the box every 15 minutes
(systemd timer jeromebadour-visits), as root.

The site's Nginx log keeps no IP address (Privacy Policy 2.5). Its format, set in the site's Nginx file:
    log_format jeromebadour '$time_iso8601\t$request_method\t$uri\t$status\t$http_referer\t$http_user_agent';

Counted: GET requests answered 200 for pages (no files, no /_next, /api, /admin, /sign-in, and never /m/, whose
addresses are private links), not from bots. Where visitors came from is kept as a site name only. Days are Istanbul
days, like the console. Each day found in the logs is written whole (deleted and written again in one transaction),
so running it again changes nothing. Days older than 30 are dropped by the site's own purge.

Env: VISITS_LOGS (default /var/log/nginx/jeromebadour.access.log*), VISITS_PSQL (the psql command; default the
site's database container).
"""
import glob
import gzip
import os
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

ZONE = ZoneInfo("Europe/Istanbul")
LOGS = os.environ.get("VISITS_LOGS", "/var/log/nginx/jeromebadour.access.log*")
PSQL = os.environ.get("VISITS_PSQL", "docker compose -p jeromebadour exec -T db psql -U postgres -d site")
OWN = {"jeromebadour.com"}
SKIP = re.compile(r"^/(_next|api|admin|sign-in|m)(/|$)")
FILE = re.compile(r"\.[a-z0-9]{2,5}$", re.I)
BOT = re.compile(r"bot|crawl|spider|slurp|preview|curl|wget|python|httpclient|headless|monitor|scan", re.I)


def lines():
    for path in sorted(glob.glob(LOGS)):
        opener = gzip.open if path.endswith(".gz") else open
        with opener(path, "rt", encoding="utf-8", errors="replace") as f:
            yield from f


def site_of(referrer):
    if not referrer or referrer == "-":
        return ""
    host = (urlparse(referrer).hostname or "").lower()
    host = host[4:] if host.startswith("www.") else host
    return "" if host in OWN or not host else host[:100]


def count():
    views = Counter()
    for line in lines():
        parts = line.rstrip("\n").split("\t")
        if len(parts) != 6:
            continue
        when, method, uri, status, referrer, agent = parts
        if method != "GET" or status != "200" or SKIP.match(uri) or FILE.search(uri) or BOT.search(agent):
            continue
        try:
            day = datetime.fromisoformat(when).astimezone(ZONE).date().isoformat()
        except ValueError:
            continue
        path = (uri.split("?")[0] or "/")[:200]
        views[(day, path, site_of(referrer))] += 1
    return views


def quote(s):
    return "'" + s.replace("'", "''") + "'"


def main():
    views = count()
    days = sorted({d for d, _, _ in views})
    if not days:
        print("visits: nothing to count")
        return
    sql = ["begin;"]
    sql.append("delete from visits_daily where day in (%s);" % ", ".join(quote(d) for d in days))
    rows = [f"({quote(d)}, {quote(p)}, {quote(r)}, {n})" for (d, p, r), n in sorted(views.items())]
    for i in range(0, len(rows), 500):
        sql.append("insert into visits_daily (day, path, referrer, views) values %s;" % ", ".join(rows[i:i + 500]))
    sql.append("commit;")
    run = subprocess.run(PSQL.split() + ["-X", "-q", "-v", "ON_ERROR_STOP=1"], input="\n".join(sql), text=True, capture_output=True)
    if run.returncode != 0:
        print("visits: the database refused:", run.stderr.strip(), file=sys.stderr)
        sys.exit(1)
    print(f"visits: {sum(views.values())} pages read over {len(days)} day(s) written")


if __name__ == "__main__":
    main()
