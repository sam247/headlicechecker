import type { Metadata } from "next";
import { Suspense } from "react";
import FindClinicsSection from "@/components/site/FindClinicsSection";
import ClinicEnquiryForm from "@/components/site/ClinicEnquiryForm";
import { getClinics, getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Find Head Lice Clinics Near You",
  description:
    "Search head lice clinics by city or postcode, compare nearby options, and submit a structured contact request for professional follow-up.",
  path: "/find-clinics",
});

const copy = getSiteCopy();

export default function FindClinicsPage() {
  const clinics = getClinics("ALL");

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Find Clinics", path: "/find-clinics" },
  ]);

  const service = serviceJsonLd({
    name: "Head lice clinic finder",
    path: "/find-clinics",
    description: "Search and contact nearby head lice clinics through a lead-first follow-up flow.",
  });

  const webpage = medicalWebPageJsonLd({
    name: "Find head lice clinics",
    path: "/find-clinics",
    description: "Searchable clinic finder for professional head lice follow-up.",
    reviewedAt: "2026-02-16",
  });

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />

      <section className="hero-gradient-shell hero-gradient-right section-shell">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="section-shell">Loading clinic finder…</div>}>
            <FindClinicsSection clinics={clinics} />
          </Suspense>

          <section className="section-shell pt-10 md:pt-12">
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Are you a head lice clinic and interested in being listed?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Submit your details and we will get back to you.</p>
              <div className="mt-4">
                <ClinicEnquiryForm />
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
          </section>
        </div>
      </section>
    </div>
  );
}
