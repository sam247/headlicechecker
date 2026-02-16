import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LongformContentPage from "@/components/site/LongformContentPage";
import { getTrustPageBySlug } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const page = getTrustPageBySlug("methodology");

export const metadata: Metadata = page
  ? pageMetadata({
      title: page.title,
      description: page.description,
      path: "/methodology",
    })
  : {};

export default function MethodologyPage() {
  if (!page) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Methodology", path: "/methodology" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: page.title,
    path: "/methodology",
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
          { href: "/clinical-safety", label: "Clinical Safety" },
          { href: "/editorial-policy", label: "Editorial Policy" },
          { href: "/head-lice-symptoms", label: "Head Lice Symptoms" },
        ]}
      />
    </>
  );
}
