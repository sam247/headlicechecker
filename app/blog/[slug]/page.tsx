import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostLayout from "@/components/site/BlogPostLayout";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/content";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path },
  ]);
  const webpage = medicalWebPageJsonLd({
    name: post.title,
    path,
    description: post.description,
    reviewedAt: post.updatedAt,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <BlogPostLayout post={post} />
    </>
  );
}
