-- Password recovery codes are stored only as SHA-256 digests.
-- These tables are accessed only by server routes using the service-role key.
create table if not exists public.account_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique check (code_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists account_recovery_codes_user_unused_idx
  on public.account_recovery_codes(user_id, created_at desc)
  where used_at is null;

create table if not exists public.account_recovery_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null check (ip_hash ~ '^[a-f0-9]{64}$'),
  username_hash text not null check (username_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);

create index if not exists account_recovery_attempts_ip_created_idx
  on public.account_recovery_attempts(ip_hash, created_at desc);
create index if not exists account_recovery_attempts_username_created_idx
  on public.account_recovery_attempts(username_hash, created_at desc);
create index if not exists account_recovery_attempts_created_idx
  on public.account_recovery_attempts(created_at);

alter table public.account_recovery_codes enable row level security;
alter table public.account_recovery_attempts enable row level security;

revoke all on public.account_recovery_codes, public.account_recovery_attempts
  from public, anon, authenticated;
grant all on public.account_recovery_codes, public.account_recovery_attempts
  to service_role;
grant usage, select on sequence public.account_recovery_attempts_id_seq to service_role;

comment on table public.account_recovery_codes is
  'One-time account recovery code hashes. Server-only; no client policies.';
comment on table public.account_recovery_attempts is
  'Hashed IP/username rate-limit records. Server-only; no client policies.';
