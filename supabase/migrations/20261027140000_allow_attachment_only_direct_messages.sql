-- Allow direct messages that contain only attachments while retaining participant checks.
drop policy if exists direct_messages_insert_sender_participant on public.direct_messages;

create policy direct_messages_insert_sender_participant
on public.direct_messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and (
    length(trim(body)) between 1 and 4000
    or (
      jsonb_typeof(attachments) = 'array'
      and jsonb_array_length(attachments) between 1 and 5
    )
  )
  and (select public.is_approved_member())
  and exists (
    select 1
    from public.direct_conversations c
    where c.id = conversation_id
      and (
        c.participant_low = (select auth.uid())
        or c.participant_high = (select auth.uid())
      )
  )
);