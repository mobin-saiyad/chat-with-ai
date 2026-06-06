"use client";
// components/MessageList.tsx
import { useRef, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export interface Message {
  id:          string;
  uid:         string;
  name:        string;
  type:        "text" | "image";
  text?:       string;
  url?:        string;
  storagePath?: string;
  createdAt:   Timestamp | null;
}

interface Props {
  messages:    Message[];
  currentUser: User;
  uploading:   boolean;
  onDelete:    (msg: Message) => void;
  onLightbox:  (url: string) => void;
}

const initials = (name: string = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const fmt = (ts: Timestamp | null) => {
  if (!ts) return "";
  return ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

export default function MessageList({ messages, currentUser, uploading, onDelete, onLightbox }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, uploading]);

  // Group by date
  const grouped: Array<{ type: "date"; label: string } | { type: "msg"; data: Message }> = [];
  let lastDate = "";
  messages.forEach(m => {
    const d     = m.createdAt?.toDate() ?? new Date();
    const label = d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    if (label !== lastDate) { grouped.push({ type: "date", label }); lastDate = label; }
    grouped.push({ type: "msg", data: m });
  });

  return (
    <div className="messages">
      {grouped.length === 0 && (
        <div className="empty-state">
          <ChatIcon />
          <p>No messages yet — say hello!</p>
        </div>
      )}

      {grouped.map((item, i) => {
        if (item.type === "date") {
          return <div key={`d-${i}`} className="date-divider">{item.label}</div>;
        }

        const m    = item.data;
        const isMe = m.uid === currentUser.uid;

        return (
          <div key={m.id} className={`msg-row ${isMe ? "me" : "them"}`}>
            <div className="msg-avatar">{initials(m.name)}</div>

            <div className="bubble-col">
              {!isMe && <span className="sender-name">{m.name}</span>}

              <div className="bubble">
                {m.type === "image" && m.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="bubble-img"
                    src={m.url}
                    alt="attachment"
                    onClick={() => onLightbox(m.url!)}
                  />
                ) : (
                  m.text
                )}
              </div>

              <div className="bubble-meta">
                <span className="bubble-time">{fmt(m.createdAt)}</span>
                {isMe && (
                  <button className="del-btn" onClick={() => onDelete(m)} title="Delete">
                    <TrashIcon /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {uploading && (
        <div className="msg-row me">
          <div className="msg-avatar">{initials(currentUser.displayName || "")}</div>
          <div className="bubble-col">
            <div className="bubble">
              <div className="typing-dots"><span /><span /><span /></div>
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
