import type { Metadata } from "next";
import Link from "next/link";
import DirectoryListings from "@/components/site/DirectoryListings";
import { Button } from "@/components/ui/button";
import { getClinics, getLocationPages, sortClinicsForDirectory } from "@/lib/data/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "UK Head Lice Clinic Directory",
  description:
    "Browse a UK specialist head lice clinic directory including verified regional partners and local listings, with simple region filtering and public contact details.",
  path: "/directory",
});

export default function DirectoryPage() {
  const ukClinics = sortClinicsForDirectory(getClinics("UK"));
  const ukRegionPages = getLocationPages().filter((page) => page.country === "UK");

  return (
    <section className="section-shell">
      <div className="container mx-auto px-4">
        <h1 className="section-title text-left">UK Specialist Head Lice Clinic Directory</h1>
        <p className="mt-3 max-w-4xl section-copy text-left">
          This directory lists UK specialist head lice clinics, including verified regional partners and local listings. Data is reviewed and updated regularly.
        </p>
        <p className="mt-3 text-sm font-medium text-foreground">Currently listing {ukClinics.length} UK specialist clinics.</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/suggest-clinic">Suggest a clinic</Link>
          </Button>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Browse by region</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {ukRegionPages.map((page) => (
              <Link
                key={page.slug}
                href={`/locations/${page.slug}`}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
              >
                {page.region}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <DirectoryListings clinics={ukClinics} />
        </div>
      </div>
    </section>
  );
}
