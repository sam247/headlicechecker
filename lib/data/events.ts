import type { ScanConfidenceLevel, ScanLabel } from "@/lib/data/types";

export type AnalyticsEventName = "scan_start" | "scan_result" | "clinic_contact_submit";

interface BasePayload {
  event: AnalyticsEventName;
  timestamp?: string;
}

interface ScanResultPayload extends BasePayload {
  event: "scan_result";
  label: ScanLabel;
  confidenceLevel?: ScanConfidenceLevel;
}

export type EventPayload =
  | BasePayload
  | ScanResultPayload
  | (BasePayload & { event: "clinic_contact_submit"; clinicId?: string });

export async function trackEvent(payload: EventPayload): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // no-op by design
  }
}
