-- jeromebadour.com: the whole schema, first version.
--
-- Run as the database owner (the migration role). The app connects as `site_app`, which owns nothing and only gets the
-- grants at the bottom of this file. Visitors have no accounts: the only person who signs in is the owner, to /admin.
-- Retention (Privacy Policy section 7) is enforced by purge_expired(), which the app calls on a timer.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------------------------------------------
-- The owner and his sessions

create table owner_account (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique check (email = lower(email) and email like '%_@_%'),
  password_hash text not null,
  created_at    timestamptz not null default now()
);
-- Exactly one owner.
create unique index owner_account_one on owner_account ((true));

create table owner_sessions (
  -- The cookie holds a random token; only its SHA-256 is stored, so a database leak can't sign anyone in.
  token_hash   bytea primary key check (length(token_hash) = 32),
  owner_id     uuid not null references owner_account(id) on delete cascade,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '14 days'
);

-- Wrong passwords, counted per visitor key, so sign-in can't be guessed at speed.
create table sign_in_failures (
  visitor_key text not null,
  at          timestamptz not null default now()
);
create index sign_in_failures_key on sign_in_failures (visitor_key, at);

-- ---------------------------------------------------------------------------------------------------------------
-- Every owner action, on record (BUILD-RULES section 3). Never edited, never deleted by the app.

create table audit_log (
  id     bigint generated always as identity primary key,
  at     timestamptz not null default now(),
  action text not null check (action ~ '^[a-z_]+\.[a-z_]+$'),
  target text,
  detail jsonb not null default '{}'
);
create index audit_log_at on audit_log (at desc, id desc);

-- ---------------------------------------------------------------------------------------------------------------
-- Limits: one row per use of something limited (a question, a message, a sign-in), per visitor key. A visitor key is
-- an anonymous cookie id or an IP address, kept only to count uses and deleted after a day.

create type limited_kind as enum ('ask', 'message');

create table limit_hits (
  kind        limited_kind not null,
  visitor_key text not null check (length(visitor_key) between 1 and 100),
  at          timestamptz not null default now()
);
create index limit_hits_key on limit_hits (kind, visitor_key, at);

-- ---------------------------------------------------------------------------------------------------------------
-- Ask about my work

create table questions (
  id          uuid primary key default gen_random_uuid(),
  question    text not null check (length(question) between 1 and 500),
  -- The answer as shown: [{ "t": text, "proofs": [label, ...] }, ...] and a closing line. Empty when refused.
  answer      jsonb not null default '{}',
  points      int not null default 0 check (points >= 0),
  refused     boolean not null default false,
  failed      boolean not null default false,
  created_at  timestamptz not null default now(),
  check (not (refused and failed)),
  -- A refused or failed question has no points.
  check (not (refused or failed) or points = 0)
);
create index questions_created on questions (created_at desc, id desc);

-- What each call to the model cost. Holds no text, so it outlives the questions (spend caps are per month).
create table ask_spend (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  input_tokens  int not null check (input_tokens >= 0),
  output_tokens int not null check (output_tokens >= 0),
  usd         numeric(10, 6) not null check (usd >= 0)
);
create index ask_spend_at on ask_spend (at);

-- ---------------------------------------------------------------------------------------------------------------
-- Messages and their status pages

create type message_status as enum ('new', 'read', 'replied');
create type message_soon as enum ('this_week', 'this_month', 'no_rush');

create table messages (
  id            uuid primary key default gen_random_uuid(),
  -- The status link holds a random token; only its SHA-256 is stored.
  token_hash    bytea not null unique check (length(token_hash) = 32),
  -- The reply email carries its own link (the first token isn't kept, so it can't be sent again); both open the page.
  reply_token_hash bytea unique check (reply_token_hash is null or length(reply_token_hash) = 32),
  name          text not null check (length(name) between 1 and 80),
  email         text not null check (email = lower(email) and email like '%_@_%.%' and length(email) <= 200),
  brief         text not null check (length(brief) between 10 and 4000),
  built_with    text[] not null default '{}' check (cardinality(built_with) <= 6),
  how_soon      message_soon not null,
  from_question text check (from_question is null or length(from_question) <= 500),
  status        message_status not null default 'new',
  read_at       timestamptz,
  reply         text check (reply is null or length(reply) between 1 and 8000),
  replied_at    timestamptz,
  created_at    timestamptz not null default now(),
  -- The status link stays open 90 days, then shows "This message is closed" (plan §7).
  link_until    timestamptz not null default now() + interval '90 days',
  check ((status = 'new') = (read_at is null)),
  check ((status = 'replied') = (reply is not null and replied_at is not null))
);
create index messages_created on messages (created_at desc, id desc);

