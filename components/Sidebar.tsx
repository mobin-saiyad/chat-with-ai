"use client";
// components/Sidebar.tsx
import { signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface Props {
  user:       User;
  msgCount:   number;
  open:       boolean;
  onClose:    () => void;
}

const initials = (name: string = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Sidebar({ user, msgCount, open, onClose }: Props) {
  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      {/* close button — visible on mobile */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="sidebar-logo">Void<span>Chat</span></div>
        <button
          onClick={onClose}
          style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 10, width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--muted)",
          }}
          className="sidebar-close-btn"
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="sidebar-user">
        <div className="avatar">{initials(user.displayName || user.email || "")}</div>
        <div className="sidebar-info">
          <b>{user.displayName || "You"}</b>
          <small>{user.email}</small>
        </div>
        <div className="online-dot" title="Online" />
      </div>

      <div className="sidebar-stats">
        <span>Total messages</span>
        <b>{msgCount}</b>
      </div>

      <button
        className="signout-btn"
        onClick={() => { signOut(auth); onClose(); }}
      >
        <LogoutIcon /> Sign out
      </button>
    </aside>
  );
}
