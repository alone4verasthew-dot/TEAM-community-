-- Move privileged SECURITY DEFINER implementations out of the API-exposed public schema.
-- Before applying, ensure "private" is NOT listed under Supabase API > Exposed schemas.
-- Public wrappers are SECURITY INVOKER and preserve the RPC names used by the app/RLS.

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated, service_role;

-- Narrow helper functions used by row-level security policies.
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

-- Admin approval implementation retains the existing authorization and capacity checks.
create or replace function private.admin_approve_member(
  p_user_id uuid,
  p_community_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_cap integer;
  v_approved_count integer;
  v_changed integer;
begin
  if not private.is_admin() then
    raise exception 'Only an approved TFY admin can approve members'
      using errcode = '42501';
  end if;

  if p_community_id is not null and not exists (
    select 1 from public.communities c
    where c.id = p_community_id and c.is_active = true
  ) then
    raise exception 'Selected community is not active'
      using errcode = '22023';
  end if;

  select s.member_cap into v_cap
  from public.app_settings s
  where s.singleton_id = 1
  for update;

  if v_cap is null then
    raise exception 'TFY settings are missing';
  end if;

  select count(*)::integer into v_approved_count
  from public.profiles p
  where p.status = 'approved';

  if v_approved_count >= v_cap or v_approved_count >= 80 then
    raise exception 'TFY is full: approval would exceed the member limit'
      using errcode = '23514';
  end if;

  update public.profiles
  set status = 'approved'
  where id = p_user_id and status = 'pending';

  get diagnostics v_changed = row_count;
  if v_changed = 0 then
    raise exception 'Member does not exist or is not pending'
      using errcode = 'P0002';
  end if;

  if p_community_id is not null then
    insert into public.memberships (community_id, profile_id, added_by)
    values (p_community_id, p_user_id, (select auth.uid()))
    on conflict (community_id, profile_id) do nothing;
  end if;
end;
$function$;

create or replace function private.admin_reject_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_changed integer;
begin
  if not private.is_admin() then
    raise exception 'Only an approved TFY admin can reject members'
      using errcode = '42501';
  end if;

  update public.profiles
  set status = 'rejected'
  where id = p_user_id and status = 'pending';

  get diagnostics v_changed = row_count;
  if v_changed = 0 then
    raise exception 'Member does not exist or is not pending'
      using errcode = 'P0002';
  end if;
end;
$function$;

-- Direct conversations remain restricted to two distinct approved members.
create or replace function private.start_direct_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_low uuid;
  v_high uuid;
  v_conversation_id uuid;
begin
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception 'Sign in before starting a conversation'
      using errcode = '42501';
  end if;

  if p_other_user_id is null or p_other_user_id = v_user_id then
    raise exception 'Choose another member to message'
      using errcode = '22023';
  end if;

  if not private.is_approved_member() then
    raise exception 'Only approved members can start conversations'
      using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_other_user_id and p.status = 'approved'
  ) then
    raise exception 'The selected member is not available for messaging'
      using errcode = '22023';
  end if;

  v_low := least(v_user_id, p_other_user_id);
  v_high := greatest(v_user_id, p_other_user_id);

  insert into public.direct_conversations (
    participant_low, participant_high, created_by
  )
  values (v_low, v_high, v_user_id)
  on conflict (participant_low, participant_high) do nothing
  returning id into v_conversation_id;

  if v_conversation_id is null then
    select c.id into v_conversation_id
    from public.direct_conversations c
    where c.participant_low = v_low
      and c.participant_high = v_high;
  end if;

  return v_conversation_id;
end;
$function$;

revoke all on function private.admin_approve_member(uuid, uuid) from public, anon;
revoke all on function private.admin_reject_member(uuid) from public, anon;
revoke all on function private.start_direct_conversation(uuid) from public, anon;
grant execute on function private.admin_approve_member(uuid, uuid) to authenticated, service_role;
grant execute on function private.admin_reject_member(uuid) to authenticated, service_role;
grant execute on function private.start_direct_conversation(uuid) to authenticated, service_role;

-- Public SECURITY INVOKER wrappers preserve existing RPC URLs and RLS call sites.
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

create or replace function public.admin_approve_member(
  p_user_id uuid,
  p_community_id uuid default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  perform private.admin_approve_member(p_user_id, p_community_id);
end;
$function$;

create or replace function public.admin_reject_member(p_user_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $function$
  select private.admin_reject_member(p_user_id);
$function$;

create or replace function public.start_direct_conversation(p_other_user_id uuid)
returns uuid
language sql
volatile
security invoker
set search_path = ''
as $function$
  select private.start_direct_conversation(p_other_user_id);
$function$;

-- Explicit least-privilege RPC grants: signed-in members only, never anonymous users.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_approved_member() from public, anon;
revoke all on function public.admin_approve_member(uuid, uuid) from public, anon;
revoke all on function public.admin_reject_member(uuid) from public, anon;
revoke all on function public.start_direct_conversation(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_approved_member() to authenticated, service_role;
grant execute on function public.admin_approve_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.admin_reject_member(uuid) to authenticated, service_role;
grant execute on function public.start_direct_conversation(uuid) to authenticated, service_role;
