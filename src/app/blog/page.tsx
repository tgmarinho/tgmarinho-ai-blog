import { Metadata } from "next";
import { posts } from "#site/content";
import { sortPostsByDate, getAllCategories } from "@/lib/velite";
import { BlogSearch } from "@/components/blog/search";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read my thoughts on software development, blockchain, and more.",
};

export default function BlogPage() {
  const publishedPosts = sortPostsByDate(posts);
  const categories = getAllCategories(posts);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Thoughts on software development, blockchain, career, and more.
        </p>
      </div>

      <BlogSearch posts={publishedPosts} categories={categories} />
    </div>
  );
}
