-- Fix ambiguous "name" references in Storage RLS policies.
-- Qualify storage.objects.name so community folder checks use the uploaded object's path,
-- not public.communities.name.

drop policy if exists tfy_chat_media_insert on storage.objects;
create policy tfy_chat_media_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'tfy-chat-media'
  and (storage.foldername(objects.name))[3] = (select auth.uid())::text
  and (
    (
      (storage.foldername(objects.name))[1] = 'community'
      and exists (
        select 1
        from public.communities c
        join public.profiles p on p.id = (select auth.uid())
        where c.id::text = (storage.foldername(objects.name))[2]
          and c.is_active = true
          and p.status = 'approved'
          and (
            exists (
              select 1 from public.memberships m
              where m.community_id = c.id and m.profile_id = (select auth.uid())
            )
            or (
              p.role = 'admin'
              and c.slug in ('community-two', 'community-three')
            )
          )
      )
    )
    or
    (
      (storage.foldername(objects.name))[1] = 'direct'
      and exists (
        select 1
        from public.direct_conversations dc
        join public.profiles p on p.id = (select auth.uid())
        where dc.id::text = (storage.foldername(objects.name))[2]
          and p.status = 'approved'
          and (
            dc.participant_low = (select auth.uid())
            or dc.participant_high = (select auth.uid())
          )
      )
    )
  )
);

drop policy if exists tfy_chat_media_select on storage.objects;
create policy tfy_chat_media_select
on storage.objects for select to authenticated
using (
  bucket_id = 'tfy-chat-media'
  and (
    (
      (storage.foldername(objects.name))[1] = 'community'
      and exists (
        select 1
        from public.communities c
        join public.profiles p on p.id = (select auth.uid())
        where c.id::text = (storage.foldername(objects.name))[2]
          and c.is_active = true
          and p.status = 'approved'
          and (
            exists (
              select 1 from public.memberships m
              where m.community_id = c.id and m.profile_id = (select auth.uid())
            )
            or (
              p.role = 'admin'
              and c.slug in ('community-two', 'community-three')
            )
          )
      )
    )
    or
    (
      (storage.foldername(objects.name))[1] = 'direct'
      and exists (
        select 1
        from public.direct_conversations dc
        join public.profiles p on p.id = (select auth.uid())
        where dc.id::text = (storage.foldername(objects.name))[2]
          and p.status = 'approved'
          and (
            dc.participant_low = (select auth.uid())
            or dc.participant_high = (select auth.uid())
          )
      )
    )
  )
);

drop policy if exists tfy_chat_media_delete_own on storage.objects;
create policy tfy_chat_media_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'tfy-chat-media'
  and (storage.foldername(objects.name))[3] = (select auth.uid())::text
);