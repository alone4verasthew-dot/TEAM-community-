-- Private media attachments for community and direct messages.
-- Existing messages remain intact; attachments default to an empty array.
alter table public.community_messages
  add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.direct_messages
  add column if not exists attachments jsonb not null default '[]'::jsonb;

alter table public.community_messages drop constraint if exists community_messages_body_check;
alter table public.community_messages add constraint community_messages_body_check
  check ((length(trim(body)) between 1 and 4000) or jsonb_array_length(attachments) > 0);
alter table public.direct_messages drop constraint if exists direct_messages_body_check;
alter table public.direct_messages add constraint direct_messages_body_check
  check ((length(trim(body)) between 1 and 4000) or jsonb_array_length(attachments) > 0);

alter table public.community_messages
  drop constraint if exists community_messages_attachments_valid;
alter table public.community_messages
  add constraint community_messages_attachments_valid
  check (case when jsonb_typeof(attachments) = 'array' then jsonb_array_length(attachments) <= 5 else false end);
alter table public.direct_messages
  drop constraint if exists direct_messages_attachments_valid;
alter table public.direct_messages
  add constraint direct_messages_attachments_valid
  check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 5);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tfy-chat-media',
  'tfy-chat-media',
  false,
  20971520,
  array[
    'image/jpeg','image/png','image/gif','image/webp',
    'video/mp4','video/webm',
    'application/pdf','text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists tfy_chat_media_insert on storage.objects;
create policy tfy_chat_media_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'tfy-chat-media'
  and (storage.foldername(name))[3] = (select auth.uid())::text
  and (
    (
      (storage.foldername(name))[1] = 'community'
      and exists (
        select 1
        from public.communities c
        join public.profiles p on p.id = (select auth.uid())
        where c.id::text = (storage.foldername(name))[2]
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
      (storage.foldername(name))[1] = 'direct'
      and exists (
        select 1
        from public.direct_conversations dc
        join public.profiles p on p.id = (select auth.uid())
        where dc.id::text = (storage.foldername(name))[2]
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
      (storage.foldername(name))[1] = 'community'
      and exists (
        select 1
        from public.communities c
        join public.profiles p on p.id = (select auth.uid())
        where c.id::text = (storage.foldername(name))[2]
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
      (storage.foldername(name))[1] = 'direct'
      and exists (
        select 1
        from public.direct_conversations dc
        join public.profiles p on p.id = (select auth.uid())
        where dc.id::text = (storage.foldername(name))[2]
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
  and (storage.foldername(name))[3] = (select auth.uid())::text
);
