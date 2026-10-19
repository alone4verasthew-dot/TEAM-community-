import Link from "next/link";
import { signupAction } from "./actions";

type SignupPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const errorMessage: Record<string, string> = {
    invalid: "Enter a valid email address and a password with at least 8 characters.",
    "username-format": "Username must be 4–20 characters: lowercase letters, numbers, or underscores.",
    invite: "That invitation code is invalid, expired, or has already been used.",
    "username-taken": "That username is already in use. Please choose another.",
    "email-exists": "An account with that email may already exist. Try signing in.",
    failed: "We couldn't create the account. Check your details and try again.",
  };

  return (
    <main className="auth-page">
      <div className="auth-panel auth-panel-wide">
        <Link className="auth-brand" href="/" aria-label="TFY home">
          <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
        </Link>
        <p className="auth-eyebrow">INVITE ONLY · 80 MEMBERS MAX</p>
        <h1>Find your people.</h1>
        <p className="auth-intro">Create your account with a valid TFY invitation code. New accounts start pending until an admin approves them.</p>

        {params.message === "check-email" ? (
          <p className="auth-notice" role="status">Account request received. Check your inbox to confirm your email before signing in.</p>
        ) : null}
        {params.error && errorMessage[params.error] ? (
          <p className="auth-error" role="alert">{errorMessage[params.error]}</p>
        ) : null}

        <form action={signupAction} className="auth-form">
          <label htmlFor="signup-display-name">Display name</label>
          <input id="signup-display-name" name="display_name" type="text" autoComplete="name" maxLength={60} />
          <label htmlFor="signup-username">Username</label>
          <input id="signup-username" name="username" type="text" autoComplete="username" minLength={4} maxLength={20} pattern="[a-zA-Z0-9_]{4,20}" required />
          <label htmlFor="signup-email">Email address</label>
          <input id="signup-email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="signup-password">Password <span className="auth-label-note">8+ characters</span></label>
          <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <label htmlFor="signup-invite-code">Invitation code</label>
          <input id="signup-invite-code" name="invite_code" type="password" autoComplete="off" required />
          <button className="auth-submit" type="submit">REQUEST ACCESS <span>↗</span></button>
          <p className="auth-privacy-note">Your invitation code is checked by the database and consumed once when signup succeeds.</p>
        </form>

        <p className="auth-switch">Already in the circle? <Link href="/login">Sign in</Link></p>
        <Link href="/" className="auth-home-link">← Back to TFY home</Link>
      </div>
    </main>
  );
}
