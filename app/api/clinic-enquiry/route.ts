import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { POLICY_VERSION } from "@/lib/data/compliance";
import { deliverClinicEnquiryEmail } from "@/lib/server/lead-delivery";
import { clientIp, isAllowedOrigin, normalizeEmail, redactEmail } from "@/lib/server/security";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";

const schema = z
  .object({
    contactName: z.string().min(2),
    clinicName: z.string().min(2),
    phone: z.string().optional(),
    address: z.string().min(3),
    email: z.string().email(),
    website: z
      .string()
      .optional()
      .transform((value) => {
        if (!value) return undefined;
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
        return `https://${trimmed}`;
      })
      .refine((value) => !value || /^https?:\/\//.test(value), "Website must be a valid URL"),
    consent: z.literal(true),
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
  const emailKey = normalizeEmail(payload.email);
  const ipLimit = rateLimit(`clinic-enquiry:ip:${ip}`, windowMs, maxRequests);
  const emailLimit = rateLimit(`clinic-enquiry:email:${emailKey}`, windowMs, Math.max(3, Math.floor(maxRequests / 2)));

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

  const referenceId = `enquiry_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const consentAt = new Date().toISOString();

  const delivery = await deliverClinicEnquiryEmail({
    referenceId,
    contactName: payload.contactName,
    clinicName: payload.clinicName,
    phone: payload.phone,
    address: payload.address,
    email: payload.email,
    website: payload.website,
    consentAt,
    policyVersion: POLICY_VERSION,
  });

  console.info("[clinic_enquiry]", {
    referenceId,
    delivery: {
      status: delivery.deliveryStatus,
      provider: delivery.provider,
      messageId: delivery.providerMessageId,
      error: delivery.error,
    },
    enquiry: {
      contactName: payload.contactName,
      clinicName: payload.clinicName,
      email: redactEmail(payload.email),
      phone: payload.phone ? "provided" : "none",
      consentAt,
      policyVersion: POLICY_VERSION,
      ip,
    },
  });

  if (delivery.deliveryStatus === "failed") {
    return NextResponse.json(
      {
        ok: false,
        code: classifyDeliveryError(delivery.error),
        error: "We couldn't deliver your enquiry right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    referenceId,
    deliveryStatus: delivery.deliveryStatus,
  });
}
