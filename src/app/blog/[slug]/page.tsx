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
import fs from "fs";
import path from "path";

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

  // If body is empty (MDX compilation failed), try to read from file
  let bodyContent = post.body || "";
  if (!bodyContent) {
    try {
      const postsDir = path.join(process.cwd(), "content", "posts");
      const files = fs.readdirSync(postsDir);
      
      // Normalize slug for comparison (remove all non-alphanumeric, normalize hyphens)
      const normalizeSlug = (s: string) => 
        s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      
      const normalizedSlug = normalizeSlug(slug);
      
      const file = files.find((f) => {
        if (!f.endsWith('.mdx') && !f.endsWith('.md')) return false;
        const fileSlug = normalizeSlug(f.replace(/\.mdx?$/, ""));
        // Try exact match first
        if (fileSlug === normalizedSlug) return true;
        
        // Try fuzzy match (remove all hyphens and compare)
        const fileSlugNoHyphens = fileSlug.replace(/-/g, "");
        const slugNoHyphens = normalizedSlug.replace(/-/g, "");
        if (fileSlugNoHyphens === slugNoHyphens) return true;
        
        // Try prefix match - check if slug starts with file slug (slug is usually longer)
        // or if file slug starts with slug (file name is usually shorter)
        if (normalizedSlug.startsWith(fileSlug) || fileSlug.startsWith(normalizedSlug)) {
          return true;
        }
        
        // Try matching first N words (handles cases where file name is shorter)
        // Split by hyphens and compare first few words
        const fileWords = fileSlug.split('-').filter(w => w.length > 0);
        const slugWords = normalizedSlug.split('-').filter(w => w.length > 0);
        const minWords = Math.min(fileWords.length, slugWords.length);
        
        if (minWords >= 3) {
          // Compare first 3-5 words
          const compareWords = Math.min(5, minWords);
          let matchingWords = 0;
          for (let i = 0; i < compareWords; i++) {
            // Normalize words (remove hyphens within words, handle accented chars)
            const fileWord = fileWords[i].replace(/-/g, '');
            const slugWord = slugWords[i].replace(/-/g, '');
            if (fileWord === slugWord || 
                fileWord.length > 5 && slugWord.startsWith(fileWord.substring(0, Math.min(5, fileWord.length))) ||
                slugWord.length > 5 && fileWord.startsWith(slugWord.substring(0, Math.min(5, slugWord.length)))) {
              matchingWords++;
            }
          }
          // If most words match, consider it a match
          if (matchingWords >= Math.min(3, compareWords - 1)) {
            return true;
          }
        }
        
        return false;
      });
      
      if (file) {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        // Extract body content (everything after frontmatter)
        const frontmatterEnd = fileContent.indexOf("---", 3);
        if (frontmatterEnd !== -1) {
          bodyContent = fileContent.substring(frontmatterEnd + 3).trim();
        } else {
          bodyContent = fileContent.trim();
        }
      } else {
        if (process.env.NODE_ENV === "development") {
          console.warn(`Could not find file for slug: ${slug}. Available files:`, files.slice(0, 5).join(", "));
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error reading file for slug ${slug}:`, error);
      }
    }
  }
  
  // Debug: log if bodyContent is still empty
  if (!bodyContent && process.env.NODE_ENV === "development") {
    console.warn(`No body content found for post: ${post.title} (slug: ${slug})`);
  }

  const stats = readingTime(bodyContent || post.body || "");

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
        <MdxContent code={bodyContent || post.body || ""} />
      </div>

      {/* Share button */}
      <ShareButton title={post.title} />
    </article>
  );
}
