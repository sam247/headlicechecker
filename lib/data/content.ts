import usClinics from "@/content/clinics.us.json";
import ukClinics from "@/content/clinics.uk.json";
import faqs from "@/content/faqs.json";
import posts from "@/content/blog/posts.json";
import siteCopy from "@/content/site-copy.json";
import evergreenPages from "@/content/pages/evergreen.json";
import locationPages from "@/content/pages/locations.json";
import trustPages from "@/content/pages/trust.json";
import type { BlogPost, Clinic, EvergreenPage, FaqItem, LocationSeoPage, SiteCopy, TrustPage } from "@/lib/data/types";

export function getClinics(country: "US" | "UK" | "ALL" = "US"): Clinic[] {
  const all = [...(usClinics as Clinic[]), ...(ukClinics as Clinic[])].filter((c) => c.active);
  if (country === "ALL") return all;
  return all.filter((c) => c.country === country);
}

export function getFaqs(): FaqItem[] {
  return faqs as FaqItem[];
}

export function getBlogPosts(): BlogPost[] {
  return (posts as BlogPost[])
    .filter((p) => p.isPublished)
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}

export function getSiteCopy(): SiteCopy {
  return siteCopy as SiteCopy;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getEvergreenPages(): EvergreenPage[] {
  return (evergreenPages as EvergreenPage[]).slice();
}

export function getEvergreenPageBySlug(slug: string): EvergreenPage | undefined {
  return getEvergreenPages().find((page) => page.slug === slug);
}

export function getLocationPages(): LocationSeoPage[] {
  return (locationPages as LocationSeoPage[]).slice();
}

export function getLocationPageBySlug(slug: string): LocationSeoPage | undefined {
  return getLocationPages().find((page) => page.slug === slug);
}

export function getTrustPages(): TrustPage[] {
  return (trustPages as TrustPage[]).slice();
}

export function getTrustPageBySlug(slug: string): TrustPage | undefined {
  return getTrustPages().find((page) => page.slug === slug);
}
