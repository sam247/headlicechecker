import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts, formatDate } from "@/lib/data/content";

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

interface BlogDetailPageProps {
  params: { slug: string };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="section-shell">
      <div className="container mx-auto max-w-3xl px-4">
        <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)} · {post.readMinutes} min read</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{post.description}</p>

        <div className="mt-8 space-y-4 text-base leading-7 text-foreground">
          {post.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
