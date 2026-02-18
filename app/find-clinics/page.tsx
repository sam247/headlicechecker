import type { Metadata } from "next";
import Link from "next/link";
import FindClinicsSection from "@/components/site/FindClinicsSection";
import ClinicContactForm from "@/components/site/ClinicContactForm";
import { Card, CardContent } from "@/components/ui/card";
import { getClinics, getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Find Head Lice Clinics Near You",
  description:
    "Search head lice clinics by city or postcode, compare nearby options, and submit a structured contact request for professional follow-up.",
  path: "/find-clinics",
});

interface FindClinicsPageProps {
  searchParams: { clinicId?: string };
}

const copy = getSiteCopy();

export default function FindClinicsPage({ searchParams }: FindClinicsPageProps) {
  const clinics = getClinics("ALL");
  const selectedClinic = clinics.find((clinic) => clinic.id === searchParams.clinicId);

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
      <div className="mx-auto max-w-6xl px-4">
        <FindClinicsSection clinics={clinics} containerClassName="max-w-6xl" />

        <section className="section-shell pt-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold">Before contacting a clinic</h2>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                For the strongest outcome, start with a clear close-up scan and note symptom timing. This gives your clinic enquiry better context and helps teams triage quickly.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <Link href="/#start-scan" className="text-primary hover:underline">
                  {copy.primaryCta}
                </Link>
                <Link href="/head-lice-symptoms" className="text-primary hover:underline">
                  Head lice symptoms guide
                </Link>
                <Link href="/locations" className="text-primary hover:underline">
                  City location guides
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <ClinicContactForm clinicId={selectedClinic?.id} clinicName={selectedClinic?.name} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
        </section>
      </div>
    </div>
  );
}
