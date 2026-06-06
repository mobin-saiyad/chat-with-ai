"use client";
// components/MessageInput.tsx
import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface Preview { file: File; url: string; }

interface Props {
  onSend:     (text: string, files: File[]) => Promise<void>;
  uploading:  boolean;
}

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export default function MessageInput({ onSend, uploading }: Props) {
  const [text, setText]       = useState("");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const fileRef   = useRef<HTMLInputElement>(null);
  const textRef   = useRef<HTMLTextAreaElement>(null);

  // auto-grow textarea
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [text]);

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPreviews(p => [...p, ...files.map(f => ({ file: f, url: URL.createObjectURL(f) }))]);
    e.target.value = "";
  };

  const removePreview = (idx: number) => {
    setPreviews(p => {
      URL.revokeObjectURL(p[idx].url);
      return p.filter((_, i) => i !== idx);
    });
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && previews.length === 0) return;
    const files = previews.map(p => p.file);
    setText("");
    setPreviews([]);
    await onSend(trimmed, files);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const canSend = (text.trim().length > 0 || previews.length > 0) && !uploading;

  return (
    <>
      {/* image previews */}
      {previews.length > 0 && (
        <div className="preview-strip">
          {previews.map((p, i) => (
            <div key={i} className="preview-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="preview" />
              <button className="preview-remove" onClick={() => removePreview(i)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {uploading && <p className="uploading-hint">Uploading…</p>}

      <div className="input-bar">
        <div className="input-wrap">
          <textarea
            ref={textRef}
            className="msg-textarea"
            rows={1}
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
          />
          <button className="icon-btn" onClick={() => fileRef.current?.click()} title="Attach photo">
            <ImageIcon />
          </button>
        </div>

        <button className="send-btn" onClick={handleSend} disabled={!canSend}>
          <SendIcon />
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={addFiles}
        />
      </div>
    </>
  );
}
