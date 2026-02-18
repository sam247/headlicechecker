import type { Metadata } from "next";
import HomePageClient from "@/components/site/HomePageClient";
import { getBlogPosts, getFaqs, getHomePageContent, getSiteCopy } from "@/lib/data/content";
import { canonical, faqJsonLd, medicalWebPageJsonLd, organizationJsonLd, serviceJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Head Lice Checker | Free Online Head Lice and Nit Check",
  description:
    "Use Head Lice Checker for a free photo-based head lice and nits check, then follow clear next steps at home or with a clinic.",
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
    title: "Head Lice Checker | Free Online Head Lice and Nit Check",
    description:
      "Run a fast head lice and nits photo check, review confidence-safe guidance, and take clear next steps.",
    url: canonical("/"),
    type: "website",
    siteName: "Head Lice Checker",
    images: [{ url: "/logo_new.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Head Lice Checker | Free Online Head Lice and Nit Check",
    description:
      "Run a fast head lice and nits photo check, review confidence-safe guidance, and take clear next steps.",
    images: ["/logo_new.png"],
  },
};

export default function Home() {
  const homeContent = getHomePageContent();
  const faqs = getFaqs().slice(0, 5);
  const siteCopy = getSiteCopy();
  const latestGuides = getBlogPosts().slice(0, 2).map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readMinutes: post.readMinutes,
  }));

  const homepageFaqJsonLd = faqJsonLd(faqs.map((item) => ({ question: item.question, answer: item.answer })));
  const medicalWebPage = medicalWebPageJsonLd({
    name: "Head Lice Checker",
    path: "/",
    description:
      "Head lice checker homepage with non-diagnostic photo screening guidance, escalation criteria, and clinic follow-up pathways.",
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
      <HomePageClient content={homeContent} faqs={faqs} latestGuides={latestGuides} siteCopy={siteCopy} />
    </>
  );
}
