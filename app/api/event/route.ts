import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, isAllowedOrigin } from "@/lib/server/security";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";
import { insertEvent } from "@/lib/server/events-repo";

const schema = z
  .object({
    event_type: z.string().min(1),
    user_session_id: z.string().min(1),
    clinic_id: z.string().trim().min(1).nullable().optional(),
    region: z.string().trim().min(1).nullable().optional(),
    confidence_tier: z.string().trim().min(1).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    timestamp: z.string().datetime({ offset: true }),
  })
  .strict();

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Origin not allowed" }, { status: 403 });
  }

  const ip = clientIp(request);
  const { windowMs, maxRequests } = getRateLimitConfig();
  const limiter = rateLimit(`event:ip:${ip}`, windowMs, maxRequests * 20);
  if (!limiter.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid event payload" }, { status: 400 });
  }

  const payload = parsed.data;
  try {
    await insertEvent({
      event_type: payload.event_type,
      user_session_id: payload.user_session_id,
      clinic_id: payload.clinic_id ?? null,
      region: payload.region ?? null,
      confidence_tier: payload.confidence_tier ?? null,
      metadata: payload.metadata ?? {},
      timestamp: payload.timestamp,
    });
    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }
}
