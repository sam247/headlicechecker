import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LongformContentPage from "@/components/site/LongformContentPage";
import { getLocationPageBySlug, getLocationPages } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

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

export default function LocationPage({ params }: LocationPageProps) {
  const page = getLocationPageBySlug(params.slug);
  if (!page) notFound();

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page.faqs)) }} />
      <LongformContentPage
        title={page.title}
        intro={page.intro}
        sections={page.sections}
        faqs={page.faqs}
        reviewedAt={page.updatedAt}
        relatedLinks={[
          { href: "/locations", label: "All Locations" },
          { href: "/find-clinics", label: "Find Clinics" },
          { href: "/head-lice-symptoms", label: "Head Lice Symptoms" },
        ]}
      />
    </>
  );
}
