"use client";

import { getOrCreateSessionId } from "@/lib/data/session";
import type { Clinic } from "@/lib/data/types";

export function buildTrackedCallHref(clinic: Clinic, sourcePath?: string, pillar = "directory"): string | null {
  if (!clinic.phone) return null;
  const sessionId = typeof window !== "undefined" ? getOrCreateSessionId() : "";
  const params = new URLSearchParams({
    clinic_id: clinic.id,
    ...(sessionId ? { sid: sessionId } : {}),
    sp: sourcePath ?? (typeof window !== "undefined" ? window.location.pathname : "/directory"),
    p: pillar,
  });
  return `/api/call?${params.toString()}`;
}

export function buildTrackedOutboundHref(clinic: Clinic, sourcePath?: string, pillar = "directory"): string | null {
  if (!clinic.bookingUrl) return null;
  const sessionId = typeof window !== "undefined" ? getOrCreateSessionId() : "";
  const params = new URLSearchParams({
    clinic_id: clinic.id,
    ...(sessionId ? { sid: sessionId } : {}),
    sp: sourcePath ?? (typeof window !== "undefined" ? window.location.pathname : "/directory"),
    p: pillar,
  });
  return `/api/outbound?${params.toString()}`;
}
