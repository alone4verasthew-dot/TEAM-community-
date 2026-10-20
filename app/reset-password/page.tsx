"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/app/components/password-field";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirm_password") ?? "");

    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Use at least 8 characters, including a lowercase letter, uppercase letter, number, and symbol.");
      setLoading(false);
      return;
    }
    if (password !== confirmation) {
      setError("The passwords don't match. Please enter them again.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setError("This reset link is invalid or expired. Request a new password reset email.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setStatus("Your password has been updated. Taking you to sign in…");
      window.setTimeout(() => router.replace("/login?message=password-updated"), 1200);
    } catch {
      setError("We couldn't update your password. Request a fresh reset link and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-panel auth-panel-wide">
        <Link className="auth-brand" href="/" aria-label="TFY home">
          <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
        </Link>
        <p className="auth-eyebrow">SECURE YOUR ACCOUNT</p>
        <h1>Choose a new password.</h1>
        <p className="auth-intro">Create a strong password to get back into your TFY circle.</p>

        {status ? <p className="auth-notice" role="status">{status}</p> : null}
        {error ? <p className="auth-error" role="alert">{error}</p> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <PasswordField id="reset-password" name="password" label="New password" autoComplete="new-password" showRequirements />
          <PasswordField id="reset-confirm-password" name="confirm_password" label="Confirm new password" autoComplete="new-password" />
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "UPDATING..." : "UPDATE PASSWORD"} <span>↗</span>
          </button>
        </form>

        <p className="auth-switch">Need a fresh link? <Link href="/forgot-password">Request another reset email</Link></p>
        <Link href="/login" className="auth-home-link">← Back to sign in</Link>
      </div>
    </main>
  );
}
