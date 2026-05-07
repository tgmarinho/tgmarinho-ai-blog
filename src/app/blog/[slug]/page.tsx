import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import readingTime from "reading-time";
import { posts, type Post } from "#site/content";
import { MdxContent } from "@/components/mdx/mdx-content";
import { ShareButton } from "@/components/mdx/share-button";
import { siteConfig } from "@/lib/constants";
import { formatIsoDateForDisplay } from "@/lib/format-iso-date";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

const languageLabels: Record<string, string> = {
  en: "EN",
  "pt-BR": "PT",
};

const languageOrder: Record<string, number> = {
  en: 0,
  "pt-BR": 1,
};

function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug && post.published);
}

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
  if (post.language === "pt-BR") return `${minutes} min de leitura`;
  return `${minutes} min read`;
}

function getFormattedDate(date: string, language?: string) {
  const locale = language === "pt-BR" ? "pt-BR" : "en-US";
  return formatIsoDateForDisplay(date, locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getPostTranslations(post: Post) {
  if (!post.translationKey) return [];
  return posts
    .filter(
      (c) => c.published && c.translationKey === post.translationKey
    )
    .sort(
      (a, b) =>
        (languageOrder[a.language ?? ""] ?? 99) -
        (languageOrder[b.language ?? ""] ?? 99)
    );
}

function getRelatedPosts(post: Post) {
  if (!post.categories?.length) return [];
  return posts
    .filter(
      (c) =>
        c.published &&
        c.slug !== post.slug &&
        c.language === post.language &&
        c.categories?.some((cat) => post.categories.includes(cat))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
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
    alternates: { canonical: postUrl },
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

  if (!post) notFound();

  const stats = getReadingTime(post);
  const readingTimeText = getReadingTimeText(post);
  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  const imageUrl = getAbsoluteUrl(post.image);
  const translations = getPostTranslations(post);
  const hasTranslations = translations.length > 1;
  const related = getRelatedPosts(post);

  const isPt = post.language === "pt-BR";
  const t = {
    back: isPt ? "voltar" : "back",
    backToBlog: isPt ? "todos os posts" : "all posts",
    written: isPt ? "publicado em" : "published",
    signedBy: isPt ? "— escrito por" : "— written by",
    moreFrom: isPt ? "mais sobre" : "more on",
    related: isPt ? "leituras relacionadas" : "related reading",
    share: isPt ? "compartilhar" : "share",
  };

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
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    keywords: post.categories,
    inLanguage: post.language ?? "en",
    timeRequired: `PT${Math.ceil(stats.minutes)}M`,
  };

  return (
    <article
      lang={post.language ?? "en"}
      className="relative mx-auto px-5 py-14 md:py-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Soft halo behind the article */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(700px 380px at 50% 0%, rgba(34,211,238,0.08), transparent 60%)",
        }}
      />

      {/* ── Top meta strip — mono, uppercase, breathing ── */}
      <div className="mx-auto max-w-[680px]">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-cyan-300"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          {t.back}
        </Link>
      </div>

      {/* ── Article header ── */}
      <header className="mx-auto mt-10 max-w-[680px]">
        {/* Category line */}
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em]">
          {post.categories.slice(0, 3).map((cat, i) => (
            <span key={cat} className="flex items-center gap-3">
              {i > 0 && <span className="text-white/15">·</span>}
              <span className="text-cyan-300/85">{cat}</span>
            </span>
          ))}
          <span className="text-white/15">·</span>
          <span className="text-muted-foreground">{readingTimeText}</span>
        </div>

        {/* Title — Fraunces display */}
        <h1
          className="text-balance font-[family-name:var(--font-fraunces)] text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground md:text-[56px]"
          style={{ fontFeatureSettings: '"ss01", "kern", "liga"' }}
        >
          {post.title}
        </h1>

        {post.description && (
          <p className="mt-6 font-[family-name:var(--font-fraunces)] text-[19px] italic leading-[1.5] text-muted-foreground md:text-[22px]">
            {post.description}
          </p>
        )}

        {/* Date + language switch */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-5">
          <time
            dateTime={post.date}
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            {t.written} · {getFormattedDate(post.date, post.language)}
          </time>

          {hasTranslations && (
            <nav
              aria-label="Article language"
              className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] p-0.5 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur-md"
            >
              {translations.map((tr) => {
                const isActive = tr.slug === post.slug;
                const label =
                  languageLabels[tr.language ?? ""] ??
                  tr.language ??
                  "—";
                return (
                  <Link
                    key={tr.slug}
                    href={`/blog/${tr.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      "rounded-full px-3 py-1 transition-colors " +
                      (isActive
                        ? "bg-cyan-300/15 text-cyan-200"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Hero image (if any) — wider than text column */}
      {post.image && (
        <figure className="mx-auto mt-12 max-w-[920px]">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 920px) 100vw, 920px"
              className="object-cover"
            />
          </div>
        </figure>
      )}

      {/* ── Body ── */}
      <div className="prose mx-auto mt-14 max-w-[680px]">
        <MdxContent code={post.body || ""} />
      </div>

      {/* ── Sign-off ── */}
      <div className="mx-auto mt-16 max-w-[680px]">
        <div className="mesh-divider" />
        <p className="mt-10 font-[family-name:var(--font-fraunces)] text-[15px] italic leading-relaxed text-muted-foreground">
          {t.signedBy}{" "}
          <Link
            href="/about"
            className="text-foreground underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:decoration-cyan-300"
          >
            {siteConfig.author}
          </Link>
        </p>
        <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/80">
          {getFormattedDate(post.date, post.language)} · {siteConfig.location}
        </p>
      </div>

      {/* ── Share + nav ── */}
      <div className="mx-auto mt-12 flex max-w-[680px] flex-wrap items-center justify-between gap-4">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-cyan-300"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          {t.backToBlog}
        </Link>
        <ShareButton title={post.title} url={postUrl} />
      </div>

      {/* ── Related ── */}
      {related.length > 0 && (
        <aside className="mx-auto mt-20 max-w-[920px]">
          <h2 className="mb-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            ━ {t.related}
          </h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group block h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/25"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/85">
                      {p.categories?.[0] ?? "post"}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                  </div>
                  <p className="mt-4 font-[family-name:var(--font-fraunces)] text-[18px] font-semibold leading-[1.2] tracking-[-0.01em] text-foreground transition-colors group-hover:text-cyan-100">
                    {p.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
