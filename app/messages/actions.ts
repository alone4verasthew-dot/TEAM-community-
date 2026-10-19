"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  redirect(`/messages/${conversationId}`);
}

export async function sendDirectMessageAction(formData: FormData) {
  const { supabase, userId } = await requireApprovedMember();
  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!UUID_PATTERN.test(conversationId) || body.length < 1 || body.length > 4000) {
    redirect("/messages?notice=invalid-message");
  }

  const { error } = await supabase.from("direct_messages").insert({
    conversation_id: conversationId,
    sender_id: userId,
    body,
  });

  if (error) {
    redirect("/messages?notice=send-failed");
  }

  redirect(`/messages/${conversationId}`);
}
