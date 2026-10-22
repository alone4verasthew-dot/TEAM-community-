-- Reconcile community access policies with the intended TFY role model.
-- Approved members can discover the active main community.
-- Admins can access the active Admins and Banners rooms without needing Banner membership.
-- Non-admin Banner access requires explicit membership.
-- Existing memberships and messages are not modified.

drop policy if exists communities_select_approved on public.communities;
create policy communities_select_approved on public.communities
for select to authenticated
using (
  (select public.is_approved_member())
  and is_active = true
  and (
    slug = 'community-one'
    or ((select public.is_admin()) and slug in ('community-two', 'community-three'))
    or (slug = 'community-three' and exists (
      select 1 from public.memberships m
      where m.community_id = communities.id and m.profile_id = (select auth.uid())
    ))
  )
);

drop policy if exists memberships_join_self on public.memberships;
create policy memberships_join_self on public.memberships
for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and (select public.is_approved_member())
  and exists (select 1 from public.communities c where c.id = community_id and c.is_active = true and c.slug = 'community-one')
);

-- Admins room is always admin-only, even if stale memberships exist.
drop policy if exists community_messages_select_members on public.community_messages;
create policy community_messages_select_members
on public.community_messages for select to authenticated
using (
  (select public.is_approved_member())
  and exists (
    select 1 from public.communities c
    where c.id = community_messages.community_id and c.is_active = true
      and (
        (c.slug = 'community-two' and (select public.is_admin()))
        or (c.slug = 'community-one' and exists (
          select 1 from public.memberships m where m.profile_id = (select auth.uid()) and m.community_id = c.id
        ))
        or (c.slug = 'community-three' and (
          (select public.is_admin()) or exists (
            select 1 from public.memberships m where m.profile_id = (select auth.uid()) and m.community_id = c.id
          )
        ))
      )
  )
);

drop policy if exists community_messages_insert_members on public.community_messages;
create policy community_messages_insert_members
on public.community_messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and length(trim(body)) between 1 and 4000
  and (select public.is_approved_member())
  and exists (
    select 1 from public.communities c
    where c.id = community_messages.community_id and c.is_active = true
      and (
        (c.slug = 'community-two' and (select public.is_admin()))
        or (c.slug = 'community-one' and exists (
          select 1 from public.memberships m where m.profile_id = (select auth.uid()) and m.community_id = c.id
        ))
        or (c.slug = 'community-three' and (
          (select public.is_admin()) or exists (
            select 1 from public.memberships m where m.profile_id = (select auth.uid()) and m.community_id = c.id
          )
        ))
      )
  )
);
