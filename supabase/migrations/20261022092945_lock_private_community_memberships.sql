-- Close direct-API paths into the Admins and Banner communities.
-- The main TFY circle is self-joinable; Banner access is assigned by an admin;
-- the Admins room is restricted to approved admins even if stale memberships exist.
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
        (select public.is_admin())
        or (
          c.slug in ('community-one', 'community-three')
          and exists (
            select 1
            from public.memberships m
            where m.profile_id = (select auth.uid())
              and m.community_id = c.id
          )
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
        (select public.is_admin())
        or (
          c.slug in ('community-one', 'community-three')
          and exists (
            select 1
            from public.memberships m
            where m.profile_id = (select auth.uid())
              and m.community_id = c.id
          )
        )
      )
  )
);