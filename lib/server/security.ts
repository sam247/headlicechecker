import { NextRequest } from "next/server";

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function normalizeEmail(email?: string): string {
  return (email ?? "").trim().toLowerCase();
}

export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nitnot.com";
  try {
    const originHost = new URL(origin).host;
    const siteHost = new URL(site).host;
    const requestHost = request.nextUrl.host;
    return originHost === siteHost || originHost === requestHost;
  } catch {
    return false;
  }
}

export function redactEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const [name, domain] = email.split("@");
  if (!name || !domain) return "***";
  return `${name.slice(0, 2)}***@${domain}`;
}
