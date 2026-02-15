import type { Metadata } from "next";
import { POLICY_VERSION, SUPPORT_CONTACT_EMAIL } from "@/lib/data/compliance";
import { getSiteCopy } from "@/lib/data/content";

const copy = getSiteCopy();

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and limitations for using the NitNot head lice checker and clinic contact features.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">Terms of use</h1>
        <div className="mt-5 space-y-4 text-sm text-muted-foreground">
          <p>{copy.medicalDisclaimer}</p>
          <p>Policy version: {POLICY_VERSION}</p>
          <p>
            The service is provided on an &quot;as available&quot; basis and should not replace professional medical advice, diagnosis, or treatment.
          </p>
          <p>
            By using this service, you confirm you have authority to upload the image and submit any personal contact details shared through forms.
          </p>
          <p>
            For service concerns, contact {SUPPORT_CONTACT_EMAIL}.
          </p>
        </div>
      </div>
    </section>
  );
}
