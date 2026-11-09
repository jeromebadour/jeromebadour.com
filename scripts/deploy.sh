#!/usr/bin/env bash
# Deploys one commit of jeromebadour.com on the Freelance box. Run as root:
#
#   /srv/jeromebadour/app/scripts/deploy.sh <commit>          deploy it
#   /srv/jeromebadour/app/scripts/deploy.sh <commit> --check  only say whether it may be deployed
#
# It refuses unless: this is the Freelance box, the commit is on main, and CI passed on it (both jobs, read from
# GitHub). Then it moves the checkout forward to that commit, builds and starts it, waits for the health check,
# checks the public site, and installs the site's timers (visits, purge, backups, restore test).
# The build log goes to /srv/jeromebadour/deploy-logs/. The running version is only replaced once the new image has built;
# a failed build leaves it untouched.
#
# The whole script lives in main(), which bash reads in full before running anything: the deploy moves this very file
# forward, and a script edited while it runs must not pick up the new lines halfway.

main() {
  set -uo pipefail
  local box=vmi3464201 app=/srv/jeromebadour/app env=/srv/jeromebadour/.env logs=/srv/jeromebadour/deploy-logs tools=/opt/sites/tools/jeromebadour
  local repo=jeromebadour/jeromebadour.com site=https://jeromebadour.com

  stop() { echo "STOPPED: $*"; exit 1; }
  as_app() { sudo -u jeromebadour git -C "$app" "$@"; }

  [ "$(hostname)" = "$box" ] || stop "this is $(hostname), not the Freelance box ($box)"
  [ "$(id -u)" = 0 ] || stop "run it as root"
  [ $# -ge 1 ] || stop "which commit? e.g. scripts/deploy.sh 6e4c52e"
  local want=$1 only_check=${2:-}

  echo "== fetching"
  as_app fetch --quiet origin main || stop "git fetch failed"
  local sha
  sha=$(as_app rev-parse --verify --quiet "$want^{commit}") || stop "no commit $want on GitHub"
  as_app merge-base --is-ancestor "$sha" origin/main || stop "$want is not on main"
  local short=${sha:0:7}
  local live
  live=$(docker inspect -f '{{.Config.Image}}' "$(docker compose --env-file "$env" -f "$app/compose.yaml" ps -q app 2>/dev/null)" 2>/dev/null)
  echo "   live now: ${live:-nothing running}   asked: $short"

  echo "== CI on $short"
  local ci
  ci=$(curl -fsS "https://api.github.com/repos/$repo/commits/$sha/check-runs" | python3 -c '
import json, sys
runs = json.load(sys.stdin)["check_runs"]
for r in runs: print("   " + r["name"] + ": " + r["status"] + " " + (r["conclusion"] or ""))
ok = len(runs) >= 2 and all(r["status"] == "completed" and r["conclusion"] == "success" for r in runs)
print("PASSED" if ok else "NOT PASSED")') || stop "could not read CI from GitHub"
  echo "$ci" | grep -v '^PASSED$\|^NOT PASSED$'
  [ "$(echo "$ci" | tail -1)" = PASSED ] || stop "CI has not passed on $short: nothing deployed"
  echo "   passed"

  if [ "$only_check" = --check ]; then echo "OK: $short may be deployed (nothing changed)"; exit 0; fi

  echo "== moving the checkout to $short"
  local before
  before=$(sha256sum < "$app/scripts/deploy.sh")
  as_app merge --ff-only --quiet "$sha" || stop "could not move forward to $short (local changes on the box?)"
  [ "$(as_app rev-parse HEAD)" = "$sha" ] || stop "checkout is not at $short"
  # This file may have moved forward with the checkout. The copy running now is the old one, so it would skip any step
  # the new one adds: hand over to the new copy, once, and let it do the whole deploy.
  if [ -z "${DEPLOY_HANDED_OVER:-}" ] && [ "$(sha256sum < "$app/scripts/deploy.sh")" != "$before" ]; then
    echo "   this deploy script changed in $short: continuing with the new one"
    DEPLOY_HANDED_OVER=1 exec bash "$app/scripts/deploy.sh" "$@"
  fi

  mkdir -p "$logs"
  local log
  log="$logs/$(date -u +%Y%m%d-%H%M)-$short.log"
  echo "== building and starting (about a minute; log: $log)"
  cd "$app" || stop "no $app"
  APP_COMMIT=$short docker compose --env-file "$env" up -d --build 2>&1 | tee "$log"
  [ "${PIPESTATUS[0]}" = 0 ] || stop "build or start failed (see $log); the running version was not replaced if the build failed"

  echo "== waiting for the health check"
  local id state=""
  id=$(docker compose --env-file "$env" ps -q app)
  for _ in $(seq 1 40); do
    state=$(docker inspect -f '{{.State.Health.Status}}' "$id" 2>/dev/null)
    echo "   health: $state"
    [ "$state" = healthy ] && break
    [ "$state" = unhealthy ] && break
    sleep 3
  done
  [ "$state" = healthy ] || stop "the app is not healthy (docker compose --env-file $env logs app)"

  local image code
  image=$(docker inspect -f '{{.Config.Image}}' "$id")
  [ "$image" = "jeromebadour-app:$short" ] || stop "running $image, expected jeromebadour-app:$short"
  code=$(curl -s -o /dev/null -w '%{http_code}' "$site/api/health")
  [ "$code" = 200 ] || stop "$site/api/health answered $code"

  # The site's timers, installed from this commit: visits every 15 minutes, the purge hourly, the nightly backup and
  # the weekly restore test. The visits and the purge run once now, so the console is current at once.
  echo "== the site's timers"
  install -d -m 755 "$tools"
  install -m 755 "$app/ops/visits.py" "$app/ops/purge.sh" "$app/ops/backup.sh" "$app/ops/restore-test.sh" "$app/ops/set-owner.sh" "$tools/"
  install -m 644 "$app/ops/offsite.sh" "$tools/"
  install -m 644 "$app"/ops/systemd/jeromebadour-*.service "$app"/ops/systemd/jeromebadour-*.timer /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable --now --quiet jeromebadour-visits.timer jeromebadour-purge.timer jeromebadour-backup.timer jeromebadour-restore-test.timer \
    || stop "the site's timers would not start"
  /usr/bin/python3 "$tools/visits.py" || stop "the visit count failed (journalctl -u jeromebadour-visits -n 20)"
  "$tools/purge.sh" || stop "the purge failed (journalctl -u jeromebadour-purge -n 20)"
  echo "   next backup $(systemctl show jeromebadour-backup.timer -p NextElapseUSecRealtime --value)"
  echo "DEPLOYED $short: $image healthy, $site/api/health 200, timers running"
}

main "$@"; exit
