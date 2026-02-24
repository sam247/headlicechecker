import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deliverSchoolToolkitEmail } from "@/lib/server/lead-delivery";
import { appendAnalyticsMetric, countryFromHeaders } from "@/lib/server/analytics-table";
import { getSchoolToolkitAssets } from "@/lib/data/school-toolkit";
import { appendSchoolLeadRow } from "@/lib/server/school-leads-table";
import { clientIp, isAllowedOrigin, normalizeEmail, redactEmail } from "@/lib/server/security";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";
import { insertEvent } from "@/lib/server/events-repo";
import { createDownloadToken } from "@/lib/server/toolkit-download";

const schema = z
  .object({
    schoolName: z.string().min(2),
    role: z.string().min(2),
    email: z.string().email(),
    country: z.string().min(2),
    trustName: z.string().optional(),
    hp_field: z.string().optional(),
  })
  .strict();

function classifyDeliveryError(detail?: string): "TRANSIENT_DELIVERY_ERROR" | "PERMANENT_DELIVERY_ERROR" {
  if (!detail) return "TRANSIENT_DELIVERY_ERROR";
  const lower = detail.toLowerCase();
  if (lower.includes("invalid") || lower.includes("missing") || lower.includes("unauthorized")) {
    return "PERMANENT_DELIVERY_ERROR";
  }
  return "TRANSIENT_DELIVERY_ERROR";
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Origin not allowed" }, { status: 403 });
  }

  const ip = clientIp(request);
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        error: "Invalid request payload",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  if (payload.hp_field && payload.hp_field.trim().length > 0) {
    return NextResponse.json({ ok: true, deliveryStatus: "queued", assets: [] }, { status: 200 });
  }

  const { windowMs, maxRequests } = getRateLimitConfig();
  const emailKey = normalizeEmail(payload.email);
  const ipLimit = rateLimit(`school-toolkit:ip:${ip}`, windowMs, maxRequests);
  const emailLimit = rateLimit(`school-toolkit:email:${emailKey}`, windowMs, Math.max(3, Math.floor(maxRequests / 2)));
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED",
        error: "Too many requests. Please wait and try again.",
      },
      { status: 429 }
    );
  }

  const submittedAt = new Date().toISOString();
  const referenceId = `school_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const assets = getSchoolToolkitAssets();
  const country = payload.country || countryFromHeaders(request.headers);

  const delivery = await deliverSchoolToolkitEmail({
    referenceId,
    submittedAt,
    schoolName: payload.schoolName,
    role: payload.role,
    email: payload.email,
    country,
    trustName: payload.trustName,
    toolkitAssets: assets.map((asset) => ({ id: asset.id, title: asset.title, href: asset.href })),
  });

  console.info("[school_toolkit]", {
    referenceId,
    delivery: {
      status: delivery.deliveryStatus,
      provider: delivery.provider,
      messageId: delivery.providerMessageId,
      error: delivery.error,
    },
    lead: {
      schoolName: payload.schoolName,
      role: payload.role,
      email: redactEmail(payload.email),
      country,
      trustName: payload.trustName ?? null,
      assetCount: assets.length,
      ip,
    },
  });

  if (delivery.deliveryStatus === "failed") {
    return NextResponse.json(
      {
        ok: false,
        code: classifyDeliveryError(delivery.error),
        error: "We couldn't send toolkit confirmation right now. Please retry shortly.",
      },
      { status: 503 }
    );
  }

  await appendSchoolLeadRow({
    timestamp: submittedAt,
    schoolName: payload.schoolName,
    role: payload.role,
    email: payload.email,
    country,
    trustName: payload.trustName,
    toolkitDownloaded: true,
    toolkitAssetsUnlocked: assets.map((asset) => asset.id),
    sourcePage: "/school-head-lice-toolkit",
    referenceId,
    eventKey: `${referenceId}:${payload.email}`,
  });

  await appendAnalyticsMetric({
    timestamp: submittedAt,
    eventName: "school_toolkit_confirmation_email_sent",
    country,
    referenceId,
    assetName: "",
    eventKey: `school_toolkit_confirmation_email_sent:${referenceId}`,
  });

  try {
    const emailDomain = payload.email.includes("@") ? payload.email.split("@")[1]?.toLowerCase() ?? "" : "";
    const trustFlag = Boolean(payload.trustName && payload.trustName.trim().length > 0);
    await insertEvent({
      event_type: "toolkit_unlock_submitted",
      user_session_id: `server_${referenceId}`,
      region: payload.country,
      metadata: {
        school_country: country,
        school_role: payload.role,
        email_domain: emailDomain,
        trust_flag: trustFlag,
        reference_id: referenceId,
      },
      timestamp: submittedAt,
    });
  } catch {
    // keep non-blocking
  }

  const emailDomain = payload.email.includes("@") ? payload.email.split("@")[1]?.toLowerCase() ?? "" : "";
  const trustFlag = Boolean(payload.trustName && payload.trustName.trim().length > 0);
  const downloadToken = createDownloadToken({
    referenceId,
    emailDomain,
    schoolCountry: country,
    schoolRole: payload.role,
    trustFlag,
  });

  return NextResponse.json({
    ok: true,
    referenceId,
    deliveryStatus: delivery.deliveryStatus,
    downloadToken,
    assets,
  });
}
