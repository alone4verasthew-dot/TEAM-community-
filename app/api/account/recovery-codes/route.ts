import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Recovery service is not configured.");
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST() {
  try {
    const userClient = await createClient();
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Sign in to manage recovery codes." }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.username) {
      return NextResponse.json({ error: "Your TFY username is not available. Contact an administrator." }, { status: 400 });
    }

    const codes = Array.from({ length: 5 }, () => {
      const hex = randomBytes(12).toString("hex").toUpperCase();
      const groups = hex.match(/.{1,4}/g) ?? [];
      return `TFY-${groups.join("-")}`;
    });

    // Invalidate any previous set before issuing a new one.
    const { error: deleteError } = await admin
      .from("account_recovery_codes")
      .delete()
      .eq("user_id", user.id);
    if (deleteError) throw deleteError;

    const rows = codes.map((code) => ({
      user_id: user.id,
      code_hash: sha256(code.replace(/[^A-Z0-9]/g, "")),
    }));
    const { error: insertError } = await admin.from("account_recovery_codes").insert(rows);
    if (insertError) throw insertError;

    return NextResponse.json({
      codes,
      message: "Save these codes now. They will not be shown again.",
    });
  } catch {
    return NextResponse.json({ error: "We couldn't generate recovery codes right now. Please try again." }, { status: 500 });
  }
}
