import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, getSiteCopy } from "@/lib/data/content";
import type { ContentFaq, ContentSection } from "@/lib/data/types";

interface RelatedLink {
  href: string;
  label: string;
}

interface LongformContentPageProps {
  title: string;
  intro: string;
  sections: ContentSection[];
  faqs?: ContentFaq[];
  reviewedAt?: string;
  ctaTitle?: string;
  ctaCopy?: string;
  relatedLinks?: RelatedLink[];
}

const siteCopy = getSiteCopy();

export default function LongformContentPage({
  title,
  intro,
  sections,
  faqs = [],
  reviewedAt,
  ctaTitle = "Ready for a quick next step?",
  ctaCopy = "Start a free photo scan first, then use the clinic finder if you want professional confirmation.",
  relatedLinks = [],
}: LongformContentPageProps) {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="section-title">{title}</h1>
        <p className="mt-4 section-copy">{intro}</p>
        {reviewedAt ? (
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last reviewed {formatDate(reviewedAt)}
          </p>
        ) : null}

        <div className="mt-8 space-y-5">
          {sections.map((section) => (
            <Card key={section.heading}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground md:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        {faqs.length ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">Frequently asked questions</h2>
            <div className="mt-5 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-border/80 bg-muted/25 p-4">
                  <h3 className="text-base font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {relatedLinks.length ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Related guides</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedLinks.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm font-medium text-primary hover:underline">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">{ctaTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{ctaCopy}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/#start-scan">{siteCopy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/find-clinics">{siteCopy.secondaryCta}</Link>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{siteCopy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
