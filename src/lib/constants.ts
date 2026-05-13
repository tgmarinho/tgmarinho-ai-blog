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

export const navLinks = [
  { href: "/blog", key: "blog" },
  { href: "/daily", key: "daily" },
  { href: "/cv", key: "cv" },
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/community", key: "community" },
  { href: "/contact", key: "contact" },
] as const;
