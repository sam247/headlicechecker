import { ArrowRight } from "lucide-react";

const posts = [
  {
    date: "Jan 15, 2026",
    title: "How to Check Your Child for Head Lice: A Step-by-Step Guide",
    excerpt: "Learn the proper wet-combing technique that professionals use to detect lice early.",
  },
  {
    date: "Jan 8, 2026",
    title: "Nits vs Dandruff: How to Tell the Difference",
    excerpt: "They look similar, but there are key differences. Here's what to look for.",
  },
  {
    date: "Dec 20, 2025",
    title: "Why Head Lice Are Nothing to Be Embarrassed About",
    excerpt: "Head lice don't discriminate — they're incredibly common and easy to treat.",
  },
];

const BlogPreview = () => {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Latest Articles
          </h2>
          <a href="#" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:underline">
            See more articles <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <article
              key={i}
              className="group rounded-2xl border border-border bg-background overflow-hidden hover:shadow-md transition-all cursor-pointer"
            >
              <div className="aspect-[16/9] bg-muted" />
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-2">{post.date}</p>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>

        <a href="#" className="sm:hidden flex items-center justify-center gap-1 text-primary font-medium text-sm mt-6 hover:underline">
          See more articles <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
};

export default BlogPreview;
