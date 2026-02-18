import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "How Head Lice Checker Works",
  description:
    "Understand the complete Head Lice Checker workflow from photo capture to confidence tiers, overlays, and clinic follow-up guidance.",
  path: "/how-it-works",
});

const sections = [
  {
    heading: "Step 1: Capture an evidence-quality photo",
    body: [
      "The scan quality starts with the image. Part hair close to the scalp, use strong natural or direct indoor light, and keep the camera steady. We recommend multiple close-ups instead of one distant image.",
      "Good photos improve confidence and help avoid ambiguous outcomes. Poorly lit or blurry images are a common reason for low-confidence screening, so taking an extra 20 seconds at capture usually improves decisions.",
      "If the result is unclear, the best next action is not repeated random uploads. It is a cleaner recapture with improved focus and lighting."
    ],
  },
  {
    heading: "Step 2: AI screening and detection mapping",
    body: [
      "Uploaded images are processed through a visual detection workflow that identifies likely regions associated with lice-related indicators. Prediction classes are normalized into stable labels used across the app.",
      "Each valid detection includes coordinates, dimensions, and confidence so the UI can display rings directly over the image. This evidence layer helps users see what the model is reacting to instead of receiving a vague score.",
      "Malformed or low-confidence detections are filtered before rendering to preserve clarity and reduce noise."
    ],
  },
  {
    heading: "Step 3: Confidence tiers and summary output",
    body: [
      "The result card includes a top label, strongest confidence tier, and a detection summary count. We use tiered language to keep interpretation understandable and avoid false precision.",
      "When detections are present, the strongest valid signal determines the headline outcome. When no valid detections are found, the tool returns a reassuring but non-diagnostic clear screen message.",
      "This structure gives users both evidence and context: what was found, how strong it appears, and why the next step is being recommended."
    ],
  },
  {
    heading: "Step 4: Next-step guidance",
    body: [
      "Guidance changes based on output class and confidence. Positive-style outcomes prompt practical household steps and clinic confirmation pathways. Clear outcomes encourage routine checks and a re-scan if symptoms persist.",
      "For low confidence, users see image-quality tips to improve capture before relying on conclusions. This is intentional: uncertainty should be surfaced clearly, not hidden.",
      "The goal is actionability. Every result should make the next step obvious within seconds."
    ],
  },
  {
    heading: "Step 5: Clinic follow-up",
    body: [
      "If you decide to escalate, the clinic finder lets you search locations and submit a structured enquiry through our lead form. This keeps details consistent and improves response handling.",
      "Direct contact details are intentionally de-emphasized in modal lead flows to ensure enquiries are routed through one reliable pipeline.",
      "You receive a reference on successful submission so follow-up can be tracked clearly."
    ],
  },
  {
    heading: "Step 6: Continuous quality improvement",
    body: [
      "We monitor anonymized behavior signals such as overlay usage, repeated rescans, and clinic CTA engagement to understand where users need clearer guidance.",
      "These insights inform parser hardening, content updates, and UI refinements so the product remains practical as provider outputs and user needs evolve.",
      "Each release aims to improve user understanding without drifting into overconfident medical language."
    ],
  },
  {
    heading: "Safety boundaries",
    body: [
      "Head Lice Checker is an indicative screening tool. It does not diagnose conditions and does not replace clinician judgment.",
      "If symptoms are persistent, worsening, or atypical, seek medical advice even after a reassuring scan.",
      "Our methodology, clinical safety guidance, and editorial policy pages explain these boundaries in detail."
    ],
  },
];

export default function HowItWorksPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "How Head Lice Checker Works",
    path: "/how-it-works",
    description: "Photo capture, AI screening, confidence tiers, overlays, and clinic follow-up workflow.",
    reviewedAt: "2026-02-16",
  });

  const service = serviceJsonLd({
    name: "Head lice photo screening workflow",
    path: "/how-it-works",
    description: "How the indicative head lice screening process operates from image upload to next-step guidance.",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <div className="container mx-auto px-4">
        <h1 className="section-title">How Head Lice Checker works</h1>
        <p className="mt-4 section-copy">
          A practical five-step flow: capture a better photo, run indicative screening, review evidence overlays, then choose clear next actions.
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
          <h2 className="text-xl font-semibold">Take the next step</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Run a free scan first, then use the clinic finder for professional confirmation where needed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/#start-scan">{copy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
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
