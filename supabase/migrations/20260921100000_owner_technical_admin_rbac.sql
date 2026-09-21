-- Server-backed roles for MYNORA administration. Existing business data and user IDs are preserved.

alter table public.admin_users
  add column if not exists role text not null default 'technical_admin';

alter table public.admin_users
  drop constraint if exists admin_users_role_check;
alter table public.admin_users
  add constraint admin_users_role_check check (role in ('owner', 'technical_admin'));

update public.admin_users
set role = 'technical_admin', display_name = coalesce(display_name, 'Nhi Nguyễn'), is_active = true
where lower(email) = 'nguyennhiphuong154@gmail.com';

insert into public.admin_users (email, display_name, is_active, role)
select 'mynorabaker@gmail.com', 'MYNORA', true, 'owner'
where not exists (
  select 1 from public.admin_users where lower(email) = 'mynorabaker@gmail.com'
);

update public.admin_users
set role = 'owner', display_name = 'MYNORA', is_active = true
where lower(email) = 'mynorabaker@gmail.com';

create or replace function private.current_admin_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select a.role
  from public.admin_users a
  where (select auth.uid()) is not null
    and a.is_active
    and lower(a.email) = lower((select auth.jwt()) ->> 'email')
  limit 1
$$;

revoke all on function private.current_admin_role() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.current_admin_role() to authenticated;

drop policy if exists admin_users_read_own_record on public.admin_users;
drop policy if exists admin_users_active_admin_read on public.admin_users;
drop policy if exists admin_users_owner_insert on public.admin_users;
drop policy if exists admin_users_owner_update on public.admin_users;
drop policy if exists admin_users_owner_delete on public.admin_users;

create policy admin_users_active_admin_read
on public.admin_users for select to authenticated
using ((select private.current_admin_role()) in ('owner', 'technical_admin'));

create policy admin_users_owner_insert
on public.admin_users for insert to authenticated
with check ((select private.current_admin_role()) = 'owner');

create policy admin_users_owner_update
on public.admin_users for update to authenticated
using ((select private.current_admin_role()) = 'owner')
with check ((select private.current_admin_role()) = 'owner');

create policy admin_users_owner_delete
on public.admin_users for delete to authenticated
using ((select private.current_admin_role()) = 'owner');

grant select, insert, update, delete on public.admin_users to authenticated;
grant usage, select on sequence public.admin_users_id_seq to authenticated;

create or replace function private.protect_mynora_owner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' and old.role = 'owner' and old.is_active
     and not exists (select 1 from public.admin_users a where a.id <> old.id and a.role = 'owner' and a.is_active) then
    raise insufficient_privilege using message = 'MYNORA must always have an active Owner';
  end if;

  if tg_op = 'UPDATE' and old.role = 'owner' and old.is_active
     and (new.role <> 'owner' or not new.is_active)
     and not exists (select 1 from public.admin_users a where a.id <> old.id and a.role = 'owner' and a.is_active) then
    raise insufficient_privilege using message = 'MYNORA must always have an active Owner';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end
$$;

drop trigger if exists admin_users_protect_owner on public.admin_users;
create trigger admin_users_protect_owner
before update or delete on public.admin_users
for each row execute function private.protect_mynora_owner();
revoke all on function private.protect_mynora_owner() from public, anon, authenticated;

create or replace function private.protect_business_owner_email()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.key = 'contact'
     and coalesce(new.value ->> 'email', '') is distinct from coalesce(old.value ->> 'email', '')
     and (select private.current_admin_role()) is distinct from 'owner' then
    raise insufficient_privilege using message = 'Only the Owner can change the business email';
  end if;
  return new;
end
$$;

drop trigger if exists site_settings_protect_business_email on public.site_settings;
create trigger site_settings_protect_business_email
before update on public.site_settings
for each row execute function private.protect_business_owner_email();
revoke all on function private.protect_business_owner_email() from public, anon, authenticated;

comment on column public.admin_users.role is 'Server-side MYNORA role: owner or technical_admin';
