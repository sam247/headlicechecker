export type LeadDestination = {
  clinicId?: string;
  email?: string;
  region: string;
};

export type LeadPayload = {
  referenceId: string;
  submittedAt: string;
  name: string;
  email: string;
  phone?: string;
  postcode: string;
  city?: string;
  message?: string;
  clinicId?: string;
  scanLabel?: string;
  scanConfidenceLevel?: string;
  indicatorCount?: number;
  consentAt: string;
  policyVersion: string;
};

export type LeadDeliveryResult = {
  deliveryStatus: "sent" | "queued" | "failed";
  provider: "resend" | "postmark" | "none";
  providerMessageId?: string;
  error?: string;
};

export type ClinicApplicationPayload = {
  referenceId: string;
  clinicName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  gmbUrl?: string;
  country: "UK" | "US";
  city: string;
  region: string;
  postcode: string;
  reviewStars?: number;
  reviewCount?: number;
  address1: string;
  address2?: string;
  services: string[];
  message?: string;
  consentAt: string;
  policyVersion: string;
};

export type ClinicEnquiryPayload = {
  referenceId: string;
  contactName: string;
  clinicName: string;
  phone?: string;
  city: string;
  state: string;
  address?: string;
  reviewStars?: number;
  reviewCount?: number;
  email: string;
  website?: string;
  gmbUrl?: string;
  consentAt: string;
  policyVersion: string;
};

export type ClaimListingPayload = {
  referenceId: string;
  clinicId: string;
  clinicName: string;
  contactEmail: string;
  website: string;
  ownershipDeclaration: string;
  phone?: string;
  submittedAt: string;
};

export type SuggestClinicPayload = {
  referenceId: string;
  clinicName: string;
  website: string;
  region: string;
  submittedByEmail?: string;
  submittedAt: string;
};

export type SchoolToolkitLeadPayload = {
  referenceId: string;
  submittedAt: string;
  schoolName: string;
  role: string;
  email: string;
  country: string;
  trustName?: string;
  toolkitAssets: Array<{ id: string; title: string; href: string }>;
};

export type ToolkitDownloadNotificationPayload = {
  referenceId: string;
  assetId: string;
  assetName: string;
  mode: "download" | "view";
  downloadSequenceNumber: number;
  emailDomain: string;
  isSchoolDomain: boolean;
  domainType: "school" | "trust" | "generic" | "unknown";
  schoolCountry: string;
  schoolRole: string;
  trustFlag: boolean;
  requestedAt: string;
  ipCountry?: string;
};

function buildTextBody(payload: LeadPayload, destination: LeadDestination): string {
  return [
    `Reference: ${payload.referenceId}`,
    `Submitted at: ${payload.submittedAt}`,
    `Clinic: ${destination.clinicId ?? "auto"}`,
    `Region: ${destination.region}`,
    `City: ${payload.city ?? "Unknown"}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone ?? "N/A"}`,
    `Postcode/ZIP: ${payload.postcode}`,
    `Scan label: ${payload.scanLabel ?? "N/A"}`,
    `Scan confidence: ${payload.scanConfidenceLevel ?? "N/A"}`,
    `Indicator count: ${payload.indicatorCount ?? "N/A"}`,
    `Consent: true (${payload.consentAt}) policy ${payload.policyVersion}`,
    `Message: ${payload.message ?? "N/A"}`,
  ].join("\n");
}

function buildClinicApplicationText(payload: ClinicApplicationPayload): string {
  return [
    `Reference: ${payload.referenceId}`,
    `Clinic name: ${payload.clinicName}`,
    `Contact name: ${payload.contactName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone ?? "N/A"}`,
    `Website: ${payload.website ?? "N/A"}`,
    `Google Business URL: ${payload.gmbUrl ?? "N/A"}`,
    `Country: ${payload.country}`,
    `City: ${payload.city}`,
    `Region: ${payload.region}`,
    `Postcode/ZIP: ${payload.postcode}`,
    `Review stars: ${payload.reviewStars ?? "N/A"}`,
    `Review count: ${payload.reviewCount ?? "N/A"}`,
    `Address 1: ${payload.address1}`,
    `Address 2: ${payload.address2 ?? "N/A"}`,
    `Services: ${payload.services.join(", ")}`,
    `Consent: true (${payload.consentAt}) policy ${payload.policyVersion}`,
    `Message: ${payload.message ?? "N/A"}`,
  ].join("\n");
}

