-- The days this site was deployed, for the home page's service board. Written only by scripts/deploy.sh as the
-- database owner (one row per deployed commit, from the deploy logs); the app can only read it.
create table deploys (
  commit text primary key check (commit ~ '^[0-9a-f]{7}$'),
  at timestamptz not null
);
grant select on deploys to site_app;

-- The last good copy of each outside feed the home page reads (W3Arena's public changelog for now), so a feed that is
-- down or changes shape never empties the board. The app reads and refreshes it (at most once an hour).
create table feeds (
  name text primary key check (name ~ '^[a-z0-9-]{1,40}$'),
  body jsonb not null,
  fetched_at timestamptz not null default now()
);
grant select, insert, update on feeds to site_app;
