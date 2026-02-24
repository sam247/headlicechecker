"use client";

import { getOrCreateSessionId } from "@/lib/data/session";

export interface EventPayload {
  event_type: string;
  clinic_id?: string;
  region?: string;
  confidence_tier?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

const EVENT_ENDPOINT = "/api/event";

function buildPayload(payload: EventPayload) {
  return {
    event_type: payload.event_type,
    user_session_id: getOrCreateSessionId(),
    clinic_id: payload.clinic_id,
    region: payload.region,
    confidence_tier: payload.confidence_tier,
    metadata: payload.metadata ?? {},
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };
}

function sendViaBeacon(json: string): boolean {
  if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") return false;
  try {
    const blob = new Blob([json], { type: "application/json" });
    return navigator.sendBeacon(EVENT_ENDPOINT, blob);
  } catch {
    return false;
  }
}

export async function trackEvent(payload: EventPayload): Promise<void> {
  const body = JSON.stringify(buildPayload(payload));
  if (sendViaBeacon(body)) return;

  try {
    await fetch(EVENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      cache: "no-store",
    });
  } catch {
    // no-op by design
  }
}
