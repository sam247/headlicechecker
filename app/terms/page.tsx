import { getSiteCopy } from "@/lib/data/content";

const copy = getSiteCopy();

export default function TermsPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">Terms of use</h1>
        <div className="mt-5 space-y-4 text-sm text-muted-foreground">
          <p>{copy.medicalDisclaimer}</p>
          <p>
            The service is provided on an &quot;as available&quot; basis and should not replace professional medical advice, diagnosis, or treatment.
          </p>
          <p>
            By using this service, you confirm you have authority to upload the image and submit any personal contact details shared through forms.
          </p>
        </div>
      </div>
    </section>
  );
}
