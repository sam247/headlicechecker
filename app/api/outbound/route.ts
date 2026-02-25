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

function normalizeExternalWebsite(raw: string | null, host: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.host === host) return null;
    if (url.pathname.startsWith("/api/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const clinicId = params.get("clinic_id")?.trim() ?? "";
  if (!clinicId) {
    return toRedirect("/directory", 302);
  }

  const clinic = getClinics("UK").find((entry) => entry.id === clinicId);
  const target = normalizeExternalWebsite(clinic?.bookingUrl ?? params.get("url"), request.nextUrl.host);
  if (!target) {
    return toRedirect("/directory", 302);
  }

  const ip = clientIp(request);
  const { windowMs, maxRequests } = getRateLimitConfig();
  const limiter = rateLimit(`outbound:ip:${ip}`, windowMs, Math.max(15, Math.floor(maxRequests * 1.5)));
  if (!limiter.allowed) {
    return toRedirect(target, 302);
  }

  const nowIso = new Date().toISOString();
  const sessionId = params.get("sid")?.trim() || "unknown";
  const sourcePath = params.get("sp")?.trim() || "/directory";
  const pillar = params.get("p")?.trim() || "directory";

  try {
    await insertEvent({
      event_type: "website_click",
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

  return toRedirect(target, 302);
}
