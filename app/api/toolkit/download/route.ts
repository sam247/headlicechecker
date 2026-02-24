import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSchoolToolkitAssets } from "@/lib/data/school-toolkit";
import { getRateLimitConfig, rateLimit } from "@/lib/server/rate-limit";
import { clientIp, isAllowedOrigin } from "@/lib/server/security";
import { countToolkitDownloadsForReference, insertEvent } from "@/lib/server/events-repo";
import { classifyDomain, hashTokenForKey, verifyDownloadToken } from "@/lib/server/toolkit-download";
import { deliverToolkitDownloadNotification } from "@/lib/server/lead-delivery";
import { countryFromHeaders } from "@/lib/server/analytics-table";

const querySchema = z.object({
  asset: z.string().min(1),
  token: z.string().min(1),
  mode: z.enum(["download", "view"]).default("download"),
});

async function writeRateLimitedEvent(input: {
  dimension: string;
  referenceId: string;
  tokenHash: string;
  ip: string;
}): Promise<void> {
  try {
    await insertEvent({
      event_type: "toolkit_download_rate_limited",
      user_session_id: `server_${input.referenceId}`,
      metadata: {
        limiter_dimension: input.dimension,
        reference_id: input.referenceId,
        token_hash: input.tokenHash,
        ip_hash: input.ip.slice(0, 8),
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    // no-op
  }
}

export async function GET(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Origin not allowed" }, { status: 403 });
  }

  const parsed = querySchema.safeParse({
    asset: request.nextUrl.searchParams.get("asset") ?? "",
    token: request.nextUrl.searchParams.get("token") ?? "",
    mode: request.nextUrl.searchParams.get("mode") ?? "download",
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid query payload" }, { status: 400 });
  }

  const { asset: assetId, token, mode } = parsed.data;
  const decoded = verifyDownloadToken(token);
  if (!decoded) {
    return NextResponse.json({ ok: false, error: "Invalid or expired token" }, { status: 401 });
  }

  const ip = clientIp(request);
  const tokenHash = hashTokenForKey(token);
  const { windowMs, maxRequests } = getRateLimitConfig();
  const tenMinutes = Math.max(windowMs, 10 * 60 * 1000);
  const ipLimiter = rateLimit(`toolkit-download:ip:${ip}`, tenMinutes, Math.max(maxRequests, 20));
  const tokenLimiter = rateLimit(`toolkit-download:token:${tokenHash}`, tenMinutes, 5);
  const referenceLimiter = rateLimit(`toolkit-download:ref:${decoded.referenceId}`, tenMinutes, 10);

  if (!ipLimiter.allowed) {
    await writeRateLimitedEvent({ dimension: "ip", referenceId: decoded.referenceId, tokenHash, ip });
    return NextResponse.json({ ok: false, error: "Too many download requests" }, { status: 429 });
  }
  if (!tokenLimiter.allowed) {
    await writeRateLimitedEvent({ dimension: "token", referenceId: decoded.referenceId, tokenHash, ip });
    return NextResponse.json({ ok: false, error: "Too many download requests" }, { status: 429 });
  }
  if (!referenceLimiter.allowed) {
    await writeRateLimitedEvent({ dimension: "referenceId", referenceId: decoded.referenceId, tokenHash, ip });
    return NextResponse.json({ ok: false, error: "Too many download requests" }, { status: 429 });
  }

  const asset = getSchoolToolkitAssets().find((item) => item.id === assetId);
  if (!asset) {
    return NextResponse.json({ ok: false, error: "Asset not found" }, { status: 404 });
  }

  const classification = classifyDomain(decoded.email_domain);
  const priorDownloads = mode === "download" ? await countToolkitDownloadsForReference(decoded.referenceId) : 0;
  const downloadSequenceNumber = mode === "download" ? priorDownloads + 1 : 0;
  const requestedAt = new Date().toISOString();
  const ipCountry = countryFromHeaders(request.headers);

  try {
    await insertEvent({
      event_type: mode === "download" ? "toolkit_downloaded" : "toolkit_file_viewed",
      user_session_id: `server_${decoded.referenceId}`,
      metadata: {
        reference_id: decoded.referenceId,
        asset_id: asset.id,
        asset_name: asset.title,
        format: asset.format,
        mode,
        download_sequence_number: downloadSequenceNumber,
        email_domain: classification.email_domain,
        is_school_domain: classification.is_school_domain,
        domain_type: classification.domain_type,
        school_country: decoded.school_country,
        school_role: decoded.school_role,
        trust_flag: decoded.trust_flag,
        ip_country: ipCountry,
      },
      timestamp: requestedAt,
    });
  } catch {
    // keep non-blocking
  }

  if (mode === "download") {
    try {
      const notifyResult = await deliverToolkitDownloadNotification({
        referenceId: decoded.referenceId,
        assetId: asset.id,
        assetName: asset.title,
        mode,
        downloadSequenceNumber,
        emailDomain: classification.email_domain,
        isSchoolDomain: classification.is_school_domain,
        domainType: classification.domain_type,
        schoolCountry: decoded.school_country,
        schoolRole: decoded.school_role,
        trustFlag: decoded.trust_flag,
        requestedAt,
        ipCountry,
      });

      await insertEvent({
        event_type:
          notifyResult.deliveryStatus === "failed"
            ? "toolkit_download_notify_failed"
            : "toolkit_download_notify_success",
        user_session_id: `server_${decoded.referenceId}`,
        metadata: {
          reference_id: decoded.referenceId,
          asset_id: asset.id,
          provider: notifyResult.provider,
          delivery_status: notifyResult.deliveryStatus,
          error: notifyResult.error ?? null,
        },
        timestamp: requestedAt,
      });
    } catch (error) {
      try {
        await insertEvent({
          event_type: "toolkit_download_notify_failed",
          user_session_id: `server_${decoded.referenceId}`,
          metadata: {
            reference_id: decoded.referenceId,
            asset_id: asset.id,
            error: error instanceof Error ? error.message : String(error),
          },
          timestamp: requestedAt,
        });
      } catch {
        // no-op
      }
    }
  }

  return NextResponse.redirect(new URL(asset.href, request.url), { status: 302 });
}

