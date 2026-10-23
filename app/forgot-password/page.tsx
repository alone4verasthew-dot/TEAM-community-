"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/account/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, recoveryCode, password }),
      });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Password recovery failed.");
      setStatus(result.message || "Password updated. Please sign in with your new password.");
      setUsername("");
      setRecoveryCode("");
      setPassword("");
      setConfirmPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete password recovery. Please try again.");
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
        <p className="auth-eyebrow">ACCOUNT RECOVERY</p>
        <h1>Find your way back.</h1>
        <p className="auth-intro">Use your TFY username and one of your saved recovery codes to set a new password. Recovery codes work once and do not require a reset email.</p>

        {status ? <p className="auth-notice" role="status">{status}</p> : null}
        {error ? <p className="auth-error" role="alert">{error}</p> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="recovery-username">TFY username</label>
          <input
            id="recovery-username"
            name="username"
            type="text"
            autoComplete="username"
            minLength={4}
            maxLength={20}
            pattern="[a-zA-Z0-9_]{4,20}"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <label htmlFor="recovery-code">Recovery code</label>
          <input
            id="recovery-code"
            name="recoveryCode"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={recoveryCode}
            onChange={(event) => setRecoveryCode(event.target.value)}
            placeholder="TFY-XXXX-XXXX-..."
            required
          />
          <label htmlFor="recovery-new-password">New password</label>
          <input
            id="recovery-new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="recovery-password-help"
            required
          />
          <p id="recovery-password-help" className="auth-privacy-note">Use at least 8 characters, including uppercase and lowercase letters, a number, and a symbol.</p>
          <label htmlFor="recovery-confirm-password">Confirm new password</label>
          <input
            id="recovery-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "UPDATING PASSWORD..." : "RESET PASSWORD"} <span>↗</span>
          </button>
        </form>

        <p className="auth-switch">Already signed in? <Link href="/recovery-codes">Manage your recovery codes</Link></p>
        <p className="auth-switch">Remembered your password? <Link href="/login">Back to sign in</Link></p>
        <Link href="/" className="auth-home-link">← Back to TFY home</Link>
      </div>
    </main>
  );
}
