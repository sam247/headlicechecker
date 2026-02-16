import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LongformContentPage from "@/components/site/LongformContentPage";
import { getTrustPageBySlug } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const page = getTrustPageBySlug("clinical-safety");

export const metadata: Metadata = page
  ? pageMetadata({
      title: page.title,
      description: page.description,
      path: "/clinical-safety",
    })
  : {};

export default function ClinicalSafetyPage() {
  if (!page) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Clinical Safety", path: "/clinical-safety" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: page.title,
    path: "/clinical-safety",
    description: page.description,
    reviewedAt: page.reviewedAt,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page.faqs)) }} />
      <LongformContentPage
        title={page.title}
        intro={page.intro}
        sections={page.sections}
        faqs={page.faqs}
        reviewedAt={page.reviewedAt}
        relatedLinks={[
          { href: "/methodology", label: "Methodology" },
          { href: "/editorial-policy", label: "Editorial Policy" },
          { href: "/find-clinics", label: "Find Clinics" },
        ]}
      />
    </>
  );
}
