#!/usr/bin/env bash
# Deletes what is past its time (Privacy Policy section 7) with the database's own purge_expired(), daily
# (ops/systemd/jeromebadour-purge.timer, as root on the box; installed by scripts/deploy.sh). Prints what it deleted.
set -euo pipefail
db=$(docker ps -q --filter label=com.docker.compose.project=jeromebadour --filter label=com.docker.compose.service=db)
[ -n "$db" ] || { echo "purge: the database container is not running" >&2; exit 1; }
echo "purge: $(docker exec "$db" psql -X -At -U postgres -d site -v ON_ERROR_STOP=1 -c 'select purge_expired()')"
