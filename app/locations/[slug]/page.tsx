import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AreaFocusMap from "@/components/site/AreaFocusMap";
import LocationClinicSection from "@/components/site/LocationClinicSection";
import LongformContentPage from "@/components/site/LongformContentPage";
import { getLocationPageBySlug, getLocationPages } from "@/lib/data/content";
import { breadcrumbJsonLd, clinicReviewJsonLd, faqJsonLd, localBusinessJsonLd, medicalWebPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { getClinicsForLocationPageWithLeadStats } from "@/lib/server/clinics";

export function generateStaticParams() {
  return getLocationPages().map((page) => ({ slug: page.slug }));
}

interface LocationPageProps {
  params: { slug: string };
}

const LOCATION_CENTERS: Record<string, { lat: number; lng: number }> = {
  london: { lat: 51.5074, lng: -0.1278 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  birmingham: { lat: 52.4862, lng: -1.8904 },
  leeds: { lat: 53.8008, lng: -1.5491 },
  glasgow: { lat: 55.8642, lng: -4.2518 },
  edinburgh: { lat: 55.9533, lng: -3.1883 },
  liverpool: { lat: 53.4084, lng: -2.9916 },
  bristol: { lat: 51.4545, lng: -2.5879 },
  "new-york": { lat: 40.7128, lng: -74.006 },
  "los-angeles": { lat: 34.0522, lng: -118.2437 },
};

export function generateMetadata({ params }: LocationPageProps): Metadata {
  const page = getLocationPageBySlug(params.slug);
  if (!page) return {};

  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/locations/${page.slug}`,
  });
}

export default async function LocationPage({ params }: LocationPageProps) {
  const page = getLocationPageBySlug(params.slug);
  if (!page) notFound();
  const nearbyClinics = await getClinicsForLocationPageWithLeadStats(page, -1, 500);
  const center = LOCATION_CENTERS[page.slug] ?? nearbyClinics[0];
  const mapDelta = page.country === "US" ? 0.45 : 0.25;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
    { name: page.city, path: `/locations/${page.slug}` },
  ]);

  const service = serviceJsonLd({
    name: `Head lice clinic support in ${page.city}`,
    path: `/locations/${page.slug}`,
    description: page.description,
    areaServed: [page.country === "UK" ? "United Kingdom" : "United States"],
  });

  const webpage = medicalWebPageJsonLd({
    name: page.title,
    path: `/locations/${page.slug}`,
    description: page.description,
    reviewedAt: page.updatedAt,
  });
  const clinicSchemas = nearbyClinics.map((clinic) => localBusinessJsonLd(clinic));
  const reviewSchemas = nearbyClinics.map((clinic) => clinicReviewJsonLd(clinic)).filter(Boolean);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page.faqs)) }} />
      {clinicSchemas.map((schema, index) => (
        <script
          key={`location-clinic-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {reviewSchemas.map((schema, index) => (
        <script
          key={`location-review-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <LongformContentPage
        title={page.title}
        intro={page.intro}
        sections={page.sections}
        faqs={page.faqs}
        reviewedAt={page.updatedAt}
        fullWidth
        heroMedia={
          center ? (
            <AreaFocusMap
              lat={center.lat}
              lng={center.lng}
              title={`${page.city} area map`}
              subtitle="Service area"
              mapDelta={mapDelta}
              heightClassName="h-[260px] md:h-[320px]"
            />
          ) : null
        }
        extraContent={<LocationClinicSection city={page.city} clinics={nearbyClinics} />}
        relatedLinks={[
          { href: "/locations", label: "All Locations" },
          { href: "/directory", label: "Directory" },
          { href: "/head-lice-symptoms", label: "Head Lice Symptoms" },
        ]}
      />
    </>
  );
}
