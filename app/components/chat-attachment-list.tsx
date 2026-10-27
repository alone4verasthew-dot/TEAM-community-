"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ChatAttachment = {
  path: string;
  name: string;
  type: string;
  size: number;
};

export default function ChatAttachmentList({ attachments }: { attachments?: ChatAttachment[] | null }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    const valid = (attachments ?? []).filter((item) =>
      item && typeof item.path === "string" && item.path.startsWith("community/") || item && typeof item.path === "string" && item.path.startsWith("direct/")
    );
    if (!valid.length) { setUrls({}); return; }
    const client = createClient();
    void Promise.all(valid.map(async (item) => {
      const { data, error } = await client.storage.from("tfy-chat-media").createSignedUrl(item.path, 60 * 10);
      return !error && data?.signedUrl ? [item.path, data.signedUrl] as const : null;
    })).then((entries) => {
      if (!cancelled) setUrls(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry))));
    });
    return () => { cancelled = true; };
  }, [attachments]);

  if (!attachments?.length) return null;
  return (
    <div className="chat-attachments">
      {attachments.map((attachment) => {
        const url = urls[attachment.path];
        const image = attachment.type.startsWith("image/");
        const video = attachment.type.startsWith("video/");
        return (
          <div className="chat-attachment" key={attachment.path}>
            {url && image ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={attachment.name} loading="lazy" /></a> : null}
            {url && video ? <video controls preload="metadata" src={url} aria-label={attachment.name} /> : null}
            {url && !image && !video ? <a href={url} target="_blank" rel="noreferrer" className="chat-attachment-file">↧ {attachment.name}</a> : null}
            {!url ? <span className="chat-attachment-file">📎 {attachment.name} · loading…</span> : null}
          </div>
        );
      })}
    </div>
  );
}
