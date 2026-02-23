import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, isAllowedOrigin } from "@/lib/server/security";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";
import { appendAnalyticsMetric, appendAnalyticsRow, countryFromHeaders, mapDetectionOutcome } from "@/lib/server/analytics-table";

const scanStartSchema = z
  .object({
    event: z.literal("scan_start"),
    timestamp: z.string().optional(),
  })
  .strict();

const scanResultSchema = z
  .object({
    event: z.literal("scan_result"),
    timestamp: z.string().optional(),
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
    result_label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
    confidence: z.enum(["high", "medium", "low"]).optional(),
    confidenceLevel: z.enum(["high", "medium", "low"]).optional(),
    detectionCount: z.number().int().min(0).optional(),
    topDetectionLabel: z.enum(["lice", "nits", "dandruff", "psoriasis"]).optional(),
    topDetectionConfidenceLevel: z.enum(["high", "medium", "low"]).optional(),
  })
  .strict();

const scanSubmissionSchema = z
  .object({
    event: z.literal("scan_submission"),
    timestamp: z.string().optional(),
    source: z.string().optional(),
  })
  .strict();

const photoUploadInitiatedSchema = z
  .object({
    event: z.literal("photo_upload_initiated"),
    timestamp: z.string().optional(),
    source: z.string().optional(),
  })
  .strict();

const scanCompletedSchema = z
  .object({
    event: z.literal("scan_completed"),
    timestamp: z.string().optional(),
    result_label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
    confidence: z.enum(["high", "medium", "low"]).optional(),
    detectionCount: z.number().int().min(0).optional(),
  })
  .strict();

const positiveDetectionShownSchema = z
  .object({
    event: z.literal("positive_detection_shown"),
    timestamp: z.string().optional(),
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
    confidence: z.enum(["high", "medium", "low"]).optional(),
    source: z.string().optional(),
  })
  .strict();

const viewClinicsClickedSchema = z
  .object({
    event: z.literal("view_clinics_clicked"),
    timestamp: z.string().optional(),
    source: z.string().optional(),
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
    clinicId: z.string().optional(),
    result_label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
    confidence: z.enum(["high", "medium", "low"]).optional(),
  })
  .strict();

const partnerEnquirySubmittedSchema = z
  .object({
    event: z.literal("partner_enquiry_submitted"),
    timestamp: z.string().optional(),
    country: z.enum(["UK", "US"]).optional(),
    source: z.string().optional(),
  })
  .strict();

const scanPositiveClickSchema = z
  .object({
    event: z.literal("scan_positive_detection_click"),
    timestamp: z.string().optional(),
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
    source: z.string().optional(),
  })
  .strict();

const findClinicClickSchema = z
  .object({
    event: z.literal("find_clinic_click"),
    timestamp: z.string().optional(),
    source: z.string().optional(),
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
  })
  .strict();

const clinicProfileClickSchema = z
  .object({
    event: z.literal("clinic_profile_click"),
    timestamp: z.string().optional(),
    clinicId: z.string().optional(),
    clinicName: z.string().optional(),
    destination: z.string().optional(),
  })
  .strict();

const schoolAssetDownloadSchema = z
  .object({
    event: z.literal("school_asset_download"),
    timestamp: z.string().optional(),
    asset_name: z.string().min(1),
    format: z.enum(["pdf", "docx", "xlsx"]),
  })
  .strict();

const schoolToolkitPageViewSchema = z
  .object({
    event: z.literal("school_toolkit_page_view"),
    timestamp: z.string().optional(),
    source: z.string().optional(),
    country: z.string().optional(),
  })
  .strict();

const schoolToolkitFormSubmittedSchema = z
  .object({
    event: z.literal("school_toolkit_form_submitted"),
    timestamp: z.string().optional(),
    role: z.string().optional(),
    country: z.string().optional(),
    reference_id: z.string().optional(),
  })
  .strict();

const schoolToolkitFileDownloadedSchema = z
  .object({
    event: z.literal("school_toolkit_file_downloaded"),
    timestamp: z.string().optional(),
    asset_name: z.string().min(1),
    format: z.enum(["pdf", "docx", "xlsx", "pptx", "md"]).optional(),
    reference_id: z.string().optional(),
    country: z.string().optional(),
  })
  .strict();

const schoolToolkitConfirmationEmailSentSchema = z
  .object({
    event: z.literal("school_toolkit_confirmation_email_sent"),
    timestamp: z.string().optional(),
    reference_id: z.string().optional(),
    country: z.string().optional(),
  })
  .strict();

const overlayToggleSchema = z
  .object({
    event: z.literal("scan_overlay_toggled"),
    timestamp: z.string().optional(),
    enabled: z.boolean(),
  })
  .strict();

const legendFilterSchema = z
  .object({
    event: z.literal("scan_legend_filter_used"),
    timestamp: z.string().optional(),
    filter: z.enum(["all", "lice", "nits", "dandruff", "psoriasis", "clear"]),
  })
  .strict();

const clinicCtaSchema = z
  .object({
    event: z.literal("scan_clinic_cta_clicked"),
    timestamp: z.string().optional(),
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
  })
  .strict();

const clinicModalOpenedSchema = z
  .object({
    event: z.literal("clinic_modal_opened"),
    timestamp: z.string().optional(),
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
  })
  .strict();

