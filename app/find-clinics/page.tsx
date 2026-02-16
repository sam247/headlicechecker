import type { Metadata } from "next";
import Link from "next/link";
import ClinicFinder from "@/components/ClinicFinder";
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
      <ClinicFinder country="US" />

      <section className="section-shell pt-8">
        <div className="container mx-auto max-w-4xl px-4">
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

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">How to choose a clinic</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Compare location, response speed, and appointment availability. Families usually get the best outcome by prioritizing earliest suitable confirmation rather than waiting for a perfect slot.
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Include symptom duration and scan context in your enquiry so clinic teams can triage efficiently.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">What happens after submission</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  After you submit, your request is routed through our contact pipeline with a reference ID. Keep that reference for follow-up if you need to resend or update details.
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  If symptoms are persistent and you do not receive a timely response, select another nearby clinic and submit again.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Planning before appointments</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  If you are booking for multiple children, group checks by household and document what was seen in each scalp zone. This reduces repeated calls and helps clinics understand urgency across contacts.
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Bring practical details to follow-up: symptom duration, recent school exposure notices, and whether attached particles were observed repeatedly near the scalp.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Choosing between nearby options</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Start with practical criteria first: travel time, earliest available slot, and response reliability. Families often get faster resolution by choosing a nearby provider with clear availability rather than waiting for a specific clinic brand.
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Location guides can also help you expand the search area if your first results are limited in peak periods.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">Clinic finder best-practice checklist</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
                <li>Run a clear scan before submitting contact requests so your enquiry includes better context.</li>
                <li>Submit one complete enquiry per preferred clinic instead of fragmented messages across channels.</li>
                <li>Track your reference ID for follow-up visibility and faster support if details need updating.</li>
                <li>Escalate quickly when symptoms persist or spread, even if earlier checks were inconclusive.</li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8">
            <ClinicContactForm clinicId={selectedClinic?.id} clinicName={selectedClinic?.name} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
        </div>
      </section>
    </div>
  );
}
