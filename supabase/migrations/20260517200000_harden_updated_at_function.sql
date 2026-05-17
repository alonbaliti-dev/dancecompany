-- Harden shared trigger function search_path.
-- Safe additive migration; apply locally and review before remote rollout.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
