"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireApprovedMember() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId || typeof userId !== "string") redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.status !== "approved") redirect("/member");
  return { supabase, userId };
}

export async function enterCommunityAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!SLUG_PATTERN.test(slug)) redirect("/#community");

  const { supabase, userId } = await requireApprovedMember();
  const { data: community } = await supabase
    .from("communities")
    .select("id, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!community) redirect("/#community");

  const { data: membership } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("community_id", community.id)
    .eq("profile_id", userId)
    .maybeSingle();

  if (!membership) {
    const { error } = await supabase.from("memberships").insert({
      community_id: community.id,
      profile_id: userId,
    });
    if (error && error.code !== "23505") {
      redirect("/member?notice=community-join-failed");
    }
  }

  revalidatePath(`/community/${slug}`);
  redirect(`/community/${slug}`);
}

export async function sendCommunityMessageAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const communityId = String(formData.get("community_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!SLUG_PATTERN.test(slug) || !UUID_PATTERN.test(communityId) || body.length < 1 || body.length > 4000) {
    redirect(`/community/${SLUG_PATTERN.test(slug) ? slug : "community-one"}?notice=invalid-message`);
  }

  const { supabase, userId } = await requireApprovedMember();
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("id", communityId)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!community) redirect(`/community/${slug}?notice=community-unavailable`);

  const { data: membership } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("community_id", communityId)
    .eq("profile_id", userId)
    .maybeSingle();

  if (!membership) redirect(`/community/${slug}?notice=not-a-member`);

  const { error } = await supabase.from("community_messages").insert({
    community_id: communityId,
    sender_id: userId,
    body,
  });

  if (error) redirect(`/community/${slug}?notice=send-failed`);

  revalidatePath(`/community/${slug}`);
  redirect(`/community/${slug}`);
}
