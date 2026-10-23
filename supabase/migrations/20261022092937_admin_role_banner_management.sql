-- Admin-only management for the independent Admin role and Banner membership.
-- This migration changes permissions/functions only; it preserves existing members and messages.
create or replace function public.admin_set_member_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an approved admin can manage roles' using errcode = '42501';
  end if;
  if p_role not in ('member', 'admin') then
    raise exception 'Role must be member or admin' using errcode = '22023';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'You cannot change your own admin role' using errcode = '42501';
  end if;
  update public.profiles
  set role = p_role
  where id = p_user_id and status = 'approved';
  if not found then
    raise exception 'Approved member not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.admin_set_banner_membership(p_user_id uuid, p_is_banner boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_community_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only an approved admin can manage Banner membership' using errcode = '42501';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'Manage Banner membership for another member from this dashboard' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p where p.id = p_user_id and p.status = 'approved') then
    raise exception 'Approved member not found' using errcode = 'P0002';
  end if;
  select c.id into v_community_id
  from public.communities c
  where c.slug = 'community-three' and c.is_active = true;
  if v_community_id is null then
    raise exception 'Banner community is unavailable';
  end if;
  if p_is_banner then
    insert into public.memberships (community_id, profile_id, added_by)
    values (v_community_id, p_user_id, (select auth.uid()))
    on conflict (community_id, profile_id) do nothing;
  else
    delete from public.memberships
    where community_id = v_community_id and profile_id = p_user_id;
  end if;
end;
$$;

revoke all on function public.admin_set_member_role(uuid, text) from public, anon;
revoke all on function public.admin_set_banner_membership(uuid, boolean) from public, anon;
grant execute on function public.admin_set_member_role(uuid, text) to authenticated;
grant execute on function public.admin_set_banner_membership(uuid, boolean) to authenticated;