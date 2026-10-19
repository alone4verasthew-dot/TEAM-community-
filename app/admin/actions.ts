"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AdminActionKind = "approve" | "reject";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId || typeof userId !== "string") {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.status !== "approved" || profile.role !== "admin") {
    redirect("/member");
  }

  return { supabase, userId };
}

export async function reviewMemberAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const action = String(formData.get("action") ?? "") as AdminActionKind;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) ||
    (action !== "approve" && action !== "reject")
  ) {
    redirect("/admin?notice=invalid-request");
  }

  if (action === "approve") {
    const { error } = await supabase.rpc("admin_approve_member", {
      p_user_id: userId,
      p_community_id: null,
    });
    if (error) {
      redirect("/admin?notice=approve-failed");
    }
    revalidatePath("/admin");
    redirect("/admin?notice=member-approved");
  }

  const { error } = await supabase.rpc("admin_reject_member", {
    p_user_id: userId,
  });
  if (error) {
    redirect("/admin?notice=reject-failed");
  }

  revalidatePath("/admin");
  redirect("/admin?notice=member-rejected");
}

export type InviteActionState = {
  error?: string;
  inviteCode?: string;
  expiresAt?: string;
};

export async function createInviteAction(
  _previousState: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const { supabase, userId } = await requireAdmin();
  const daysValue = String(formData.get("expires_in_days") ?? "7");
  const allowedDays = new Set(["1", "7", "30"]);
  if (!allowedDays.has(daysValue)) {
    return { error: "Choose a valid invitation expiry period." };
  }

  // The raw secret is shown only in this authenticated server-action response.
  // Only its SHA-256 digest is stored in Postgres.
  const inviteCode = `TFY-${randomBytes(32).toString("base64url")}`;
  const tokenHash = createHash("sha256").update(inviteCode, "utf8").digest("hex");
  const expiresAt = new Date(Date.now() + Number(daysValue) * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("invite_links").insert({
    token_hash: tokenHash,
    created_by: userId,
    is_active: true,
    expires_at: expiresAt.toISOString(),
    max_uses: 1,
    uses_count: 0,
  });

  if (error) {
    return { error: "Invite code couldn't be created. Check your admin permissions and try again." };
  }

  revalidatePath("/admin");
  return {
    inviteCode,
    expiresAt: expiresAt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }),
  };
}
