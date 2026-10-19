import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";

export default async function MemberPage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId || typeof userId !== "string") {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, display_name, status, role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <Link className="auth-brand" href="/">么 TEAM <strong>ᵀᶠʸ</strong> 乂</Link>
          <h1>Profile not ready</h1>
          <p className="auth-intro">We couldn't load your TFY profile. Please refresh, or sign out and try again.</p>
          <form action={signOutAction}><button className="auth-submit" type="submit">SIGN OUT</button></form>
        </section>
      </main>
    );
  }

  const displayName = profile.display_name || profile.username || "TFY member";
  const isApproved = profile.status === "approved";
  const isRejected = profile.status === "rejected";

  return (
    <main className="auth-page">
      <section className="auth-panel member-panel">
        <Link className="auth-brand" href="/">么 TEAM <strong>ᵀᶠʸ</strong> 乂</Link>
        <p className="auth-eyebrow">{isApproved ? "WELCOME TO THE CIRCLE" : "TFY MEMBERSHIP"}</p>
        <h1>Welcome, {displayName}.</h1>
        {isApproved ? (
          <>
            <p className="auth-intro">Your membership is approved. Your private community space is the next stage being built.</p>
            <div className="member-status member-status-approved">MEMBER APPROVED</div>
            <p className="member-detail">Username: @{profile.username || "not set"}</p>
            <p className="member-detail">Access role: {profile.role}</p>
            {profile.role === "admin" ? <Link className="admin-dashboard-link" href="/admin">OPEN ADMIN DASHBOARD ↗</Link> : null}
          </>
        ) : isRejected ? (
          <>
            <p className="auth-intro">This membership request was not approved. Contact the TFY team if you think this is a mistake.</p>
            <div className="member-status member-status-rejected">REQUEST NOT APPROVED</div>
          </>
        ) : (
          <>
            <p className="auth-intro">Your account is created. An admin must approve your membership before you can access the private community.</p>
            <div className="member-status">PENDING ADMIN APPROVAL</div>
            <p className="member-detail">We’ll keep your space private while your request is reviewed.</p>
          </>
        )}
        <form action={signOutAction}><button className="auth-submit" type="submit">SIGN OUT</button></form>
      </section>
    </main>
  );
}
