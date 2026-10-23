import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import { sendDirectMessageAction, startDirectConversationAction } from "./actions";
import OptimisticChatComposer from "@/app/components/optimistic-chat-composer";
import DirectMessageHistory from "@/app/components/direct-message-history";

// These pages render user-specific data and must never be prerendered or shared-cached.
export const dynamic = "force-dynamic";

type MessagesPageProps = {
  searchParams: Promise<{ notice?: string; conversation?: string; new?: string }>;
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

  if (!userId || typeof userId !== "string") redirect("/login");

  const { data: viewer } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", userId)
    .maybeSingle();

  if (viewer?.status !== "approved") redirect("/member");

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
          .limit(500)
      : Promise.resolve({ data: [] as { conversation_id: string; body: string; sender_id: string; created_at: string }[] }),
  ]);

  const otherProfiles = new Map<string, { id: string; username: string | null; display_name: string | null }>();
  for (const profile of profilesResult.data ?? []) otherProfiles.set(profile.id, profile);

  const latestMessages = new Map<string, { body: string; sender_id: string; created_at: string }>();
  for (const message of messagesResult.data ?? []) {
    if (!latestMessages.has(message.conversation_id)) latestMessages.set(message.conversation_id, message);
  }

  const conversationByOtherId = new Map<string, string>();
  for (const conversation of conversationRows) {
    const otherId = conversation.participant_low === userId
      ? conversation.participant_high
      : conversation.participant_low;
    conversationByOtherId.set(otherId, conversation.id);
  }

  const activeConversation = conversationRows.find((conversation) => conversation.id === params.conversation);
  const activeOtherId = activeConversation
    ? activeConversation.participant_low === userId
      ? activeConversation.participant_high
      : activeConversation.participant_low
    : null;
  const activeOther = activeOtherId ? otherProfiles.get(activeOtherId) : undefined;
  const activeMessagesResult = activeConversation
    ? await supabase
        .from("direct_messages")
        .select("id, sender_id, body, created_at")
        .eq("conversation_id", activeConversation.id)
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] as { id: string; sender_id: string; body: string; created_at: string }[] };
  // Keep the inbox responsive for long-running chats; render the newest 200 in chronological order.
  const activeMessages = [...(activeMessagesResult.data ?? [])].reverse();
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
            <Link href="/#community">COMMUNITIES</Link>
            <Link href="/member">MEMBER VIEW</Link>
            <form action={signOutAction}><button type="submit">SIGN OUT</button></form>
          </div>
        </header>

        <section className="chat-heading">
          <p className="admin-eyebrow">TFY DIRECT · APPROVED MEMBERS</p>
          <h1>Messages <span>with your circle.</span></h1>
          <p className="chat-subtitle">Private chats, with the people who make your path matter.</p>
        </section>

        {notice ? <p className="admin-alert admin-alert-error" role="status">{notice}</p> : null}

        <div className="chat-inbox-layout">
          <aside className="chat-list-panel chat-inbox-sidebar" aria-labelledby="conversations-heading">
            <div className="chat-panel-heading">
              <div>
                <p className="admin-eyebrow">YOUR INBOX</p>
                <h2 id="conversations-heading">Messages</h2>
              </div>
              <Link className="chat-compose-new" href="/messages?new=1" aria-label="Start a new message" title="New message">＋</Link>
            </div>

            {conversationRows.length === 0 ? (
              <div className="chat-empty chat-empty-compact">
                <span className="chat-empty-mark">言</span>
                <h3>No chats yet</h3>
                <p>Start a private conversation with an approved TFY member.</p>
                <Link className="chat-open-button" href="/messages?new=1">NEW MESSAGE ↗</Link>
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
                  const selected = conversation.id === activeConversation?.id;
                  return (
                    <Link
                      className={selected ? "chat-conversation-row chat-conversation-row-active" : "chat-conversation-row"}
                      href={`/messages?conversation=${conversation.id}`}
                      key={conversation.id}
                      aria-current={selected ? "page" : undefined}
                    >
                      <span className="chat-avatar">{initials(name)}</span>
                      <span className="chat-conversation-copy">
                        <strong>{name}</strong>
                        <small>@{other?.username || "member"}</small>
                        <span className="chat-preview">{latest ? `${latest.sender_id === userId ? "You: " : ""}${latest.body}` : "Start a conversation"}</span>
                      </span>
                      <span className="chat-conversation-time">{latest ? formatTime(latest.created_at) : ""}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            <Link className="chat-sidebar-community-link" href="/#community">么 <span>Explore TFY communities</span> ↗</Link>
          </aside>

          <section className="chat-list-panel chat-inbox-main" aria-label="Selected conversation">
            {activeConversation && activeOther ? (
              <>
                <div className="chat-inbox-thread-header">
                  <div className="chat-thread-person">
                    <span className="chat-avatar chat-thread-avatar">{initials(activeOther.display_name || activeOther.username || "T")}</span>
                    <div>
                      <h2>{activeOther.display_name || activeOther.username || "TFY member"}</h2>
                      <p className="chat-thread-username">@{activeOther.username || "member"}</p>
                    </div>
                  </div>
                  <span className="chat-secure-label"><span /> PRIVATE CHAT</span>
                </div>
                <div className="chat-inbox-message-stream" aria-label="Conversation messages">
                  <DirectMessageHistory
                    conversationId={activeConversation.id}
                    userId={userId}
                    initialMessages={activeMessages}
                  />
                </div>
                <OptimisticChatComposer
                  action={sendDirectMessageAction}
                  hiddenFields={[{ name: "conversation_id", value: activeConversation.id }, { name: "return_to", value: "inbox" }]}
                  formClassName="chat-inbox-compose"
                  confirmedMessageIds={activeMessages.map((message) => message.id)}
                  placeholder="Message…"
                />
                <p className="chat-inbox-privacy">Only the two approved participants can read this conversation.</p>
              </>
            ) : params.new === "1" ? (
              <>
                <div className="chat-panel-heading chat-new-message-heading">
                  <div>
                    <p className="admin-eyebrow">NEW CONVERSATION</p>
                    <h2>Find a member</h2>
                  </div>
                  <Link className="chat-back-link" href="/messages">CANCEL</Link>
                </div>
                <p className="chat-panel-intro">Choose an approved TFY member to start a private conversation.</p>
                {(newMembersResult.data ?? []).length === 0 ? (
                  <div className="chat-empty"><h3>You are the first in this circle.</h3><p>Approved members will appear here as they join.</p></div>
                ) : (
                  <div className="chat-member-list chat-new-member-list">
                    {(newMembersResult.data ?? []).map((member) => {
                      const name = member.display_name || member.username || "TFY member";
                      const existingConversation = conversationByOtherId.get(member.id);
                      return (
                        <article className="chat-member-row" key={member.id}>
                          <span className="chat-avatar chat-avatar-small">{initials(name)}</span>
                          <span className="chat-member-copy"><strong>{name}</strong><small>@{member.username || "member"}</small></span>
                          {existingConversation ? (
                            <Link className="chat-open-button" href={`/messages?conversation=${existingConversation}`}>OPEN CHAT ↗</Link>
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
              </>
            ) : (
              <div className="chat-inbox-welcome">
                <span className="chat-inbox-logo">么</span>
                <h2>Your TFY inbox.</h2>
                <p>Select a conversation on the left, or start a new message to connect with your circle.</p>
                <Link className="chat-open-button" href="/messages?new=1">NEW MESSAGE <span>↗</span></Link>
                <div className="chat-inbox-community-prompt">
                  <strong>Looking for the group?</strong>
                  <p>Enter one of your TFY communities to talk with the whole circle.</p>
                  <Link href="/#community">EXPLORE COMMUNITIES ↗</Link>
                </div>
              </div>
            )}
          </section>
        </div>
        <footer className="chat-footer">TFY COMMUNITY <span>·</span> PRIVATE BY DESIGN</footer>
      </div>
    </main>
  );
}
