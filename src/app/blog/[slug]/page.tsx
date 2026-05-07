import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { posts, type Post } from "#site/content";
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

const languageLabels: Record<string, string> = {
  en: "EN",
  "pt-BR": "PT-BR",
};

const languageOrder: Record<string, number> = {
  en: 0,
  "pt-BR": 1,
};

function getAbsoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return undefined;

  return new URL(pathOrUrl, siteConfig.url).toString();
}

function getReadingTime(post: Post) {
  return readingTime(post.body || "");
}

function getReadingTimeText(post: Post) {
  const stats = getReadingTime(post);
  const minutes = Math.ceil(stats.minutes);

  if (post.language === "pt-BR") {
    return `${minutes} min de leitura`;
  }

  return stats.text;
}

function getFormattedDate(date: string, language?: string) {
  return new Date(date).toLocaleDateString(
    language === "pt-BR" ? "pt-BR" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function getPostTranslations(post: Post) {
  if (!post.translationKey) return [];

  return posts
    .filter(
      (candidate) =>
        candidate.published && candidate.translationKey === post.translationKey
    )
    .sort(
      (a, b) =>
        (languageOrder[a.language ?? ""] ?? 99) -
        (languageOrder[b.language ?? ""] ?? 99)
    );
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  const imageUrl = getAbsoluteUrl(post.image);
  const readingTimeText = getReadingTimeText(post);
  const publishedDate = getFormattedDate(post.date, post.language);

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: siteConfig.author }],
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: postUrl,
      siteName: siteConfig.name,
      locale: post.language === "pt-BR" ? "pt_BR" : "en_US",
      authors: [siteConfig.author],
      tags: post.categories,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              type:
                imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg")
                  ? "image/jpeg"
                  : undefined,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: "@tgmarinho",
      images: imageUrl ? [imageUrl] : undefined,
    },
    other: {
      "article:published_time": post.date,
      "article:author": siteConfig.author,
      "twitter:label1": "Published",
      "twitter:data1": publishedDate,
      "twitter:label2": "Reading time",
      "twitter:data2": readingTimeText,
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

  const stats = getReadingTime(post);
  const readingTimeText = getReadingTimeText(post);
  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  const imageUrl = getAbsoluteUrl(post.image);
  const translations = getPostTranslations(post);
  const hasTranslations = translations.length > 1;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    keywords: post.categories,
    inLanguage: post.language ?? "en",
    timeRequired: `PT${Math.ceil(stats.minutes)}M`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      {/* Post header */}
      <header className="mb-10">
        {hasTranslations && (
          <nav
            aria-label="Article language"
            className="mb-6 inline-flex rounded-full border border-border/70 bg-muted/40 p-1"
          >
            {translations.map((translation) => {
              const isActive = translation.slug === post.slug;
              const label =
                languageLabels[translation.language ?? ""] ??
                translation.language ??
                "Article";

              return (
                <Button
                  key={translation.slug}
                  asChild
                  size="xs"
                  variant={isActive ? "default" : "ghost"}
                  className="rounded-full px-3"
                  aria-current={isActive ? "page" : undefined}
                >
                  <Link href={`/blog/${translation.slug}`}>{label}</Link>
                </Button>
              );
            })}
          </nav>
        )}

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
            {getFormattedDate(post.date, post.language)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {readingTimeText}
          </span>
        </div>

        {post.image && (
          <div className="relative mt-8 aspect-3/2 overflow-hidden rounded-xl border border-border/70 bg-muted/30">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}
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
