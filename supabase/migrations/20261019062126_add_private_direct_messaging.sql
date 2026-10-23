
create table if not exists public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_low uuid not null references public.profiles(id) on delete cascade,
  participant_high uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint direct_conversations_two_distinct_members check (participant_low < participant_high),
  constraint direct_conversations_unique_pair unique (participant_low, participant_high)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists direct_conversations_low_idx on public.direct_conversations(participant_low, created_at desc);
create index if not exists direct_conversations_high_idx on public.direct_conversations(participant_high, created_at desc);
create index if not exists direct_messages_conversation_created_idx on public.direct_messages(conversation_id, created_at desc);

alter table public.direct_conversations enable row level security;
alter table public.direct_messages enable row level security;

revoke all on public.direct_conversations, public.direct_messages from anon, authenticated;
grant select on public.direct_conversations to authenticated;
grant select, insert on public.direct_messages to authenticated;
grant all on public.direct_conversations, public.direct_messages to service_role;

drop policy if exists direct_conversations_select_participants on public.direct_conversations;
create policy direct_conversations_select_participants
on public.direct_conversations for select to authenticated
using (
  (select public.is_approved_member())
  and (
    participant_low = (select auth.uid())
    or participant_high = (select auth.uid())
  )
);

drop policy if exists direct_messages_select_participants on public.direct_messages;
create policy direct_messages_select_participants
on public.direct_messages for select to authenticated
using (
  (select public.is_approved_member())
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

drop policy if exists direct_messages_insert_sender_participant on public.direct_messages;
create policy direct_messages_insert_sender_participant
on public.direct_messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and length(trim(body)) between 1 and 4000
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

create or replace function public.start_direct_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_low uuid;
  v_high uuid;
  v_conversation_id uuid;
begin
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception 'Sign in before starting a conversation'
      using errcode = '42501';
  end if;

  if p_other_user_id is null or p_other_user_id = v_user_id then
    raise exception 'Choose another member to message'
      using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = v_user_id and p.status = 'approved'
  ) then
    raise exception 'Only approved members can start conversations'
      using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = p_other_user_id and p.status = 'approved'
  ) then
    raise exception 'The selected member is not available for messaging'
      using errcode = '22023';
  end if;

  v_low := least(v_user_id, p_other_user_id);
  v_high := greatest(v_user_id, p_other_user_id);

  insert into public.direct_conversations (
    participant_low, participant_high, created_by
  )
  values (v_low, v_high, v_user_id)
  on conflict (participant_low, participant_high) do nothing
  returning id into v_conversation_id;

  if v_conversation_id is null then
    select c.id into v_conversation_id
    from public.direct_conversations c
    where c.participant_low = v_low
      and c.participant_high = v_high;
  end if;

  return v_conversation_id;
end;
$$;

revoke all on function public.start_direct_conversation(uuid) from public, anon;
grant execute on function public.start_direct_conversation(uuid) to authenticated;
;
