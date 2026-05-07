---
name: blog-post-bilingual
description: Creates a bilingual blog post pair (pt-BR + en) for this repository with mirrored structure, localized copy, correct frontmatter, and shared translationKey. Compatible with Cursor, Claude Code, and Pi.dev. Use when the user asks for posts in both Portuguese and English.
disable-model-invocation: true
---

# Bilingual Blog Post Pair (pt-BR + en)

Use this skill when the user asks for the same article in both languages.

## Agent compatibility

This skill is intentionally agent-agnostic and can be used by:
- Cursor
- Claude Code
- Pi.dev

Execution policy:
1. If the current agent can generate images directly, generate the cover image.
2. If it cannot generate images, ask for image creation in the current platform flow and keep the same art direction prompt.
3. Always finish with `image` filled in both frontmatters.

## Reference baseline (3 latest posts)

- `content/posts/new-website-visual-identity-agentic-futurism-en.mdx`
- `content/posts/nova-identidade-visual-website-blog-pt-br.mdx`
- `content/posts/tenho-mais-medo-do-arrependimento-do-que-de-quebrar-a-cara.mdx`

## Output contract

Always create **2 files**:
1. One pt-BR file (`...-pt-br.mdx`)
2. One English file (`...-en.mdx`)

Both must:
- share the same `translationKey`
- keep equivalent section structure
- use localized title/description (not literal line-by-line translation)
- include contextual cover image in frontmatter

## Frontmatter rules

PT-BR:

```yaml
language: "pt-BR"
categories: ["...", "...", "pt-br"]
```

EN:

```yaml
language: "en"
categories: ["...", "...", "en"]
```

Shared:
- `date`, `published`, `translationKey`
- semantic `slug` variants per language
- `image` (same cover path by default, unless user requests different images per language)

## Cover image is mandatory

Always ask to create (or generate) a cover image based on the blog post context.

Default behavior:
1. Generate one shared image for the bilingual pair.
2. Save asset in `public/images/` with semantic filename.
3. Use the same `image` path in pt-BR and EN frontmatter.
4. Only use separate images if the user explicitly asks.

## Localization rules

1. Translate meaning, not sentence shape.
2. Keep same narrative arc across both versions.
3. Preserve technical terms when standard (`RAG`, `MCP`, `typecheck`, etc.).
4. Adapt idioms and tone naturally for each language.

## Workflow

```txt
- [ ] Define core thesis (one sentence)
- [ ] Define shared outline (4-8 sections)
- [ ] Write pt-BR version first
- [ ] Write English version with same structure
- [ ] Create/generate contextual cover image
- [ ] Set same translationKey in both files
- [ ] Validate frontmatter fields and categories
- [ ] Save both files in content/posts/
- [ ] Run npm run velite
```

## Naming conventions

Prefer:
- `tema-do-post-pt-br.mdx`
- `post-topic-en.mdx`

Avoid:
- mixed language slugs
- uppercase letters
- vague slugs like `new-post.mdx`

## Examples

See:
- [examples.md](examples.md)
