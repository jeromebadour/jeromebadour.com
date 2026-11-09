-- Empties the site's tables between browser suites, so each one starts from a fresh database. Run as the owner role.
-- The owner account stays (scripts/test-e2e.sh sets it once with ops/set-owner.mjs).
delete from owner_sessions;
delete from audit_log;
delete from sign_in_failures;
delete from limit_hits;
delete from questions;
delete from ask_spend;
delete from messages;
delete from proposals;
delete from visits_daily;
update brakes set paused = false, reason = null;
delete from socials;
insert into socials (kind, label, url, on_proposals, sort) values
  ('discord', 'Discord', 'https://discord.com/users/792855756872613958', false, 1),
  ('github', 'GitHub', 'https://github.com/jeromebadour', true, 2),
  ('upwork', 'Upwork', 'https://www.upwork.com/freelancers/~018fb626b478552f9f', true, 3);
