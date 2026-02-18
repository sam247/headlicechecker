import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFaqs, getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const faqs = getFaqs();
const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "Head Lice Checker FAQ",
  description: "Answers to common questions about scan quality, confidence, privacy, and clinic next steps.",
  path: "/faq",
});

export default function FaqPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "FAQ", path: "/faq" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "Head Lice Checker FAQ",
    path: "/faq",
    description: "Frequently asked questions about indicative head lice screening and clinic follow-up.",
    reviewedAt: "2026-02-16",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <div className="container mx-auto px-4">
        <h1 className="section-title">Frequently asked questions</h1>
        <p className="mt-4 section-copy">
          Clear answers about image quality, confidence interpretation, privacy boundaries, and what to do after each result type.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="p-5">
                <h2 className="text-base font-semibold md:text-lg">{faq.question}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Still unsure what to do next?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with a scan for practical triage, then use the clinic finder if you want professional confirmation.
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
            <Link href="/how-it-works" className="text-primary hover:underline">
              How it works
            </Link>
            <Link href="/head-lice-symptoms" className="text-primary hover:underline">
              Head lice symptoms
            </Link>
            <Link href="/nits-vs-dandruff" className="text-primary hover:underline">
              Nits vs dandruff
            </Link>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
