"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
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
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (requestError) throw requestError;
      sessionStorage.setItem("tfy-password-reset-email", email.trim());
      setStatus("If an account exists for that email, a reset code will arrive shortly. Check your inbox and spam folder, then enter the code on the next screen.");
      window.location.assign("/reset-password");
    } catch {
      setError("We couldn't send the reset code right now. Please wait a while and try again.");
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
        <p className="auth-intro">Enter the email linked to your TFY account. We&apos;ll send you a one-time reset code.</p>

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
            {loading ? "SENDING CODE..." : "SEND RESET CODE"} <span>↗</span>
          </button>
        </form>

        <p className="auth-switch">Remembered your password? <Link href="/login">Back to sign in</Link></p>
        <Link href="/" className="auth-home-link">← Back to TFY home</Link>
      </div>
    </main>
  );
}
