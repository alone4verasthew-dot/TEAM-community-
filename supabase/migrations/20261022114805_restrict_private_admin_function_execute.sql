revoke all on function private.admin_set_member_role_internal(uuid, text) from public, anon;
revoke all on function private.admin_set_banner_membership_internal(uuid, boolean) from public, anon;
grant execute on function private.admin_set_member_role_internal(uuid, text) to authenticated;
grant execute on function private.admin_set_banner_membership_internal(uuid, boolean) to authenticated;
