import type { Metadata } from "next";
import type { BlogPost } from "@/lib/data/types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://headlicechecker.com";
export const SITE_NAME = "Head Lice Checker";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
}

export function canonical(path: string): string {
  return `${SITE_URL}${path}`;
}

export function pageMetadata(input: PageMetadataInput): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: input.path,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      type: "website",
      siteName: SITE_NAME,
      url: canonical(input.path),
      images: [{ url: "/logo_new.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: ["/logo_new.png"],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/find-clinics?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo_new.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@headlicechecker.com",
      },
    ],
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    keywords: post.keywords.join(", "),
    mainEntityOfPage: canonical(`/blog/${post.slug}`),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo_new.png`,
      },
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}

export function serviceJsonLd(input: { name: string; path: string; description: string; areaServed?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    serviceType: "Head lice screening guidance and clinic finder",
    areaServed: (input.areaServed ?? ["United Kingdom", "United States"]).map((area) => ({
      "@type": "Country",
      name: area,
    })),
    url: canonical(input.path),
  };
}

export function medicalWebPageJsonLd(input: {
  name: string;
  path: string;
  description: string;
  reviewedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: canonical(input.path),
    about: {
      "@type": "MedicalCondition",
      name: "Head lice",
    },
    lastReviewed: input.reviewedAt,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

export function collectionPageJsonLd(input: { name: string; path: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: canonical(input.path),
  };
}
