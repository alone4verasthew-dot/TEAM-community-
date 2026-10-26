-- Let approved admins use private chat rooms without granting them Banner membership.
-- Membership assignment remains independent from the Admin role.
drop policy if exists community_messages_select_members on public.community_messages;
create policy community_messages_select_members
on public.community_messages for select to authenticated
using (
  (select public.is_approved_member())
  and exists (
    select 1 from public.communities c
    where c.id = community_messages.community_id
      and c.is_active = true
      and (
        c.slug = 'community-one'
        or ((select public.is_admin()) and c.slug in ('community-two', 'community-three'))
        or exists (
          select 1 from public.memberships m
          where m.profile_id = (select auth.uid())
            and m.community_id = community_messages.community_id
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
    select 1 from public.communities c
    where c.id = community_messages.community_id
      and c.is_active = true
      and (
        c.slug = 'community-one'
        or ((select public.is_admin()) and c.slug in ('community-two', 'community-three'))
        or exists (
          select 1 from public.memberships m
          where m.profile_id = (select auth.uid())
            and m.community_id = community_messages.community_id
        )
      )
  )
);
