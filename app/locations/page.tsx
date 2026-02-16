import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocationPages, getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, collectionPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const pages = getLocationPages();
const siteCopy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "Head Lice Clinic Locations",
  description:
    "Browse local head lice support guides for major UK and US cities, including checklists, escalation guidance, and clinic next steps.",
  path: "/locations",
});

export default function LocationsHubPage() {
  const ukPages = pages.filter((page) => page.country === "UK");
  const usPages = pages.filter((page) => page.country === "US");

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
  ]);

  const collection = collectionPageJsonLd({
    name: "Head lice city guides",
    path: "/locations",
    description: "Location-based guidance for clinic follow-up and home screening steps.",
  });

  const service = serviceJsonLd({
    name: "Head lice screening and clinic finder",
    path: "/locations",
    description: "Find city-specific guidance and clinic follow-up pathways in the UK and US.",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />

      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="section-title">Head lice clinic location guides</h1>
        <p className="mt-4 section-copy">
          Explore city-specific guidance for parents and caregivers. Each guide covers what to check at home, when to escalate to a clinic, and how to plan nearby support.
        </p>

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

        <p className="mt-4 text-xs text-muted-foreground">{siteCopy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
