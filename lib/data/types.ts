export type ScanLabel = "lice" | "nits" | "dandruff" | "psoriasis" | "clear";

export type ScanConfidenceLevel = "high" | "medium" | "low";

export interface Clinic {
  id: string;
  name: string;
  region: string;
  country: "US" | "UK";
  city: string;
  postcode: string;
  address1: string;
  address2?: string;
  phone: string;
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
  readMinutes: number;
  category: string;
  body: string[];
}

export interface SiteCopy {
  brandName: string;
  tagline: string;
  medicalDisclaimer: string;
  privacyClaim: string;
  primaryCta: string;
  secondaryCta: string;
}
