import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClinics } from "@/lib/data/content";
import { POLICY_VERSION } from "@/lib/data/compliance";
import type { ScanConfidenceLevel, ScanLabel } from "@/lib/data/types";
import { deliverLeadEmail } from "@/lib/server/lead-delivery";
import { clientIp, isAllowedOrigin, normalizeEmail, redactEmail } from "@/lib/server/security";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    postcode: z.string().min(3),
    message: z.string().max(500).optional(),
    clinicId: z.string().optional(),
    scanLabel: z.custom<ScanLabel>().optional(),
    scanConfidenceLevel: z.custom<ScanConfidenceLevel>().optional(),
    consent: z.literal(true),
    hp_field: z.string().optional(),
  })
  .strict();

function pickDestination(clinicId?: string, postcode?: string): { clinicId?: string; email?: string; region: string } {
  const clinics = getClinics("ALL");
  const byId = clinicId ? clinics.find((c) => c.id === clinicId) : undefined;
  if (byId) return { clinicId: byId.id, email: byId.email, region: byId.country };

  const normalized = postcode?.trim().toUpperCase() ?? "";
  const usHint = /^\d{5}/.test(normalized);
  const region = usHint ? "US" : "UK";
  const fallback = clinics.find((c) => c.country === region);
  return { clinicId: fallback?.id, email: fallback?.email, region };
}

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
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  if (payload.hp_field && payload.hp_field.trim().length > 0) {
    return NextResponse.json({ ok: true, deliveryStatus: "queued" }, { status: 200 });
  }

  const emailKey = normalizeEmail(payload.email);
  const { windowMs, maxRequests } = getRateLimitConfig();
  const ipLimit = rateLimit(`lead:ip:${ip}`, windowMs, maxRequests);
  const emailLimit = rateLimit(`lead:email:${emailKey}`, windowMs, Math.max(3, Math.floor(maxRequests / 2)));

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

  const destination = pickDestination(payload.clinicId, payload.postcode);
  const referenceId = `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const consentAt = new Date().toISOString();

  const delivery = await deliverLeadEmail(
    {
      referenceId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      postcode: payload.postcode,
      message: payload.message,
      clinicId: payload.clinicId,
      scanLabel: payload.scanLabel,
      scanConfidenceLevel: payload.scanConfidenceLevel,
      consentAt,
      policyVersion: POLICY_VERSION,
    },
    destination
  );

  console.info("[clinic_contact]", {
    referenceId,
    destination,
    delivery: {
      status: delivery.deliveryStatus,
      provider: delivery.provider,
      messageId: delivery.providerMessageId,
      error: delivery.error,
    },
    lead: {
      name: payload.name,
      email: redactEmail(payload.email),
      phone: payload.phone ? "provided" : "none",
      postcode: payload.postcode,
      messageLength: payload.message?.length ?? 0,
      scanLabel: payload.scanLabel,
      scanConfidenceLevel: payload.scanConfidenceLevel,
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
        error: "We couldn't deliver your request right now. Please try again shortly.",
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
