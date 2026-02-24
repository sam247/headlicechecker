import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StructuredEscalationModel from "@/components/site/StructuredEscalationModel";
import { formatDate, getSiteCopy } from "@/lib/data/content";
import type { ContentPage } from "@/lib/data/types";

const siteCopy = getSiteCopy();

interface ContentPageLayoutProps {
  page: ContentPage;
}

export default function ContentPageLayout({ page }: ContentPageLayoutProps) {
  const siblings = page.internalLinks.filter((link) => link.type === "sibling");
  const conversionLink = page.internalLinks.find((link) => link.type === "conversion");
  const toolLink = page.internalLinks.find((link) => link.type === "tool");
  const hubLink = page.internalLinks.find((link) => link.type === "hub");

  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-5xl px-4">
        <div id="overview">
          <h1 className="section-title">{page.title}</h1>
          <p className="mt-4 section-copy">{page.intro}</p>
          {page.image ? (
            <figure className="mt-6 overflow-hidden rounded-xl border border-border">
              <Image
                src={page.image}
                alt={page.title}
                width={1200}
                height={700}
                className="h-auto w-full object-cover"
              />
            </figure>
          ) : null}
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Published {formatDate(page.publishedAt)} · Updated {formatDate(page.updatedAt)}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href={toolLink?.href ?? "/#start-scan"}>{siteCopy.primaryCta}</Link>
            </Button>
            {conversionLink ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link href={conversionLink.href}>{conversionLink.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>

        {page.pageType === "cluster" && page.escalationModelRequired ? (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              This structured model explains how detection moves toward confirmation in practical stages.
            </p>
            <StructuredEscalationModel />
          </>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {page.internalAnchors.map((anchor) => (
            <Link key={anchor} href={`#${anchor}`} className="rounded-full border border-border px-3 py-1 hover:border-primary">
              {anchor.replace(/-/g, " ")}
            </Link>
          ))}
        </div>

        <div id="next-steps" className="mt-8 space-y-8">
          {page.sections.map((section) => {
            const anchor = section.heading
              .toLowerCase()
              .replace(/[^a-z0-9\\s-]/g, "")
              .trim()
              .replace(/\\s+/g, "-");
            return (
              <section key={section.heading} id={anchor} className="border-b border-border/60 pb-6">
                <h2 className="text-2xl font-semibold">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-base leading-8 text-muted-foreground">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.heading}-${index}`}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-8 text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </div>

        {page.pageType === "hub" && page.hubChildren?.length ? (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">Cluster pages in this hub</h2>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {page.hubChildren.map((childPath) => (
                  <Link key={childPath} href={childPath} className="text-sm font-medium text-primary hover:underline">
                    {childPath}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">Related next steps</h2>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {hubLink ? (
                <Link href={hubLink.href} className="text-primary hover:underline">
                  {hubLink.label}
                </Link>
              ) : null}
              {siblings.map((link) => (
                <Link key={link.href} href={link.href} className="text-primary hover:underline">
                  {link.label}
                </Link>
              ))}
              {conversionLink ? (
                <Link href={conversionLink.href} className="text-primary hover:underline">
                  {conversionLink.label}
                </Link>
              ) : null}
              {toolLink ? (
                <Link href={toolLink.href} className="text-primary hover:underline">
                  {toolLink.label}
                </Link>
              ) : null}
              <Link href="/locations" className="text-primary hover:underline">
                Verified regional clinics by location
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{page.professionalBoundaryDisclaimer}</p>
          </CardContent>
        </Card>

        <div id="faq" className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-border/80 bg-muted/25 p-4">
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
