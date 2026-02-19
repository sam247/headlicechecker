export type ScanLabel = "lice" | "nits" | "dandruff" | "psoriasis" | "clear";

export type ScanConfidenceLevel = "high" | "medium" | "low";

export interface DetectionItem {
  id: string;
  label: Exclude<ScanLabel, "clear">;
  confidence: number;
  confidenceLevel: ScanConfidenceLevel;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ScanErrorCode =
  | "PROVIDER_ERROR"
  | "NO_PROVIDER_CONFIGURED"
  | "IMAGE_TOO_SMALL"
  | "BAD_REQUEST"
  | "UNKNOWN_ERROR";

export interface Clinic {
  id: string;
  name: string;
  region: string;
  country: "US" | "UK";
  city: string;
  postcode: string;
  address1?: string;
  address2?: string;
  phone?: string;
  email?: string;
  bookingUrl?: string;
  lat: number;
  lng: number;
  services: string[];
  active: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
  category: string;
  author: string;
  keywords: string[];
  isPublished: boolean;
  body: string[];
  image?: string;
}

export interface SiteCopy {
  brandName: string;
  tagline: string;
  medicalDisclaimer: string;
  privacyClaim: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface HomeHeroContent {
  badge: string;
  title: string;
  emphasis: string;
  paragraphs: string[];
  highlights: string[];
}

export interface HomeSectionContent {
  heading: string;
  paragraphs: string[];
}

export interface HomeLookForItem {
  title: string;
  copy: string;
}

export interface HomeScenarioCard {
  audience: string;
  title: string;
  copy: string;
  points: string[];
}

export interface HomeTrustLink {
  href: string;
  label: string;
  title: string;
  copy: string;
}

export interface HomePageContent {
  reviewedAt: string;
  hero: HomeHeroContent;
  quickDecide: HomeSectionContent;
  lookFor: {
    heading: string;
    intro: string;
    items: HomeLookForItem[];
  };
  scenarios: {
    heading: string;
    intro: string;
    cards: HomeScenarioCard[];
  };
  trust: {
    heading: string;
    intro: string;
    links: HomeTrustLink[];
  };
  guides: {
    heading: string;
    intro: string;
  };
  faq: {
    heading: string;
    intro: string;
    items: ContentFaq[];
  };
  lowerCta: {
    title: string;
    copy: string;
  };
}

export interface LeadSubmissionResult {
  ok: boolean;
  referenceId?: string;
  deliveryStatus?: "sent" | "queued" | "failed";
  code?: "VALIDATION_ERROR" | "RATE_LIMITED" | "TRANSIENT_DELIVERY_ERROR" | "PERMANENT_DELIVERY_ERROR";
  error?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string[];
  publishedAt?: string;
  updatedAt?: string;
}

export interface ContentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ContentFaq {
  question: string;
  answer: string;
}

export interface EvergreenPage extends SeoMeta {
  slug: string;
  intro: string;
  sections: ContentSection[];
  faqs: ContentFaq[];
}

export interface TrustPage extends SeoMeta {
  slug: string;
  intro: string;
  reviewedAt: string;
  sections: ContentSection[];
  faqs: ContentFaq[];
}

export interface LocationSeoPage extends SeoMeta {
  slug: string;
  city: string;
  region: string;
  country: "UK" | "US";
  intro: string;
  sections: ContentSection[];
  faqs: ContentFaq[];
}
