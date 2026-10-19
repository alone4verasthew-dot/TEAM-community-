"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const inviteCode = String(formData.get("invite_code") ?? "").trim();

  if (!email || !email.includes("@") || password.length < 8) {
    redirect("/signup?error=invalid");
  }
  if (!/^[a-z0-9_]{4,20}$/.test(username)) {
    redirect("/signup?error=username-format");
  }
  if (!inviteCode) {
    redirect("/signup?error=invite");
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/member`,
      data: {
        username,
        display_name: displayName || username,
        // The database trigger validates, hashes, and consumes this code atomically.
        invite_token: inviteCode,
      },
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("invitation code") || message.includes("invite")) {
      redirect("/signup?error=invite");
    }
    if (message.includes("username") || message.includes("duplicate key")) {
      redirect("/signup?error=username-taken");
    }
    if (message.includes("already registered") || message.includes("already exists")) {
      redirect("/signup?error=email-exists");
    }
    redirect("/signup?error=failed");
  }

  if (data.session) {
    redirect("/member");
  }
  redirect("/signup?message=check-email");
}
