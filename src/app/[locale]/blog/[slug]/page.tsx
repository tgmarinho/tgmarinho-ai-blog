import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import readingTime from "reading-time";
import { allPosts as posts, type AnyPost as Post } from "@/lib/all-posts";
import { Link, redirect } from "@/i18n/navigation";
import { MdxContent } from "@/components/mdx/mdx-content";
import { ShareButton } from "@/components/mdx/share-button";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { siteConfig } from "@/lib/constants";
import { formatIsoDateForDisplay } from "@/lib/format-iso-date";
import { getPostLanguage, getTranslationPair } from "@/lib/posts-i18n";
import { extractToc } from "@/lib/toc";
import { routing, type Locale } from "@/i18n/routing";

export const revalidate = 3600;

interface PostPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

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

function getFormattedDate(date: string, locale: Locale) {
  return formatIsoDateForDisplay(
    date,
    locale === "pt-BR" ? "pt-BR" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function getRelatedPosts(post: Post) {
  if (!post.categories?.length) return [];
  const postLocale = getPostLanguage(post);
  return posts
    .filter(
      (c) =>
        c.published &&
        c.slug !== post.slug &&
        getPostLanguage(c) === postLocale &&
        c.categories?.some((cat) => post.categories.includes(cat))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

function buildBlogPath(locale: Locale, slug?: string) {
  const base = locale === "en" ? "/en/blog" : "/blog";
  return slug ? `${base}/${slug}` : base;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const postLocale = getPostLanguage(post);
  const pair = getTranslationPair(posts, post);
  const canonical = `${siteConfig.url}${buildBlogPath(postLocale, post.slug)}`;
  const imageUrl = getAbsoluteUrl(post.image);

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    const tr = pair[loc];
    if (tr) {
      languages[loc] = `${siteConfig.url}${buildBlogPath(loc, tr.slug)}`;
    }
  }

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: siteConfig.author }],
    alternates: { canonical, languages },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: canonical,
      siteName: siteConfig.name,
      locale: locale === "pt-BR" ? "pt_BR" : "en_US",
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
  };
}

export function generateStaticParams() {
  const params: Array<{ locale: Locale; slug: string }> = [];
  for (const post of posts) {
    if (!post.published) continue;
    const lang = getPostLanguage(post);
    params.push({ locale: lang, slug: post.slug });
  }
  return params;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const postLocale = getPostLanguage(post);
  const pair = getTranslationPair(posts, post);

  // If user is on a different locale than the post, redirect to the
  // translated version when available; otherwise fall through with a banner.
  if (postLocale !== locale) {
    const translated = pair[locale];
    if (translated) {
      redirect({ href: `/blog/${translated.slug}`, locale });
    }
  }

  const t = await getTranslations("blog.post");
  const stats = getReadingTime(post);
  const minutes = Math.ceil(stats.minutes);
  const readingTimeText = t("readingTime", { minutes });
  const postUrl = `${siteConfig.url}${buildBlogPath(postLocale, post.slug)}`;
  const imageUrl = getAbsoluteUrl(post.image);
  const related = getRelatedPosts(post);
  const translationInOtherLocale = pair[locale === "pt-BR" ? "en" : "pt-BR"];
  const showMissingBanner = postLocale !== locale && !pair[locale];
  const toc = extractToc(post.body || "");
  const tocLabel = t("onThisPage");
  const commentHref =
    post.tweetUrl ??
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      post.title
    )}&url=${encodeURIComponent(postUrl)}`;

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
    inLanguage: postLocale,
    timeRequired: `PT${minutes}M`,
  };

  return (
    <article
      lang={postLocale}
      className="relative mx-auto px-5 py-14 md:py-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${siteConfig.url}${postLocale === "en" ? "/en" : ""}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `${siteConfig.url}${buildBlogPath(postLocale)}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: postUrl,
              },
            ],
          }),
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(700px 380px at 50% 0%, rgba(34,211,238,0.08), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-[680px]">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-cyan-300"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          {t("back")}
        </Link>
      </div>

      {showMissingBanner && (
        <div className="mx-auto mt-6 max-w-[680px] rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-4 text-[13px] leading-relaxed text-cyan-100/90">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            ━ {t("translationMissingTitle")}
          </p>
          <p className="mt-2 text-muted-foreground">
            {t("translationMissingDescription")}
          </p>
        </div>
      )}

      <header className="mx-auto mt-10 max-w-[680px]">
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-5">
          <time
            dateTime={post.date}
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            {getFormattedDate(post.date, postLocale)}
          </time>

          {translationInOtherLocale && (
            <Link
              href={`/blog/${translationInOtherLocale.slug}`}
              locale={locale === "pt-BR" ? "en" : "pt-BR"}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md transition-colors hover:border-cyan-300/30 hover:text-cyan-200"
            >
              {t("readInOtherLocale")}
            </Link>
          )}
        </div>
      </header>

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

      {toc.length > 1 && (
        <aside
          aria-label={tocLabel}
          className="pointer-events-none fixed top-32 z-10 hidden w-[240px] xl:right-[max(1rem,calc((100vw-920px)/2-280px))] xl:block"
        >
          <div className="pointer-events-auto max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
            <TableOfContents items={toc} label={tocLabel} />
          </div>
        </aside>
      )}

      <div className="prose mx-auto mt-14 max-w-[680px]">
        <MdxContent code={post.body || ""} />
      </div>

      <div className="mx-auto mt-16 max-w-[680px]">
        <div className="mesh-divider" />
        <p className="mt-10 font-[family-name:var(--font-fraunces)] text-[15px] italic leading-relaxed text-muted-foreground">
          —{" "}
          <Link
            href="/about"
            className="text-foreground underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:decoration-cyan-300"
          >
            {siteConfig.author}
          </Link>
        </p>
        <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/80">
          {getFormattedDate(post.date, postLocale)} · {siteConfig.location}
        </p>
        <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/60">
          {t("aiDisclaimer")}
        </p>
      </div>

      <div className="mx-auto mt-12 flex max-w-[680px] flex-wrap items-center justify-between gap-4">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-cyan-300"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          {t("back")}
        </Link>
        <ShareButton title={post.title} url={postUrl} />
      </div>

      <aside className="mx-auto mt-16 max-w-[680px]">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-6 backdrop-blur-md md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(420px 200px at 100% 0%, rgba(34,211,238,0.10), transparent 60%)",
            }}
          />
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            ━ {t("commentKicker")}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-[24px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground md:text-[28px]">
            {t("commentTitle")}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {t("commentBody")}
          </p>
          <a
            href={commentHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-100 transition-all hover:border-cyan-300/50 hover:bg-cyan-300/15"
          >
            <FaXTwitter className="h-3 w-3" />
            {t("commentCta")}
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </aside>

      {related.length > 0 && (
        <aside className="mx-auto mt-20 max-w-[920px]">
          <h2 className="mb-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            ━ {t("related")}
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
