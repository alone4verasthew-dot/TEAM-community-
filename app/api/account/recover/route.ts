import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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

function validPassword(password: string) {
  return password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

export async function POST(request: NextRequest) {
  let username = "";
  try {
    const body = await request.json() as {
      username?: unknown;
      recoveryCode?: unknown;
      password?: unknown;
    };
    username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const recoveryCode = typeof body.recoveryCode === "string" ? body.recoveryCode.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!/^[a-z0-9_]{4,20}$/.test(username) || !recoveryCode.startsWith("TFY") || recoveryCode.length !== 19 || !validPassword(password)) {
      return NextResponse.json({ error: "Enter a valid username, recovery code, and strong password." }, { status: 400 });
    }

    const admin = getAdminClient();
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = request.headers.get("x-real-ip")?.trim() || forwardedFor || "unknown";
    const ipHash = sha256(ip);
    const usernameHash = sha256(username);
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { error: logError } = await admin.from("account_recovery_attempts").insert({
      ip_hash: ipHash,
      username_hash: usernameHash,
    });
    if (logError) throw logError;

    const [{ count: ipCount, error: ipError }, { count: usernameCount, error: usernameError }] = await Promise.all([
      admin.from("account_recovery_attempts").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", cutoff),
      admin.from("account_recovery_attempts").select("id", { count: "exact", head: true }).eq("username_hash", usernameHash).gte("created_at", cutoff),
    ]);
    if (ipError || usernameError) throw ipError || usernameError;
    if ((ipCount ?? 0) > 10 || (usernameCount ?? 0) > 5) {
      return NextResponse.json({ error: "Too many recovery attempts. Please try again later." }, { status: 429 });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) {
      return NextResponse.json({ error: "Username or recovery code is invalid." }, { status: 400 });
    }

    const codeHash = sha256(recoveryCode);
    const { data: codeRow, error: codeError } = await admin
      .from("account_recovery_codes")
      .select("id")
      .eq("user_id", profile.id)
      .eq("code_hash", codeHash)
      .is("used_at", null)
      .maybeSingle();

    if (codeError) throw codeError;
    if (!codeRow) {
      return NextResponse.json({ error: "Username or recovery code is invalid." }, { status: 400 });
    }

    // Conditional update makes a code single-use even if two requests race.
    const { data: consumed, error: consumeError } = await admin
      .from("account_recovery_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", codeRow.id)
      .is("used_at", null)
      .select("id")
      .maybeSingle();

    if (consumeError) throw consumeError;
    if (!consumed) {
      return NextResponse.json({ error: "Username or recovery code is invalid." }, { status: 400 });
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(profile.id, { password });
    if (updateError) {
      // The code stays consumed if the auth provider rejects the update; other codes remain available.
      return NextResponse.json({ error: "Password update failed. Please use another recovery code or try again." }, { status: 500 });
    }

    return NextResponse.json({ message: "Password updated. Please sign in with your new password." });
  } catch {
    return NextResponse.json({ error: "We couldn't complete password recovery right now. Please try again." }, { status: 500 });
  }
}
