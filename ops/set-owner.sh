#!/usr/bin/env bash
# Sets the owner's sign-in email and password on the box, as root (installed to /opt/sites/tools/jeromebadour/ by
# scripts/deploy.sh):
#
#   set-owner.sh <email> <password-file>
#
# Runs ops/set-owner.mjs inside the image the site is running now, on the site's own network: nothing is built and
# the database is not migrated (a plain `docker compose run` would build an untagged image first). The password is
# the file's first line, read from standard input, never from a command line; the database password is passed by
# name only, so it never shows in the process list. The password file is shredded afterwards, whatever happens.
set -euo pipefail
[ $# -eq 2 ] || { echo "usage: set-owner.sh <email> <password-file>" >&2; exit 1; }
email=$1 file=$2
[ -s "$file" ] || { echo "set-owner: no password file at $file" >&2; exit 1; }
trap 'shred -u "$file" 2>/dev/null && echo "set-owner: $file shredded"' EXIT

env_file=${SITE_ENV:-/srv/jeromebadour/.env}
if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  POSTGRES_PASSWORD=$(grep -m1 '^POSTGRES_PASSWORD=' "$env_file" | cut -d= -f2-)
fi
[ -n "$POSTGRES_PASSWORD" ] || { echo "set-owner: no POSTGRES_PASSWORD in $env_file" >&2; exit 1; }

app=$(docker ps -q --filter label=com.docker.compose.project=jeromebadour --filter label=com.docker.compose.service=app)
[ -n "$app" ] || { echo "set-owner: the site is not running" >&2; exit 1; }
image=$(docker inspect -f '{{.Config.Image}}' "$app")
network=$(docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}} {{end}}' "$app" | awk '{print $1}')

export OWNER_EMAIL=$email OWNER_DATABASE_URL="postgres://postgres:${POSTGRES_PASSWORD}@db:5432/site"
echo "set-owner: using $image"
head -n1 "$file" | tr -d '\r' | docker run --rm -i --network "$network" -e OWNER_EMAIL -e OWNER_DATABASE_URL "$image" node ops/set-owner.mjs
