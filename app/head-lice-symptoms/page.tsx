import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LongformContentPage from "@/components/site/LongformContentPage";
import { getEvergreenPageBySlug } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const page = getEvergreenPageBySlug("head-lice-symptoms");

export const metadata: Metadata = page
  ? pageMetadata({
      title: page.title,
      description: page.description,
      path: "/head-lice-symptoms",
    })
  : {};

export default function HeadLiceSymptomsPage() {
  if (!page) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Head Lice Symptoms", path: "/head-lice-symptoms" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: page.title,
    path: "/head-lice-symptoms",
    description: page.description,
    reviewedAt: page.updatedAt,
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
        reviewedAt={page.updatedAt}
        relatedLinks={[
          { href: "/nits-vs-dandruff", label: "Nits vs Dandruff" },
          { href: "/faq", label: "FAQ" },
          { href: "/find-clinics", label: "Find Clinics" },
        ]}
      />
    </>
  );
}
