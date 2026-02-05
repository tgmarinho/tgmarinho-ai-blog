import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  title: string;
  description?: string;
  date: string;
  slug: string;
  categories: string[];
  body: string;
}

interface RecentPostsProps {
  posts: Post[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Recent Posts</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            title={post.title}
            description={post.description}
            date={post.date}
            slug={post.slug}
            categories={post.categories}
            body={post.body}
          />
        ))}
      </div>
    </section>
  );
}
