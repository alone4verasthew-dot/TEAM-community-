import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import { sendDirectMessageAction } from "../actions";
import OptimisticChatComposer from "@/app/components/optimistic-chat-composer";

// These pages render user-specific data and must never be prerendered or shared-cached.
export const dynamic = "force-dynamic";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
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

export default async function ConversationPage({ params, searchParams }: ConversationPageProps) {
  const [{ conversationId }, query] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId)) {
    redirect("/messages");
  }

  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId || typeof userId !== "string") {
    redirect("/login");
  }

  const { data: viewer } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", userId)
    .maybeSingle();

  if (viewer?.status !== "approved") {
    redirect("/member");
  }

  const { data: conversation } = await supabase
    .from("direct_conversations")
    .select("id, participant_low, participant_high, created_at")
    .eq("id", conversationId)
    .maybeSingle();

  // RLS hides conversations when the current user is not a participant.
  if (!conversation) {
    redirect("/messages?notice=start-failed");
  }

  const otherUserId = conversation.participant_low === userId
    ? conversation.participant_high
    : conversation.participant_low;

  const [{ data: other }, { data: messages }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, role")
      .eq("id", otherUserId)
      .eq("status", "approved")
      .maybeSingle(),
    supabase
      .from("direct_messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);

  if (!other) {
    redirect("/messages");
  }

  const otherName = other.display_name || other.username || "TFY member";
  const notice = query.notice === "invalid-message"
    ? "Messages must contain 1–4,000 characters."
    : query.notice === "send-failed"
      ? "Message could not be sent. Please try again."
      : null;

  return (
    <main className="auth-page chat-page chat-thread-page">
      <div className="chat-atmosphere" aria-hidden="true">
        <div className="chat-moon" />
        <div className="chat-mist chat-mist-one" />
        <div className="chat-mist chat-mist-two" />
        <span className="chat-ember chat-ember-one" />
        <span className="chat-ember chat-ember-two" />
        <span className="chat-ember chat-ember-three" />
        <span className="chat-ember chat-ember-four" />
        <span className="chat-kanji chat-kanji-one">心</span>
        <span className="chat-kanji chat-kanji-two">誠</span>
      </div>

      <div className="chat-shell chat-thread-shell">
        <header className="chat-header">
          <Link className="auth-brand chat-brand" href="/">
            <span className="auth-mark">么</span> TEAM <strong>ᵀᶠʸ</strong> <span className="auth-mark">乂</span>
          </Link>
          <div className="chat-nav">
            <Link href="/messages">ALL CHATS</Link>
            <Link href="/#community">COMMUNITIES</Link>
            {viewer.role === "admin" ? <Link href="/admin">ADMIN DOJO</Link> : null}
            <form action={signOutAction}>
              <button type="submit">SIGN OUT</button>
            </form>
          </div>
        </header>

        <section className="chat-thread-panel">
          <div className="chat-thread-topline">
            <Link className="chat-back-link" href="/messages">← ALL CONVERSATIONS</Link>
            <span className="chat-secure-label"><span /> PRIVATE CHANNEL</span>
          </div>
          <div className="chat-thread-person">
            <span className="chat-avatar chat-thread-avatar">{otherName.trim().slice(0, 1).toUpperCase()}</span>
            <div>
              <p className="admin-eyebrow">APPROVED MEMBER</p>
              <h1>{otherName}</h1>
              <p className="chat-thread-username">@{other.username || "member"}</p>
            </div>
          </div>

          {notice ? <p className="admin-alert admin-alert-error" role="status">{notice}</p> : null}

          <div className="chat-message-stream" aria-label="Conversation messages">
            {(messages ?? []).length === 0 ? (
              <div className="chat-thread-empty">
                <span>言</span>
                <h2>Begin with a word.</h2>
                <p>This is a private conversation between you and {otherName}.</p>
              </div>
            ) : (
              (messages ?? []).map((message) => {
                const own = message.sender_id === userId;
                return (
                  <article className={own ? "chat-message-row chat-message-row-own" : "chat-message-row"} key={message.id}>
                    <div className={own ? "chat-message-bubble chat-message-bubble-own" : "chat-message-bubble"}>
                      <p>{message.body}</p>
                      <time dateTime={message.created_at}>{formatTime(message.created_at)}</time>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <OptimisticChatComposer
            action={sendDirectMessageAction}
            hiddenFields={[{ name: "conversation_id", value: conversationId }]}
            formClassName="chat-compose-form"
            confirmedMessageIds={(messages ?? []).map((message) => message.id)}
            placeholder={`Write something to ${otherName}…`}
            buttonLabel="SEND MESSAGE ↗"
            thread
          />
          <p className="chat-inbox-privacy">Only the two approved participants can read this conversation.</p>
        </section>
        <footer className="chat-footer">TFY COMMUNITY <span>·</span> PRIVATE BY DESIGN</footer>
      </div>
    </main>
  );
}
