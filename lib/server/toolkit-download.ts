import "server-only";

import crypto from "node:crypto";

export type DomainType = "school" | "trust" | "generic" | "unknown";

export interface ToolkitDownloadTokenPayload {
  referenceId: string;
  email_domain: string;
  school_country: string;
  school_role: string;
  trust_flag: boolean;
  download_count: number;
  issuedAt: number;
  exp: number;
}

function getTokenSecret(): string | null {
  const value = process.env.TOOLKIT_DOWNLOAD_TOKEN_SECRET?.trim();
  return value && value.length > 0 ? value : null;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadPart: string): string {
  const secret = getTokenSecret();
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(payloadPart).digest("base64url");
}

function isSchoolDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  if (!d) return false;
  if (d.endsWith(".sch.uk")) return true;
  if (d.endsWith(".edu")) return true;
  if (/\.edu\.[a-z]{2,}$/i.test(d)) return true;
  if (/\.k12\.[a-z]{2,}$/i.test(d)) return true;
  return false;
}

export function classifyDomain(emailDomain?: string): {
  email_domain: string;
  is_school_domain: boolean;
  domain_type: DomainType;
} {
  const domain = (emailDomain ?? "").trim().toLowerCase();
  if (!domain) {
    return {
      email_domain: "",
      is_school_domain: false,
      domain_type: "unknown",
    };
  }
  if (isSchoolDomain(domain)) {
    return {
      email_domain: domain,
      is_school_domain: true,
      domain_type: "school",
    };
  }
  if (domain.includes("trust") || domain.includes("mat")) {
    return {
      email_domain: domain,
      is_school_domain: false,
      domain_type: "trust",
    };
  }
  return {
    email_domain: domain,
    is_school_domain: false,
    domain_type: "generic",
  };
}

export function createDownloadToken(input: {
  referenceId: string;
  emailDomain: string;
  schoolCountry: string;
  schoolRole: string;
  trustFlag: boolean;
}): string | null {
  const secret = getTokenSecret();
  if (!secret) return null;
  const ttlMinutes = Number(process.env.TOOLKIT_DOWNLOAD_TOKEN_TTL_MINUTES ?? "1440");
  const ttlMs = Number.isFinite(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes * 60 * 1000 : 24 * 60 * 60 * 1000;
  const now = Date.now();
  const payload: ToolkitDownloadTokenPayload = {
    referenceId: input.referenceId,
    email_domain: input.emailDomain.toLowerCase(),
    school_country: input.schoolCountry,
    school_role: input.schoolRole,
    trust_flag: input.trustFlag,
    download_count: 0,
    issuedAt: now,
    exp: now + ttlMs,
  };
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadPart);
  return `${payloadPart}.${signature}`;
}

export function verifyDownloadToken(token: string): ToolkitDownloadTokenPayload | null {
  const secret = getTokenSecret();
  if (!secret) return null;
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;
  const expected = sign(payloadPart);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payloadPart)) as ToolkitDownloadTokenPayload;
    if (!parsed.referenceId || !parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hashTokenForKey(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 16);
}
