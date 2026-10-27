"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  if (!userId || typeof userId !== "string") {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.status !== "approved") {
    redirect("/member");
  }

  return { supabase, userId };
}

export async function startDirectConversationAction(formData: FormData) {
  const { supabase, userId } = await requireApprovedMember();
  const otherUserId = String(formData.get("other_user_id") ?? "");

  if (!UUID_PATTERN.test(otherUserId) || otherUserId === userId) {
    redirect("/messages?notice=invalid-member");
  }

  const { data: conversationId, error } = await supabase.rpc(
    "start_direct_conversation",
    { p_other_user_id: otherUserId },
  );

  if (error || !conversationId) {
    redirect("/messages?notice=start-failed");
  }

  redirect(`/messages?conversation=${conversationId}`);
}

export async function loadOlderDirectMessagesAction(conversationId: string, before: string) {
  if (!UUID_PATTERN.test(conversationId) || !before || Number.isNaN(Date.parse(before))) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; created_at: string }[] };
  }

  const { supabase } = await requireApprovedMember();
  const { data: conversation } = await supabase
    .from("direct_conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation) {
    return { ok: false as const, messages: [] as { id: string; sender_id: string; body: string; created_at: string }[] };
  }

  const { data, error } = await supabase
    .from("direct_messages")
    .select("id, sender_id, body, attachments, created_at")
    .eq("conversation_id", conversationId)
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

export async function sendDirectMessageAction(formData: FormData) {
  const { supabase, userId } = await requireApprovedMember();
  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!UUID_PATTERN.test(conversationId) || body.length > 4000) {
    return { ok: false as const, error: "Messages must contain 1–4,000 characters." };
  }

  const attachments = parseAttachments(formData, "direct", conversationId, userId);
  if (!attachments || (!body && attachments.length === 0)) return { ok: false as const, error: "Add a message or up to 5 valid attachments." };

  const { data: message, error } = await supabase
    .from("direct_messages")
    .insert({ conversation_id: conversationId, sender_id: userId, body: body || " ", attachments })
    .select("id, conversation_id, sender_id, body, attachments, created_at")
    .single();

  if (error || !message) {
    return { ok: false as const, error: "Message could not be sent. Please try again." };
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true as const, message };
}
