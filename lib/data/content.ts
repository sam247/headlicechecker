import usClinics from "@/content/clinics.us.json";
import ukClinics from "@/content/clinics.uk.json";
import faqs from "@/content/faqs.json";
import posts from "@/content/blog/posts.json";
import siteCopy from "@/content/site-copy.json";
import type { BlogPost, Clinic, FaqItem, SiteCopy } from "@/lib/data/types";

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
