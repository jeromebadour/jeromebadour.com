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
