"use client";
// components/AuthScreen.tsx
import { useState, KeyboardEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Props {
  onUser: (user: any) => void;
}

export default function AuthScreen({ onUser }: Props) {
  const [mode, setMode]   = useState<"login" | "register">("login");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [busy, setBusy]   = useState(false);

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      if (mode === "register") {
        const { user } = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(user, { displayName: name });
        await setDoc(doc(db, "users", user.uid), {
          name, email,
          createdAt: serverTimestamp(),
        });
        onUser(user);
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, pass);
        onUser(user);
      }
    } catch (e: any) {
      setErr(e.message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") submit(); };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">Chat with <span>AI</span></div>
        <p className="auth-sub">
          {mode === "login" ? "Login" : "Create your account."}
        </p>

        {mode === "register" && (
          <div className="field">
            <label>Display name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              onKeyDown={onKey}
            />
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            onKeyDown={onKey}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="•••••••"
            onKeyDown={onKey}
          />
        </div>

        <div className="auth-err">{err}</div>

        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        {/* <button
          className="btn btn-ghost"
          onClick={() => { setMode(m => m === "login" ? "register" : "login"); setErr(""); }}
        >
          {mode === "login" ? "No account? Register →" : "Have an account? Sign in →"}
        </button> */}
      </div>
    </div>
  );
}

// sumera@gmail.com
// Mobin@888

//ai@gmail.com
//sumera@888

// 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

// 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
// git remote set-url origin https://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@github.com/mobin-saiyad/chat-with-ai.git