function buildClinicEnquiryText(payload: ClinicEnquiryPayload): string {
  return [
    `Reference: ${payload.referenceId}`,
    `Contact name: ${payload.contactName}`,
    `Clinic name: ${payload.clinicName}`,
    `Phone: ${payload.phone ?? "N/A"}`,
    `City: ${payload.city}`,
    `State: ${payload.state}`,
    `Address: ${payload.address ?? "N/A"}`,
    `Review stars: ${payload.reviewStars ?? "N/A"}`,
    `Review count: ${payload.reviewCount ?? "N/A"}`,
    `Email: ${payload.email}`,
    `Website: ${payload.website ?? "N/A"}`,
    `Google Business URL: ${payload.gmbUrl ?? "N/A"}`,
    `Consent: true (${payload.consentAt}) policy ${payload.policyVersion}`,
  ].join("\n");
}

function buildClaimListingText(payload: ClaimListingPayload): string {
  return [
    `Reference: ${payload.referenceId}`,
    `Clinic ID: ${payload.clinicId}`,
    `Clinic name: ${payload.clinicName}`,
    `Contact email: ${payload.contactEmail}`,
    `Website: ${payload.website}`,
    `Phone: ${payload.phone ?? "N/A"}`,
    `Ownership declaration: ${payload.ownershipDeclaration}`,
    `Submitted at: ${payload.submittedAt}`,
    "Status: claim_pending",
  ].join("\n");
}

function buildSuggestClinicText(payload: SuggestClinicPayload): string {
  return [
    `Reference: ${payload.referenceId}`,
    `Clinic name: ${payload.clinicName}`,
    `Website: ${payload.website}`,
    `Region: ${payload.region}`,
    `Submitted by email: ${payload.submittedByEmail ?? "N/A"}`,
    `Submitted at: ${payload.submittedAt}`,
    "Status: pending_review",
  ].join("\n");
}

async function sendEmail(
  subject: string,
  text: string,
  to: string,
  options?: { from?: string; bcc?: string }
): Promise<LeadDeliveryResult> {
  const provider = (process.env.LEAD_EMAIL_PROVIDER ?? "none").toLowerCase();
  const from = options?.from ?? process.env.LEAD_FROM_EMAIL;

  if (!to || !from) {
    return { deliveryStatus: "queued", provider: "none", error: "Missing email routing configuration" };
  }

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { deliveryStatus: "queued", provider: "none", error: "Missing RESEND_API_KEY" };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        ...(options?.bcc ? { bcc: [options.bcc] } : {}),
        subject,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { deliveryStatus: "failed", provider: "resend", error: detail.slice(0, 200) };
    }

    const data = (await res.json()) as { id?: string };
    return { deliveryStatus: "sent", provider: "resend", providerMessageId: data.id };
  }

  if (provider === "postmark") {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    if (!token) return { deliveryStatus: "queued", provider: "none", error: "Missing POSTMARK_SERVER_TOKEN" };

    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: from,
        To: to,
        ...(options?.bcc ? { Bcc: options.bcc } : {}),
        Subject: subject,
        TextBody: text,
        MessageStream: "outbound",
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { deliveryStatus: "failed", provider: "postmark", error: detail.slice(0, 200) };
    }

    const data = (await res.json()) as { MessageID?: string };
    return { deliveryStatus: "sent", provider: "postmark", providerMessageId: data.MessageID };
  }

  return { deliveryStatus: "queued", provider: "none" };
}

export async function deliverLeadEmail(
  payload: LeadPayload,
  destination: LeadDestination
): Promise<LeadDeliveryResult> {
  const fallbackTo = process.env.LEAD_FALLBACK_TO;
  const to = destination.email ?? fallbackTo;
  const city = payload.city ?? "Unknown";
  const confidence = payload.scanConfidenceLevel ?? "Unknown";
  const subject = `New Head Lice Enquiry - ${city} - Confidence: ${confidence}`;
  const text = buildTextBody(payload, destination);
  return sendEmail(subject, text, to ?? "");
}

