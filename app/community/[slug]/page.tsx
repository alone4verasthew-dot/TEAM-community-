import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import { enterCommunityAction, sendCommunityMessageAction } from "../actions";
import OptimisticChatComposer from "@/app/components/optimistic-chat-composer";
import CommunityMessageHistory from "@/app/components/community-message-history";
import type { ChatAttachment } from "@/app/components/chat-attachment-list";

// These pages render user-specific data and must never be prerendered or shared-cached.
export const dynamic = "force-dynamic";

type CommunityPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ notice?: string }>;
};

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CommunityPage({ params, searchParams }: CommunityPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;
  if (!userId || typeof userId !== "string") redirect("/login");

  const { data: viewer } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", userId)
    .maybeSingle();
  if (viewer?.status !== "approved") redirect("/member");

  const { data: community } = await supabase
    .from("communities")
    .select("id, slug, name, description, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!community || (!community.is_active && viewer.role !== "admin")) notFound();
  if (community.slug === "community-two" && viewer.role !== "admin") notFound();

  const { data: membership } = await supabase
    .from("memberships")
    .select("community_id")
    .eq("community_id", community.id)
    .eq("profile_id", userId)
    .maybeSingle();

  if (community.slug === "community-three" && viewer.role !== "admin" && !membership) notFound();

  const chatTheme = slug === "community-two" ? "admins" : slug === "community-three" ? "banners" : "tfy";
  const chatTitle = chatTheme === "admins" ? "ADMINS TFY" : chatTheme === "banners" ? "BANNERS TFY" : "TFY COMMUNITY";
  const chatIcon = chatTheme === "admins" ? "🛡" : chatTheme === "banners" ? "旗" : "么";
  const chatEyebrow = chatTheme === "admins" ? "THE COMMAND ROOM · PRIVATE CHAT" : chatTheme === "banners" ? "THE CREATIVE STUDIO · GROUP CHAT" : "THE TFY CIRCLE · PRIVATE GROUP CHAT";

  const noticeText: Record<string, string> = {
    "invalid-message": "Messages must contain 1–4,000 characters.",
    "community-unavailable": "This community is no longer available.",
    "not-a-member": "Enter this community before sending a message.",
    "send-failed": "Message could not be sent. Please try again.",
  };
  const notice = query.notice ? noticeText[query.notice] : undefined;

  let messages: { id: string; sender_id: string; body: string; attachments: ChatAttachment[]; created_at: string }[] = [];
  let senderNames = new Map<string, { name: string; role: string; isBanner: boolean }>();
  const canUseChat = Boolean(membership) || viewer.role === "admin";
  if (canUseChat) {
    const { data } = await supabase
      .from("community_messages")
      .select("id, sender_id, body, attachments, created_at")
      .eq("community_id", community.id)
      .order("created_at", { ascending: false })
      .limit(200);
    messages = [...(data ?? [])].map((message) => ({ ...message, attachments: Array.isArray(message.attachments) ? message.attachments as unknown as ChatAttachment[] : [] })).reverse();

    const senderIds = [...new Set(messages.map((message) => message.sender_id))];
    if (senderIds.length) {
      const [{ data: profiles }, { data: bannerCommunity }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, role")
          .in("id", senderIds),
        supabase.from("communities").select("id").eq("slug", "community-three").maybeSingle(),
      ]);
      const { data: bannerRows } = bannerCommunity
        ? await supabase
            .from("memberships")
            .select("profile_id")
            .eq("community_id", bannerCommunity.id)
            .in("profile_id", senderIds)
        : { data: [] as { profile_id: string }[] };
      const bannerIds = new Set((bannerRows ?? []).map((row) => row.profile_id));
      senderNames = new Map((profiles ?? []).map((profile) => [
        profile.id,
        {
          name: profile.display_name || profile.username || "TFY member",
          role: profile.role,
          isBanner: bannerIds.has(profile.id),
        },
      ]));
    }
  }

  return (
    <main className={`auth-page chat-page community-chat-page community-theme-${chatTheme}`}>
      <div className="chat-atmosphere" aria-hidden="true">
        <div className="chat-moon" />
        <div className="chat-mist chat-mist-one" />
        <div className="chat-mist chat-mist-two" />
      </div>
      <div className="chat-shell community-chat-shell">
        <header className="chat-header">
          <Link className="auth-brand chat-brand" href="/">
            <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
          </Link>
          <div className="chat-nav">
            <Link href="/messages">MESSAGES</Link>
            <Link href="/member">MEMBER VIEW</Link>
            <form action={signOutAction}><button type="submit">SIGN OUT</button></form>
          </div>
        </header>

        <section className="community-chat-panel">
          <div className="community-chat-heading">
            <Link className="chat-back-link" href="/#community">← ALL COMMUNITIES</Link>
            <span className="community-live-pill"><i /> {chatTitle}</span>
          </div>
          <div className="community-title-row">
            <span className="community-icon">{chatIcon}</span>
            <div>
              <p className="admin-eyebrow">{chatEyebrow}</p>
              <h1 className="community-chat-title">{chatTitle}</h1>
              <p>{community.description}</p>
            </div>
          </div>

          {notice ? <p className="admin-alert admin-alert-error" role="status">{notice}</p> : null}

          {!canUseChat ? (
            <div className="community-join-state">
              <span className="community-join-mark">仲間</span>
              <h2>Step into your circle.</h2>
              <p>Join {chatTitle} to read messages and talk with approved TFY members.</p>
              <form action={enterCommunityAction}>
                <input type="hidden" name="slug" value={community.slug} />
                <button className="community-enter-primary" type="submit">ENTER COMMUNITY <span>↗</span></button>
              </form>
            </div>
          ) : (
            <>
              <div className="community-chat-status">
                <span>{chatTitle} · GROUP CHAT</span>
                <span>{messages.length} {messages.length === 1 ? "MESSAGE" : "MESSAGES"}</span>
              </div>
              <div className="community-message-stream" aria-label="Community group messages" aria-live="polite">
                <CommunityMessageHistory
                  slug={community.slug}
                  userId={userId}
                  initialMessages={messages.map((message) => {
                    const sender = senderNames.get(message.sender_id);
                    return {
                      ...message,
                      sender_name: sender?.name || "TFY member",
                      sender_role: sender?.role || "member",
                      is_banner: Boolean(sender?.isBanner),
                    };
                  })}
                />
              </div>
              <OptimisticChatComposer
                action={sendCommunityMessageAction}
                hiddenFields={[{ name: "slug", value: community.slug }, { name: "community_id", value: community.id }]}
                formClassName="community-compose-form"
                confirmedMessageIds={messages.map((message) => message.id)}
                placeholder={`Message ${chatTitle}…`}
                community
              />
              <p className="community-privacy-note">Only approved members who entered this community can read or send group messages.</p>
            </>
          )}
        </section>
        <footer className="chat-footer">TFY COMMUNITY <span>·</span> GROW TOGETHER</footer>
      </div>
    </main>
  );
}
