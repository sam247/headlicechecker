import type { MetadataRoute } from "next";
import { getBlogPosts, getEvergreenPages, getLocationPages, getTrustPages } from "@/lib/data/content";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticLastModified = new Date("2026-02-16T00:00:00.000Z");
  const staticRoutes = [
    "",
    "/about",
    "/blog",
    "/contact",
    "/faq",
    "/find-clinics",
    "/for-clinics",
    "/for-schools",
    "/how-it-works",
    "/locations",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: staticLastModified,
  }));

  const blogRoutes = getBlogPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
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

  return [...staticRoutes, ...blogRoutes, ...evergreenRoutes, ...trustRoutes, ...locationRoutes];
}
