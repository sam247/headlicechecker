import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPostBySlug, getBlogPosts, formatDate } from "@/lib/data/content";
import { articleJsonLd, breadcrumbJsonLd, canonical, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

interface BlogDetailPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: BlogDetailPageProps): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};

  const base = pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      url: canonical(`/blog/${post.slug}`),
    },
  };
}

const relatedGuides = [
  { href: "/head-lice-symptoms", label: "Head Lice Symptoms" },
  { href: "/nits-vs-dandruff", label: "Nits vs Dandruff" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/find-clinics", label: "Find Clinics" },
];

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <article className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="container mx-auto max-w-4xl px-4">
        <p className="text-xs text-muted-foreground">
          {formatDate(post.publishedAt)} · Updated {formatDate(post.updatedAt)} · {post.readMinutes} min read
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{post.description}</p>

        <div className="mt-8 space-y-4 text-base leading-7 text-foreground">
          {post.body.map((paragraph, index) => (
            <p key={`${post.slug}-${index}`}>{paragraph}</p>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">Related guides</h2>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {relatedGuides.map((guide) => (
                <Link key={guide.href} href={guide.href} className="text-primary hover:underline">
                  {guide.label}
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Start with a free scan first, then use clinic pathways for professional confirmation.
            </p>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}
