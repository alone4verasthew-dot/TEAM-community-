"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/app/components/password-field";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const token = String(formData.get("token") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirm_password") ?? "");

    if (!email.trim() || !/^\d{6}$/.test(token)) {
      setError("Enter the email address and the 6-digit code from your reset email.");
      setLoading(false);
      return;
    }
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
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "recovery",
      });
      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setStatus("Your password has been updated. Taking you to sign in…");
      window.setTimeout(() => router.replace("/login?message=password-updated"), 1200);
    } catch {
      setError("The code is invalid or expired, or the email service is temporarily rate-limited. Request a new code and try again.");
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
        <p className="auth-intro">Enter the one-time code from your email and choose a new password.</p>

        {status ? <p className="auth-notice" role="status">{status}</p> : null}
        {error ? <p className="auth-error" role="alert">{error}</p> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="recovery-email">Email address</label>
          <input id="recovery-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="recovery-token">6-digit reset code</label>
          <input id="recovery-token" name="token" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="123456" required />
          <PasswordField id="reset-password" name="password" label="New password" autoComplete="new-password" showRequirements />
          <PasswordField id="reset-confirm-password" name="confirm_password" label="Confirm new password" autoComplete="new-password" />
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "VERIFYING CODE..." : "VERIFY CODE & UPDATE PASSWORD"} <span>↗</span>
          </button>
        </form>

        <p className="auth-switch">Need a new code? <Link href="/forgot-password">Request another reset code</Link></p>
        <p className="auth-switch">Remembered your password? <Link href="/login">Back to sign in</Link></p>
        <Link href="/" className="auth-home-link">← Back to TFY home</Link>
      </div>
    </main>
  );
}
