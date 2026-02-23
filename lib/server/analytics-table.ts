import crypto from "node:crypto";

export type DetectionOutcome = "clear" | "possible activity" | "high confidence";

interface AnalyticsRowInput {
  timestamp: string;
  userCountry: string;
  detectionOutcome: DetectionOutcome;
  clinicClicked: string;
  leadSubmitted: boolean;
  eventKey: string;
}

interface AnalyticsMetricInput {
  timestamp: string;
  eventName: string;
  country: string;
  referenceId: string;
  assetName: string;
  eventKey: string;
}

const RECENT_KEYS_TTL_MS = 5 * 60 * 1000;
const recentEventKeys = new Map<string, number>();

type AccessTokenState = {
  token: string;
  expiresAt: number;
} | null;

let cachedToken: AccessTokenState = null;

function normalizePrivateKey(raw?: string): string | null {
  if (!raw) return null;
  const key = raw.replace(/\\n/g, "\n").trim();
  return key.length > 0 ? key : null;
}

function base64url(input: Buffer | string): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signJwt(serviceAccountEmail: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(privateKey);
  return `${unsignedToken}.${base64url(signature)}`;
}

async function getAccessToken(): Promise<string | null> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  if (!serviceAccountEmail || !privateKey) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const assertion = signJwt(serviceAccountEmail, privateKey);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;

  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return data.access_token;
}

export async function appendSheetValues(input: {
  sheetId: string;
  tab: string;
  values: Array<string[]>;
  eventKey: string;
}): Promise<void> {
  if (!input.sheetId || !input.tab) return;
  if (shouldSkipByDedup(input.eventKey)) return;

  const token = await getAccessToken();
  if (!token) return;

  const range = encodeURIComponent(`${input.tab}!A:Z`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${input.sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: input.values }),
  }).catch(() => {
    // no-op
  });
}

function shouldSkipByDedup(eventKey: string): boolean {
  const now = Date.now();
  for (const [key, expiresAt] of recentEventKeys.entries()) {
    if (expiresAt <= now) recentEventKeys.delete(key);
  }
  if (recentEventKeys.has(eventKey)) return true;
  recentEventKeys.set(eventKey, now + RECENT_KEYS_TTL_MS);
  return false;
}

export function countryFromHeaders(headers: Headers): string {
  const raw =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code") ??
    "unknown";
  const normalized = raw.trim().toUpperCase();
  if (!normalized || normalized === "XX" || normalized === "ZZ" || normalized === "T1") return "unknown";
  return normalized;
}

export function mapDetectionOutcome(
  label?: string,
  confidence?: string
): DetectionOutcome {
  if (label === "clear") return "clear";
  if ((label === "lice" || label === "nits") && confidence === "high") return "high confidence";
  return "possible activity";
}

export async function appendAnalyticsRow(input: AnalyticsRowInput): Promise<void> {
  const sheetId = process.env.ANALYTICS_SHEET_ID;
  const tab = process.env.ANALYTICS_SHEET_TAB;
  if (!sheetId || !tab) return;
  await appendSheetValues({
    sheetId,
    tab,
    values: [
      [
        input.timestamp,
        input.userCountry || "unknown",
        input.detectionOutcome,
        input.clinicClicked ?? "",
        input.leadSubmitted ? "true" : "false",
      ],
    ],
    eventKey: `analytics-row:${input.eventKey}`,
  });
}

export async function appendAnalyticsMetric(input: AnalyticsMetricInput): Promise<void> {
  const sheetId = process.env.ANALYTICS_SHEET_ID;
  const tab = process.env.ANALYTICS_METRICS_SHEET_TAB;
  if (!sheetId || !tab) return;
  await appendSheetValues({
    sheetId,
    tab,
    values: [
      [
        input.timestamp,
        input.eventName,
        input.country || "unknown",
        input.referenceId || "",
        input.assetName || "",
      ],
    ],
    eventKey: `analytics-metric:${input.eventKey}`,
  });
}
