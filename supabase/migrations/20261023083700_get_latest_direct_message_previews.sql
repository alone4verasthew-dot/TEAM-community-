create or replace function public.get_latest_direct_message_previews(p_conversation_ids uuid[])
returns table (
  conversation_id uuid,
  body text,
  sender_id uuid,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct on (dm.conversation_id)
    dm.conversation_id,
    dm.body,
    dm.sender_id,
    dm.created_at
  from public.direct_messages as dm
  join public.direct_conversations as dc
    on dc.id = dm.conversation_id
  where dm.conversation_id = any(p_conversation_ids)
    and (
      dc.participant_low = (select auth.uid())
      or dc.participant_high = (select auth.uid())
    )
  order by dm.conversation_id, dm.created_at desc, dm.id desc;
$$;

revoke all on function public.get_latest_direct_message_previews(uuid[]) from public, anon;
grant execute on function public.get_latest_direct_message_previews(uuid[]) to authenticated;
