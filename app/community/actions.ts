"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ChatAttachment = { path: string; name: string; type: string; size: number };
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm",
  "application/pdf", "text/plain", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
function parseAttachments(formData: FormData, kind: "community" | "direct", targetId: string, userId: string): ChatAttachment[] | null {
  const raw = String(formData.get("attachments") ?? "[]");
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!Array.isArray(parsed) || parsed.length > 5) return null;
  const prefix = `${kind}/${targetId}/${userId}/`;
  const attachments: ChatAttachment[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") return null;
    const value = item as Partial<ChatAttachment>;
    if (typeof value.path !== "string" || !value.path.startsWith(prefix) ||
      typeof value.name !== "string" || value.name.length < 1 || value.name.length > 160 ||
      typeof value.type !== "string" || !ALLOWED_ATTACHMENT_TYPES.has(value.type) ||
      typeof value.size !== "number" || value.size <= 0 || value.size > 20 * 1024 * 1024) return null;
    attachments.push({ path: value.path, name: value.name, type: value.type, size: value.size });
  }
  return attachments;
}


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
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; attachments: unknown; created_at: string }[] };
  }

  const { supabase, userId, role } = await requireApprovedMember();
  const { data: community } = await supabase
    .from("communities")
    .select("id, slug, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!community || (!community.is_active && role !== "admin")) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; attachments: { path: string; name: string; type: string; size: number }[]; created_at: string }[] };
  }
  if (slug === "community-two" && role !== "admin") {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; attachments: { path: string; name: string; type: string; size: number }[]; created_at: string }[] };
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("community_id", community.id)
    .eq("profile_id", userId)
    .maybeSingle();
  const adminPrivateAccess = role === "admin" && (slug === "community-two" || slug === "community-three");
  if (!membership && !adminPrivateAccess) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; attachments: { path: string; name: string; type: string; size: number }[]; created_at: string }[] };
  }

  const { data, error } = await supabase
    .from("community_messages")
    .select("id, sender_id, body, attachments, created_at")
    .eq("community_id", community.id)
    .lt("created_at", before)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; attachments: { path: string; name: string; type: string; size: number }[]; created_at: string }[] };
  }

  const olderMessages = [...(data ?? [])].reverse();
  const senderIds = [...new Set(olderMessages.map((message) => message.sender_id))];
  const [{ data: profiles }, { data: bannerCommunity }] = senderIds.length
    ? await Promise.all([
        supabase.from("profiles").select("id, username, display_name, role").in("id", senderIds),
        supabase.from("communities").select("id").eq("slug", "community-three").maybeSingle(),
      ])
    : [{ data: [] as { id: string; username: string | null; display_name: string | null; role: string }[] }, { data: null as { id: string } | null }];
  const { data: bannerRows } = bannerCommunity && senderIds.length
    ? await supabase.from("memberships").select("profile_id").eq("community_id", bannerCommunity.id).in("profile_id", senderIds)
    : { data: [] as { profile_id: string }[] };
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const bannerIds = new Set((bannerRows ?? []).map((row) => row.profile_id));

  return {
    ok: true as const,
    messages: olderMessages.map((message) => {
      const profile = profileById.get(message.sender_id);
      return {
        ...message,
        attachments: Array.isArray(message.attachments) ? message.attachments as unknown as { path: string; name: string; type: string; size: number }[] : [],
        sender_name: profile?.display_name || profile?.username || "TFY member",
        sender_role: profile?.role || "member",
        is_banner: bannerIds.has(message.sender_id),
      };
    }),
    hasMore: (data ?? []).length === 50,
  };
}

export async function sendCommunityMessageAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const communityId = String(formData.get("community_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!SLUG_PATTERN.test(slug) || !UUID_PATTERN.test(communityId) || body.length > 4000) {
    return { ok: false as const, error: "Messages must contain 1–4,000 characters." };
  }

  const { supabase, userId } = await requireApprovedMember();
  const attachments = parseAttachments(formData, "community", communityId, userId);
  if (!attachments || (!body && attachments.length === 0)) return { ok: false as const, error: "Add a message or up to 5 valid attachments." };
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
    .insert({ community_id: communityId, sender_id: userId, body: body || " ", attachments })
    .select("id, community_id, sender_id, body, attachments, created_at")
    .single();

  if (error || !message) return { ok: false as const, error: "Message could not be sent. Please try again." };

  revalidatePath(`/community/${slug}`);
  return { ok: true as const, message };
}
