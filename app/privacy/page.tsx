import type { Metadata } from "next";
import {
  DATA_CATEGORIES,
  EVENT_RETENTION_DAYS,
  LEAD_RETENTION_DAYS,
  POLICY_VERSION,
  PRIVACY_CONTACT_EMAIL,
  PROCESSOR_DISCLOSURE,
} from "@/lib/data/compliance";
import { getSiteCopy } from "@/lib/data/content";

const copy = getSiteCopy();

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NitNot handles uploaded images, consented lead data, retention windows, and processor disclosures.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">Privacy policy</h1>
        <div className="mt-5 space-y-4 text-sm text-muted-foreground">
          <p>{copy.privacyClaim}</p>
          <p>Policy version: {POLICY_VERSION}</p>
          <p>Data categories collected:</p>
          <ul className="list-disc space-y-1 pl-5">
            {DATA_CATEGORIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>Lead submissions are retained for up to {LEAD_RETENTION_DAYS} days.</p>
          <p>Analytics event logs are retained for up to {EVENT_RETENTION_DAYS} days.</p>
          <p>{PROCESSOR_DISCLOSURE}</p>
          <p>
            You can request removal of submitted contact details by emailing {PRIVACY_CONTACT_EMAIL} and including your reference ID.
          </p>
        </div>
      </div>
    </section>
  );
}
