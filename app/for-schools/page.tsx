import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "For Schools and Childcare Teams",
  description:
    "Head lice outbreak guidance for schools and childcare teams, including communication steps, parent triage, and clinic referral workflows.",
  path: "/for-schools",
});

const sections = [
  {
    heading: "A calm response framework for schools",
    body: [
      "Schools need practical, low-friction workflows when reports increase. The priority is calm communication, consistent home-check instructions, and quick escalation pathways where needed.",
      "A standardized process reduces rumor-driven panic and helps families understand exactly what to do tonight, tomorrow morning, and if symptoms persist.",
      "Head Lice Checker supports this with clear guidance language and simple scan-first triage steps for parents."
    ],
  },
  {
    heading: "Communication guidance for parent notices",
    body: [
      "Effective notices are factual and non-stigmatizing. They explain that head lice concerns are manageable, outline what to check at home, and avoid singling out children or classrooms.",
      "Include practical instructions: inspect in bright light, part hair in sections, focus behind ears and at the nape, and seek confirmation if signs remain unclear.",
      "Messaging should always include the non-diagnostic boundary and point families to professional advice for persistent symptoms."
    ],
  },
  {
    heading: "How scan triage can support school workflows",
    body: [
      "Parent-led photo triage can reduce decision delay between notice and action. Families can run a quick indicative scan and decide whether to monitor, recapture, or contact a clinic.",
      "This creates a cleaner handoff to professional support and can reduce unnecessary treatment cycles based on uncertain visual checks.",
      "Schools benefit because communications become action-oriented instead of ambiguous."
    ],
  },
  {
    heading: "Escalation pathways and timing",
    body: [
      "If families report persistent symptoms, repeated likely indicators, or household spread, guidance should move quickly toward clinic confirmation.",
      "Schools can share neutral escalation language: if uncertainty remains after careful checking, seek professional confirmation rather than repeating low-quality checks.",
      "A clear escalation policy improves confidence for parents and staff alike."
    ],
  },
  {
    heading: "Implementation checklist for school teams",
    body: [
      "Define one communication template, one follow-up reminder schedule, and one referral route. This prevents mixed messages and fragmented action.",
      "Track only operational essentials, such as notice sent dates and generalized response milestones. Avoid collecting unnecessary sensitive information.",
      "Review playbooks each term and adjust wording based on parent feedback and support ticket themes."
    ],
  },
  {
    heading: "Sample weekly monitoring cadence",
    body: [
      "A lightweight cadence helps teams stay proactive: issue a clear notice when needed, send one follow-up reminder, and provide one escalation route for uncertain cases.",
      "Keep communications short and repeatable so parents can act quickly without interpreting multiple versions of guidance.",
      "At the end of each week, review where confusion occurred and refine your template language for the next cycle."
    ],
  },
  {
    heading: "Partnering with Head Lice Checker",
    body: [
      "Schools and childcare teams can use Head Lice Checker as a parent-support companion to existing health policies.",
      "The platform provides practical education pages, scan triage, and clinic finder pathways that can be shared in notices and parent resources.",
      "For structured rollout support, contact our team and we can help define a simple implementation workflow."
    ],
  },
];

const faqs = [
  {
    question: "Should schools diagnose head lice cases?",
    answer:
      "No. Schools should provide clear guidance and encourage professional confirmation when needed, while avoiding diagnostic claims.",
  },
  {
    question: "How should schools reduce stigma in communication?",
    answer:
      "Use neutral, factual language and avoid identifying students. Focus on routine checks and practical next steps for all families.",
  },
  {
    question: "Can this tool replace school health policy?",
    answer:
      "No. It supports parent triage and communication clarity but should complement existing school and healthcare policies.",
  },
  {
    question: "What is the recommended CTA order for parents?",
    answer: "Start with scan guidance first, then offer clinic support pathways if risk remains elevated.",
  },
];

export default function ForSchoolsPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "For Schools", path: "/for-schools" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "Head lice guidance for schools",
    path: "/for-schools",
    description: "Outbreak communication and escalation guidance for schools and childcare teams.",
    reviewedAt: "2026-02-16",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <div className="container mx-auto px-4">
        <h1 className="section-title">For schools and childcare teams</h1>
        <p className="mt-4 section-copy">
          Keep outbreak responses calm and consistent with practical parent guidance, scan-first triage, and clear clinic escalation pathways.
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
          <h2 className="text-xl font-semibold">Need implementation support?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Contact our team for a practical school rollout framework and parent communication guidance.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/#start-scan">{copy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/find-clinics">{copy.secondaryCta}</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/contact">Contact school support</Link>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
