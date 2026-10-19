-- Keep SECURITY DEFINER role-check helpers outside the API-exposed public schema.
-- Ensure the "private" schema is NOT listed under Supabase API > Exposed schemas.
-- Public wrappers remain SECURITY INVOKER so existing RLS policies and app code keep working.

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'approved'
      and p.role = 'admin'
  );
$function$;

create or replace function private.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'approved'
  );
$function$;

revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_approved_member() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;
grant execute on function private.is_approved_member() to authenticated, service_role;

-- Preserve the existing public function names used by RLS policies. These wrappers
-- run as the caller; only the narrowly scoped private helpers run as SECURITY DEFINER.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $function$
  select private.is_admin();
$function$;

create or replace function public.is_approved_member()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $function$
  select private.is_approved_member();
$function$;

-- Restore the intended callable grants explicitly without granting anon access.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_approved_member() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_approved_member() to authenticated, service_role;
