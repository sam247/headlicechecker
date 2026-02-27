import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { formatDate, getBlogPosts } from "@/lib/data/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Head Lice Blog | Tips, Treatment & Prevention",
  description: "Expert advice on head lice detection, treatment, and prevention. Practical tips for parents, schools, and caregivers.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">Head Lice Blog</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Practical advice on detection, treatment, and prevention. Use our free{" "}
          <Link href="/#start-scan" className="text-primary hover:underline">
            head lice checker
          </Link>{" "}
          for an indicative result.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/50"
            >
              {post.image ? (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized
                  />
                </div>
              ) : null}
              <h2 className="mt-3 font-semibold group-hover:text-primary">{post.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatDate(post.publishedAt)} · {post.readMinutes} min</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
