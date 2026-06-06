"use client";
// lib/useNotifications.ts
import { useState, useEffect, useCallback } from "react";

export type NotifPermission = "default" | "granted" | "denied" | "unsupported";

const STORAGE_KEY = "voidchat_notifications";

export function useNotifications() {
  const [permission, setPermission] = useState<NotifPermission>("default");
  // user's preference — stored in localStorage so it persists across sessions
  const [enabled, setEnabled] = useState(false);

  // ── read current browser permission + saved preference on mount ────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as NotifPermission);

    const saved = localStorage.getItem(STORAGE_KEY);
    // only restore "on" if the browser permission was already granted
    if (saved === "true" && Notification.permission === "granted") {
      setEnabled(true);
    }
  }, []);

  // ── toggle called from the UI ──────────────────────────────────────────────
  const toggle = useCallback(async () => {
    if (permission === "unsupported") return;

    if (!enabled) {
      // turning ON → ask for permission if not yet granted
      if (Notification.permission === "default") {
        const result = await Notification.requestPermission();
        setPermission(result as NotifPermission);
        if (result !== "granted") return; // user said no
      }
      if (Notification.permission === "denied") {
        // browser has hard-blocked — nothing we can do programmatically
        setPermission("denied");
        return;
      }
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      // turning OFF — just update our preference (can't revoke browser permission)
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, "false");
    }
  }, [enabled, permission]);

  // ── fire a notification ────────────────────────────────────────────────────
  const notify = useCallback((title: string, body: string, icon?: string) => {
    if (!enabled || permission !== "granted") return;
    // don't notify if tab is visible
    if (document.visibilityState === "visible") return;

    try {
      const n = new Notification(title, {
        body,
        icon: icon || "/icon.png",
        badge: "/icon.png",
        tag: "voidchat-msg",   // replaces previous notification instead of stacking
        // renotify: true,
      });
      // auto-close after 5 s
      setTimeout(() => n.close(), 5000);
      // clicking the notification focuses the tab
      n.onclick = () => { window.focus(); n.close(); };
    } catch (_) {
      // silent fail (e.g. Firefox in private mode)
    }
  }, [enabled, permission]);

  return { permission, enabled, toggle, notify };
}