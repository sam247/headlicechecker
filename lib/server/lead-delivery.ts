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

export async function deliverLeadEmail(
  payload: LeadPayload,
  destination: LeadDestination
): Promise<LeadDeliveryResult> {
  const provider = (process.env.LEAD_EMAIL_PROVIDER ?? "none").toLowerCase();
  const from = process.env.LEAD_FROM_EMAIL;
  const fallbackTo = process.env.LEAD_FALLBACK_TO;
  const to = destination.email ?? fallbackTo;

  if (!to || !from) {
    return { deliveryStatus: "failed", provider: "none", error: "Missing email routing configuration" };
  }

  const subject = `Head Lice Checker lead ${payload.referenceId} (${destination.region})`;
  const text = buildTextBody(payload, destination);

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
