import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deliverClaimListingEmail } from "@/lib/server/lead-delivery";
import { insertClinicClaim } from "@/lib/server/clinic-directory-repo";
import { insertEvent } from "@/lib/server/events-repo";
import { clientIp, isAllowedOrigin, normalizeEmail, redactEmail } from "@/lib/server/security";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";

const schema = z
  .object({
    clinicId: z.string().trim().min(1),
    clinicName: z.string().trim().min(2),
    contactEmail: z.string().email(),
    website: z
      .string()
      .trim()
      .min(3)
      .transform((value) => {
        if (value.startsWith("http://") || value.startsWith("https://")) return value;
        return `https://${value}`;
      })
      .refine((value) => /^https?:\/\//.test(value), "Website must be a valid URL"),
    ownershipDeclaration: z.string().trim().min(8).max(1000),
    phone: z.string().trim().max(50).optional(),
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
    return NextResponse.json({ ok: true, deliveryStatus: "queued" }, { status: 200 });
  }

  const { windowMs, maxRequests } = getRateLimitConfig();
  const emailKey = normalizeEmail(payload.contactEmail);
  const ipLimit = rateLimit(`claim-listing:ip:${ip}`, windowMs, maxRequests);
  const emailLimit = rateLimit(`claim-listing:email:${emailKey}`, windowMs, Math.max(3, Math.floor(maxRequests / 2)));

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
  const referenceId = `claim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    await insertClinicClaim({
      referenceId,
      clinicId: payload.clinicId,
      clinicName: payload.clinicName,
      contactEmail: payload.contactEmail,
      website: payload.website,
      ownershipDeclaration: payload.ownershipDeclaration,
      phone: payload.phone,
      createdAt: submittedAt,
      metadata: {
        source_path: "/claim-listing",
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "TRANSIENT_DELIVERY_ERROR",
        error: "We couldn't store your request right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  const delivery = await deliverClaimListingEmail({
    referenceId,
    clinicId: payload.clinicId,
    clinicName: payload.clinicName,
    contactEmail: payload.contactEmail,
    website: payload.website,
    ownershipDeclaration: payload.ownershipDeclaration,
    phone: payload.phone,
    submittedAt,
  });

  console.info("[claim_listing]", {
    referenceId,
    delivery: {
      status: delivery.deliveryStatus,
      provider: delivery.provider,
      messageId: delivery.providerMessageId,
      error: delivery.error,
    },
    claim: {
      clinicId: payload.clinicId,
      clinicName: payload.clinicName,
      contactEmail: redactEmail(payload.contactEmail),
      hasPhone: Boolean(payload.phone),
      ip,
    },
  });

  try {
    await insertEvent({
      event_type: "clinic_listing_claim_submitted",
      user_session_id: `server_${referenceId}`,
      clinic_id: payload.clinicId,
      region: null,
      metadata: {
        source_path: "/claim-listing",
        email: redactEmail(payload.contactEmail),
        delivery_status: delivery.deliveryStatus,
      },
      timestamp: submittedAt,
    });
  } catch {
    // non-blocking
  }

  if (delivery.deliveryStatus === "failed") {
    return NextResponse.json(
      {
        ok: false,
        code: classifyDeliveryError(delivery.error),
        error: "We couldn't deliver your request right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    referenceId,
    deliveryStatus: delivery.deliveryStatus,
    claimStatus: "claim_pending",
  });
}
