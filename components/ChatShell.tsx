"use client";
// components/ChatShell.tsx
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { useNotifications } from "@/lib/useNotifications";

import AuthScreen    from "./AuthScreen";
import Sidebar       from "./Sidebar";
import MessageList, { Message } from "./MessageList";
import MessageInput  from "./MessageInput";
import ConfirmDialog from "./ConfirmDialog";

export default function ChatShell() {
  const [user, setUser]             = useState<User | null | undefined>(undefined);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [lightbox, setLightbox]     = useState<string | null>(null);
  const [toDelete, setToDelete]     = useState<Message | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [replyTo, setReplyTo]       = useState<Message | null>(null);

  // track whether initial snapshot has loaded (avoid notifying old messages)
  const initialLoadDone = useRef(false);
  const { permission, enabled, toggle, notify } = useNotifications();

  // ── auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  // ── messages + notifications ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    initialLoadDone.current = false;

    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);

      if (!initialLoadDone.current) {
        // first snapshot = existing history, don't notify
        initialLoadDone.current = true;
        return;
      }

      // check for new incoming messages (not from me)
      snap.docChanges().forEach(change => {
        if (change.type !== "added") return;
        const m = change.doc.data() as Message;
        if (m.uid === user.uid) return; // my own message
        notify(
          m.name || "New message",
          m.type === "image" ? "📷 Sent a photo" : (m.text || ""),
        );
      });
    });

    return unsub;
  }, [user, notify]);

  // ── ESC closes sidebar ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── send ───────────────────────────────────────────────────────────────────
  const handleSend = async (text: string, files: File[]) => {
    if (!user) return;
    setUploading(files.length > 0);

    const replySnap = replyTo
      ? {
          id:    replyTo.id,
          name:  replyTo.name,
          type:  replyTo.type,
          text:  replyTo.text,
          url:   replyTo.url,
        }
      : undefined;

    setReplyTo(null);

    try {
      const base = {
        uid:       user.uid,
        name:      user.displayName || user.email || "Anonymous",
        createdAt: serverTimestamp(),
        ...(replySnap ? { replyTo: replySnap } : {}),
      };
      if (text) {
        await addDoc(collection(db, "messages"), { ...base, type: "text", text });
      }
      for (const file of files) {
        const storageRef  = ref(storage, `chat/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url         = await getDownloadURL(storageRef);
        await addDoc(collection(db, "messages"), {
          ...base, type: "image", url, storagePath: storageRef.fullPath,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!toDelete) return;
    const { id, storagePath } = toDelete;
    setToDelete(null);
    await deleteDoc(doc(db, "messages", id));
    if (storagePath) {
      try { await deleteObject(ref(storage, storagePath)); } catch (_) {}
    }
  };

  // ── loading ────────────────────────────────────────────────────────────────
  if (user === undefined) {
    return (
      <div style={{
        display: "flex", height: "100dvh",
        alignItems: "center", justifyContent: "center",
        background: "#0a0c10", color: "#5c6275", fontFamily: "sans-serif",
      }}>
        Initialising…
      </div>
    );
  }

  if (!user) return <AuthScreen onUser={setUser} />;

  return (
    <>
      <div className="app-shell">
        <div
          className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        <Sidebar
          user={user}
          msgCount={messages.length}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          notifEnabled={enabled}
          notifPermission={permission}
          onNotifToggle={toggle}
        />

        <main className="chat-panel">
          <div className="chat-header">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <HamburgerIcon />
            </button>
            <div className="header-pulse" />
            <div style={{ flex: 1 }}>
              <h2>Global Room</h2>
              <p>{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <MessageList
            messages={messages}
            currentUser={user}
            uploading={uploading}
            onDelete={setToDelete}
            onLightbox={setLightbox}
            onReply={setReplyTo}
          />

          <MessageInput
            onSend={handleSend}
            uploading={uploading}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </main>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="full size" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {toDelete && (
        <ConfirmDialog onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
