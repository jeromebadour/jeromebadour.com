-- Proposal pages: an optional headline per proof, in the same order as the proofs. Empty means the proof's own title.
alter table proposals add column headlines text[] not null default '{"","",""}'
  check (cardinality(headlines) = 3 and array_position(headlines, null) is null
         and length(headlines[1]) <= 80 and length(headlines[2]) <= 80 and length(headlines[3]) <= 80);
