import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/data/content";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
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
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const blogRoutes = getBlogPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
  }));

  return [...staticRoutes, ...blogRoutes];
}
