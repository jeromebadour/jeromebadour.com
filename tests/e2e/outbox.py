"""The emails the site wrote to EMAIL_OUTBOX (no Resend in tests). OUTBOX is the same folder on this machine (CI mounts
it into the site's container)."""
import glob
import json
import os
import re
import time

OUTBOX = os.environ.get("OUTBOX", "/tmp/site-outbox")


def emails_to(address):
    found = []
    for path in glob.glob(os.path.join(OUTBOX, "*.json")):
        with open(path) as f:
            mail = json.load(f)
        if mail["to"].lower() == address.lower():
            found.append((os.path.getmtime(path), path, mail))
    return [m for _, _, m in sorted(found, key=lambda x: (x[0], x[1]))]


def newest(address, after=0, wait=10):
    """The newest email to `address` once there are more than `after`; waits up to `wait` seconds for it."""
    end = time.time() + wait
    while time.time() < end:
        mails = emails_to(address)
        if len(mails) > after:
            return mails[-1]
        time.sleep(0.2)
    raise SystemExit(f"no email to {address} (had {after})")


def link(mail, path):
    """The first link in an email's text that goes to `path` (e.g. '/m/')."""
    m = re.search(r"https?://[^\s]+" + re.escape(path) + r"[^\s]*", mail["text"])
    return m.group(0) if m else None
