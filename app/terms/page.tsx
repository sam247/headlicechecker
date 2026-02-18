import type { Metadata } from "next";
import { POLICY_VERSION, SUPPORT_CONTACT_EMAIL } from "@/lib/data/compliance";
import { getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Terms of Use",
    description: "Terms and limitations for using the Head Lice Checker screening and clinic contact features.",
    path: "/terms",
  }),
};

export default function TermsPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Terms of Use", path: "/terms" },
  ]);

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="container mx-auto px-4">
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
