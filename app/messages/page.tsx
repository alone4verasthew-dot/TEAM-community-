import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import { startDirectConversationAction } from "./actions";

type MessagesPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

const notices: Record<string, string> = {
  "invalid-member": "Choose a valid member to start a conversation.",
  "start-failed": "Couldn't start this conversation. The member may no longer be approved.",
  "invalid-message": "Messages must contain 1–4,000 characters.",
  "send-failed": "Message couldn't be sent. Check your access and try again.",
};

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "T";
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId || typeof userId !== "string") {
    redirect("/login");
  }

  const { data: viewer } = await supabase
    .from("profiles")
    .select("status, role, username, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (viewer?.status !== "approved") {
    redirect("/member");
  }

  const { data: conversations } = await supabase
    .from("direct_conversations")
    .select("id, participant_low, participant_high, created_at")
    .or(`participant_low.eq.${userId},participant_high.eq.${userId}`)
    .order("created_at", { ascending: false });

  const conversationRows = conversations ?? [];
  const otherIds = conversationRows.map((conversation) =>
    conversation.participant_low === userId
      ? conversation.participant_high
      : conversation.participant_low,
  );

  const [profilesResult, newMembersResult, messagesResult] = await Promise.all([
    otherIds.length
      ? supabase.from("profiles").select("id, username, display_name").in("id", otherIds).eq("status", "approved")
      : Promise.resolve({ data: [] as { id: string; username: string | null; display_name: string | null }[] }),
    supabase
      .from("profiles")
      .select("id, username, display_name")
      .eq("status", "approved")
      .neq("id", userId)
      .order("created_at", { ascending: false }),
    conversationRows.length
      ? supabase
          .from("direct_messages")
          .select("conversation_id, body, sender_id, created_at")
          .in("conversation_id", conversationRows.map((conversation) => conversation.id))
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as { conversation_id: string; body: string; sender_id: string; created_at: string }[] }),
  ]);

  const otherProfiles = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
  const latestMessages = new Map<string, { body: string; sender_id: string; created_at: string }>();
  for (const message of messagesResult.data ?? []) {
    if (!latestMessages.has(message.conversation_id)) {
      latestMessages.set(message.conversation_id, message);
    }
  }

  const conversationByOtherId = new Map<string, string>();
  for (const conversation of conversationRows) {
    const otherId = conversation.participant_low === userId
      ? conversation.participant_high
      : conversation.participant_low;
    conversationByOtherId.set(otherId, conversation.id);
  }

  const notice = params.notice ? notices[params.notice] : undefined;

  return (
    <main className="auth-page chat-page">
      <div className="chat-atmosphere" aria-hidden="true">
        <div className="chat-moon" />
        <div className="chat-mist chat-mist-one" />
        <div className="chat-mist chat-mist-two" />
        <span className="chat-ember chat-ember-one" />
        <span className="chat-ember chat-ember-two" />
        <span className="chat-ember chat-ember-three" />
        <span className="chat-ember chat-ember-four" />
        <span className="chat-kanji chat-kanji-one">心</span>
        <span className="chat-kanji chat-kanji-two">仲間</span>
      </div>

      <div className="chat-shell">
        <header className="chat-header">
          <Link className="auth-brand chat-brand" href="/">
            <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
          </Link>
          <div className="chat-nav">
            {viewer.role === "admin" ? <Link href="/admin">ADMIN DOJO</Link> : null}
            <Link href="/member">MEMBER VIEW</Link>
            <form action={signOutAction}>
              <button type="submit">SIGN OUT</button>
            </form>
          </div>
        </header>

        <section className="chat-heading">
          <p className="admin-eyebrow">PRIVATE CHANNEL · APPROVED MEMBERS</p>
          <h1>Words between <span>warriors.</span></h1>
          <p className="chat-subtitle">Private one-to-one conversations, visible only to the two approved members.</p>
        </section>

        {notice ? <p className="admin-alert admin-alert-error" role="status">{notice}</p> : null}

        <div className="chat-directory-layout">
          <section className="chat-list-panel" aria-labelledby="conversations-heading">
            <div className="chat-panel-heading">
              <div>
                <p className="admin-eyebrow">YOUR PRIVATE SPACE</p>
                <h2 id="conversations-heading">Conversations</h2>
              </div>
              <span className="chat-count">{conversationRows.length.toString().padStart(2, "0")}</span>
            </div>

            {conversationRows.length === 0 ? (
              <div className="chat-empty">
                <span className="chat-empty-mark">言</span>
                <h3>Quiet, for now.</h3>
                <p>Choose an approved member to open your first private conversation.</p>
              </div>
            ) : (
              <div className="chat-conversation-list">
                {conversationRows.map((conversation) => {
                  const otherId = conversation.participant_low === userId
                    ? conversation.participant_high
                    : conversation.participant_low;
                  const other = otherProfiles.get(otherId);
                  const latest = latestMessages.get(conversation.id);
                  const name = other?.display_name || other?.username || "TFY member";
                  return (
                    <Link className="chat-conversation-row" href={`/messages/${conversation.id}`} key={conversation.id}>
                      <span className="chat-avatar">{initials(name)}</span>
                      <span className="chat-conversation-copy">
                        <strong>{name}</strong>
                        <small>@{other?.username || "member"}</small>
                        <span className="chat-preview">{latest ? `${latest.sender_id === userId ? "You: " : ""}${latest.body}` : "Begin your conversation"}</span>
                      </span>
                      <span className="chat-conversation-time">{latest ? formatTime(latest.created_at) : "OPEN ↗"}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="chat-list-panel chat-members-panel" aria-labelledby="members-heading">
            <div className="chat-panel-heading">
              <div>
                <p className="admin-eyebrow">THE APPROVED CIRCLE</p>
                <h2 id="members-heading">Find a member</h2>
              </div>
              <span className="chat-count">{(newMembersResult.data ?? []).length.toString().padStart(2, "0")}</span>
            </div>
            <p className="chat-panel-intro">Only approved members appear here. Start a private conversation without exposing anyone's email address.</p>

            {(newMembersResult.data ?? []).length === 0 ? (
              <div className="chat-empty chat-empty-compact">
                <h3>You are the first in this circle.</h3>
                <p>Approved members will appear here as they join.</p>
              </div>
            ) : (
              <div className="chat-member-list">
                {(newMembersResult.data ?? []).map((member) => {
                  const name = member.display_name || member.username || "TFY member";
                  const existingConversation = conversationByOtherId.get(member.id);
                  return (
                    <article className="chat-member-row" key={member.id}>
                      <span className="chat-avatar chat-avatar-small">{initials(name)}</span>
                      <span className="chat-member-copy">
                        <strong>{name}</strong>
                        <small>@{member.username || "member"}</small>
                      </span>
                      {existingConversation ? (
                        <Link className="chat-open-button" href={`/messages/${existingConversation}`}>OPEN CHAT ↗</Link>
                      ) : (
                        <form action={startDirectConversationAction}>
                          <input type="hidden" name="other_user_id" value={member.id} />
                          <button className="chat-open-button" type="submit">MESSAGE ↗</button>
                        </form>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
        <footer className="chat-footer">TFY COMMUNITY <span>·</span> PRIVATE BY DESIGN</footer>
      </div>
    </main>
  );
}
