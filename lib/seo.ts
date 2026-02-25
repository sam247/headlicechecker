import type { Metadata } from "next";
import type { BlogPost, Clinic } from "@/lib/data/types";

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
      target: `${SITE_URL}/directory?q={search_term_string}`,
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

export function articleJsonLd(post: BlogPost, pathOverride?: string) {
  const base: Record<string, unknown> = {
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
    mainEntityOfPage: canonical(pathOverride ?? `/${post.slug}`),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo_new.png`,
      },
    },
  };
  if (post.image) {
    base.image = canonical(post.image);
  }
  return base;
}

export function contentArticleJsonLd(input: {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  authorName: string;
  keywords: string[];
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    keywords: input.keywords.join(", "),
    mainEntityOfPage: canonical(input.path),
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

export function webPageJsonLd(input: {
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
    lastReviewed: input.reviewedAt,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

export function educationalOrganizationJsonLd(input: {
  name: string;
  path: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: input.name,
    description: input.description,
    url: canonical(input.path),
    areaServed: ["United Kingdom", "United States"],
    sameAs: [SITE_URL],
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

function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, value));
}

function normalizeReviewCount(value?: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const normalized = Math.max(0, Math.floor(value));
  return normalized;
}

export function clinicReviewJsonLd(clinic: Clinic) {
  if (typeof clinic.reviewStars !== "number") return null;
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "LocalBusiness",
      name: clinic.name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: clampRating(clinic.reviewStars),
      bestRating: 5,
      worstRating: 0,
    },
    author: {
      "@type": "Organization",
      name: "Google Reviews",
    },
  };
}

export function localBusinessJsonLd(clinic: Clinic) {
  const reviewCount = normalizeReviewCount(clinic.reviewCount);
  const hasRating = typeof clinic.reviewStars === "number";
  const streetAddress = [clinic.address1, clinic.address2].filter(Boolean).join(", ");

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: clinic.name,
    description: clinic.description,
    telephone: clinic.phone,
    email: clinic.email,
    url: clinic.bookingUrl,
    sameAs: clinic.gmbUrl,
    areaServed: clinic.region,
    address: {
      "@type": "PostalAddress",
      ...(streetAddress ? { streetAddress } : {}),
      addressLocality: clinic.city,
      postalCode: clinic.postcode,
      addressCountry: clinic.country,
    },
    ...(hasRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: clampRating(clinic.reviewStars as number),
            ...(typeof reviewCount === "number" ? { reviewCount } : {}),
          },
        }
      : {}),
  };
}
