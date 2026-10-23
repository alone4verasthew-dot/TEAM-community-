"use client";

import { useState, useTransition } from "react";
import { loadOlderCommunityMessagesAction } from "@/app/community/actions";
import RoleBadges from "@/app/components/role-badges";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
  is_banner?: boolean;
};

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommunityMessageHistory({
  slug,
  userId,
  initialMessages,
}: {
  slug: string;
  userId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [hasMore, setHasMore] = useState(initialMessages.length === 200);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function loadOlder() {
    if (isPending || !hasMore || messages.length === 0) return;
    const before = messages[0].created_at;
    setError("");
    startTransition(async () => {
      try {
        const result = await loadOlderCommunityMessagesAction(slug, before);
        if (!result.ok) {
          setError("Older messages couldn't be loaded. Please try again.");
          return;
        }
        setMessages((current) => {
          const known = new Set(current.map((message) => message.id));
          return [...result.messages.filter((message) => !known.has(message.id)), ...current];
        });
        setHasMore(result.hasMore ?? false);
      } catch {
        setError("Older messages couldn't be loaded. Please try again.");
      }
    });
  }

  return (
    <>
      {hasMore ? (
        <div className="chat-history-pagination">
          <button type="button" onClick={loadOlder} disabled={isPending}>
            {isPending ? "LOADING OLDER MESSAGES…" : "↑ LOAD OLDER MESSAGES"}
          </button>
        </div>
      ) : null}
      {error ? <p className="admin-alert admin-alert-error" role="alert">{error}</p> : null}
      {messages.length === 0 ? (
        <div className="community-thread-empty">
          <span>言</span>
          <h2>Welcome to the circle.</h2>
          <p>Your circle is here. Say hello and set the tone.</p>
        </div>
      ) : messages.map((message) => {
        const own = message.sender_id === userId;
        const senderName = message.sender_name || "TFY member";
        return (
          <article className={own ? "community-message-row community-message-row-own" : "community-message-row"} key={message.id}>
            {!own ? <span className="community-message-avatar">{senderName.trim().slice(0, 1).toUpperCase()}</span> : null}
            <div className={own ? "community-message-bubble community-message-bubble-own" : "community-message-bubble"}>
              {!own ? (
                <div className="community-message-sender">
                  <strong>{senderName}</strong>
                  <RoleBadges isBanner={Boolean(message.is_banner)} isAdmin={message.sender_role === "admin"} compact />
                </div>
              ) : null}
              <p>{message.body}</p>
              <time dateTime={message.created_at}>{formatTime(message.created_at)}</time>
            </div>
          </article>
        );
      })}
    </>
  );
}
