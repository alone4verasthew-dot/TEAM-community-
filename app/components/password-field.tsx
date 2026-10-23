"use client";

import { useState } from "react";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  showRequirements?: boolean;
};

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  required = true,
  showRequirements = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-password-field">
      <label htmlFor={id}>
        {label}
        {showRequirements ? <span className="auth-label-note">8+ characters</span> : null}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={showRequirements ? 8 : undefined}
          required={required}
          aria-describedby={showRequirements ? `${id}-requirements` : undefined}
          style={{ width: "100%", paddingRight: "3rem" }}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: "0.65rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.35rem",
            border: 0,
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          {visible ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" strokeLinecap="round" />
              <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.7 4.8 9.5 6-.4.7-1.4 2.1-3.4 3.6M6.2 6.2C3.8 7.7 2.5 10 2.5 11c.8 1.2 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {showRequirements ? (
        <ul id={`${id}-requirements`} className="auth-password-requirements" aria-live="polite">
          <li>At least 8 characters</li>
          <li>At least one lowercase letter (a–z)</li>
          <li>At least one uppercase letter (A–Z)</li>
          <li>At least one number (0–9)</li>
          <li>At least one symbol (for example, ! @ # $)</li>
        </ul>
      ) : null}
    </div>
  );
}
