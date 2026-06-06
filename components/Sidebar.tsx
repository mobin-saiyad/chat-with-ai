"use client";
// components/Sidebar.tsx
import { signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { NotifPermission } from "@/lib/useNotifications";

interface Props {
  user:            User;
  msgCount:        number;
  open:            boolean;
  onClose:         () => void;
  notifEnabled:    boolean;
  notifPermission: NotifPermission;
  onNotifToggle:   () => void;
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

const BellIcon = ({ on }: { on: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
    {!on && <line x1="1" y1="1" x2="23" y2="23"/>}
  </svg>
);

export default function Sidebar({
  user, msgCount, open, onClose,
  notifEnabled, notifPermission, onNotifToggle,
}: Props) {

  const isDenied      = notifPermission === "denied";
  const isUnsupported = notifPermission === "unsupported";
  const cantEnable    = isDenied || isUnsupported;

  const notifLabel = isUnsupported
    ? "Not supported"
    : isDenied
    ? "Blocked by browser"
    : notifEnabled ? "On" : "Off";

  return (
    <aside className={`sidebar${open ? " open" : ""}`}>

      {/* header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="sidebar-logo">Void<span>Chat</span></div>
        <button onClick={onClose} className="sidebar-close-btn" aria-label="Close menu">
          <CloseIcon />
        </button>
      </div>

      {/* user card */}
      <div className="sidebar-user">
        <div className="avatar">{initials(user.displayName || user.email || "")}</div>
        <div className="sidebar-info">
          <b>{user.displayName || "You"}</b>
          <small>{user.email}</small>
        </div>
        <div className="online-dot" title="Online" />
      </div>

      {/* stats */}
      <div className="sidebar-stats">
        <span>Total messages</span>
        <b>{msgCount}</b>
      </div>

      {/* ── notification toggle ── */}
      <div className={`notif-row${cantEnable ? " notif-row--disabled" : ""}`}>
        <div className="notif-row-left">
          <BellIcon on={notifEnabled} />
          <div className="notif-row-text">
            <span className="notif-row-label">Notifications</span>
            <span className="notif-row-status">{notifLabel}</span>
          </div>
        </div>

        {/* pill toggle switch */}
        <button
          className={`notif-toggle${notifEnabled ? " notif-toggle--on" : ""}${cantEnable ? " notif-toggle--disabled" : ""}`}
          onClick={cantEnable ? undefined : onNotifToggle}
          aria-label={notifEnabled ? "Turn off notifications" : "Turn on notifications"}
          aria-checked={notifEnabled}
          role="switch"
          disabled={cantEnable}
          title={
            isDenied
              ? "Notifications blocked — change in browser settings"
              : isUnsupported
              ? "Your browser doesn't support notifications"
              : undefined
          }
        >
          <span className="notif-toggle-thumb" />
        </button>
      </div>

      {isDenied && (
        <p className="notif-hint">
          Notifications are blocked. Open your browser settings to allow them for this site.
        </p>
      )}

      <button
        className="signout-btn"
        onClick={() => { signOut(auth); onClose(); }}
      >
        <LogoutIcon /> Sign out
      </button>
    </aside>
  );
}
