#!/usr/bin/env bash
# Runs the browser suites against a running site (BASE_URL, default http://localhost:3102) that uses the fake Claude
# (tests/e2e/fake_claude.mjs) and the email outbox. PGDATABASE is the site's database, reached as its owner; each
# suite starts from empty tables. The owner account is set once, as the box would set it.
set -uo pipefail
cd "$(dirname "$0")/.."
suites=${*:-owner}
export OWNER_EMAIL=${OWNER_EMAIL:-jerome@example.com} OWNER_PASSWORD=${OWNER_PASSWORD:-test-password-123}
printf '%s\n' "$OWNER_PASSWORD" | OWNER_DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@$PGHOST:${PGPORT:-5432}/$PGDATABASE" \
  node ops/set-owner.mjs || exit 1
failed=0
for suite in $suites; do
  psql -X -q -v ON_ERROR_STOP=1 -f tests/e2e/reset.sql >/dev/null || exit 1
  rm -f "${OUTBOX:-/tmp/site-outbox}"/*.json 2>/dev/null
  echo "== $suite"
  if python3 tests/e2e/${suite}_e2e.py > "/tmp/e2e-$suite.log" 2>&1; then
    grep -E "passed$" "/tmp/e2e-$suite.log"
  else
    grep -E "^FAIL|Error|passed$" "/tmp/e2e-$suite.log" | head -20
    failed=1
  fi
done
exit $failed
