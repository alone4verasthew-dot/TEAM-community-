-- Restrict self-joining private rooms at the database layer.
-- Existing membership rows and messages are not modified.
-- Approved members may join only the main TFY room themselves.
-- Admins access private rooms by role; Banner membership remains explicitly assigned.
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
