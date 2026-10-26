
create or replace function public.is_invite_valid(p_token text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.invite_links il
    where il.token_hash = pg_catalog.encode(
        extensions.digest(coalesce(p_token, ''), 'sha256'),
        'hex'
      )
      and il.is_active = true
      and (il.expires_at is null or il.expires_at > pg_catalog.now())
      and (il.max_uses is null or il.uses_count < il.max_uses)
  );
$$;

revoke all on function public.is_invite_valid(text) from public;
grant execute on function public.is_invite_valid(text) to anon, authenticated;
;
