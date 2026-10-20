-- Restrict self-joining private rooms at the database layer.
-- Existing membership rows and messages are not modified.
drop policy if exists memberships_join_self on public.memberships;
create policy memberships_join_self on public.memberships
for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and (select public.is_approved_member())
  and exists (
    select 1 from public.communities c
    where c.id = community_id and c.is_active = true
      and (
        c.slug = 'community-one'
        or (c.slug = 'community-two' and (select public.is_admin()))
        or (
          c.slug = 'community-three'
          and (
            (select public.is_admin())
            or exists (
              select 1 from public.memberships bm
              where bm.community_id = c.id and bm.profile_id = (select auth.uid())
            )
          )
        )
      )
  )
);
