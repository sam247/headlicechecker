import usClinics from "@/content/clinics.us.json";
import ukClinics from "@/content/clinics.uk.json";
import faqs from "@/content/faqs.json";
import posts from "@/content/blog/posts.json";
import siteCopy from "@/content/site-copy.json";
import evergreenPages from "@/content/pages/evergreen.json";
import locationPages from "@/content/pages/locations.json";
import trustPages from "@/content/pages/trust.json";
import homePageContent from "@/content/pages/home.json";
import { CONTENT_PAGES } from "@/lib/data/content-pages";
import { validateContentGovernance } from "@/lib/data/content-governance";
import {
  calculateConversionQualityScore,
  calculatePartnerPriorityScore,
  calculateRegionDensityScore,
} from "@/lib/data/partner-scoring";
import type {
  BlogPost,
  Clinic,
  ClinicPartnerStatus,
  ClinicTier,
  ContentPage,
  ContentPillar,
  EvergreenPage,
  FaqItem,
  HomePageContent,
  LocationSeoPage,
  SiteCopy,
  TrustPage,
} from "@/lib/data/types";
import { isVerifiedRegionalPartner } from "@/lib/data/clinic-partner";

const HOMEPAGE_FEATURED_GUIDE_PATHS = [
  "/professional/head-lice-treatment-for-adults",
  "/symptoms/what-are-the-first-signs-of-head-lice",
  "/professional/best-over-the-counter-head-lice-treatment-for-sensitive-skin",
] as const;

function normalizeClinicTier(clinic: Clinic): ClinicTier {
  if (clinic.partner_status === "featured") return "featured";
  if (clinic.tier === "featured" || clinic.tier === "standard") return clinic.tier;
  if (clinic.featured === true || clinic.sponsored === true) return "featured";
  return "standard";
}

function normalizePartnerStatus(clinic: Clinic): ClinicPartnerStatus | null {
  if (
    clinic.partner_status === "free" ||
    clinic.partner_status === "founding" ||
    clinic.partner_status === "verified" ||
    clinic.partner_status === "featured" ||
    clinic.partner_status === "exclusive"
  ) {
    return clinic.partner_status;
  }
  const partnerFlag = String(clinic.partner ?? "").trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(partnerFlag)) return "verified";
  if (["no", "n", "false", "0"].includes(partnerFlag)) return "free";
  if (clinic.founding_partner) return "founding";
  if (clinic.tier === "featured") return "featured";
  return null;
}

function normalizeClinic(clinic: Clinic): Clinic {
  const tier = normalizeClinicTier(clinic);
  return {
    ...clinic,
    tier,
    featured: tier === "featured",
    partner_status: normalizePartnerStatus(clinic),
    partner_priority_score: clinic.partner_priority_score ?? calculatePartnerPriorityScore(clinic),
    region_density_score: clinic.region_density_score ?? calculateRegionDensityScore(clinic),
    conversion_quality_score: clinic.conversion_quality_score ?? calculateConversionQualityScore(clinic),
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

function premiumPosition(clinic: Clinic): number {
  return typeof clinic.premium_position === "number" ? clinic.premium_position : Number.MAX_SAFE_INTEGER;
}

export function sortClinicsByTier(clinics: Clinic[]): Clinic[] {
  return clinics.slice().sort((a, b) => {
    const byPremiumPosition = premiumPosition(a) - premiumPosition(b);
    if (byPremiumPosition !== 0) return byPremiumPosition;

    const aFeatured = a.tier === "featured" ? 1 : 0;
    const bFeatured = b.tier === "featured" ? 1 : 0;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;
    if (aFeatured === 1 && bFeatured === 1) return featuredRank(a) - featuredRank(b);
    return 0;
  });
}

export function sortClinicsForDirectory(clinics: Clinic[]): Clinic[] {
  return clinics.slice().sort((a, b) => {
    const aVerified = isVerifiedRegionalPartner(a) ? 1 : 0;
    const bVerified = isVerifiedRegionalPartner(b) ? 1 : 0;
    if (aVerified !== bVerified) return bVerified - aVerified;

    if (aVerified === 1 && bVerified === 1) {
      const byPremiumPosition = premiumPosition(a) - premiumPosition(b);
      if (byPremiumPosition !== 0) return byPremiumPosition;

      const aFeatured = a.tier === "featured" ? 1 : 0;
      const bFeatured = b.tier === "featured" ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      if (aFeatured === 1 && bFeatured === 1) return featuredRank(a) - featuredRank(b);
    }

    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) return byName;
    return a.region.localeCompare(b.region);
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
  const ranked = applyFeaturedCap(sortClinicsForDirectory(source), maxFeatured);
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

function isLivePage(page: ContentPage): boolean {
  const now = Date.now();
  const publishAt = new Date(page.publishedAt).getTime();
  return Number.isFinite(publishAt) ? publishAt <= now : true;
}

export function getContentPages(includeUnpublished = false): ContentPage[] {
  const pages = validateContentGovernance(CONTENT_PAGES).slice();
  return includeUnpublished ? pages : pages.filter((page) => page.isPublished && isLivePage(page));
}

export function getContentPageByPath(path: string, includeUnpublished = false): ContentPage | undefined {
  return getContentPages(includeUnpublished).find((page) => page.path === path);
}

export function getContentPageBySegments(segments: string[], includeUnpublished = false): ContentPage | undefined {
  return getContentPageByPath(`/${segments.join("/")}`, includeUnpublished);
}

export function getLatestGuides(limit = 3): ContentPage[] {
  return getContentPages()
    .filter((page) => page.pageType !== "hub")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function getHomepageFeaturedGuides(): ContentPage[] {
  const byPath = new Map(getContentPages().map((page) => [page.path, page] as const));
  return HOMEPAGE_FEATURED_GUIDE_PATHS.map((path) => byPath.get(path)).filter((page): page is ContentPage => Boolean(page));
}

export function getClusterPagesForPillar(pillar: ContentPillar, limit?: number): ContentPage[] {
  const pages = getContentPages()
    .filter((page) => page.pillar === pillar && page.pageType === "cluster")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return typeof limit === "number" ? pages.slice(0, Math.max(limit, 0)) : pages;
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
