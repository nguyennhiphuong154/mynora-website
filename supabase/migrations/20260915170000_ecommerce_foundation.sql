alter table public.products
  add column if not exists short_description text not null default '',
  add column if not exists base_price numeric(12,0),
  add column if not exists compare_price numeric(12,0),
  add column if not exists preparation_time_days integer,
  add column if not exists minimum_order integer not null default 1,
  add column if not exists serving_size text not null default '',
  add column if not exists storage_instruction text not null default '',
  add column if not exists allergen_info text not null default '',
  add column if not exists is_archived boolean not null default false;

update public.products
set short_description = description
where short_description = '';

alter table public.products
  add constraint products_base_price_valid check (base_price is null or base_price >= 0),
  add constraint products_compare_price_valid check (compare_price is null or compare_price >= 0),
  add constraint products_preparation_time_valid check (preparation_time_days is null or preparation_time_days between 0 and 90),
  add constraint products_minimum_order_valid check (minimum_order between 1 and 99),
  add constraint products_compare_price_order check (compare_price is null or base_price is null or compare_price >= base_price);

create table public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete restrict,
  name text not null,
  sku text unique,
  price numeric(12,0),
  compare_price numeric(12,0),
  preparation_time_days integer,
  minimum_order integer not null default 1,
  serving_size text not null default '',
  stock_quantity integer,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_name_valid check (char_length(btrim(name)) between 1 and 120),
  constraint product_variants_sku_valid check (sku is null or char_length(btrim(sku)) between 1 and 80),
  constraint product_variants_price_valid check (price is null or price >= 0),
  constraint product_variants_compare_price_valid check (compare_price is null or compare_price >= 0),
  constraint product_variants_compare_price_order check (compare_price is null or price is null or compare_price >= price),
  constraint product_variants_preparation_time_valid check (preparation_time_days is null or preparation_time_days between 0 and 90),
  constraint product_variants_minimum_order_valid check (minimum_order between 1 and 99),
  constraint product_variants_stock_valid check (stock_quantity is null or stock_quantity >= 0)
);

create table public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete restrict,
  image_path text not null,
  alt_text text not null default '',
  width integer,
  height integer,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_images_path_valid check (char_length(btrim(image_path)) between 1 and 500),
  constraint product_images_width_valid check (width is null or width > 0),
  constraint product_images_height_valid check (height is null or height > 0),
  unique (product_id, image_path)
);

insert into public.product_images(product_id,image_path,alt_text,width,height,is_primary,sort_order)
select id,image_path,display_name || ' của MYNORA',1254,1254,true,0
from public.products
on conflict (product_id,image_path) do nothing;

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  description text not null default '',
  updated_at timestamptz not null default now(),
  constraint site_settings_key_valid check (key ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),
  constraint site_settings_value_object check (jsonb_typeof(value) = 'object')
);

insert into public.site_settings(key,value,is_public,description) values
('contact', '{"phone":"0763722023","phoneHasZalo":true,"email":"mynorabakery@gmail.com","contactHours":"Thứ Hai–Chủ nhật, 8:00–20:00"}', true, 'Thông tin liên hệ công khai hiện có'),
('order', '{"minimumPreorderDays":5,"urgentOrdersAccepted":false,"expectedReplyMinutes":15,"receivingWindowNoticeDays":2}', true, 'Quy tắc đặt trước công khai hiện có'),
('delivery', '{"enabled":true,"areaLabel":"Đà Nẵng","freeRadiusKm":5,"feeOutsideFreeRadiusVnd":10000,"customerSelectsTimeWindowOnly":true,"driverBookedBy":"MYNORA"}', true, 'Cấu hình giao nhận công khai hiện có'),
('privacy', '{"showKitchenLocation":false,"showPickupAddress":false,"showMap":false}', true, 'Thiết lập riêng tư công khai')
on conflict (key) do nothing;

create function private.set_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger products_set_updated_at before update on public.products
for each row execute function private.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function private.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants
for each row execute function private.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function private.set_updated_at();

alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.site_settings enable row level security;

revoke all on public.product_variants, public.product_images, public.site_settings from anon, authenticated;
grant select on public.product_variants, public.product_images, public.site_settings to anon, authenticated;
grant insert, update, delete on public.product_variants, public.product_images, public.site_settings to authenticated;
grant all on public.product_variants, public.product_images, public.site_settings to service_role;
grant usage, select on sequence public.product_variants_id_seq, public.product_images_id_seq to authenticated, service_role;

create policy product_variants_public_read on public.product_variants for select to anon
using (is_active and exists (
  select 1 from public.products p join public.categories c on c.id=p.category_id
  where p.id=product_id and not p.is_archived and p.content_status <> 'hidden' and c.is_active
));
create policy product_variants_authenticated_read on public.product_variants for select to authenticated
using (
  (is_active and exists (
    select 1 from public.products p join public.categories c on c.id=p.category_id
    where p.id=product_id and not p.is_archived and p.content_status <> 'hidden' and c.is_active
  )) or exists (
    select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')
  )
);
create policy product_variants_admin_insert on public.product_variants for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));
create policy product_variants_admin_update on public.product_variants for update to authenticated
using (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')))
with check (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));
create policy product_variants_admin_delete on public.product_variants for delete to authenticated
using (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));

create policy product_images_public_read on public.product_images for select to anon
using (is_active and exists (
  select 1 from public.products p join public.categories c on c.id=p.category_id
  where p.id=product_id and not p.is_archived and p.content_status <> 'hidden' and c.is_active
));
create policy product_images_authenticated_read on public.product_images for select to authenticated
using (
  (is_active and exists (
    select 1 from public.products p join public.categories c on c.id=p.category_id
    where p.id=product_id and not p.is_archived and p.content_status <> 'hidden' and c.is_active
  )) or exists (
    select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')
  )
);
create policy product_images_admin_insert on public.product_images for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));
create policy product_images_admin_update on public.product_images for update to authenticated
using (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')))
with check (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));
create policy product_images_admin_delete on public.product_images for delete to authenticated
using (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));

create policy site_settings_public_read on public.site_settings for select to anon
using (is_public);
create policy site_settings_authenticated_read on public.site_settings for select to authenticated
using (is_public or exists (
  select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')
));
create policy site_settings_admin_insert on public.site_settings for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));
create policy site_settings_admin_update on public.site_settings for update to authenticated
using (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')))
with check (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));
create policy site_settings_admin_delete on public.site_settings for delete to authenticated
using (exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')));

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon
using (not is_archived and content_status <> 'hidden' and exists (
  select 1 from public.categories c where c.id=category_id and c.is_active
));
create policy products_authenticated_read on public.products for select to authenticated
using (
  (not is_archived and content_status <> 'hidden' and exists (select 1 from public.categories c where c.id=category_id and c.is_active))
  or exists (select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email'))
);
drop policy if exists products_admin_read on public.products;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon using (is_active);
create policy categories_authenticated_read on public.categories for select to authenticated
using (is_active or exists (
  select 1 from public.admin_users a where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')
));

create index product_variants_product_sort_idx on public.product_variants(product_id,sort_order,id);
create index product_images_product_sort_idx on public.product_images(product_id,sort_order,id);
create unique index product_images_one_primary_idx on public.product_images(product_id) where is_primary and is_active;
create index products_public_catalog_idx on public.products(category_id,sort_order,id) where not is_archived and content_status <> 'hidden';
create index admin_password_setup_tokens_user_id_idx on public.admin_password_setup_tokens(user_id);

revoke execute on function private.set_updated_at() from public, anon, authenticated;
