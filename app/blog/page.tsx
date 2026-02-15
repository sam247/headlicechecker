import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPosts, formatDate } from "@/lib/data/content";

const posts = getBlogPosts();

export default function BlogPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="section-title">Articles and guides</h1>
        <p className="mt-3 section-copy">Practical resources for parents, schools, and clinics.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.slug}>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)} · {post.readMinutes} min read</p>
                <h2 className="mt-2 text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
