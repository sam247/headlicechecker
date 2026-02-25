import { NextRequest } from "next/server";
import { getClinics } from "@/lib/data/content";
import { insertEvent } from "@/lib/server/events-repo";
import { clientIp } from "@/lib/server/security";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";

function toRedirect(location: string, status = 302): Response {
  return new Response(null, {
    status,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
    },
  });
}

function normalizeUkPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.startsWith("44")) return `+${digits}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (digits.length === 10 || digits.length === 11) return `+44${digits}`;
  return `+${digits}`;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const clinicId = params.get("clinic_id")?.trim() ?? "";
  if (!clinicId) {
    return toRedirect("/directory", 302);
  }

  const clinic = getClinics("UK").find((entry) => entry.id === clinicId);
  const phone = normalizeUkPhone(clinic?.phone ?? params.get("phone"));
  if (!phone) {
    return toRedirect("/directory", 302);
  }

  const ip = clientIp(request);
  const { windowMs, maxRequests } = getRateLimitConfig();
  const limiter = rateLimit(`call:ip:${ip}`, windowMs, Math.max(15, Math.floor(maxRequests * 1.5)));
  if (!limiter.allowed) {
    return toRedirect(`tel:${phone}`, 302);
  }

  const nowIso = new Date().toISOString();
  const sessionId = params.get("sid")?.trim() || "unknown";
  const sourcePath = params.get("sp")?.trim() || "/directory";
  const pillar = params.get("p")?.trim() || "directory";

  try {
    await insertEvent({
      event_type: "call_click",
      user_session_id: sessionId,
      clinic_id: clinic?.id ?? clinicId,
      region: clinic?.region ?? null,
      metadata: {
        source_path: sourcePath,
        pillar,
      },
      timestamp: nowIso,
    });
  } catch {
    // non-blocking by design
  }

  return toRedirect(`tel:${phone}`, 302);
}
