import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts, formatDate } from "@/lib/data/content";
import { articleJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

interface BlogDetailPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: BlogDetailPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }} />
      <div className="container mx-auto max-w-3xl px-4">
        <p className="text-xs text-muted-foreground">
          {formatDate(post.publishedAt)} · Updated {formatDate(post.updatedAt)} · {post.readMinutes} min read
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{post.description}</p>

        <div className="mt-8 space-y-4 text-base leading-7 text-foreground">
          {post.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 flex gap-4 text-sm">
          <Link href="/faq" className="text-primary hover:underline">Read FAQ</Link>
          <Link href="/find-clinics" className="text-primary hover:underline">Find clinics</Link>
        </div>
      </div>
    </article>
  );
}
