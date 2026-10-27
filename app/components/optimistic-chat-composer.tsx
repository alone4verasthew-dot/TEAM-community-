"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatAttachment } from "@/app/components/chat-attachment-list";

type SendResult = {
  ok: boolean;
  error?: string;
  message?: { id: string; body: string; created_at: string };
};
type SendAction = (formData: FormData) => Promise<SendResult>;

type Props = {
  action: SendAction;
  hiddenFields: { name: string; value: string }[];
  formClassName: string;
  placeholder: string;
  buttonLabel?: string;
  community?: boolean;
  thread?: boolean;
  confirmedMessageIds: string[];
};

export default function OptimisticChatComposer({
  action,
  hiddenFields,
  formClassName,
  placeholder,
  buttonLabel = "➤",
  community = false,
  thread = false,
  confirmedMessageIds,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [optimisticMessage, setOptimisticMessage] = useState<{ id: string | null; body: string } | null>(null);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (optimisticMessage?.id && confirmedMessageIds.includes(optimisticMessage.id)) {
      setOptimisticMessage(null);
    }
  }, [confirmedMessageIds, optimisticMessage]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    const body = String(formData.get("body") ?? "").trim();
    if ((!body && attachments.length === 0) || body.length > 4000) {
      setError(attachments.length ? "Messages can contain up to 4,000 characters." : "Enter a message or attach a file.");
      return;
    }

    formData.set("attachments", JSON.stringify(attachments));
    setError("");
    setOptimisticMessage({ id: null, body: body || `📎 ${attachments.length} attachment(s)` });
    if (inputRef.current) inputRef.current.value = "";

    startTransition(async () => {
      try {
        const result = await action(formData);
        if (!result.ok) {
          setOptimisticMessage(null);
          if (attachments.length) { const client = createClient(); await client.storage.from("tfy-chat-media").remove(attachments.map((item) => item.path)); }
          setAttachments([]);
          setError(result.error || "Message could not be sent. Please try again.");
          if (inputRef.current) inputRef.current.value = body;
          return;
        }
        setOptimisticMessage({ id: result.message?.id ?? null, body: body || `📎 ${attachments.length} attachment(s)` });
        setAttachments([]);
      } catch {
        setOptimisticMessage(null);
        setError("Connection issue. Please try sending again.");
        if (inputRef.current) inputRef.current.value = body;
      }
    });
  }

  return (
    <>
      {optimisticMessage ? (
        <div className={community ? "community-message-row community-message-row-own optimistic-message" : "chat-message-row chat-message-row-own optimistic-message"} aria-live="polite">
          <div className={community ? "community-message-bubble community-message-bubble-own" : "chat-message-bubble chat-message-bubble-own"}>
            <p>{optimisticMessage.body}</p>
            <time>{optimisticMessage.id ? "Sent" : "Sending…"}</time>
          </div>
        </div>
      ) : null}
      {error ? <p className="admin-alert admin-alert-error" role="alert">{error}</p> : null}
      <form className={formClassName} onSubmit={submit}>
        <input type="hidden" name="attachments" value={JSON.stringify(attachments)} />
        {hiddenFields.map((field) => <input key={field.name} type="hidden" name={field.name} value={field.value} />)}
        {thread ? <label htmlFor="optimistic-message-body">YOUR MESSAGE <span>· MAX 4,000 CHARACTERS</span></label> : <label className="sr-only" htmlFor={community ? "community-message-body" : "optimistic-message-body"}>Write a message</label>}
        <textarea
          ref={inputRef}
          id={community ? "community-message-body" : "optimistic-message-body"}
          name="body"
          rows={2}
          maxLength={4000}
          required={attachments.length === 0}
          placeholder={placeholder}
          onChange={() => { if (error) setError(""); }}
        />
        <div className="chat-attachment-uploader">
          <label className="chat-attach-button">📎 Attach files
            <input type="file" multiple accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={uploading || isPending || attachments.length >= 5} onChange={async (event) => {
              const selected = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = "";
              if (!selected.length) return;
              if (attachments.length + selected.length > 5) { setError("You can attach up to 5 files per message."); return; }
              const allowed = new Set(["image/jpeg","image/png","image/gif","image/webp","video/mp4","video/webm","application/pdf","text/plain","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
              if (selected.some((file) => !allowed.has(file.type) || file.size > 20 * 1024 * 1024 || file.size === 0)) { setError("Use supported image/video/PDF/document files up to 20 MB each."); return; }
              const targetId = hiddenFields.find((field) => field.name === "community_id")?.value || hiddenFields.find((field) => field.name === "conversation_id")?.value;
              if (!targetId) { setError("Chat destination could not be verified."); return; }
              setUploading(true); setError("");
              try {
                const client = createClient();
                const { data: auth } = await client.auth.getUser();
                if (!auth.user) throw new Error("Please sign in again before uploading.");
                const uploaded: ChatAttachment[] = [];
                for (const file of selected) {
                  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "attachment";
                  const path = `${community ? "community" : "direct"}/${targetId}/${auth.user.id}/${crypto.randomUUID()}-${safeName}`;
                  const { error: uploadError } = await client.storage.from("tfy-chat-media").upload(path, file, { contentType: file.type, upsert: false });
                  if (uploadError) throw uploadError;
                  uploaded.push({ path, name: file.name.slice(0, 160), type: file.type, size: file.size });
                }
                setAttachments((current) => [...current, ...uploaded]);
              } catch (uploadError) {
                setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
              } finally { setUploading(false); }
            }} />
          </label>
          {uploading ? <span role="status">Uploading…</span> : null}
          {attachments.map((attachment) => <span className="chat-attachment-chip" key={attachment.path}>{attachment.name} <button type="button" aria-label={`Remove ${attachment.name}`} onClick={async () => { const client = createClient(); await client.storage.from("tfy-chat-media").remove([attachment.path]); setAttachments((current) => current.filter((item) => item.path !== attachment.path)); }}>×</button></span>)}
        </div>
        {thread ? (
          <div className="chat-compose-footer">
            <p>Only the two approved participants can read this conversation.</p>
            <button type="submit" aria-label="Send message" disabled={isPending || uploading}>{uploading ? "UPLOADING…" : isPending ? "SENDING…" : buttonLabel}</button>
          </div>
        ) : <button type="submit" aria-label="Send message" disabled={isPending || uploading}>{uploading ? "…" : isPending ? "…" : buttonLabel}</button>}
      </form>
    </>
  );
}
