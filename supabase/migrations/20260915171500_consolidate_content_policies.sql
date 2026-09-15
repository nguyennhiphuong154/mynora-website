drop policy if exists "Active admins manage posts" on public.posts;
drop policy if exists "Published posts are public" on public.posts;
drop policy if exists posts_admin_read on public.posts;

create policy posts_authenticated_read on public.posts for select to authenticated
using (
  (status = 'published' and published_at is not null and published_at <= now())
  or exists (
    select 1 from public.admin_users a
    where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')
  )
);

drop policy if exists "Active admins manage contact submissions" on public.contact_submissions;
drop policy if exists "Visitors create contact submissions" on public.contact_submissions;
drop policy if exists contact_public_insert on public.contact_submissions;

create policy contact_public_insert on public.contact_submissions for insert to anon
with check (status='new' and source='website' and internal_note='');

create policy contact_authenticated_insert on public.contact_submissions for insert to authenticated
with check (
  (status='new' and source='website' and internal_note='')
  or exists (
    select 1 from public.admin_users a
    where a.is_active and lower(a.email)=lower((select auth.jwt())->>'email')
  )
);
