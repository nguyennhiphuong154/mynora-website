update public.admin_users
set email = 'mynorabakery@gmail.com'
where lower(email) = 'mynorabaker@gmail.com'
  and not exists (
    select 1
    from public.admin_users
    where lower(email) = 'mynorabakery@gmail.com'
  );

update public.admin_users
set role = 'owner',
    is_active = true
where lower(email) = 'mynorabakery@gmail.com';
