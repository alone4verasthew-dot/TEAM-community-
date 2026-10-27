-- Store attachment metadata alongside group chat messages.
-- Existing messages remain unchanged and receive an empty attachment list.
alter table public.community_messages
  add column if not exists attachments jsonb not null default '[]'::jsonb;

alter table public.community_messages
  drop constraint if exists community_messages_attachments_array_check;

alter table public.community_messages
  add constraint community_messages_attachments_array_check
  check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 5);
