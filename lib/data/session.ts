"use client";

const SESSION_KEY = "hlc_session_id";

function fallbackUuid(): string {
  const rand = Math.random().toString(36).slice(2, 12);
  return `hlc_${Date.now().toString(36)}_${rand}`;
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return fallbackUuid();
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return fallbackUuid();
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing && existing.trim().length > 0) return existing;
    const created = generateSessionId();
    window.localStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return fallbackUuid();
  }
}
