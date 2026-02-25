import type { MetadataRoute } from "next";
import { getClinics, getContentPages, getEvergreenPages, getLocationPages, getTrustPages } from "@/lib/data/content";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticLastModified = new Date("2026-02-16T00:00:00.000Z");
  const staticRoutes = [
    "",
    "/about",
    "/claim-listing",
    "/contact",
    "/directory",
    "/clinics",
    "/clinics/pricing",
    "/schools",
    "/how-it-works",
    "/locations",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: staticLastModified,
  }));

  const contentRoutes = getContentPages().map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(page.updatedAt || page.publishedAt),
  }));

  const evergreenRoutes = getEvergreenPages().map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    lastModified: new Date(page.updatedAt || page.publishedAt || "2026-02-16"),
  }));

  const trustRoutes = getTrustPages().map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    lastModified: new Date(page.updatedAt || page.publishedAt || "2026-02-16"),
  }));

  const locationRoutes = getLocationPages().map((page) => ({
    url: `${SITE_URL}/locations/${page.slug}`,
    lastModified: new Date(page.updatedAt || page.publishedAt || "2026-02-16"),
  }));

  const directoryRoutes = getClinics("UK").map((clinic) => ({
    url: `${SITE_URL}/directory/${clinic.id}`,
    lastModified: staticLastModified,
  }));

  return [...staticRoutes, ...contentRoutes, ...evergreenRoutes, ...trustRoutes, ...locationRoutes, ...directoryRoutes];
}
