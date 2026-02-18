import type { Metadata } from "next";
import Image from "next/image";
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
  { href: "/", label: "Head lice check" },
  { href: "/head-lice-symptoms", label: "Head Lice Symptoms" },
  { href: "/nits-vs-dandruff", label: "Nits vs Dandruff" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/find-clinics", label: "Find Clinics" },
];

type BodyBlock =
  | { type: "h2"; text: string }
  | { type: "p"; html: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBodyBlocks(body: string[]): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  let i = 0;
  const numberedRegex = /^\d+\.\s/;
  while (i < body.length) {
    const line = body[i];
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
      i += 1;
    } else if (line.startsWith("• ")) {
      const items: string[] = [];
      while (i < body.length && body[i].startsWith("• ")) {
        items.push(body[i].slice(2));
        i += 1;
      }
      blocks.push({ type: "ul", items });
    } else if (numberedRegex.test(line)) {
      const items: string[] = [];
      while (i < body.length && numberedRegex.test(body[i])) {
        items.push(body[i].replace(numberedRegex, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
    } else {
      blocks.push({ type: "p", html: line });
      i += 1;
    }
  }
  return blocks;
}

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
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <span aria-hidden>←</span> Back to Blog
        </Link>
        <p className="text-xs text-muted-foreground">
          {formatDate(post.publishedAt)} · Updated {formatDate(post.updatedAt)} · {post.readMinutes} min read
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{post.description}</p>

        {post.image && (
          <figure className="mt-8">
            <Image
              src={post.image}
              alt=""
              width={1200}
              height={630}
              className="rounded-lg border object-cover w-full h-auto"
              priority
            />
          </figure>
        )}

        <div className="mt-8 space-y-4 text-base leading-7 text-foreground prose prose-neutral max-w-none">
          {parseBodyBlocks(post.body).map((block, index) => {
            const key = `${post.slug}-${index}`;
            if (block.type === "h2") {
              return (
                <h2 key={key} className="mt-8 mb-3 text-xl font-semibold md:text-2xl scroll-mt-6">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={key} className="my-4 ml-4 list-none space-y-2 pl-0">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === "ol") {
              return (
                <ol key={key} className="my-4 list-decimal space-y-2 pl-6">
                  {block.items.map((item, j) => (
                    <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ol>
              );
            }
            return (
              <p key={key} dangerouslySetInnerHTML={{ __html: block.html }} />
            );
          })}
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
