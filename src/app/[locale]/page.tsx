import { posts } from "#site/content";
import { sortPostsByDate } from "@/lib/velite";
import { Hero } from "@/components/home/hero";
import { RecentPosts } from "@/components/home/recent-posts";

export default function HomePage() {
  const publishedPosts = sortPostsByDate(posts);
  const recentPosts = publishedPosts.slice(0, 5);

  return (
    <>
      <Hero postCount={publishedPosts.length} />
      <RecentPosts posts={recentPosts} />
    </>
  );
}
