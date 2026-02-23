import { track } from "@vercel/analytics";
import type { ScanConfidenceLevel, ScanLabel } from "@/lib/data/types";

export type AnalyticsEventName =
  | "scan_submission"
  | "scan_result"
  | "scan_positive_detection_click"
  | "find_clinic_click"
  | "clinic_profile_click"
  | "clinic_contact_submitted"
  | "clinic_apply_submitted"
  | "school_asset_download"
  | "scan_start"
  | "clinic_contact_submit"
  | "clinic_apply_submit"
  | "clinic_modal_opened"
  | "clinic_contact_panel_opened"
  | "scan_overlay_toggled"
  | "scan_legend_filter_used"
  | "scan_clinic_cta_clicked";

interface BasePayload {
  event: AnalyticsEventName;
  timestamp?: string;
  source?: string;
}

interface ScanResultPayload extends BasePayload {
  event: "scan_result";
  result_label?: ScanLabel;
  label?: ScanLabel;
  confidence?: ScanConfidenceLevel;
  confidenceLevel?: ScanConfidenceLevel;
  detectionCount?: number;
  topDetectionLabel?: Exclude<ScanLabel, "clear">;
  topDetectionConfidenceLevel?: ScanConfidenceLevel;
}

interface ScanPositivePayload extends BasePayload {
  event: "scan_positive_detection_click";
  label?: ScanLabel;
  source?: string;
}

interface FindClinicClickPayload extends BasePayload {
  event: "find_clinic_click";
  source?: string;
  label?: ScanLabel;
}

interface ClinicProfileClickPayload extends BasePayload {
  event: "clinic_profile_click";
  clinicId?: string;
  clinicName?: string;
  destination?: string;
}

interface SchoolAssetDownloadPayload extends BasePayload {
  event: "school_asset_download";
  asset_name: string;
  format: "pdf" | "docx" | "xlsx";
}

interface OverlayTogglePayload extends BasePayload {
  event: "scan_overlay_toggled";
  enabled: boolean;
}

interface LegendFilterPayload extends BasePayload {
  event: "scan_legend_filter_used";
  filter: ScanLabel | "all";
}

interface ClinicApplyPayload extends BasePayload {
  event: "clinic_apply_submit" | "clinic_apply_submitted";
  country?: "UK" | "US";
  source?: "for-clinics";
}

interface ClinicContactPayload extends BasePayload {
  event: "clinic_contact_submit" | "clinic_contact_submitted";
  clinicId?: string;
  source?: "page" | "modal";
}

export type EventPayload =
  | BasePayload
  | ScanResultPayload
  | ScanPositivePayload
  | FindClinicClickPayload
  | ClinicProfileClickPayload
  | SchoolAssetDownloadPayload
  | OverlayTogglePayload
  | LegendFilterPayload
  | ClinicApplyPayload
  | ClinicContactPayload
  | (BasePayload & { event: "clinic_modal_opened"; label?: ScanLabel })
  | (BasePayload & { event: "clinic_contact_panel_opened"; clinicId?: string; label?: ScanLabel })
  | (BasePayload & { event: "scan_clinic_cta_clicked"; label?: ScanLabel })
  | (BasePayload & { event: "scan_start" });

function normalizeEventName(payload: EventPayload): AnalyticsEventName {
  if (payload.event === "scan_start") return "scan_submission";
  if (payload.event === "scan_clinic_cta_clicked") return "find_clinic_click";
  if (payload.event === "clinic_contact_submit") return "clinic_contact_submitted";
  if (payload.event === "clinic_apply_submit") return "clinic_apply_submitted";
  return payload.event;
}

function normalizeProperties(payload: EventPayload): Record<string, string | number | boolean> {
  const cloned = { ...payload } as Record<string, unknown>;
  delete cloned.event;
  delete cloned.timestamp;

  if (cloned.label && !cloned.result_label) {
    cloned.result_label = cloned.label;
  }
  if (cloned.confidenceLevel && !cloned.confidence) {
    cloned.confidence = cloned.confidenceLevel;
  }

  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(cloned)) {
    if (value == null) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[key] = value;
    }
  }
  return result;
}

export async function trackEvent(payload: EventPayload): Promise<void> {
  const analyticsEvent = normalizeEventName(payload);
  const properties = normalizeProperties(payload);

  try {
    track(analyticsEvent, properties);
  } catch {
    // no-op
  }

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        event: analyticsEvent,
      }),
    });
  } catch {
    // no-op by design
  }
}
