import { defineConfig, defineCollection, s } from "velite";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(200),
      description: s.string().max(999).optional(),
      date: s.isodate(),
      published: s.boolean().default(true),
      slug: s.string().optional(),
      language: s.enum(["pt-BR", "en"]),
      translationKey: s.string().min(1),
      categories: s.array(s.string()).default([]),
      image: s.string().optional(),
      body: s.markdown(), // Changed from mdx to markdown to fix compilation issues
    })
    .transform((data) => {
      const slug =
        data.slug ??
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      return {
        ...data,
        slug,
        slugAsParams: slug,
        plainBody: data.body
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      };
    }),
});

const journal = defineCollection({
  name: "JournalEntry",
  pattern: "journal/**/*.md",
  schema: s
    .object({
      title: s.string().max(200),
      summary: s.string().max(240),
      date: s.isodate(),
      repos: s.array(s.string()).default([]),
      commits: s.number().int().nonnegative().optional(),
      sessions: s.number().int().nonnegative().optional(),
      language: s.enum(["pt-BR", "en"]).default("pt-BR"),
      body: s.markdown(),
    })
    .transform((data, { meta }) => {
      // Derive slug from filename (expected: YYYY-MM-DD.md)
      const filename = meta.path.split("/").pop() ?? "";
      const slug = filename.replace(/\.md$/i, "");
      const url =
        data.language === "en" ? `/en/daily/${slug}` : `/daily/${slug}`;
      return {
        ...data,
        slug,
        url,
        plainBody: data.body
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      };
    }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts, journal },
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          defaultLang: "plaintext",
        },
      ],
    ],
  },
  mdx: {
    // Disable strict validation to allow posts with invalid JSX/JS
    jsx: true,
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          defaultLang: "plaintext",
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
  },
});
