-- obl-portal: bootstrap a profile row on every new auth.users insert.
-- Independent of the existing on_auth_user_created → handle_new_user() trigger;
-- multiple triggers on the same event are allowed and run in name order.

begin;

create or replace function public.obl_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.obl_profiles (id, email, name, invited_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists obl_on_auth_user_created on auth.users;

create trigger obl_on_auth_user_created
  after insert on auth.users
  for each row execute function public.obl_handle_new_user();

commit;
