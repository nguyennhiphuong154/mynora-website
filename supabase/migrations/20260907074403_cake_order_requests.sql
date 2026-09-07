create table public.cake_order_requests (
 id uuid primary key default gen_random_uuid(),
 idempotency_key uuid not null unique,
 payload jsonb not null,
 items jsonb not null,
 status text not null default 'pending' check(status in ('pending','confirmed','closed')),
 created_at timestamptz not null default now()
);
create table public.cake_order_notifications (
 order_id uuid primary key references public.cake_order_requests(id),
 status text not null default 'pending' check(status in ('pending','sending','sent','failed')),
 attempts integer not null default 0,
 last_error text,
 sent_at timestamptz,
 locked_until timestamptz,
 next_attempt_at timestamptz not null default now()
);
alter table public.cake_order_requests enable row level security;
alter table public.cake_order_notifications enable row level security;
revoke all on public.cake_order_requests, public.cake_order_notifications from anon, authenticated;
grant all on public.cake_order_requests, public.cake_order_notifications to service_role;
grant select on public.cake_order_requests, public.cake_order_notifications to authenticated;
create policy "Admins read cake requests" on public.cake_order_requests for select to authenticated using (exists(select 1 from public.admin_users where is_active and lower(email)=lower((select auth.jwt())->>'email')));
create policy "Admins read cake notifications" on public.cake_order_notifications for select to authenticated using (exists(select 1 from public.admin_users where is_active and lower(email)=lower((select auth.jwt())->>'email')));
create index cake_order_requests_phone_created_idx on public.cake_order_requests ((payload->>'phone'),created_at desc);
create index cake_order_notifications_retry_idx on public.cake_order_notifications(next_attempt_at) where status <> 'sent';

-- Invoker RPC is callable only by the Edge Function's service role. The transaction
-- locks each key and phone, validates the live catalog, then saves order + outbox.
create function public.submit_cake_order(p_key uuid, p_payload jsonb) returns uuid
language plpgsql security invoker set search_path='' as $$
declare saved public.cake_order_requests; item jsonb; product public.products; snapshots jsonb := '[]'; new_id uuid; phone text := p_payload->>'phone';
begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into saved from public.cake_order_requests where idempotency_key=p_key;
 if found then
   if saved.payload <> p_payload then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
   return saved.id;
 end if;
 perform pg_advisory_xact_lock(hashtextextended(phone,1));
 if (select count(*) from public.cake_order_requests where payload->>'phone'=phone and created_at>now()-interval '1 hour') >= 5 then raise exception 'RATE_LIMIT'; end if;
 if jsonb_array_length(p_payload->'items') not between 1 and 20 then raise exception 'INVALID_ITEMS'; end if;
 for item in select * from jsonb_array_elements(p_payload->'items') loop
   select p.* into product from public.products p join public.categories c on c.id=p.category_id where p.id=(item->>'productId')::bigint and c.is_active and p.content_status <> 'hidden' and p.order_status='available' for share of p,c;
   if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
   if (item->>'quantity')::numeric not between 1 and 99 or (item->>'quantity')::numeric <> trunc((item->>'quantity')::numeric) then raise exception 'INVALID_QUANTITY'; end if;
   snapshots := snapshots || jsonb_build_array(jsonb_build_object('productId',product.id::text,'productNameSnapshot',product.display_name,'quantity',(item->>'quantity')::int));
 end loop;
 insert into public.cake_order_requests(idempotency_key,payload,items) values(p_key,p_payload,snapshots) returning id into new_id;
 insert into public.cake_order_notifications(order_id) values(new_id);
 return new_id;
end $$;
revoke all on function public.submit_cake_order(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.submit_cake_order(uuid,jsonb) to service_role;

create function public.claim_cake_notification(p_id uuid) returns boolean
language sql security invoker set search_path='' as $$
 with claimed as (
 update public.cake_order_notifications set status='sending',attempts=attempts+1,locked_until=now()+interval '2 minutes'
 where order_id=p_id and status<>'sent' and next_attempt_at<=now() and (locked_until is null or locked_until<now()) returning order_id
 ) select exists(select 1 from claimed);
$$;
revoke all on function public.claim_cake_notification(uuid) from public,anon,authenticated;
grant execute on function public.claim_cake_notification(uuid) to service_role;
