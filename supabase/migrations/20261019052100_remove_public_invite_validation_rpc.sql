
revoke all on function public.is_invite_valid(text) from public, anon, authenticated;
drop function public.is_invite_valid(text);
;
