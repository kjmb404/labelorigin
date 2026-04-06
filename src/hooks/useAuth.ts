/**
 * Auth hook for client portal.
 *
 * - Session stored in localStorage (key: "lo_session") so it survives refreshes.
 * - On mount: restores session from localStorage if present and not expired.
 * - Magic link token in URL is consumed and cleaned up automatically.
 */

"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "lo_session";

interface Session {
  token: string;
  email: string;
}

function saveSession(s: Session) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function clearSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.token || !s?.email) return null;
    // Decode JWT payload to check expiry (no verification — server handles that)
    const [, payload] = s.token.split(".");
    const { exp } = JSON.parse(atob(payload));
    if (Date.now() / 1000 > exp) { clearSession(); return null; }
    return s;
  } catch { return null; }
}

export function useAuth() {
  const [session,   setSession]   = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checking,  setChecking]  = useState(true);  // true only during initial mount check
  const [error,     setError]     = useState<string | null>(null);

  // Restore session from localStorage on mount, then check for magic-link token in URL
  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      setSession(stored);
      setChecking(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    if (token) {
      window.history.replaceState({}, "", window.location.pathname);
      verifyToken(token);
    }
    setChecking(false);
  }, []);

  const verifyToken = async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/auth/verify?token=${token}`);
      const data = await res.json();
      if (data.success) {
        const s = { token: data.session_token, email: data.email };
        setSession(s);
        saveSession(s);
      } else {
        setError(data.error || "Invalid or expired link. Please request a new one.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/magic-link", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success && data.error) setError(data.error);
      return data;
    } catch {
      setError("Failed to send login link. Please try again.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const authHeaders = session
    ? { Authorization: `Bearer ${session.token}` }
    : {};

  return { session, isLoading, checking, error, sendMagicLink, verifyToken, logout, authHeaders };
}
