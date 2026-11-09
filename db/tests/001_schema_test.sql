-- Proves the schema's promises. Run on a fresh database after the migrations; any failed check stops with an error.
-- Setup runs as the owner; every check after `set role` runs as site_app, the role the app uses.
\set ON_ERROR_STOP on

insert into owner_account (email, password_hash) values ('jerome@example.com', 'x');
insert into messages (token_hash, name, email, brief, how_soon) values
  (digest('t1', 'sha256'), 'Daniel Moreau', 'daniel@example.com', 'Payments for my web app, please.', 'this_month');
insert into questions (question, answer, points) values ('Have you built a payment system?', '{"points": []}', 4);
insert into questions (question, created_at) values ('old question', now() - interval '31 days');
insert into messages (token_hash, name, email, brief, how_soon, created_at) values
  (digest('t2', 'sha256'), 'Old Sender', 'old@example.com', 'An old message, a year ago.', 'no_rush', now() - interval '13 months');
insert into limit_hits (kind, visitor_key, at) values ('ask', 'v1', now() - interval '25 hours'), ('ask', 'v1', now());

set role site_app;

-- 1. The app can't create a second owner, change the owner, or touch the schema.
do $$ begin
  begin
    insert into owner_account (email, password_hash) values ('other@example.com', 'x');
    raise exception 'site_app created an owner';
  exception when insufficient_privilege then null; end;
  begin
    update owner_account set email = 'x@example.com';
    raise exception 'site_app changed the owner';
  exception when insufficient_privilege then null; end;
  begin
    execute 'create table sneaky (id int)';
    raise exception 'site_app created a table';
  exception when insufficient_privilege then null; end;
end $$;

-- 2. The audit log is append-only for the app.
insert into audit_log (action, target) values ('message.read', 'x');
do $$ begin
  begin
    update audit_log set action = 'message.forged';
    raise exception 'site_app edited the audit log';
  exception when insufficient_privilege then null; end;
  begin
    delete from audit_log;
    raise exception 'site_app deleted the audit log';
  exception when insufficient_privilege then null; end;
  begin
    insert into audit_log (action) values ('Not An Action');
    raise exception 'a malformed action was logged';
  exception when check_violation then null; end;
end $$;

-- 3. Messages: a status follows its facts; the app can't delete a message.
do $$ begin
  begin
    update messages set status = 'read' where name = 'Daniel Moreau';
    raise exception 'read without read_at';
  exception when check_violation then null; end;
  update messages set status = 'read', read_at = now() where name = 'Daniel Moreau';
  begin
    update messages set status = 'replied' where name = 'Daniel Moreau';
    raise exception 'replied without a reply';
  exception when check_violation then null; end;
  update messages set status = 'replied', reply = 'Thanks, here is my plan.', replied_at = now() where name = 'Daniel Moreau';
  begin
    delete from messages;
    raise exception 'site_app deleted a message';
  exception when insufficient_privilege then null; end;
  begin
    insert into messages (token_hash, name, email, brief, how_soon) values (digest('t3', 'sha256'), 'X', 'NOT@LOWER.COM', 'A long enough brief.', 'no_rush');
    raise exception 'an uppercase email was stored';
  exception when check_violation then null; end;
  assert (select link_until::date from messages where name = 'Daniel Moreau') = (now() + interval '90 days')::date,
    'the status link is not open 90 days';
end $$;

-- 4. Questions: refused or failed ones carry no points; the app can't delete one.
do $$ begin
  begin
    insert into questions (question, refused, points) values ('poem', true, 2);
    raise exception 'a refused question had points';
  exception when check_violation then null; end;
  begin
    insert into questions (question) values (repeat('x', 501));
    raise exception 'a question over 500 characters was stored';
  exception when check_violation then null; end;
  begin
    delete from questions;
    raise exception 'site_app deleted a question';
  exception when insufficient_privilege then null; end;
end $$;

-- 5. Proposal pages: exactly three proofs, a clean address, an Upwork job link.
do $$ begin
  insert into proposals (slug, title, job_url, note, proofs)
  values ('payments-booking-app', 'Payments for a booking web app', 'https://www.upwork.com/jobs/~01', 'A short note for the client.', '{Shop,"Admin console","Distill tests"}');
  begin
    insert into proposals (slug, title, job_url, note, proofs) values ('two-proofs', 'Two proofs only', 'https://www.upwork.com/jobs/~02', 'A short note for the client.', '{Shop,"Admin console"}');
    raise exception 'a page with two proofs was stored';
  exception when check_violation then null; end;
  begin
    insert into proposals (slug, title, job_url, note, proofs) values ('Bad Slug', 'Bad address', 'https://www.upwork.com/jobs/~03', 'A short note for the client.', '{a,b,c}');
    raise exception 'a bad address was stored';
  exception when check_violation then null; end;
  begin
    insert into proposals (slug, title, job_url, note, proofs) values ('elsewhere', 'Not on Upwork', 'https://example.com/job', 'A short note for the client.', '{a,b,c}');
    raise exception 'a job link off Upwork was stored';
  exception when check_violation then null; end;
end $$;

-- 6. Brakes: a pause needs a reason; resuming clears it.
do $$ begin
  begin
    update brakes set paused = true where name = 'ask';
    raise exception 'a pause without a reason';
  exception when check_violation then null; end;
  update brakes set paused = true, reason = 'Spend check' where name = 'ask';
  update brakes set paused = false, reason = null where name = 'ask';
  assert (select count(*) from brakes) = 3, 'brakes missing';
  assert (select count(*) from socials) = 3, 'the three socials are not seeded';
end $$;

-- 7. Retention: purge_expired deletes what is past its time and nothing else.
do $$
declare r jsonb;
begin
  r := purge_expired();
  assert (r->>'questions')::int = 1, 'old question not purged';
  assert (r->>'messages')::int = 1, 'old message not purged';
  assert (r->>'limits')::int = 1, 'old limit hit not purged';
  assert (select count(*) from questions) = 1, 'a recent question was purged';
  assert (select count(*) from messages) = 1, 'a recent message was purged';
  assert (select count(*) from limit_hits) = 1, 'a recent limit hit was purged';
end $$;

reset role;
\echo 001 schema ok
