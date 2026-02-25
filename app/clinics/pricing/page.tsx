import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClinicPricingConfig } from "@/lib/config/clinic-pricing";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Clinic Pricing and Featured Placement",
  description:
    "Compare standard and featured listing options, understand lead quality, and choose the right placement model for your clinic.",
  path: "/clinics/pricing",
});

const featuredBenefits = [
  "Priority visibility in finder and location listings",
  "Featured badge and premium placement treatment",
  "Higher intent enquiries from scan-led workflows",
  "Structured clinic profile with rating support",
];

const standardBenefits = [
  "Standard listing visibility in the clinic finder",
  "Direct inclusion in local search and contact flow",
  "Access to partner enquiry onboarding",
];

export default function ForClinicsPricingPage() {
  const pricing = getClinicPricingConfig();
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "For Clinics", path: "/clinics" },
    { name: "Pricing", path: "/clinics/pricing" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "Clinic listing pricing",
    path: "/clinics/pricing",
    description: "Featured and standard listing options for clinic partners.",
    reviewedAt: "2026-02-23",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />

      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="section-title">Clinic listing tiers</h1>
        <p className="mx-auto mt-4 max-w-3xl section-copy text-center">
          Choose the placement model that fits your capacity. Featured placements are designed for clinics that want stronger visibility and higher-intent leads from families already moving toward professional confirmation.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card className="border-primary/50 clinic-card--sponsored">
            <CardContent className="p-6">
              <p className="clinic-badge-sponsored w-fit">Featured</p>
              <h2 className="mt-3 text-2xl font-bold">Tier 1: Featured</h2>
              <p className="mt-2 text-sm text-muted-foreground">Best for clinics focused on lead quality and faster growth.</p>
              <p className="mt-4 text-lg font-semibold text-foreground">{pricing.featuredLabel}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {featuredBenefits.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold">Tier 2: Standard</h2>
              <p className="mt-2 text-sm text-muted-foreground">Baseline listing for clinics onboarding into the platform.</p>
              <p className="mt-4 text-lg font-semibold text-foreground">{pricing.standardLabel}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {standardBenefits.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Why lead quality is higher here</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Families typically enter from a scan-first journey and reach clinics after confidence-driven triage, which improves enquiry context versus untargeted outbound traffic.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/clinics#enquiry">Submit partner enquiry</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/find-clinics">View clinic finder</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
