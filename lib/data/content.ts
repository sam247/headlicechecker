import usClinics from "@/content/clinics.us.json";
import ukClinics from "@/content/clinics.uk.json";
import faqs from "@/content/faqs.json";
import posts from "@/content/blog/posts.json";
import siteCopy from "@/content/site-copy.json";
import evergreenPages from "@/content/pages/evergreen.json";
import locationPages from "@/content/pages/locations.json";
import trustPages from "@/content/pages/trust.json";
import homePageContent from "@/content/pages/home.json";
import type {
  BlogPost,
  Clinic,
  ClinicTier,
  EvergreenPage,
  FaqItem,
  HomePageContent,
  LocationSeoPage,
  SiteCopy,
  TrustPage,
} from "@/lib/data/types";

function normalizeClinicTier(clinic: Clinic): ClinicTier {
  if (clinic.tier === "featured" || clinic.tier === "standard") return clinic.tier;
  if (clinic.featured === true || clinic.sponsored === true) return "featured";
  return "standard";
}

function normalizeClinic(clinic: Clinic): Clinic {
  const tier = normalizeClinicTier(clinic);
  return {
    ...clinic,
    tier,
    featured: tier === "featured",
  };
}

export function getClinics(country: "US" | "UK" | "ALL" = "US"): Clinic[] {
  const all = [...(usClinics as Clinic[]), ...(ukClinics as Clinic[])]
    .filter((c) => c.active)
    .map(normalizeClinic);
  if (country === "ALL") return all;
  return all.filter((c) => c.country === country);
}

function featuredRank(clinic: Clinic): number {
  return typeof clinic.featuredRank === "number" ? clinic.featuredRank : Number.MAX_SAFE_INTEGER;
}

export function sortClinicsByTier(clinics: Clinic[]): Clinic[] {
  return clinics.slice().sort((a, b) => {
    const aFeatured = a.tier === "featured" ? 1 : 0;
    const bFeatured = b.tier === "featured" ? 1 : 0;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;
    if (aFeatured === 1 && bFeatured === 1) return featuredRank(a) - featuredRank(b);
    return 0;
  });
}

export function applyFeaturedCap(clinics: Clinic[], maxFeatured = 2): Clinic[] {
  if (maxFeatured < 0) return clinics.slice();
  let featuredSeen = 0;
  const kept: Clinic[] = [];
  for (const clinic of clinics) {
    if (clinic.tier === "featured") {
      if (featuredSeen >= maxFeatured) continue;
      featuredSeen += 1;
    }
    kept.push(clinic);
  }
  return kept;
}

export function getClinicsForLocationPage(page: LocationSeoPage, maxFeatured = 2, maxTotal = 6): Clinic[] {
  const inCountry = getClinics(page.country);
  const city = page.city.trim().toLowerCase();
  const region = page.region.trim().toLowerCase();
  const primary = inCountry.filter((clinic) => {
    const clinicCity = clinic.city.trim().toLowerCase();
    const clinicRegion = clinic.region.trim().toLowerCase();
    return clinicCity === city || clinicRegion === region;
  });

  const source = primary.length > 0 ? primary : inCountry;
  const ranked = applyFeaturedCap(sortClinicsByTier(source), maxFeatured);
  return ranked.slice(0, Math.max(maxTotal, 1));
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

export function getHomePageContent(): HomePageContent {
  return homePageContent as HomePageContent;
}
