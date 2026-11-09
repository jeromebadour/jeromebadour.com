"""Shared by the browser suites: the base address, a check() that records results, and psql as the database owner.

Env: BASE_URL (default http://localhost:3102); PGHOST / PGPORT / PGUSER / PGPASSWORD / PGDATABASE for the owner
connection; OWNER_EMAIL and OWNER_PASSWORD for the owner account scripts/test-e2e.sh set; CHROME (optional).
"""
import os
import subprocess
import sys

BASE = os.environ.get("BASE_URL", "http://localhost:3102")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "jerome@example.com")
OWNER_PASSWORD = os.environ.get("OWNER_PASSWORD", "test-password-123")
CHROME = os.environ.get("CHROME") or None
results = []


def check(name, ok, detail=""):
    results.append((name, ok))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))


def sql(q):
    return subprocess.run(["psql", "-X", "-At", "-c", q], capture_output=True, text=True).stdout.strip()


def sign_in(pg, password=None):
    pg.goto(BASE + "/sign-in")
    pg.fill("input[name=email]", OWNER_EMAIL)
    pg.fill("input[name=password]", password or OWNER_PASSWORD)
    pg.click("button[type=submit]")


def finish():
    passed = sum(1 for _, ok in results if ok)
    print(f"{passed} of {len(results)} passed")
    sys.exit(0 if passed == len(results) else 1)
