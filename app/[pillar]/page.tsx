import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPageLayout from "@/components/site/ContentPageLayout";
import { getContentPageByPath } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

interface HubPageProps {
  params: { pillar: string };
}

export function generateMetadata({ params }: HubPageProps): Metadata {
  const page = getContentPageByPath(`/${params.pillar}`);
  if (!page || page.pageType !== "hub") return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
  });
}

export default function HubPage({ params }: HubPageProps) {
  const page = getContentPageByPath(`/${params.pillar}`);
  if (!page || page.pageType !== "hub") notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: page.title, path: page.path },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: page.title,
    path: page.path,
    description: page.description,
    reviewedAt: page.updatedAt,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(page.faqs)) }} />
      <ContentPageLayout page={page} />
    </>
  );
}
