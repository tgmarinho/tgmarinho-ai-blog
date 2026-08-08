import { featureFlags, type FeatureFlag } from "@/lib/feature-flags";

export const siteConfig = {
  name: "Thiago Marinho",
  username: "tgmarinho",
  url: "https://tgmarinhopro.com",
  description:
    "AI Product Engineer | 10+ Years Full-Stack Developer | Building AI-driven solutions | TypeScript, React, React Native, Node.js | Spec Driven Development | LLMs, RAG, AI Agents",
  /** Open Graph / WhatsApp / X — short, human-readable share card (not keyword-stuffed) */
  shareTitle: "Thiago Marinho · AI Product Engineer",
  shareDescription:
    "Personal site and technical blog on AI agents, product engineering, and full-stack development. CV, projects, and community.",
  /** Root OG image — same-origin URL for reliable link previews (612×408) */
  defaultOgImage: "/images/hero/portrait-hybrid-v2-removebg.png",
  author: "Thiago Marinho",
  email: "tgmarinho@gmail.com",
  role: "AI Product Engineer",
  location: "Brazil",
  yearsOfExperience: 12,
  /** Google Analytics 4 measurement ID (loaded only in production) */
  gaId: "G-TQ5YYYZN87",
  links: {
    github: "https://github.com/tgmarinho",
    twitter: "https://twitter.com/tgmarinho",
    linkedin: "https://linkedin.com/in/tgmarinho",
    discord: "https://discord.gg/kznGvgV7aA",
    youtube: "https://youtube.com/@tgmarinho",
  },
  newsletter: {
    provider: "buttondown",
    url: "https://buttondown.email/tgmarinho",
  },
};

export type NavLink = {
  href: string;
  key: string;
  featureFlag?: FeatureFlag;
};

export const navLinks = [
  { href: "/about", key: "about" },
  { href: "/cv", key: "cv" },
  { href: "/projects", key: "projects" },
  { href: "/ask", key: "ask", featureFlag: "ask" },
  { href: "/blog", key: "blog" },
  { href: "/daily", key: "daily" },
  { href: "/community", key: "community" },
  { href: "/contact", key: "contact" },
] as const satisfies readonly NavLink[];

function isNavLinkEnabled(link: NavLink): boolean {
  return link.featureFlag ? featureFlags[link.featureFlag] : true;
}

export function getEnabledNavLinks(): readonly NavLink[] {
  return navLinks.filter(isNavLinkEnabled);
}
