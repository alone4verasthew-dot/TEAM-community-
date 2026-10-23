"use client";

import { useState, useTransition } from "react";
import { loadOlderDirectMessagesAction } from "@/app/messages/actions";

type Message = { id: string; sender_id: string; body: string; created_at: string };

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DirectMessageHistory({
  conversationId,
  userId,
  initialMessages,
}: {
  conversationId: string;
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
      const result = await loadOlderDirectMessagesAction(conversationId, before);
      if (!result.ok) {
        setError("Older messages couldn't be loaded. Please try again.");
        return;
      }
      setMessages((current) => {
        const known = new Set(current.map((message) => message.id));
        return [...result.messages.filter((message) => !known.has(message.id)), ...current];
      });
      setHasMore(result.hasMore ?? false);
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
        <div className="chat-thread-empty">
          <span>言</span>
          <h2>Begin with a word.</h2>
          <p>This is a private conversation.</p>
        </div>
      ) : messages.map((message) => {
        const own = message.sender_id === userId;
        return (
          <article className={own ? "chat-message-row chat-message-row-own" : "chat-message-row"} key={message.id}>
            <div className={own ? "chat-message-bubble chat-message-bubble-own" : "chat-message-bubble"}>
              <p>{message.body}</p>
              <time dateTime={message.created_at}>{formatTime(message.created_at)}</time>
            </div>
          </article>
        );
      })}
    </>
  );
}
