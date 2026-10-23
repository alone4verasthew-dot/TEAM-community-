import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import { manageMemberAccessAction, reviewMemberAction } from "./actions";
import InviteCreator from "./InviteCreator";

// These pages render user-specific data and must never be prerendered or shared-cached.
export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

const notices: Record<string, { text: string; kind: "success" | "error" }> = {
  "member-approved": { text: "Member approved successfully.", kind: "success" },
  "member-rejected": { text: "Membership request rejected.", kind: "success" },
  "approve-failed": { text: "Approval failed. The member cap may have been reached, or the request may no longer be pending.", kind: "error" },
  "reject-failed": { text: "Reject action failed. Refresh the page and try again.", kind: "error" },
  "invalid-request": { text: "That request could not be processed. Refresh and try again.", kind: "error" },
  "access-updated": { text: "Member access updated.", kind: "success" },
  "access-failed": { text: "Member access could not be updated. Refresh and try again.", kind: "error" },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId || typeof userId !== "string") {
    redirect("/login");
  }

  const { data: viewer } = await supabase
    .from("profiles")
    .select("status, role, display_name, username")
    .eq("id", userId)
    .maybeSingle();

  if (viewer?.status !== "approved" || viewer.role !== "admin") {
    redirect("/member");
  }

  const [
    { data: profiles, error: profilesError },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, status, role, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("app_settings")
      .select("member_cap, approval_enabled")
      .eq("singleton_id", 1)
      .maybeSingle(),
  ]);

  const { data: bannerCommunity } = await supabase.from("communities").select("id").eq("slug", "community-three").maybeSingle();
  const { data: bannerRows } = bannerCommunity ? await supabase.from("memberships").select("profile_id").eq("community_id", bannerCommunity.id) : { data: [] };
  const bannerMemberIds = new Set((bannerRows ?? []).map((row) => row.profile_id));
  const allProfiles = profiles ?? [];
  const pendingProfiles = allProfiles.filter((profile) => profile.status === "pending");
  const approvedProfiles = allProfiles.filter((profile) => profile.status === "approved");
  const notice = params.notice ? notices[params.notice] : undefined;

  return (
    <main className="auth-page admin-page">
      <div className="admin-atmosphere" aria-hidden="true">
        <div className="admin-blood-moon" />
        <div className="admin-fog admin-fog-one" />
        <div className="admin-fog admin-fog-two" />
        <svg className="admin-landscape-art" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="adminMountain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#280510" />
              <stop offset="1" stopColor="#050407" />
            </linearGradient>
            <linearGradient id="adminGateGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8c0b25" stopOpacity="0" />
              <stop offset=".5" stopColor="#ff334e" stopOpacity=".65" />
              <stop offset="1" stopColor="#8c0b25" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 330 130 245 245 300 398 174 535 290 695 205 840 305 995 185 1115 280 1270 166 1440 278V520H0Z" fill="url(#adminMountain)" />
          <path d="M0 390 180 323 355 365 515 295 660 355 835 286 1010 372 1180 297 1325 350 1440 310V520H0Z" fill="#080508" />
          <g fill="none" stroke="#a3132c" strokeOpacity=".25" strokeWidth="2">
            <path d="M995 390V270M1120 390V270M970 286H1145M980 264Q1060 235 1135 264" />
            <path d="M1022 390V300M1092 390V300M1010 310H1105" strokeWidth="5" />
            <path d="M125 520V390M210 520V390M105 405H230M115 382Q168 358 220 382" />
          </g>
          <path d="M0 454Q300 415 520 455T960 440T1440 430V520H0Z" fill="#030304" />
          <path d="M0 455Q300 416 520 455T960 440T1440 430" stroke="url(#adminGateGlow)" strokeWidth="1.5" fill="none" />
        </svg>
        <span className="admin-kanji admin-kanji-one">道</span>
        <span className="admin-kanji admin-kanji-two">誠</span>
        <span className="admin-kanji admin-kanji-three">仲間</span>
        <span className="admin-ember admin-ember-1" />
        <span className="admin-ember admin-ember-2" />
        <span className="admin-ember admin-ember-3" />
        <span className="admin-ember admin-ember-4" />
        <span className="admin-ember admin-ember-5" />
        <span className="admin-ember admin-ember-6" />
        <span className="admin-ember admin-ember-7" />
        <span className="admin-ember admin-ember-8" />
        <span className="admin-ember admin-ember-9" />
        <span className="admin-ember admin-ember-10" />
        <span className="admin-ember admin-ember-11" />
        <span className="admin-ember admin-ember-12" />
        <span className="admin-sword-sheen admin-sword-one" />
        <span className="admin-sword-sheen admin-sword-two" />
      </div>
      <div className="admin-shell">
        <header className="admin-header">
          <Link className="auth-brand admin-brand" href="/">
            <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
          </Link>
          <div className="admin-live-status"><span className="admin-live-dot" /> DOJO SYSTEM ONLINE</div>
          <div className="admin-header-actions">
            <Link className="admin-top-link" href="/messages">PRIVATE MESSAGES</Link>
            <Link className="admin-top-link" href="/member">MEMBER VIEW</Link>
            <form action={signOutAction}>
              <button className="admin-signout" type="submit">SIGN OUT</button>
            </form>
          </div>
        </header>

        <section className="admin-intro">
          <p className="admin-eyebrow">PRIVATE CIRCLE · ADMIN CONTROL</p>
          <div className="admin-title-row">
            <h1>Protect the circle.<br /><span>Grow it thoughtfully.</span></h1>
            <div className="admin-title-seal" aria-hidden="true">
              <span>侍</span>
              <small>TFY</small>
            </div>
          </div>
          <p className="admin-muted">
            Review membership requests, keep track of the 80-member limit, and issue private invitation codes.
          </p>
        </section>

        {notice ? (
          <p className={notice.kind === "success" ? "admin-alert admin-alert-success" : "admin-alert admin-alert-error"} role="status">
            {notice.text}
          </p>
        ) : null}

        <section className="admin-stats" aria-label="Community summary">
          <article className="admin-stat">
            <span className="admin-stat-label">APPROVED MEMBERS</span>
            <strong>{approvedProfiles.length}<small> / {settings?.member_cap ?? 80}</small></strong>
            <span className="admin-stat-foot">Approved accounts</span>
          </article>
          <article className="admin-stat">
            <span className="admin-stat-label">PENDING REQUESTS</span>
            <strong>{pendingProfiles.length}</strong>
            <span className="admin-stat-foot">Awaiting your review</span>
          </article>
          <article className="admin-stat">
            <span className="admin-stat-label">ADMIN ACCESS</span>
            <strong className="admin-stat-word">ACTIVE</strong>
            <span className="admin-stat-foot">@{viewer.username || "admin"}</span>
          </article>
        </section>

        <InviteCreator />

        <section className="admin-panel" aria-labelledby="pending-heading">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">MEMBERSHIP REVIEW</p>
              <h2 id="pending-heading">Pending requests <span className="admin-count">{pendingProfiles.length}</span></h2>
            </div>
          </div>
          <p className="admin-muted">
            Approving a request grants approved-member status. Approval cannot exceed the configured member limit.
          </p>

          {profilesError ? (
            <p className="admin-alert admin-alert-error" role="alert">Could not load membership requests. Refresh the page.</p>
          ) : pendingProfiles.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty-mark" aria-hidden="true">✓</span>
              <h3>All caught up.</h3>
              <p>No pending membership requests right now.</p>
            </div>
          ) : (
            <div className="admin-member-list">
              {pendingProfiles.map((profile) => (
                <article className="admin-member-row" key={profile.id}>
                  <div className="admin-avatar" aria-hidden="true">
                    {(profile.display_name || profile.username || "T").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="admin-member-info">
                    <strong>{profile.display_name || profile.username || "TFY member"}</strong>
                    <span>@{profile.username || "username not set"}</span>
                    <small>Requested {formatDate(profile.created_at)}</small>
                  </div>
                  <div className="admin-member-actions">
                    <form action={reviewMemberAction}>
                      <input type="hidden" name="user_id" value={profile.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button className="admin-approve-button" type="submit">APPROVE</button>
                    </form>
                    <form action={reviewMemberAction}>
                      <input type="hidden" name="user_id" value={profile.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button className="admin-reject-button" type="submit">REJECT</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="members-heading">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">THE CIRCLE</p>
              <h2 id="members-heading">Approved members</h2>
            </div>
          </div>
          {approvedProfiles.length === 0 ? (
            <p className="admin-muted">No approved members yet.</p>
          ) : (
            <div className="admin-member-list">
              {approvedProfiles.map((profile) => (
                <article className="admin-member-row admin-approved-row" key={profile.id}>
                  <div className="admin-avatar admin-avatar-approved" aria-hidden="true">
                    {(profile.display_name || profile.username || "T").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="admin-member-info">
                    <strong>{profile.display_name || profile.username || "TFY member"}</strong>
                    <span>@{profile.username || "username not set"}</span>
                  </div>
                  <span className="admin-role-chip">{profile.role}</span>
                  <div className="admin-member-actions admin-access-actions">
                    <form action={manageMemberAccessAction}>
                      <input type="hidden" name="user_id" value={profile.id} />
                      <input type="hidden" name="operation" value={profile.role === "admin" ? "remove-admin" : "grant-admin"} />
                      <button className="admin-top-link" type="submit">{profile.role === "admin" ? "REMOVE ADMIN" : "MAKE ADMIN"}</button>
                    </form>
                    <form action={manageMemberAccessAction}>
                      <input type="hidden" name="user_id" value={profile.id} />
                      <input type="hidden" name="operation" value={bannerMemberIds.has(profile.id) ? "remove-banner" : "grant-banner"} />
                      <button className="admin-top-link" type="submit">{bannerMemberIds.has(profile.id) ? "REMOVE BANNER" : "ADD BANNER"}</button>
                    </form>
                    <span className="admin-muted">{bannerMemberIds.has(profile.id) ? "Banner member" : "Not Banner"}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="admin-footer">TFY COMMUNITY <span>·</span> PRIVATE BY DESIGN</footer>
      </div>
    </main>
  );
}
