import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LongformContentPage from "@/components/site/LongformContentPage";
import { getEvergreenPageBySlug } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const page = getEvergreenPageBySlug("nits-vs-dandruff");

export const metadata: Metadata = page
  ? pageMetadata({
      title: page.title,
      description: page.description,
      path: "/nits-vs-dandruff",
    })
  : {};

export default function NitsVsDandruffPage() {
  if (!page) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Nits vs Dandruff", path: "/nits-vs-dandruff" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: page.title,
    path: "/nits-vs-dandruff",
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
          { href: "/head-lice-symptoms", label: "Head Lice Symptoms" },
          { href: "/how-it-works", label: "How It Works" },
          { href: "/find-clinics", label: "Find Clinics" },
        ]}
      />
    </>
  );
}