export async function deliverClinicApplicationEmail(
  payload: ClinicApplicationPayload
): Promise<LeadDeliveryResult> {
  const to = process.env.CLINIC_APPLY_TO ?? process.env.LEAD_FALLBACK_TO;
  const subject = `Clinic application ${payload.referenceId} (${payload.country} ${payload.city})`;
  const text = buildClinicApplicationText(payload);
  return sendEmail(subject, text, to ?? "");
}

export async function deliverClinicEnquiryEmail(
  payload: ClinicEnquiryPayload
): Promise<LeadDeliveryResult> {
  const to = process.env.CLINIC_ENQUIRY_TO ?? process.env.LEAD_FALLBACK_TO;
  const subject = `Clinic enquiry ${payload.referenceId}`;
  const text = buildClinicEnquiryText(payload);
  return sendEmail(subject, text, to ?? "");
}

export async function deliverClaimListingEmail(
  payload: ClaimListingPayload
): Promise<LeadDeliveryResult> {
  const to = process.env.CLINIC_ENQUIRY_TO ?? process.env.LEAD_FALLBACK_TO;
  const subject = `Clinic listing verification request ${payload.referenceId}`;
  const text = buildClaimListingText(payload);
  return sendEmail(subject, text, to ?? "");
}

export async function deliverSuggestClinicEmail(
  payload: SuggestClinicPayload
): Promise<LeadDeliveryResult> {
  const to = process.env.CLINIC_ENQUIRY_TO ?? process.env.LEAD_FALLBACK_TO;
  const subject = `Clinic directory suggestion ${payload.referenceId}`;
  const text = buildSuggestClinicText(payload);
  return sendEmail(subject, text, to ?? "");
}

export async function deliverSchoolToolkitEmail(
  payload: SchoolToolkitLeadPayload
): Promise<LeadDeliveryResult> {
  const to = payload.email;
  const subject = `School Toolkit Access - ${payload.schoolName}`;
  const text = [
    `Reference: ${payload.referenceId}`,
    `Submitted at: ${payload.submittedAt}`,
    `School: ${payload.schoolName}`,
    `Role: ${payload.role}`,
    `Email: ${payload.email}`,
    `Country: ${payload.country}`,
    `Trust: ${payload.trustName ?? "N/A"}`,
    "",
    "Your toolkit files are now unlocked:",
    ...payload.toolkitAssets.map((asset) => `- ${asset.title}: ${asset.href}`),
    "",
    "This framework provides non-diagnostic policy and communication guidance for schools.",
  ].join("\n");

  return sendEmail(subject, text, to, {
    from: process.env.SCHOOL_TOOLKIT_CONFIRMATION_FROM ?? process.env.LEAD_FROM_EMAIL,
    bcc: process.env.SCHOOL_TOOLKIT_OPS_BCC,
  });
}

export async function deliverToolkitDownloadNotification(
  payload: ToolkitDownloadNotificationPayload
): Promise<LeadDeliveryResult> {
  const to = process.env.TOOLKIT_DOWNLOAD_NOTIFY_TO ?? "";
  const subject = `Toolkit ${payload.mode}: ${payload.assetName} (${payload.referenceId})`;
  const text = [
    `Reference: ${payload.referenceId}`,
    `Asset ID: ${payload.assetId}`,
    `Asset Name: ${payload.assetName}`,
    `Mode: ${payload.mode}`,
    `Download sequence number: ${payload.downloadSequenceNumber}`,
    `Email domain: ${payload.emailDomain || "unknown"}`,
    `School domain: ${payload.isSchoolDomain ? "true" : "false"}`,
    `Domain type: ${payload.domainType}`,
    `School country: ${payload.schoolCountry || "unknown"}`,
    `School role: ${payload.schoolRole || "unknown"}`,
    `Trust flag: ${payload.trustFlag ? "true" : "false"}`,
    `Requested at: ${payload.requestedAt}`,
    `IP country: ${payload.ipCountry ?? "unknown"}`,
  ].join("\n");

  return sendEmail(subject, text, to, {
    from: process.env.TOOLKIT_DOWNLOAD_NOTIFY_FROM ?? process.env.LEAD_FROM_EMAIL,
  });
}
