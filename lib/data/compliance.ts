export const PRIVACY_CONTACT_EMAIL = "privacy@headlicechecker.com";
export const SUPPORT_CONTACT_EMAIL = "support@headlicechecker.com";
export const POLICY_VERSION = "2026-02-v2";
export const LEAD_RETENTION_DAYS = 180;
export const EVENT_RETENTION_DAYS = 90;

export const DATA_CATEGORIES = [
  "Contact details (name, email, optional phone)",
  "Location hint (postcode/ZIP)",
  "Optional contextual message",
  "Consent metadata (timestamp, policy version)",
] as const;

export const PROCESSOR_DISCLOSURE =
  "Scan providers and email delivery providers act as processors to support scan inference and clinic follow-up notifications.";
