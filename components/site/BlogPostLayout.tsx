import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatDate, getSiteCopy } from "@/lib/data/content";
import type { BlogPost } from "@/lib/data/types";

const siteCopy = getSiteCopy();

interface BlogPostLayoutProps {
  post: BlogPost;
}

function renderBlock(block: string, index: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("## ")) {
    const heading = trimmed.slice(3);
    return (
      <h2 key={index} id={heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="mt-8 text-xl font-semibold">
        {heading}
      </h2>
    );
  }
  return (
    <p key={index} className="mt-3 text-base leading-8 text-muted-foreground [&_a]:text-primary [&_a]:hover:underline">
      <span dangerouslySetInnerHTML={{ __html: trimmed }} />
    </p>
  );
}

export default function BlogPostLayout({ post }: BlogPostLayoutProps) {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-3xl px-4">
        <article>
          <h1 className="section-title">{post.title}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{post.description}</p>
          {post.image ? (
            <figure className="mt-6 overflow-hidden rounded-xl border border-border">
              <Image
                src={post.image}
                alt={post.title}
                width={800}
                height={450}
                className="h-auto w-full object-cover"
                unoptimized
              />
            </figure>
          ) : null}
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {formatDate(post.publishedAt)} · {post.readMinutes} min read
          </p>
          <div className="mt-5">
            <Button asChild className="rounded-full">
              <Link href="/#start-scan">{siteCopy.primaryCta}</Link>
            </Button>
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-8">
            {post.body.map((block, i) => renderBlock(block, i))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4 rounded-xl border border-border bg-muted/30 p-6">
            <Link href="/#start-scan" className="text-sm font-medium text-primary hover:underline">
              Free head lice check
            </Link>
            <Link href="/directory" className="text-sm font-medium text-primary hover:underline">
              Find clinics
            </Link>
            <Link href="/schools" className="text-sm font-medium text-primary hover:underline">
              For schools
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
