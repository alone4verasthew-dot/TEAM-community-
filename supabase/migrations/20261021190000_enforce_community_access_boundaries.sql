-- Enforce TFY community access at the database boundary.
-- Approved members can discover/read the Main TFY community.
-- Admins can access Admins and Banners chats without gaining Banner membership.
-- Banner access for non-admins is controlled only by an explicit membership.

drop policy if exists communities_select_approved on public.communities;
create policy communities_select_approved on public.communities
for select to authenticated
using (
  (select public.is_approved_member())
  and is_active = true
  and (
    slug = 'community-one'
    or (select public.is_admin())
    or (
      slug = 'community-three'
      and exists (
        select 1
        from public.memberships m
        where m.community_id = communities.id
          and m.profile_id = (select auth.uid())
      )
    )
  )
);

drop policy if exists memberships_join_self on public.memberships;
create policy memberships_join_self on public.memberships
for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and (select public.is_approved_member())
  and exists (
    select 1
    from public.communities c
    where c.id = community_id
      and c.is_active = true
      and c.slug = 'community-one'
  )
);

drop policy if exists community_messages_select_members on public.community_messages;
create policy community_messages_select_members
on public.community_messages for select to authenticated
using (
  (select public.is_approved_member())
  and exists (
    select 1
    from public.communities c
    where c.id = community_messages.community_id
      and c.is_active = true
      and (
        exists (
          select 1
          from public.memberships m
          where m.profile_id = (select auth.uid())
            and m.community_id = c.id
        )
        or (
          (select public.is_admin())
          and c.slug in ('community-two', 'community-three')
        )
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
    select 1
    from public.communities c
    where c.id = community_messages.community_id
      and c.is_active = true
      and (
        exists (
          select 1
          from public.memberships m
          where m.profile_id = (select auth.uid())
            and m.community_id = c.id
        )
        or (
          (select public.is_admin())
          and c.slug in ('community-two', 'community-three')
        )
      )
  )
);
