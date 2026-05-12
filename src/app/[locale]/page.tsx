import { setRequestLocale } from "next-intl/server";
import { getPostsMeta } from "@/lib/velite";
import { Hero } from "@/components/home/hero";
import { RecentPosts } from "@/components/home/recent-posts";
import { routing, type Locale } from "@/i18n/routing";

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const localePosts = getPostsMeta(locale);
  const recentPosts = localePosts.slice(0, 5);

  return (
    <>
      <Hero postCount={localePosts.length} />
      <RecentPosts posts={recentPosts} />
    </>
  );
}
