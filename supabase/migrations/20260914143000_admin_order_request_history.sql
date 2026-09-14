create extension if not exists pg_trgm with schema extensions;

create sequence if not exists public.cake_order_request_code_seq;

alter table public.cake_order_requests
  add column request_code text,
  add column admin_note text not null default '',
  add column updated_at timestamptz not null default now(),
  add column customer_name text generated always as (payload->>'customerName') stored,
  add column customer_phone text generated always as (payload->>'phone') stored,
  add column requested_date text generated always as (payload->>'requestedDate') stored;

update public.cake_order_requests
set request_code = 'MYN-' || lpad(nextval('public.cake_order_request_code_seq')::text, 6, '0'),
    status = case status
      when 'pending' then 'new'
      when 'closed' then 'completed'
      else status
    end;

alter table public.cake_order_requests
  alter column request_code set default ('MYN-' || lpad(nextval('public.cake_order_request_code_seq')::text, 6, '0')),
  alter column request_code set not null,
  drop constraint cake_order_requests_status_check,
  add constraint cake_order_requests_request_code_key unique (request_code),
  add constraint cake_order_requests_status_check check (status in ('new','contacted','confirmed','completed','cancelled')),
  add constraint cake_order_requests_admin_note_length check (char_length(admin_note) <= 5000);

create table public.cake_order_request_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.cake_order_requests(id) on delete restrict,
  event_type text not null check (event_type in ('created','status_changed')),
  from_status text,
  to_status text,
  actor_user_id uuid,
  created_at timestamptz not null default now()
);

insert into public.cake_order_request_events(request_id,event_type,to_status,created_at)
select id,'created',status,created_at from public.cake_order_requests;

create schema if not exists private;

create function private.touch_cake_order_request() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create function private.log_cake_order_request_event() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.cake_order_request_events(request_id,event_type,to_status,created_at)
    values(new.id,'created',new.status,new.created_at);
  elsif old.status is distinct from new.status then
    insert into public.cake_order_request_events(request_id,event_type,from_status,to_status,actor_user_id)
    values(new.id,'status_changed',old.status,new.status,(select auth.uid()));
  end if;
  return new;
end $$;

create trigger cake_order_requests_touch_updated_at
before update on public.cake_order_requests
for each row execute function private.touch_cake_order_request();

create trigger cake_order_requests_log_event
after insert or update of status on public.cake_order_requests
for each row execute function private.log_cake_order_request_event();

alter table public.cake_order_request_events enable row level security;
revoke all on public.cake_order_request_events from anon, authenticated;
grant select on public.cake_order_request_events to authenticated;
grant all on public.cake_order_request_events to service_role;
grant update(status,admin_note) on public.cake_order_requests to authenticated;

create policy "Admins read cake request events"
on public.cake_order_request_events for select to authenticated
using (exists(
  select 1 from public.admin_users
  where is_active and lower(email)=lower((select auth.jwt())->>'email')
));

create policy "Admins update cake requests"
on public.cake_order_requests for update to authenticated
using (exists(
  select 1 from public.admin_users
  where is_active and lower(email)=lower((select auth.jwt())->>'email')
))
with check (exists(
  select 1 from public.admin_users
  where is_active and lower(email)=lower((select auth.jwt())->>'email')
));

revoke execute on function private.touch_cake_order_request() from public, anon, authenticated;
revoke execute on function private.log_cake_order_request_event() from public, anon, authenticated;

create index cake_order_requests_status_created_idx on public.cake_order_requests(status,created_at desc);
create index cake_order_requests_open_created_idx on public.cake_order_requests(created_at desc)
where status in ('new','contacted','confirmed');
create index cake_order_requests_customer_name_search_idx on public.cake_order_requests
using gin (lower(customer_name) extensions.gin_trgm_ops);
create index cake_order_requests_customer_phone_search_idx on public.cake_order_requests
using gin (customer_phone extensions.gin_trgm_ops);
create index cake_order_request_events_request_created_idx on public.cake_order_request_events(request_id,created_at desc);
