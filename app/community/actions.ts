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
    .select("status, role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.status !== "approved") redirect("/member");
  return { supabase, userId, role: profile.role };
}

export async function enterCommunityAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!SLUG_PATTERN.test(slug)) redirect("/#community");

  const { supabase, userId, role } = await requireApprovedMember();
  const { data: community } = await supabase
    .from("communities")
    .select("id, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!community) redirect("/#community");
  if (community.slug === "community-two" && role !== "admin") redirect("/member?notice=community-restricted");
  if (community.slug === "community-three" && role !== "admin") {
    const { data: bannerMembership } = await supabase.from("memberships").select("community_id").eq("community_id", community.id).eq("profile_id", userId).maybeSingle();
    if (!bannerMembership) redirect("/member?notice=community-restricted");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("community_id", community.id)
    .eq("profile_id", userId)
    .maybeSingle();

  if (!membership && !(role === "admin" && (community.slug === "community-two" || community.slug === "community-three"))) {
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


export async function loadOlderCommunityMessagesAction(slug: string, before: string) {
  if (!SLUG_PATTERN.test(slug) || !before || Number.isNaN(Date.parse(before))) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; created_at: string }[] };
  }

  const { supabase, userId, role } = await requireApprovedMember();
  const { data: community } = await supabase
    .from("communities")
    .select("id, slug, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!community || (!community.is_active && role !== "admin")) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; created_at: string }[] };
  }
  if (slug === "community-two" && role !== "admin") {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; created_at: string }[] };
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("community_id", community.id)
    .eq("profile_id", userId)
    .maybeSingle();
  const adminPrivateAccess = role === "admin" && (slug === "community-two" || slug === "community-three");
  if (!membership && !adminPrivateAccess) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; created_at: string }[] };
  }

  const { data, error } = await supabase
    .from("community_messages")
    .select("id, sender_id, body, created_at")
    .eq("community_id", community.id)
    .lt("created_at", before)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; created_at: string }[] };
  }

  return {
    ok: true as const,
    messages: [...(data ?? [])].reverse(),
    hasMore: (data ?? []).length === 50,
  };
}

export async function sendCommunityMessageAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const communityId = String(formData.get("community_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!SLUG_PATTERN.test(slug) || !UUID_PATTERN.test(communityId) || body.length < 1 || body.length > 4000) {
    return { ok: false as const, error: "Messages must contain 1–4,000 characters." };
  }

  const { supabase, userId } = await requireApprovedMember();
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("id", communityId)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!community) return { ok: false as const, error: "This community is no longer available." };

  const [{ data: membership }, { data: viewer }] = await Promise.all([
    supabase.from("memberships").select("community_id").eq("community_id", communityId).eq("profile_id", userId).maybeSingle(),
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
  ]);

  const adminPrivateAccess = viewer?.role === "admin" &&
    (slug === "community-two" || slug === "community-three");
  if (!membership && !adminPrivateAccess) {
    return { ok: false as const, error: "Enter this community before sending a message." };
  }

  const { data: message, error } = await supabase
    .from("community_messages")
    .insert({ community_id: communityId, sender_id: userId, body })
    .select("id, community_id, sender_id, body, created_at")
    .single();

  if (error || !message) return { ok: false as const, error: "Message could not be sent. Please try again." };

  revalidatePath(`/community/${slug}`);
  return { ok: true as const, message };
}
