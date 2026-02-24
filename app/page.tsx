import type { Metadata } from "next";
import HomePageClient from "@/components/site/HomePageClient";
import { getHomePageContent, getHomepageFeaturedGuides, getSiteCopy } from "@/lib/data/content";
import { canonical, faqJsonLd, medicalWebPageJsonLd, organizationJsonLd, serviceJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Head Lice Checker Online | AI Photo-Based Detection",
  description:
    "Use Head Lice Checker Online for AI photo-based head lice and nits detection, then follow clear next steps at home or with a clinic.",
  keywords: [
    "head lice checker",
    "head lice check",
    "nits check",
    "head lice detection",
    "head lice checking",
    "online head lice checker",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Head Lice Checker Online | AI Photo-Based Detection",
    description:
      "Run an AI photo-based head lice and nits check online, review confidence-safe guidance, and take clear next steps.",
    url: canonical("/"),
    type: "website",
    siteName: "Head Lice Checker",
    images: [{ url: "/logo_new.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Head Lice Checker Online | AI Photo-Based Detection",
    description:
      "Run an AI photo-based head lice and nits check online, review confidence-safe guidance, and take clear next steps.",
    images: ["/logo_new.png"],
  },
};

export default function Home() {
  const homeContent = getHomePageContent();
  const siteCopy = getSiteCopy();
  const latestGuides = getHomepageFeaturedGuides().map((page) => ({
    path: page.path,
    title: page.title,
    description: page.description,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
    readMinutes: 10,
    image: page.image,
  }));

  const homepageFaqJsonLd = faqJsonLd(
    homeContent.faq.items.map((item) => ({ question: item.question, answer: item.answer }))
  );
  const medicalWebPage = medicalWebPageJsonLd({
    name: "Head Lice Checker Online",
    path: "/",
    description:
      "Head Lice Checker Online homepage with AI photo-based non-diagnostic screening guidance, escalation criteria, and clinic follow-up pathways.",
    reviewedAt: homeContent.reviewedAt,
  });
  const service = serviceJsonLd({
    name: "Online head lice checker and nits screening",
    path: "/",
    description: "Free photo-based head lice and nits triage guidance with clear next steps and clinic support.",
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <HomePageClient content={homeContent} latestGuides={latestGuides} siteCopy={siteCopy} />
    </>
  );
}
