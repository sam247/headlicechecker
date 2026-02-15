import { getSiteCopy } from "@/lib/data/content";

const copy = getSiteCopy();

export default function PrivacyPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">Privacy policy</h1>
        <div className="mt-5 space-y-4 text-sm text-muted-foreground">
          <p>{copy.privacyClaim}</p>
          <p>
            Contact requests include the details you provide and are routed to the nearest relevant clinic team. Third-party AI inference providers may have their own retention policies.
          </p>
          <p>
            You can request removal of submitted contact details by emailing privacy@nitnot.com and including your reference ID.
          </p>
        </div>
      </div>
    </section>
  );
}
