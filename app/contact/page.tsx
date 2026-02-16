import type { Metadata } from "next";
import Link from "next/link";
import ClinicContactForm from "@/components/site/ClinicContactForm";
import { Card, CardContent } from "@/components/ui/card";
import { getClinics, getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Head Lice Checker",
  description: "Contact Head Lice Checker for clinic follow-up requests, partnership enquiries, and support questions.",
  path: "/contact",
});

interface ContactPageProps {
  searchParams: { clinicId?: string };
}

const copy = getSiteCopy();

export default function ContactPage({ searchParams }: ContactPageProps) {
  const clinics = getClinics("ALL");
  const selectedClinic = clinics.find((c) => c.id === searchParams.clinicId);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "Contact Head Lice Checker",
    path: "/contact",
    description: "Contact and clinic follow-up form for Head Lice Checker users and partners.",
    reviewedAt: "2026-02-16",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">Contact Head Lice Checker</h1>
        <p className="mt-4 section-copy">
          Use this form for clinic follow-up enquiries, partner applications, or general support. If you already selected a clinic, we pre-fill that context below.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Best for families</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with a quick scan, then submit a clinic enquiry with your context included.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link href="/#start-scan" className="text-primary hover:underline">
                  {copy.primaryCta}
                </Link>
                <Link href="/find-clinics" className="text-primary hover:underline">
                  {copy.secondaryCta}
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Best for clinics and schools</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Share coverage details, enquiry goals, and service regions. We will route to the right team.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <Link href="/for-clinics" className="text-primary hover:underline">
                  Clinic partnerships
                </Link>
                <Link href="/for-schools" className="text-primary hover:underline">
                  School support
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">What to include for faster support</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Include your postcode or ZIP, symptom timing, and whether you already completed a scan. This helps us route requests and reduce reply delays.
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                If you are contacting a specific clinic, mention preferred callback windows and any accessibility considerations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Safety and limitations</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Contact responses support next-step coordination and do not replace medical diagnosis. For severe symptoms, use local healthcare channels immediately.
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                We use non-diagnostic language throughout the platform to keep recommendations practical and safety-focused.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">When to use this contact route</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Use this form when you need help choosing a clinic, want to submit a follow-up enquiry, or need support with a previous submission. This route is also suitable for school and clinic partnership enquiries.
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                For urgent medical concerns, contact local healthcare services directly. Our platform provides indicative screening guidance and coordination support, not emergency or diagnostic care.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">What to expect after submitting</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Successful submissions return a reference ID so requests can be traced. Keep this reference in case you need to update details or ask for a follow-up status check.
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Response timing can vary by location and clinic capacity. If your preferred option is unavailable, submit through finder again with an alternate nearby clinic.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Before you submit</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>Confirm your postcode or ZIP is accurate so routing can prioritize nearby options.</li>
              <li>Include symptom duration and any scan context that may help triage urgency.</li>
              <li>Use one complete message instead of multiple partial submissions.</li>
              <li>Check your email address carefully to avoid follow-up delays.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8">
          <ClinicContactForm compact clinicId={selectedClinic?.id} clinicName={selectedClinic?.name} />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
