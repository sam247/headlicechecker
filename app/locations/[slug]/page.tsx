import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
