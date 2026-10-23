
create or replace function public.tfy_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
  v_display_name text;
  v_invite_token text;
  v_invite_id uuid;
begin
  v_invite_token := nullif(
    pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'invite_token', '')),
    ''
  );

  if v_invite_token is null then
    raise exception 'A valid TFY invitation code is required'
      using errcode = '23514';
  end if;

  select il.id into v_invite_id
  from public.invite_links il
  where il.token_hash = pg_catalog.encode(
      extensions.digest(v_invite_token, 'sha256'),
      'hex'
    )
    and il.is_active = true
    and (il.expires_at is null or il.expires_at > pg_catalog.now())
    and (il.max_uses is null or il.uses_count < il.max_uses)
  for update;

  if v_invite_id is null then
    raise exception 'Invitation code is invalid, expired, or already used'
      using errcode = '23514';
  end if;

  update public.invite_links
  set uses_count = uses_count + 1
  where id = v_invite_id;

  v_username := pg_catalog.lower(
    pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'username', ''))
  );
  if v_username !~ '^[a-z0-9_]{4,20}$' then
    v_username := null;
  end if;

  v_display_name := nullif(
    pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')),
    ''
  );
  if v_display_name is null then
    v_display_name := nullif(
      pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')),
      ''
    );
  end if;

  insert into public.profiles (id, username, display_name, status, role)
  values (new.id, v_username, v_display_name, 'pending', 'member')
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.tfy_handle_new_user() from public, anon, authenticated;
;
