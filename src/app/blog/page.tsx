import { Metadata } from "next";
import { posts } from "#site/content";
import { sortPostsByDate, getAllCategories } from "@/lib/velite";
import { BlogSearch } from "@/components/blog/search";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field notes on AI engineering, agentic systems, and shipping software that thinks.",
};

export default function BlogPage() {
  const publishedPosts = sortPostsByDate(posts);
  const categories = getAllCategories(posts);

  return (
    <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <div className="mb-14 max-w-2xl">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
          ━ archive · {publishedPosts.length} entries
        </span>
        <h1 className="mt-3 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[60px]">
          The <span className="text-gradient-cm">signal</span>,
          <br />
          not the noise.
        </h1>
        <p className="mt-5 max-w-lg text-[15.5px] leading-[1.7] text-muted-foreground">
          Long-form essays and rapid field notes on AI agents, product
          engineering, careers, and the craft of shipping.
        </p>
      </div>

      <BlogSearch posts={publishedPosts} categories={categories} />
    </div>
  );
}