-- ---------------------------------------------------------------------------------------------------------------
-- Proposal pages (/for/<slug>)

create table proposals (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 60),
  title      text not null check (length(title) between 3 and 120),
  job_url    text not null check (job_url ~ '^https://www\.upwork\.com/'),
  note       text not null check (length(note) between 10 and 400),
  -- Exactly three proofs, by their label in the site's proof list.
  proofs     text[] not null check (cardinality(proofs) = 3),
  is_on      boolean not null default true,
  opens      int not null default 0 check (opens >= 0),
  created_at timestamptz not null default now()
);
create index proposals_created on proposals (created_at desc, id desc);

-- ---------------------------------------------------------------------------------------------------------------
-- Brakes: each public feature can be paused, with a reason (plan §9).

create type brake_name as enum ('ask', 'messages', 'proposals');

create table brakes (
  name       brake_name primary key,
  paused     boolean not null default false,
  reason     text check (reason is null or length(reason) between 3 and 200),
  changed_at timestamptz not null default now(),
  check (paused = (reason is not null))
);
insert into brakes (name) values ('ask'), ('messages'), ('proposals');

-- ---------------------------------------------------------------------------------------------------------------
-- Socials shown under the name, in the footer and on About

create type social_kind as enum ('discord', 'github', 'upwork', 'linkedin', 'x', 'youtube', 'other');

create table socials (
  id            uuid primary key default gen_random_uuid(),
  kind          social_kind not null,
  label         text not null check (length(label) between 1 and 30),
  url           text not null check (url ~ '^https://'),
  on_proposals  boolean not null default false,
  sort          int not null default 0,
  created_at    timestamptz not null default now()
);
insert into socials (kind, label, url, on_proposals, sort) values
  ('discord', 'Discord', 'https://discord.com/users/792855756872613958', false, 1),
  ('github', 'GitHub', 'https://github.com/jeromebadour', true, 2),
  ('upwork', 'Upwork', 'https://www.upwork.com/freelancers/~018fb626b478552f9f', true, 3);

-- ---------------------------------------------------------------------------------------------------------------
-- Visits: counts per day and page, from Nginx's own log (no IP addresses, no cookies). Filled by ops/visits.py.

create table visits_daily (
  day      date not null,
  path     text not null check (length(path) between 1 and 200),
  -- Where visitors came from, as a site name only ('' when unknown or direct).
  referrer text not null default '' check (length(referrer) <= 100),
  views    int not null check (views > 0),
  primary key (day, path, referrer)
);

-- ---------------------------------------------------------------------------------------------------------------
-- Retention (Privacy Policy section 7). Returns what it deleted, for the log.

create or replace function purge_expired() returns jsonb
language plpgsql security definer set search_path = public as $$
declare q int; m int; l int; s int; f int; v int;
begin
  delete from questions where created_at < now() - interval '30 days';
  get diagnostics q = row_count;
  delete from messages where created_at < now() - interval '12 months';
  get diagnostics m = row_count;
  delete from limit_hits where at < now() - interval '1 day';
  get diagnostics l = row_count;
  delete from owner_sessions where expires_at < now();
  get diagnostics s = row_count;
  delete from sign_in_failures where at < now() - interval '1 day';
  get diagnostics f = row_count;
  delete from visits_daily where day < current_date - 30;
  get diagnostics v = row_count;
  return jsonb_build_object('questions', q, 'messages', m, 'limits', l, 'sessions', s, 'sign_in_failures', f, 'visits', v);
end $$;

-- ---------------------------------------------------------------------------------------------------------------
-- The app's role: no ownership, no DDL, no deletes except where the app must remove rows.

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'site_app') then
    create role site_app login;
  end if;
end $$;

revoke all on all tables in schema public from site_app;
grant usage on schema public to site_app;
grant select on owner_account to site_app;
grant select, insert, update, delete on owner_sessions to site_app;
grant select, insert on sign_in_failures to site_app;
grant insert on audit_log to site_app;
grant select on audit_log to site_app;
grant select, insert, delete on limit_hits to site_app;
grant select, insert, update on questions to site_app;
grant select, insert on ask_spend to site_app;
grant select, insert, update on messages to site_app;
grant select, insert, update on proposals to site_app;
grant select, update on brakes to site_app;
grant select, insert, update, delete on socials to site_app;
grant select on visits_daily to site_app;
grant execute on function purge_expired() to site_app;
