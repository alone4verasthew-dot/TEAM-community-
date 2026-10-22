"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type SendResult = { ok: boolean; error?: string; message?: { id: string; body: string; created_at: string } };
type SendAction = (formData: FormData) => Promise<SendResult>;

type Props = {
  action: SendAction;
  hiddenFields: { name: string; value: string }[];
  formClassName: string;
  placeholder: string;
  buttonLabel?: string;
  community?: boolean;
};

export default function OptimisticChatComposer({
  action,
  hiddenFields,
  formClassName,
  placeholder,
  buttonLabel = "➤",
  community = false,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [optimisticBody, setOptimisticBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();
    if (!body || body.length > 4000) {
      setError("Messages must contain 1–4,000 characters.");
      return;
    }

    setError("");
    setOptimisticBody(body);
    if (inputRef.current) inputRef.current.value = "";

    startTransition(async () => {
      try {
        const result = await action(formData);
        if (!result.ok) {
          setOptimisticBody("");
          setError(result.error || "Message could not be sent. Please try again.");
          if (inputRef.current) inputRef.current.value = body;
          return;
        }
        router.refresh();
        // Keep the instant preview visible while the refreshed server message list arrives.
        window.setTimeout(() => setOptimisticBody(""), 900);
      } catch {
        setOptimisticBody("");
        setError("Connection issue. Please try sending again.");
        if (inputRef.current) inputRef.current.value = body;
      }
    });
  }

  return (
    <>
      {optimisticBody ? (
        <div className={community ? "community-message-row community-message-row-own optimistic-message" : "chat-message-row chat-message-row-own optimistic-message"} aria-live="polite">
          <div className={community ? "community-message-bubble community-message-bubble-own" : "chat-message-bubble chat-message-bubble-own"}>
            <p>{optimisticBody}</p>
            <time>Sending…</time>
          </div>
        </div>
      ) : null}
      {error ? <p className="admin-alert admin-alert-error" role="alert">{error}</p> : null}
      <form className={formClassName} onSubmit={submit}>
        {hiddenFields.map((field) => <input key={field.name} type="hidden" name={field.name} value={field.value} />)}
        <label className="sr-only" htmlFor={community ? "community-message-body" : "optimistic-message-body"}>Write a message</label>
        <textarea
          ref={inputRef}
          id={community ? "community-message-body" : "optimistic-message-body"}
          name="body"
          rows={2}
          maxLength={4000}
          required
          placeholder={placeholder}
          onChange={() => { if (error) setError(""); }}
        />
        <button type="submit" aria-label="Send message" disabled={isPending}>{isPending ? "…" : buttonLabel}</button>
      </form>
    </>
  );
}
