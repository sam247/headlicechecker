import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, isAllowedOrigin } from "@/lib/server/security";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";

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
    label: z.enum(["lice", "nits", "dandruff", "psoriasis", "clear"]),
    confidenceLevel: z.enum(["high", "medium", "low"]).optional(),
  })
  .strict();

const clinicSubmitSchema = z
  .object({
    event: z.literal("clinic_contact_submit"),
    timestamp: z.string().optional(),
    clinicId: z.string().optional(),
  })
  .strict();

const schema = z.discriminatedUnion("event", [scanStartSchema, scanResultSchema, clinicSubmitSchema]);

const counters: Record<string, number> = {
  scan_start: 0,
  scan_result: 0,
  clinic_contact_submit: 0,
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
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, counters, updatedAt: new Date().toISOString() });
}
