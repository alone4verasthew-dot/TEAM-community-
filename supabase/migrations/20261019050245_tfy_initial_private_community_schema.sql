
-- TFY Community initial database foundation.
-- All exposed tables use RLS; only approved members can access member-facing data.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text not null default '',
  avatar_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  role text not null default 'member'
    check (role in ('member', 'moderator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format
    check (username is null or username ~ '^[a-z0-9_]{4,20}$')
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) between 2 and 80),
  description text not null default '',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  community_id uuid not null references public.communities(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  added_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz not null default now(),
  primary key (community_id, profile_id)
);

create table if not exists public.app_settings (
  singleton_id smallint primary key default 1 check (singleton_id = 1),
  approval_enabled boolean not null default true,
  member_cap integer not null default 80 check (member_cap between 1 and 80),
  updated_at timestamptz not null default now()
);

create table if not exists public.invite_links (
  id uuid primary key default gen_random_uuid(),
  -- Store only a digest of an invite token, never the raw token.
  token_hash text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  uses_count integer not null default 0 check (uses_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_approved_username_idx on public.profiles(username) where status = 'approved';
create index if not exists memberships_profile_idx on public.memberships(profile_id);
create index if not exists invite_links_active_idx on public.invite_links(is_active, expires_at);

insert into public.app_settings (singleton_id, approval_enabled, member_cap)
values (1, true, 80)
on conflict (singleton_id) do nothing;

create or replace function public.tfy_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists tfy_profiles_set_updated_at on public.profiles;
create trigger tfy_profiles_set_updated_at
before update on public.profiles
for each row execute function public.tfy_set_updated_at();

drop trigger if exists tfy_communities_set_updated_at on public.communities;
create trigger tfy_communities_set_updated_at
before update on public.communities
for each row execute function public.tfy_set_updated_at();

drop trigger if exists tfy_settings_set_updated_at on public.app_settings;
create trigger tfy_settings_set_updated_at
before update on public.app_settings
for each row execute function public.tfy_set_updated_at();

create or replace function public.tfy_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
  v_display_name text;
begin
  v_username := pg_catalog.lower(pg_catalog.trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  if v_username !~ '^[a-z0-9_]{4,20}$' then
    v_username := null;
  end if;

  v_display_name := nullif(pg_catalog.trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');
  if v_display_name is null then
    v_display_name := nullif(pg_catalog.trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  end if;

  insert into public.profiles (id, username, display_name, status, role)
  values (new.id, v_username, v_display_name, 'pending', 'member')
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.tfy_handle_new_user() from public, anon, authenticated;
drop trigger if exists tfy_on_auth_user_created on auth.users;
create trigger tfy_on_auth_user_created
after insert on auth.users
for each row execute function public.tfy_handle_new_user();

-- Security-definer helpers avoid recursive RLS policies on profiles.
create or replace function public.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'approved'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'approved'
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_approved_member() from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_approved_member() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Admin-only approval functions. Locking app_settings serializes approvals,
-- so concurrent requests cannot exceed the configured cap.
create or replace function public.admin_approve_member(
  p_user_id uuid,
  p_community_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cap integer;
  v_approved_count integer;
  v_changed integer;
begin
  if not public.is_admin() then
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
$$;

create or replace function public.admin_reject_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed integer;
begin
  if not public.is_admin() then
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
$$;

revoke all on function public.admin_approve_member(uuid, uuid) from public, anon;
revoke all on function public.admin_reject_member(uuid) from public, anon;
grant execute on function public.admin_approve_member(uuid, uuid) to authenticated;
grant execute on function public.admin_reject_member(uuid) to authenticated;

-- Enable RLS before exposing any table through the Data API.
alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.memberships enable row level security;
alter table public.app_settings enable row level security;
alter table public.invite_links enable row level security;

drop policy if exists profiles_select_visible on public.profiles;
create policy profiles_select_visible on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or ((select public.is_approved_member()) and status = 'approved')
  or (select public.is_admin())
);

drop policy if exists profiles_update_own_approved on public.profiles;
create policy profiles_update_own_approved on public.profiles
for update to authenticated
using (
  id = (select auth.uid())
  and status = 'approved'
)
with check (
  id = (select auth.uid())
  and status = 'approved'
);

drop policy if exists communities_select_approved on public.communities;
create policy communities_select_approved on public.communities
for select to authenticated
using (
  (select public.is_approved_member())
  and (is_active = true or (select public.is_admin()))
);

drop policy if exists communities_admin_insert on public.communities;
create policy communities_admin_insert on public.communities
for insert to authenticated
with check ((select public.is_admin()));

drop policy if exists communities_admin_update on public.communities;
create policy communities_admin_update on public.communities
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists communities_admin_delete on public.communities;
create policy communities_admin_delete on public.communities
for delete to authenticated
using ((select public.is_admin()));

drop policy if exists memberships_select_approved on public.memberships;
create policy memberships_select_approved on public.memberships
for select to authenticated
using ((select public.is_approved_member()) or (select public.is_admin()));

drop policy if exists memberships_join_self on public.memberships;
create policy memberships_join_self on public.memberships
for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and (select public.is_approved_member())
  and exists (
    select 1 from public.communities c
    where c.id = community_id and c.is_active = true
  )
);

drop policy if exists memberships_leave_self_or_admin on public.memberships;
create policy memberships_leave_self_or_admin on public.memberships
for delete to authenticated
using (
  profile_id = (select auth.uid())
  or (select public.is_admin())
);

drop policy if exists app_settings_admin_only on public.app_settings;
create policy app_settings_admin_only on public.app_settings
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists invite_links_admin_only on public.invite_links;
create policy invite_links_admin_only on public.invite_links
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Start from explicit minimum privileges. No anonymous API access to member data.
revoke all on public.profiles, public.communities, public.memberships,
  public.app_settings, public.invite_links from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (username, display_name, bio, avatar_url, updated_at)
  on public.profiles to authenticated;

grant select, insert, update, delete on public.communities to authenticated;
grant select, insert, delete on public.memberships to authenticated;
grant select, insert, update, delete on public.app_settings to authenticated;
grant select, insert, update, delete on public.invite_links to authenticated;

grant all on public.profiles, public.communities, public.memberships,
  public.app_settings, public.invite_links to service_role;
;
