import { siteConfig } from "@/lib/constants";
import { localizedUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

/**
 * Stable `@id`s so every JSON-LD node can cross-reference the same entities
 * (Person ↔ Organization ↔ WebSite) instead of emitting disconnected blocks.
 * This is what lets search + answer engines resolve one knowledge-graph entity
 * for "Thiago Marinho" across the whole site.
 */
export const PERSON_ID = `${siteConfig.url}/#person`;
export const ORG_ID = `${siteConfig.url}/#organization`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;
const LOGO_ID = `${siteConfig.url}/#logo`;

const sameAs = [
  siteConfig.links.github,
  siteConfig.links.twitter,
  siteConfig.links.linkedin,
  siteConfig.links.youtube,
  siteConfig.links.discord,
];

const KNOWS_ABOUT = [
  "Artificial Intelligence",
  "AI Agents",
  "Retrieval-Augmented Generation",
  "Large Language Models",
  "Full-Stack Development",
  "Next.js",
  "React",
  "React Native",
  "TypeScript",
  "Node.js",
  "Product Engineering",
  "Spec-Driven Development",
  "Web3",
];

export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: siteConfig.author,
    alternateName: siteConfig.username,
    url: siteConfig.url,
    email: `mailto:${siteConfig.email}`,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    image: `${siteConfig.url}${siteConfig.defaultOgImage}`,
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ["pt-BR", "en"],
    address: { "@type": "PostalAddress", addressCountry: "BR" },
    worksFor: { "@id": ORG_ID },
    sameAs,
  };
}

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.shareDescription,
    logo: {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: `${siteConfig.url}${siteConfig.defaultOgImage}`,
    },
    image: { "@id": LOGO_ID },
    founder: { "@id": PERSON_ID },
    sameAs,
  };
}

export function websiteNode(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.shareDescription,
    inLanguage: locale,
    publisher: { "@id": PERSON_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${localizedUrl(locale, "/blog")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function profilePageNode(
  locale: Locale,
  path: string,
  { name, description }: { name: string; description: string },
) {
  const url = localizedUrl(locale, path);
  return {
    "@type": "ProfilePage",
    "@id": `${url}#profilepage`,
    url,
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
  };
}

export function faqPageNode(faqs: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbNode(
  locale: Locale,
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: localizedUrl(locale, item.path),
    })),
  };
}

/** Wrap one or more schema nodes in a single `@graph` document. */
export function jsonLdGraph(nodes: ReadonlyArray<Record<string, unknown>>) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
