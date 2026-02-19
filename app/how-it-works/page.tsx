import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "How Head Lice Checker Works",
  description:
    "Understand the full AI screening flow from evidence-quality photo capture through confirmation gating and clinic finder follow-up.",
  path: "/how-it-works",
});

const heroHighlights = [
  "Evidence-first AI analysis in under a minute",
  "Confidence tiers with visible detection overlays",
  "Clinic finder appears after confirmation gating",
];

const steps = [
  {
    title: "Capture a quality scalp photo",
    body: "Part hair near the scalp, use strong direct light, and take close shots from multiple angles. This reduces false uncertainty before analysis begins.",
    output: "Output: an image suitable for high-confidence screening.",
  },
  {
    title: "Run AI analysis",
    body: "The scan evaluates visual signals tied to lice-related indicators and returns candidate detections with class labels, confidence, and box coordinates.",
    output: "Output: structured detection payload for interpretation.",
  },
  {
    title: "Normalize and validate detections",
    body: "Detection aliases are mapped to stable labels and malformed entries are filtered. This protects consistency when provider payload formats vary.",
    output: "Output: clean, render-safe detection set.",
  },
  {
    title: "Generate confidence-led summary",
    body: "Results are converted into practical tiers so families can understand likely signal strength without overconfident medical language.",
    output: "Output: headline label, confidence tier, and indicator count.",
  },
  {
    title: "Apply confirmation gate",
    body: "Users review evidence overlays and symptom context before escalation. Low-confidence outcomes prompt recapture guidance instead of immediate clinic action.",
    output: "Output: clear decision path to monitor, rescan, or escalate.",
  },
  {
    title: "Open clinic follow-up when needed",
    body: "When indicators repeat or confidence is elevated, users move to the clinic finder and submit structured enquiry details for professional confirmation.",
    output: "Output: faster, better-context clinic handoff.",
  },
];

const processCards = [
  {
    heading: "Image intake and preprocessing",
    body: "Images are validated for format and minimum usable dimensions before inference. We avoid aggressive enhancement transforms and instead emphasize better source capture for reliable interpretation.",
  },
  {
    heading: "Parsing and normalization",
    body: "Provider outputs can include nested predictions and alias labels. We normalize these payloads into a stable internal structure so overlays, summaries, and logic remain consistent across releases.",
  },
  {
    heading: "Confidence and fallback policy",
    body: "Confidence tiers communicate signal strength in plain language. Where evidence is weak, guidance shifts to recapture quality controls and symptom-aware follow-up rather than binary certainty.",
  },
  {
    heading: "Safety boundaries by design",
    body: "The product is triage support, not diagnosis. Messaging, result framing, and CTA sequencing explicitly direct users to clinical confirmation when repeat indicators or persistent symptoms remain.",
  },
];

const faqs = [
  {
    question: "Does the tool diagnose head lice?",
    answer:
      "No. The output is indicative screening support. Diagnosis and treatment decisions should be confirmed by a qualified clinician.",
  },
  {
    question: "Why is clinic finder shown after confirmation logic?",
    answer:
      "The flow is designed to reduce premature escalation. Users first review evidence quality and confidence context, then move to clinics when risk appears elevated or symptoms persist.",
  },
  {
    question: "What causes low-confidence results?",
    answer:
      "Most low-confidence outcomes come from blur, poor lighting, or incomplete scalp visibility. A cleaner recapture often improves decision quality more than repeated random uploads.",
  },
  {
    question: "Can a clear output still miss activity?",
    answer:
      "Yes. A clear result is reassuring but not absolute. If symptoms continue, repeat with stronger image quality and seek professional confirmation.",
  },
  {
    question: "How does this support clinic teams?",
    answer:
      "Structured confirmation gating means families reach clinics with clearer context, reducing triage friction and improving follow-up quality.",
  },
];

const confirmationSequence = ["Scan", "Review evidence", "Confirm need", "Find clinic"];

export default function HowItWorksPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "How Head Lice Checker Works",
    path: "/how-it-works",
    description: "Step-by-step AI screening workflow, confidence logic, and confirmation-gated clinic follow-up.",
    reviewedAt: "2026-02-19",
  });

  const service = serviceJsonLd({
    name: "Head lice screening workflow",
    path: "/how-it-works",
    description: "How image capture, AI analysis, confidence logic, and clinic follow-up decisions work together.",
  });

  const midpoint = Math.ceil(faqs.length / 2);
  const leftFaqs = faqs.slice(0, midpoint);
  const rightFaqs = faqs.slice(midpoint);

  return (
    <section className="section-shell pb-12 md:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary))_0%,transparent_45%)]" />
        <div className="container relative z-10 mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">How It Works</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
              A classic scan-to-confirm workflow for faster head lice decisions
            </h1>
            <p className="mt-4 section-copy max-w-3xl">
              Head Lice Checker is built as a decision engine, not a black box. You capture better evidence, review AI signals with confidence context, then move to clinic follow-up only when the confirmation gate indicates escalation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full" size="lg">
                <Link href="/#start-scan">{copy.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full" size="lg">
                <Link href="#step-flow">See the 6-step flow</Link>
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">At-a-glance outcomes</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {heroHighlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              The same non-diagnostic safety boundaries apply across scan results, guidance content, and clinic escalation pathways.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div id="step-flow" className="mt-[60px]">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">The 6-step AI analysis sequence</h2>
            <p className="mt-3 section-copy">
              This page follows a standard SaaS process model: input quality, processing transparency, confidence framing, and controlled escalation.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => (
              <Card key={step.title}>
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {index + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{step.body}</p>
                  <p className="mt-3 text-sm font-medium text-foreground">{step.output}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Inside the AI process</h2>
          <p className="mt-3 section-copy max-w-4xl">
            The workflow is intentionally auditable in plain language so families and partners understand what the system is doing before any escalation decision is made.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {processCards.map((card) => (
              <div key={card.heading} className="border-b border-border pb-5">
                <h3 className="font-semibold">{card.heading}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-primary/30 bg-card p-6 md:p-8">
          <h2 className="text-2xl font-bold">Confirmation gate before clinic follow-up</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            Clinic finder appears after confirmation logic, not as step one. This protects users from over-escalation and keeps professional follow-up focused on stronger or persistent risk cases.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-medium">
            {confirmationSequence.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-muted/30 px-3 py-1">{item}</span>
                {index < confirmationSequence.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold">Expanded FAQ</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <Accordion type="single" collapsible className="w-full">
              {leftFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`left-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Accordion type="single" collapsible className="w-full">
              {rightFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`right-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-2xl font-bold">Run scan first, then escalate with confidence</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Start with an evidence-quality scan. If the confirmation gate points to escalation, move directly to clinic follow-up in a structured flow.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full" size="lg">
              <Link href="/#start-scan">{copy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full" size="lg">
              <Link href="/find-clinics">{copy.secondaryCta}</Link>
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/methodology" className="text-primary hover:underline">
              Methodology
            </Link>
            <Link href="/clinical-safety" className="text-primary hover:underline">
              Clinical safety
            </Link>
            <Link href="/editorial-policy" className="text-primary hover:underline">
              Editorial policy
            </Link>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
