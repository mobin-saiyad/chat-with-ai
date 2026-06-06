// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ── PASTE YOUR FIREBASE CONFIG HERE ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDNnYsCD2Cm8LVtrsooNPFQYT6LzQ2nlg0",
  authDomain:        "t-chat-b2502.firebaseapp.com",
  projectId:         "t-chat-b2502",
  storageBucket:     "t-chat-b2502.firebasestorage.app",
  messagingSenderId: "713390633947",
  appId:             "1:713390633947:web:53145f86907836edd7adfe",
};
// ─────────────────────────────────────────────────────────────────────────────

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
