export type LeadDestination = {
  clinicId?: string;
  email?: string;
  region: string;
};

export type LeadPayload = {
  referenceId: string;
  name: string;
  email: string;
  phone?: string;
  postcode: string;
  message?: string;
  clinicId?: string;
  scanLabel?: string;
  scanConfidenceLevel?: string;
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
  country: "UK" | "US";
  city: string;
  region: string;
  postcode: string;
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
  address: string;
  email: string;
  website?: string;
  consentAt: string;
  policyVersion: string;
};

function buildTextBody(payload: LeadPayload, destination: LeadDestination): string {
  return [
    `Reference: ${payload.referenceId}`,
    `Clinic: ${destination.clinicId ?? "auto"}`,
    `Region: ${destination.region}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone ?? "N/A"}`,
    `Postcode/ZIP: ${payload.postcode}`,
    `Scan label: ${payload.scanLabel ?? "N/A"}`,
    `Scan confidence: ${payload.scanConfidenceLevel ?? "N/A"}`,
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
    `Country: ${payload.country}`,
    `City: ${payload.city}`,
    `Region: ${payload.region}`,
    `Postcode/ZIP: ${payload.postcode}`,
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
    `Address: ${payload.address}`,
    `Email: ${payload.email}`,
    `Website: ${payload.website ?? "N/A"}`,
    `Consent: true (${payload.consentAt}) policy ${payload.policyVersion}`,
  ].join("\n");
}

async function sendEmail(subject: string, text: string, to: string): Promise<LeadDeliveryResult> {
  const provider = (process.env.LEAD_EMAIL_PROVIDER ?? "none").toLowerCase();
  const from = process.env.LEAD_FROM_EMAIL;

  if (!to || !from) {
    return { deliveryStatus: "failed", provider: "none", error: "Missing email routing configuration" };
  }

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { deliveryStatus: "failed", provider: "resend", error: "Missing RESEND_API_KEY" };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
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
    if (!token) return { deliveryStatus: "failed", provider: "postmark", error: "Missing POSTMARK_SERVER_TOKEN" };

    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: from,
        To: to,
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
  const subject = `Head Lice Checker lead ${payload.referenceId} (${destination.region})`;
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
