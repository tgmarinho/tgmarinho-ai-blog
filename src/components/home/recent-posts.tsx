import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";

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

  const [feature, ...rest] = posts;

  return (
    <section className="relative px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
              ━ writing
            </span>
            <h2 className="mt-3 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground md:text-[44px]">
              Field notes from the <span className="text-gradient-cyan">edge</span>.
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-[12.5px] tracking-wide text-foreground/90 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
          >
            All posts
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Asymmetric grid: large feature card + 2x2 secondary on desktop */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:grid-rows-2 md:[grid-auto-flow:dense]">
          {feature && (
            <PostCard
              {...feature}
              variant="feature"
              className="md:col-span-1 md:row-span-2"
            />
          )}
          {rest.slice(0, 4).map((post) => (
            <PostCard key={post.slug} {...post} variant="default" />
          ))}
        </div>
      </div>
    </section>
  );
}
