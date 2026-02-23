import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, School } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SchoolToolkitGate from "@/components/site/SchoolToolkitGate";
import { getSchoolToolkitAssets, getSchoolToolkitContent } from "@/lib/data/school-toolkit";
import { breadcrumbJsonLd, educationalOrganizationJsonLd, faqJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

const content = getSchoolToolkitContent();
const assets = getSchoolToolkitAssets();

export const metadata: Metadata = pageMetadata({
  title: "School Head Lice Toolkit | Policy Templates and Outbreak Protocol",
  description:
    "Download the Head Lice School Response Framework with a head lice policy template, lice letter to parents template, and school lice outbreak protocol guidance.",
  path: "/school-head-lice-toolkit",
});

export default function SchoolHeadLiceToolkitPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "For Schools", path: "/for-schools" },
    { name: "School Head Lice Toolkit", path: "/school-head-lice-toolkit" },
  ]);

  const webpage = webPageJsonLd({
    name: "The Head Lice School Response Framework",
    path: "/school-head-lice-toolkit",
    description:
      "Institutional toolkit for school head lice policy templates, parent communication, and outbreak protocol governance alignment.",
    reviewedAt: "2026-02-23",
  });

  const educationalOrg = educationalOrganizationJsonLd({
    name: "Head Lice School Response Framework",
    path: "/school-head-lice-toolkit",
    description:
      "Toolkit support for primary schools, nurseries, and trusts using non-diagnostic head lice communication frameworks.",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(content.faq)) }} />

      <div className="hero-gradient-shell hero-gradient-right rounded-3xl">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <School className="h-4 w-4" />
            School Toolkit
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{content.title}</h1>
          <p className="mt-4 section-copy max-w-4xl">{content.intro}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {content.audiences.map((item) => (
              <span key={item} className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <section className="mt-8">
          <h2 className="text-2xl font-bold md:text-3xl">What is included</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold">Policy Template</h3>
                <p className="mt-2 text-sm text-muted-foreground">A head lice policy template aligned to institutional governance language.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold">Parent Notice Template</h3>
                <p className="mt-2 text-sm text-muted-foreground">A lice letter to parents template for calm, structured outbreak communication.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold">Escalation Tracker</h3>
                <p className="mt-2 text-sm text-muted-foreground">Operational record template for school lice outbreak protocol follow-up.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold">Staff Briefing Slides</h3>
                <p className="mt-2 text-sm text-muted-foreground">Briefing decks for staff alignment during active communication periods.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold">Printable Poster</h3>
                <p className="mt-2 text-sm text-muted-foreground">School-ready poster formats for family guidance visibility.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold">Framework Bundle</h3>
                <p className="mt-2 text-sm text-muted-foreground">Seven structured files for no-exclusion policy support and governance consistency.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Institutional principles</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {content.highlights.map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-bold">Why Structured Communication Prevents Escalation</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
            Structured communication reduces avoidable escalation by giving staff and families one consistent sequence: what to check, when to monitor, and when to escalate for professional confirmation. This framework supports governance alignment across notices, follow-up, and safeguarding language while keeping guidance non-diagnostic and operationally clear. When schools communicate consistently, uncertainty falls, parent response quality improves, and outbreak management becomes more stable.
          </p>
        </section>

        <section className="mt-10">
          <SchoolToolkitGate assets={assets} />
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Schools Using The Framework</h2>
            <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
              Placeholder
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This area will include institutional testimonials and case studies as adoption grows.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Testimonial slot</div>
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Case study slot</div>
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Outcome snapshot slot</div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Frequently asked questions</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {content.faq.map((item) => (
              <Card key={item.question}>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Need implementation support?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with the toolkit, then use schools hub guidance and escalation pathways for rollout support.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/for-schools">
                Go to schools hub
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/contact">
                Contact support
                <Building2 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
