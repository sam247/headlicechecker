import type { Metadata } from "next";
import ClaimListingForm from "@/components/site/ClaimListingForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Verify Clinic Listing",
  description: "Owners can verify clinic listings for manual review and partner verification assessment.",
  path: "/claim-listing",
});

interface ClaimListingPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function ClaimListingPage({ searchParams }: ClaimListingPageProps) {
  const initialClinicId = pickParam(searchParams?.clinic_id);
  const initialClinicName = pickParam(searchParams?.clinic_name);
  const initialWebsite = pickParam(searchParams?.website);

  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="section-title text-left">Verify your clinic listing</h1>
        <p className="mt-3 section-copy text-left">
          Submit a verification request for manual review. No automated approval is applied at this stage.
        </p>
        <div className="mt-6">
          <ClaimListingForm
            initialClinicId={initialClinicId}
            initialClinicName={initialClinicName}
            initialWebsite={initialWebsite}
          />
        </div>
      </div>
    </section>
  );
}
