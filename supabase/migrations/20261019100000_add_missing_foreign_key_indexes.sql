-- Supporting indexes for foreign keys reported by the Supabase performance advisor.
-- This migration is additive and does not modify or delete existing data.

create index if not exists communities_created_by_idx
  on public.communities (created_by);

create index if not exists community_messages_sender_id_idx
  on public.community_messages (sender_id);

create index if not exists direct_conversations_created_by_idx
  on public.direct_conversations (created_by);

create index if not exists direct_messages_sender_id_idx
  on public.direct_messages (sender_id);

create index if not exists invite_links_created_by_idx
  on public.invite_links (created_by);

create index if not exists memberships_added_by_idx
  on public.memberships (added_by);
