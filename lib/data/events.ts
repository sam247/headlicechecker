import type { ScanConfidenceLevel, ScanLabel } from "@/lib/data/types";

export type AnalyticsEventName =
  | "scan_start"
  | "scan_result"
  | "clinic_contact_submit"
  | "clinic_apply_submit"
  | "clinic_modal_opened"
  | "clinic_contact_panel_opened"
  | "clinic_contact_submitted"
  | "clinic_apply_submitted"
  | "scan_overlay_toggled"
  | "scan_legend_filter_used"
  | "scan_clinic_cta_clicked";

interface BasePayload {
  event: AnalyticsEventName;
  timestamp?: string;
}

interface ScanResultPayload extends BasePayload {
  event: "scan_result";
  label: ScanLabel;
  confidenceLevel?: ScanConfidenceLevel;
  detectionCount?: number;
  topDetectionLabel?: Exclude<ScanLabel, "clear">;
  topDetectionConfidenceLevel?: ScanConfidenceLevel;
}

interface OverlayTogglePayload extends BasePayload {
  event: "scan_overlay_toggled";
  enabled: boolean;
}

interface LegendFilterPayload extends BasePayload {
  event: "scan_legend_filter_used";
  filter: ScanLabel | "all";
}

interface ClinicClickPayload extends BasePayload {
  event: "scan_clinic_cta_clicked";
  label?: ScanLabel;
}

interface ClinicModalOpenedPayload extends BasePayload {
  event: "clinic_modal_opened";
  label?: ScanLabel;
}

interface ClinicContactPanelOpenedPayload extends BasePayload {
  event: "clinic_contact_panel_opened";
  clinicId?: string;
  label?: ScanLabel;
}

interface ClinicContactSubmittedPayload extends BasePayload {
  event: "clinic_contact_submitted";
  clinicId?: string;
  source?: "page" | "modal";
}

interface ClinicApplySubmitPayload extends BasePayload {
  event: "clinic_apply_submit";
  country?: "UK" | "US";
}

interface ClinicApplySubmittedPayload extends BasePayload {
  event: "clinic_apply_submitted";
  country?: "UK" | "US";
  source?: "for-clinics";
}

export type EventPayload =
  | BasePayload
  | ScanResultPayload
  | OverlayTogglePayload
  | LegendFilterPayload
  | ClinicClickPayload
  | ClinicModalOpenedPayload
  | ClinicContactPanelOpenedPayload
  | ClinicContactSubmittedPayload
  | ClinicApplySubmitPayload
  | ClinicApplySubmittedPayload
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
