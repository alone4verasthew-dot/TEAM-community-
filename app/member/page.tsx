import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import RoleBadges from "@/app/components/role-badges";

// These pages render user-specific data and must never be prerendered or shared-cached.
export const dynamic = "force-dynamic";

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
          <p className="auth-intro">We could not load your TFY profile. Please refresh, or sign out and try again.</p>
          <form action={signOutAction}><button className="auth-submit" type="submit">SIGN OUT</button></form>
        </section>
      </main>
    );
  }

  const displayName = profile.display_name || profile.username || "TFY member";
  const { data: bannerCommunity } = await supabase.from("communities").select("id").eq("slug", "community-three").maybeSingle();
  const { data: bannerMembership } = bannerCommunity && profile.status === "approved" ? await supabase.from("memberships").select("community_id").eq("community_id", bannerCommunity.id).eq("profile_id", userId).maybeSingle() : { data: null };
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
            <p className="auth-intro">Your membership is approved. You can now find approved members and start private one-to-one conversations.</p>
            <div className="member-status member-status-approved">MEMBER APPROVED</div>
            <RoleBadges isBanner={Boolean(bannerMembership)} isAdmin={profile.role === "admin"} />
            <p className="member-detail">Username: @{profile.username || "not set"}</p>
            <p className="member-detail">Access role: {profile.role}</p>
            <Link className="member-messages-link" href="/messages">OPEN PRIVATE MESSAGES ↗</Link>
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
        <Link className="member-messages-link" href="/recovery-codes">MANAGE ACCOUNT RECOVERY CODES ↗</Link>
        <form action={signOutAction}><button className="auth-submit" type="submit">SIGN OUT</button></form>
      </section>
    </main>
  );
}
