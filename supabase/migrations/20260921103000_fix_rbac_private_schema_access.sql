-- Allow authenticated sessions to resolve the tightly-scoped private RLS helper.
-- Function EXECUTE remains explicitly limited and the private schema exposes no tables.
grant usage on schema private to authenticated;
grant execute on function private.current_admin_role() to authenticated;

-- The project already had an equivalent case-insensitive unique email index.
drop index if exists public.admin_users_email_lower_key;