const clinicContactPanelOpenedSchema = z
  .object({
    event: z.literal("clinic_contact_panel_opened"),
    timestamp: z.string().optional(),
    clinicId: z.string().optional(),
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]).optional(),
  })
  .strict();

const clinicContactSubmittedSchema = z
  .object({
    event: z.literal("clinic_contact_submitted"),
    timestamp: z.string().optional(),
    clinicId: z.string().optional(),
    source: z.enum(["page", "modal"]).optional(),
  })
  .strict();

const clinicSubmitSchema = z
  .object({
    event: z.literal("clinic_contact_submit"),
    timestamp: z.string().optional(),
    clinicId: z.string().optional(),
  })
  .strict();

const clinicApplySubmitSchema = z
  .object({
    event: z.literal("clinic_apply_submit"),
    timestamp: z.string().optional(),
    country: z.enum(["UK", "US"]).optional(),
  })
  .strict();

const clinicApplySubmittedSchema = z
  .object({
    event: z.literal("clinic_apply_submitted"),
    timestamp: z.string().optional(),
    country: z.enum(["UK", "US"]).optional(),
    source: z.literal("for-clinics").optional(),
  })
  .strict();

const schema = z.discriminatedUnion("event", [
  scanStartSchema,
  scanSubmissionSchema,
  photoUploadInitiatedSchema,
  scanCompletedSchema,
  positiveDetectionShownSchema,
  viewClinicsClickedSchema,
  partnerEnquirySubmittedSchema,
  scanResultSchema,
  scanPositiveClickSchema,
  findClinicClickSchema,
  clinicProfileClickSchema,
  schoolAssetDownloadSchema,
  schoolToolkitPageViewSchema,
  schoolToolkitFormSubmittedSchema,
  schoolToolkitFileDownloadedSchema,
  schoolToolkitConfirmationEmailSentSchema,
  clinicSubmitSchema,
  clinicApplySubmitSchema,
  clinicApplySubmittedSchema,
  overlayToggleSchema,
  legendFilterSchema,
  clinicCtaSchema,
  clinicModalOpenedSchema,
  clinicContactPanelOpenedSchema,
  clinicContactSubmittedSchema,
]);

const counters: Record<string, number> = {
  scan_start: 0,
  scan_submission: 0,
  photo_upload_initiated: 0,
  scan_completed: 0,
  positive_detection_shown: 0,
  view_clinics_clicked: 0,
  partner_enquiry_submitted: 0,
  scan_result: 0,
  scan_positive_detection_click: 0,
  find_clinic_click: 0,
  clinic_profile_click: 0,
  school_asset_download: 0,
  school_toolkit_page_view: 0,
  school_toolkit_form_submitted: 0,
  school_toolkit_file_downloaded: 0,
  school_toolkit_confirmation_email_sent: 0,
  clinic_contact_submit: 0,
  clinic_apply_submit: 0,
  clinic_apply_submitted: 0,
  scan_overlay_toggled: 0,
  scan_legend_filter_used: 0,
  scan_clinic_cta_clicked: 0,
  clinic_modal_opened: 0,
  clinic_contact_panel_opened: 0,
  clinic_contact_submitted: 0,
};

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Origin not allowed" }, { status: 403 });
  }

  const ip = clientIp(request);
  const { windowMs, maxRequests } = getRateLimitConfig();
  const limiter = rateLimit(`events:ip:${ip}`, windowMs, maxRequests * 3);
  if (!limiter.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid event payload" }, { status: 400 });
  }

  const event = {
    ...parsed.data,
    timestamp: parsed.data.timestamp ?? new Date().toISOString(),
  };

  counters[event.event] += 1;
  console.info("[analytics_event]", event);

  const country = countryFromHeaders(request.headers);
  if (
    event.event === "scan_completed" ||
    event.event === "scan_result" ||
    event.event === "view_clinics_clicked" ||
    event.event === "find_clinic_click" ||
    event.event === "positive_detection_shown"
  ) {
    const label =
      "result_label" in event && event.result_label
        ? event.result_label
        : "label" in event
          ? event.label
          : undefined;
    const confidence =
      "confidence" in event && event.confidence
        ? event.confidence
        : "confidenceLevel" in event
          ? event.confidenceLevel
          : undefined;
    const clinicClicked =
      "clinicId" in event && typeof event.clinicId === "string" ? event.clinicId : "";

    await appendAnalyticsRow({
      timestamp: event.timestamp,
      userCountry: country,
      detectionOutcome: mapDetectionOutcome(label, confidence),
      clinicClicked,
      leadSubmitted: false,
      eventKey: `${event.event}:${event.timestamp}:${clinicClicked}:${label ?? ""}`,
    });
  }

  if (
    event.event === "school_toolkit_page_view" ||
    event.event === "school_toolkit_form_submitted" ||
    event.event === "school_toolkit_file_downloaded" ||
    event.event === "school_toolkit_confirmation_email_sent"
  ) {
    const explicitCountry = "country" in event && typeof event.country === "string" ? event.country : "";
    const referenceId = "reference_id" in event && typeof event.reference_id === "string" ? event.reference_id : "";
    const assetName = "asset_name" in event && typeof event.asset_name === "string" ? event.asset_name : "";
    await appendAnalyticsMetric({
      timestamp: event.timestamp,
      eventName: event.event,
      country: explicitCountry || country,
      referenceId,
      assetName,
      eventKey: `${event.event}:${event.timestamp}:${referenceId}:${assetName}`,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, counters, updatedAt: new Date().toISOString() });
}
