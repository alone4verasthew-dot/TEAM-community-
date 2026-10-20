import Link from "next/link";
import { loginAction } from "./actions";
import { PasswordField } from "../components/password-field";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage: Record<string, string> = {
    invalid: "Enter a valid email address and password.",
    credentials: "Email or password is incorrect. Please try again.",
    confirmation: "Email confirmation link could not be used. Request a fresh link or sign in again.",
  };
  const notice = params.message === "signed-out" ? "You have been signed out." : "";

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="auth-brand" href="/" aria-label="TFY home">
          <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
        </Link>
        <p className="auth-eyebrow">WELCOME BACK</p>
        <h1>Return to your circle.</h1>
        <p className="auth-intro">Sign in to continue your path with TFY.</p>

        {notice ? <p className="auth-notice" role="status">{notice}</p> : null}
        {params.error && errorMessage[params.error] ? (
          <p className="auth-error" role="alert">{errorMessage[params.error]}</p>
        ) : null}

        <form action={loginAction} className="auth-form">
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" name="email" type="email" autoComplete="email" required />
          <PasswordField id="login-password" name="password" label="Password" autoComplete="current-password" />
          <button className="auth-submit" type="submit">SIGN IN <span>↗</span></button>
        </form>

        <p className="auth-switch">Have an invitation code? <Link href="/signup">Create your account</Link></p>
        <Link href="/" className="auth-home-link">← Back to TFY home</Link>
      </div>
    </main>
  );
}
