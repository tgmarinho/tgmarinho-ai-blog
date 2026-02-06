import { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "#site/content";
import { MdxContent } from "@/components/mdx/mdx-content";
import { ShareButton } from "@/components/mdx/share-button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import readingTime from "reading-time";
import { siteConfig } from "@/lib/constants";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug && post.published);
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `${siteConfig.url}/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export function generateStaticParams() {
  return posts
    .filter((post) => post.published)
    .map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const stats = readingTime(post.body || "");

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      {/* Post header */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((cat) => (
            <Badge key={cat} variant="secondary">
              {cat}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-lg text-muted-foreground mb-4">
            {post.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {stats.text}
          </span>
        </div>
      </header>

      {/* Separator */}
      <hr className="border-border mb-10" />

      {/* Post content */}
      <div className="prose max-w-none">
        <MdxContent code={post.body || ""} />
      </div>

      {/* Share button */}
      <ShareButton title={post.title} />
    </article>
  );
}
