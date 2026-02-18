import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "About Head Lice Checker",
  description:
    "Learn how Head Lice Checker helps families move from uncertainty to action with evidence-led, non-diagnostic screening guidance.",
  path: "/about",
});

const sections = [
  {
    heading: "Why this platform exists",
    body: [
      "Head Lice Checker was built for a simple reason: families need clarity fast when head lice concerns appear. Most parents are not looking for perfect medical certainty in minute one; they want a calm first step they can trust.",
      "Our product turns that first step into a practical workflow. Capture a better photo, run an indicative screening check, and then decide whether to monitor, re-check, or request professional follow-up.",
      "This approach reduces panic and helps households avoid both delay and overreaction."
    ],
  },
  {
    heading: "How we balance speed and safety",
    body: [
      "Fast output is useful only when it is framed responsibly. That is why every result is labeled as indicative, confidence-tiered, and paired with clear guidance on when to seek clinic confirmation.",
      "We do not position the scan as a diagnosis or treatment prescription. Instead, we focus on practical decision support that complements professional care.",
      "Users get evidence overlays and context chips, then choose next steps with better visibility into what the scan actually found."
    ],
  },
  {
    heading: "What trust means to us",
    body: [
      "Trust comes from transparency. We publish methodology, clinical safety boundaries, and editorial standards so users can understand how decisions are made.",
      "We also track product behavior to improve clarity: where users re-scan, where they engage with clinic CTAs, and where guidance may be confusing.",
      "Continuous improvement is part of the product, not an afterthought."
    ],
  },
  {
    heading: "Who we support",
    body: [
      "Head Lice Checker supports parents, caregivers, schools, and clinics. Families use the scan for quick triage. Schools use guidance pages for communication consistency during outbreak periods.",
      "Clinic partners receive structured lead submissions through controlled contact flows, helping with response quality and operational visibility.",
      "Our current focus is practical household support with global clinic finder coverage."
    ],
  },
  {
    heading: "Privacy and security posture",
    body: [
      "Families trust us with sensitive context, so we treat privacy as an operational requirement rather than a marketing claim. Data collection is scoped to what is needed for screening support and clinic follow-up routing.",
      "Contact and consent workflows are explicit, and policy pages document retention windows and support channels. This keeps expectations clear for users who want to understand how information is handled.",
      "Security controls are reviewed alongside product releases so trust standards keep pace with feature changes."
    ],
  },
  {
    heading: "How we collaborate with clinics",
    body: [
      "Clinic collaboration is built around lead clarity, not volume alone. Structured enquiries carry useful context that helps providers prioritize callbacks and reduce back-and-forth.",
      "We continue improving location coverage and referral relevance so families can move from uncertain home checks to practical professional support quickly.",
      "The long-term goal is a dependable bridge between early triage and trusted local care pathways."
    ],
  },
  {
    heading: "What happens next",
    body: [
      "We are continuing to expand educational coverage, location guidance, and trust documentation while keeping the product lightweight and mobile-friendly.",
      "Every rollout is measured against two standards: does it improve user understanding, and does it improve next-step outcomes without overclaiming certainty.",
      "If those standards are not met, we adjust quickly.",
      "Our roadmap prioritizes practical utility over feature noise: clearer evidence views, stronger local guidance, and faster pathways to professional confirmation."
    ],
  },
];

export default function AboutPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "About Head Lice Checker",
    path: "/about",
    description: "Overview of Head Lice Checker services, trust principles, and product goals.",
    reviewedAt: "2026-02-16",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <div className="container mx-auto px-4">
        <h1 className="section-title">About Head Lice Checker</h1>
        <p className="mt-4 section-copy">
          We help families move from uncertainty to action with evidence-led, non-diagnostic photo screening and clear clinic follow-up pathways.
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
          <h2 className="text-xl font-semibold">Get started now</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with a free scan, then use the clinic finder if you want professional confirmation.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/#start-scan">{copy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/find-clinics">{copy.secondaryCta}</Link>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
