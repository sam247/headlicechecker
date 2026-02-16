import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "For Clinic Partners",
  description:
    "Join Head Lice Checker as a clinic partner to receive structured, consented enquiries from families who need professional follow-up.",
  path: "/for-clinics",
});

const sections = [
  {
    heading: "Why clinics partner with us",
    body: [
      "Clinic teams need lead quality, not lead noise. Head Lice Checker routes parent enquiries through a structured capture flow so submissions include location hints, context, and explicit consent.",
      "Families arrive after an indicative triage step, which improves intent quality compared with generic cold enquiries.",
      "The result is a cleaner follow-up queue and better conversion potential for participating clinics."
    ],
  },
  {
    heading: "How lead routing works",
    body: [
      "Parents select a clinic from finder results and submit a centralized enquiry form. This keeps messaging consistent and prevents data loss across fragmented channels.",
      "Submitted leads are validated and delivered through the existing clinic contact pipeline with reference IDs for traceability.",
      "This design supports operational clarity and allows monitoring of response outcomes over time."
    ],
  },
  {
    heading: "What makes enquiries higher quality",
    body: [
      "The scan journey sets context before contact. Families can view likely indicators and confidence tiers, then choose follow-up based on clearer evidence.",
      "Because contact is triggered after a decision point, clinics receive more focused requests and fewer purely exploratory messages.",
      "As location content expands, intent quality improves further through city-level educational pathways."
    ],
  },
  {
    heading: "Operational standards for partner clinics",
    body: [
      "Partners should provide clear service coverage, response windows, and practical appointment expectations. Transparent communication improves trust and reduces drop-off.",
      "Clinics are encouraged to respond using the context provided in each enquiry and to confirm next steps in plain language for parents.",
      "Lead handling should align with local privacy and consent obligations."
    ],
  },
  {
    heading: "Network growth and local relevance",
    body: [
      "Our location rollout focuses on high-intent city pages that connect educational content to clinic discovery. This strengthens both search visibility and referral relevance.",
      "As demand grows, we prioritize coverage quality over directory size. Clinics with strong response standards are better positioned for sustained lead performance.",
      "We continue to optimize finder UX and contact flow metrics to improve partnership outcomes."
    ],
  },
  {
    heading: "Lead quality analytics and optimization",
    body: [
      "We analyze funnel behavior across scan outcomes, clinic finder interactions, and contact submissions to improve the relevance of routed enquiries.",
      "When patterns show friction, such as high drop-off before submit, we adjust copy and form design to keep conversion quality high without sacrificing consent clarity.",
      "This optimization cycle helps partner clinics receive enquiries with better context and stronger follow-through intent."
    ],
  },
  {
    heading: "How to apply",
    body: [
      "Use the partner contact route to share your service area, availability, and preferred lead handling process.",
      "Our team reviews fit, routing coverage, and operational readiness before onboarding.",
      "Once live, your clinic appears in finder experiences and location-intent pathways where relevant."
    ],
  },
];

const faqs = [
  {
    question: "Do partner clinics receive direct contact details before form submit?",
    answer: "No. The lead-first flow centralizes enquiry capture through the platform before details are routed.",
  },
  {
    question: "Can I define my service region?",
    answer: "Yes. Region and location coverage are part of onboarding so routing can match your operational area.",
  },
  {
    question: "How are enquiries tracked?",
    answer: "Each successful submission includes a reference ID for delivery and follow-up traceability.",
  },
  {
    question: "Does the platform diagnose patients?",
    answer: "No. The scan output is indicative triage only and clinics provide professional confirmation.",
  },
];

export default function ForClinicsPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "For Clinics", path: "/for-clinics" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "Clinic partnership overview",
    path: "/for-clinics",
    description: "How clinic partner lead routing and onboarding works.",
    reviewedAt: "2026-02-16",
  });

  const service = serviceJsonLd({
    name: "Clinic partner lead routing",
    path: "/for-clinics",
    description: "Structured family enquiry routing for head lice clinic partners.",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="section-title">For clinic partners</h1>
        <p className="mt-4 section-copy">
          Receive consented, structured family enquiries through a lead-first flow designed for clearer context and stronger follow-through.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <Card key={section.heading}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Apply as a partner clinic</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Share your coverage and response capacity, and we will follow up with onboarding details.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/#start-scan">{copy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/find-clinics">{copy.secondaryCta}</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/contact">Apply now</Link>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
