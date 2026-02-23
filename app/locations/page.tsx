import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocationPages, getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, collectionPageJsonLd, faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const pages = getLocationPages();
const siteCopy = getSiteCopy();

const hubFaqs = [
  {
    question: "How do I find a head lice removal service near me?",
    answer:
      "Start with local clinics in your city, then compare response speed, treatment process, and follow-up support before booking.",
  },
  {
    question: "What does a head lice specialist do that home checks cannot?",
    answer:
      "A specialist provides professional confirmation, treatment guidance, and a clear follow-up plan when signs are persistent or unclear.",
  },
  {
    question: "Should I choose the nearest clinic or the fastest appointment?",
    answer:
      "For most families, the fastest suitable appointment is the best choice. Early confirmation usually reduces household spread and repeat uncertainty.",
  },
  {
    question: "When should I escalate from a home check to a clinic?",
    answer:
      "Escalate when likely indicators repeat, itching persists, or more than one household contact reports symptoms.",
  },
  {
    question: "Can I use scan results to decide if a clinic is needed?",
    answer:
      "Yes. Use scan output as triage support, then seek professional confirmation for likely positive or uncertain results.",
  },
  {
    question: "Are head lice clinics useful for schools and childcare cases?",
    answer:
      "Yes. Clinics can help confirm uncertain cases quickly and provide clear treatment pathways for families.",
  },
];

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Head Lice Removal Service Near Me | Locations Hub",
    description:
      "Find a head lice removal service near you, compare specialist options, and get clear next steps for professional follow-up.",
    path: "/locations",
  }),
  keywords: [
    "head lice removal service near me",
    "head lice specialist near me",
    "head lice removal near me",
    "head lice clinic locations",
  ],
};

export default function LocationsHubPage() {
  const ukPages = pages.filter((page) => page.country === "UK");
  const usPages = pages.filter((page) => page.country === "US");

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
  ]);

  const collection = collectionPageJsonLd({
    name: "Head lice service location guides",
    path: "/locations",
    description: "Location-based guidance for families searching for head lice specialists and clinic follow-up.",
  });

  const service = serviceJsonLd({
    name: "Head lice removal service directory",
    path: "/locations",
    description: "Compare nearby head lice specialists and plan professional follow-up with city-specific support pages.",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(hubFaqs)) }} />

      <div className="hero-gradient-shell hero-gradient-right rounded-3xl">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h1 className="section-title">Head lice removal service near you</h1>
          <p className="mt-4 section-copy max-w-4xl">
            If you are searching for a <strong>head lice specialist near me</strong>, this hub helps you move from uncertainty to action. Use these location pages to find local options, understand when professional support is appropriate, and compare practical next steps.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold">How professional head lice services work</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clinics support confirmation, treatment planning, and follow-up guidance. They are most useful when home checks are mixed, symptoms persist, or you need clear same-day direction.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xl font-semibold">How to choose a specialist near you</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Compare response speed, family support quality, and treatment process clarity. In most cases, choose the first suitable appointment rather than waiting for a perfect location.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">United Kingdom</h2>
            <div className="mt-4 space-y-3">
              {ukPages.map((page) => (
                <Card key={page.slug}>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{page.region}</p>
                    <h3 className="mt-1 text-xl font-semibold">
                      <Link href={`/locations/${page.slug}`} className="hover:text-primary">
                        {page.city}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{page.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold">United States</h2>
            <div className="mt-4 space-y-3">
              {usPages.map((page) => (
                <Card key={page.slug}>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{page.region}</p>
                    <h3 className="mt-1 text-xl font-semibold">
                      <Link href={`/locations/${page.slug}`} className="hover:text-primary">
                        {page.city}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{page.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Need help right now?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with a quick photo scan, then use the clinic finder when you want professional follow-up.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/#start-scan">{siteCopy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/find-clinics">{siteCopy.secondaryCta}</Link>
            </Button>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold md:text-3xl">Frequently asked questions</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {hubFaqs.map((item) => (
              <Card key={item.question}>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <p className="mt-4 text-xs text-muted-foreground">{siteCopy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
