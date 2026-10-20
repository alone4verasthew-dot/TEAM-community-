"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (requestError) throw requestError;
      setStatus("If an account exists for that email, a password reset link will arrive shortly. Check your inbox and spam folder.");
    } catch {
      setError("We couldn't send the reset email right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="auth-brand" href="/" aria-label="TFY home">
          <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
        </Link>
        <p className="auth-eyebrow">ACCOUNT RECOVERY</p>
        <h1>Find your way back.</h1>
        <p className="auth-intro">Enter the email linked to your TFY account. We'll send you a secure password reset link.</p>

        {status ? <p className="auth-notice" role="status">{status}</p> : null}
        {error ? <p className="auth-error" role="alert">{error}</p> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="recovery-email">Email address</label>
          <input
            id="recovery-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "SENDING..." : "SEND RESET LINK"} <span>↗</span>
          </button>
        </form>

        <p className="auth-switch">Remembered your password? <Link href="/login">Back to sign in</Link></p>
        <Link href="/" className="auth-home-link">← Back to TFY home</Link>
      </div>
    </main>
  );
}
