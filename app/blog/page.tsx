import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPosts, formatDate, getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, collectionPageJsonLd, pageMetadata } from "@/lib/seo";

const posts = getBlogPosts();
const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "Head Lice Guides and Articles",
  description: "Browse practical guides on symptoms, nits, home checks, school response playbooks, and clinic follow-up.",
  path: "/blog",
});

export default function BlogPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);

  const collection = collectionPageJsonLd({
    name: "Head lice guides",
    path: "/blog",
    description: "Educational guides for families, schools, and clinics.",
  });

  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="section-title">Articles and guides</h1>
        <p className="mt-4 section-copy">
          Practical reading for parents, schools, and clinic teams. Each article uses non-diagnostic language and links directly to scan and clinic pathways.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/blog/head-lice-treatment-for-adults" className="text-primary hover:underline">
            Head lice treatment for adults
          </Link>
          <Link href="/head-lice-symptoms" className="text-primary hover:underline">
            Head lice symptoms
          </Link>
          <Link href="/nits-vs-dandruff" className="text-primary hover:underline">
            Nits vs dandruff
          </Link>
          <Link href="/locations" className="text-primary hover:underline">
            Location guides
          </Link>
          <Link href="/#start-scan" className="text-primary hover:underline">
            {copy.primaryCta}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.slug}>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.publishedAt)} · Updated {formatDate(post.updatedAt)} · {post.readMinutes} min read
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
                <div className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{post.category}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
