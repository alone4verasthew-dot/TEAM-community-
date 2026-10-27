"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadCommunityMediaAction } from "@/app/community/actions";
import type { ChatAttachment } from "@/app/components/chat-attachment-list";

type MediaItem = {
  id: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
  attachment: ChatAttachment;
};
type MediaKind = "all" | "photos" | "videos" | "files";

function kindOf(type: string): Exclude<MediaKind, "all"> {
  if (type.startsWith("image/")) return "photos";
  if (type.startsWith("video/")) return "videos";
  return "files";
}
function readableDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CommunityMediaGallery({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [kind, setKind] = useState<MediaKind>("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || loaded || isPending) return;
    setError("");
    startTransition(async () => {
      try {
        const result = await loadCommunityMediaAction(slug);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setMedia(result.media);
        setLoaded(true);
      } catch {
        setError("Media could not be loaded. Please try again.");
      }
    });
  }, [open, loaded, isPending, slug]);

  useEffect(() => {
    if (!open || !media.length) return;
    let cancelled = false;
    const client = createClient();
    const missing = media.filter((item) => !urls[item.id]);
    void (async () => {
      const created: Record<string, string> = {};
      // Avoid flooding Storage with a single request per item for large archives.
      for (let offset = 0; offset < missing.length; offset += 10) {
        if (cancelled) return;
        const batch = missing.slice(offset, offset + 10);
        const entries = await Promise.all(batch.map(async (item) => {
          const { data, error: signedUrlError } = await client.storage.from("tfy-chat-media").createSignedUrl(item.attachment.path, 60 * 10);
          return !signedUrlError && data?.signedUrl ? [item.id, data.signedUrl] as const : null;
        }));
        for (const entry of entries) {
          if (entry) created[entry[0]] = entry[1];
        }
        if (!cancelled && Object.keys(created).length) {
          setUrls((current) => ({ ...current, ...created }));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [open, media, urls]);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return media.filter((item) => {
      if (kind !== "all" && kindOf(item.attachment.type) !== kind) return false;
      return !query || item.attachment.name.toLocaleLowerCase().includes(query) || item.sender_name.toLocaleLowerCase().includes(query);
    });
  }, [media, kind, search]);

  return (
    <>
      <div className="community-media-toolbar">
        <button type="button" className="community-media-open" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <span aria-hidden="true">▧</span> GROUP MEDIA <span className="community-media-open-sub">PHOTOS · VIDEOS · FILES</span>
        </button>
      </div>
      {open ? (
        <div className="community-media-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section className="community-media-dialog" role="dialog" aria-modal="true" aria-labelledby="community-media-title">
            <header className="community-media-header">
              <div>
                <p className="admin-eyebrow">THE CIRCLE ARCHIVE</p>
                <h2 id="community-media-title">GROUP MEDIA</h2>
                <p>{media.length} {media.length === 1 ? "attachment" : "attachments"} shared by group members</p>
              </div>
              <button type="button" className="community-media-close" onClick={() => setOpen(false)} aria-label="Close group media">×</button>
            </header>
            <div className="community-media-controls">
              <div className="community-media-tabs" role="group" aria-label="Filter media type">
                {(["all", "photos", "videos", "files"] as MediaKind[]).map((value) => (
                  <button type="button" key={value} className={kind === value ? "active" : ""} onClick={() => setKind(value)}>{value === "all" ? "ALL" : value.toUpperCase()}</button>
                ))}
              </div>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search file or member name…" aria-label="Search group media by file or uploader" />
            </div>
            {isPending ? <p className="community-media-state" role="status">Loading group media…</p> : null}
            {error ? <p className="community-media-state" role="alert">{error}</p> : null}
            {!isPending && !error && loaded && visible.length === 0 ? <p className="community-media-state">No media matches this filter yet.</p> : null}
            <div className="community-media-grid">
              {visible.map((item) => {
                const url = urls[item.id];
                const isImage = item.attachment.type.startsWith("image/");
                const isVideo = item.attachment.type.startsWith("video/");
                return (
                  <article className="community-media-card" key={item.id}>
                    <div className="community-media-preview">
                      {url && isImage ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={item.attachment.name} loading="lazy" /></a> : null}
                      {url && isVideo ? <video controls preload="metadata" src={url} aria-label={item.attachment.name} /> : null}
                      {url && !isImage && !isVideo ? <a className="community-media-file" href={url} target="_blank" rel="noreferrer"><span aria-hidden="true">↧</span><strong>{item.attachment.name}</strong><small>Open / download file</small></a> : null}
                      {!url ? <span className="community-media-loading">Loading preview…</span> : null}
                    </div>
                    <div className="community-media-meta">
                      <strong className="community-media-filename" title={item.attachment.name}>{item.attachment.name}</strong>
                      <span>Uploaded by <b>{item.sender_name}</b></span>
                      <time dateTime={item.created_at}>{readableDate(item.created_at)}</time>
                    </div>
                  </article>
                );
              })}
            </div>
            <footer className="community-media-footer"><span>PRIVATE GROUP ARCHIVE</span><button type="button" onClick={() => { setOpen(false); setSearch(""); setKind("all"); }}>DONE</button></footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
