-- TFY group chat messages and seeded landing-page communities
create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists community_messages_community_created_idx
  on public.community_messages (community_id, created_at asc);

alter table public.community_messages enable row level security;

drop policy if exists community_messages_select_members on public.community_messages;
create policy community_messages_select_members
  on public.community_messages for select to authenticated
  using (
    (select public.is_approved_member())
    and exists (
      select 1
      from public.memberships m
      join public.communities c on c.id = m.community_id
      where m.profile_id = (select auth.uid())
        and m.community_id = community_messages.community_id
        and c.is_active = true
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
      select 1
      from public.memberships m
      join public.communities c on c.id = m.community_id
      where m.profile_id = (select auth.uid())
        and m.community_id = community_messages.community_id
        and c.is_active = true
    )
  );

grant select, insert on public.community_messages to authenticated;

insert into public.communities (slug, name, description, is_active)
values
  ('community-one', '🦅:𝘛𝘌𝘈𝘔 (;™🕷️∆)𝘛 𝘍 𝘠🍁', 'One circle. One path. One TFY family.', true),
  ('community-two', 'ADMINS OF TFY', 'Coordinate, plan and keep the TFY community moving forward.', true),
  ('community-three', '᥇ꪖ​ꪀꪀꫀ𝘳𝘴', 'Share banners, visuals and creative designs for the TFY circle.', true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    is_active = true,
    updated_at = now();
