"use client";

import Link from "next/link";
import { useState } from "react";

export default function RecoveryCodesPage() {
  const [codes, setCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function generateCodes() {
    if (codes && !window.confirm("Generating new codes will invalidate your previous recovery codes. Continue?")) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/account/recovery-codes", { method: "POST" });
      const result = await response.json() as { codes?: string[]; error?: string; message?: string };
      if (!response.ok || !result.codes) throw new Error(result.error || "Couldn't generate recovery codes.");
      setCodes(result.codes);
      setNotice(result.message || "Save these codes now. They will not be shown again.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't generate recovery codes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyCodes() {
    if (!codes) return;
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setNotice("Recovery codes copied. Store them somewhere private and safe.");
    } catch {
      setError("Clipboard access was blocked. Select and copy the codes manually.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-panel auth-panel-wide">
        <Link className="auth-brand" href="/" aria-label="TFY home">
          <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
        </Link>
        <p className="auth-eyebrow">ACCOUNT SECURITY</p>
        <h1>Keep a way back.</h1>
        <p className="auth-intro">Create one-time recovery codes so you can reset your password without relying on a reset email. You must be signed in to create them.</p>

        {error ? <p className="auth-error" role="alert">{error}</p> : null}
        {notice ? <p className="auth-notice" role="status">{notice}</p> : null}

        {codes ? (
          <>
            <div role="group" aria-label="Your recovery codes" style={{ display: "grid", gap: "0.65rem", margin: "1.25rem 0" }}>
              {codes.map((code) => (
                <code key={code} style={{ display: "block", padding: "0.8rem 1rem", border: "1px solid var(--border, #444)", borderRadius: "0.65rem", letterSpacing: "0.08em", overflowWrap: "anywhere" }}>{code}</code>
              ))}
            </div>
            <p className="auth-privacy-note">Each code works once. These codes are shown only now; save them in a password manager or another private place. Anyone who has a code may be able to reset your password.</p>
            <button className="auth-submit" type="button" onClick={copyCodes}>COPY ALL CODES <span>↗</span></button>
            <button className="auth-submit" type="button" onClick={generateCodes} disabled={loading} style={{ marginTop: "0.75rem" }}>
              {loading ? "GENERATING..." : "REPLACE THESE CODES"} <span>↻</span>
            </button>
          </>
        ) : (
          <button className="auth-submit" type="button" onClick={generateCodes} disabled={loading}>
            {loading ? "GENERATING..." : "GENERATE RECOVERY CODES"} <span>↗</span>
          </button>
        )}

        <p className="auth-switch">Need to recover an account? <Link href="/forgot-password">Go to account recovery</Link></p>
        <Link href="/member" className="auth-home-link">← Back to TFY Community</Link>
      </div>
    </main>
  );
}
