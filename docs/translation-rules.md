# Translation rules for bilingual blog posts

Use these when generating a translated MDX pair. The reference skill is `.cursor/skills/blog-post-bilingual/SKILL.md` (already-installed convention).

## Output

Create ONE new file alongside the original. Don't modify the original.

## Frontmatter

Both files share:
- `date` — identical
- `published: true`
- `translationKey` — identical (use the original's; never invent a new one)
- `image` — same path if the original has one (omit otherwise)

Per-language fields:
- `title`, `description` — translated naturally (adapt tone, not literal)
- `slug` — semantic, language-appropriate
- `language: "pt-BR"` or `language: "en"`
- `categories` — same as original, but the language tag swapped (`en` ↔ `pt-br`)

## Body

- Translate prose naturally — meaning, not sentence shape
- Keep code blocks intact (translate inline comments only when present)
- Keep links and images untouched
- Keep technical terms in English when standard: RAG, MCP, agent, prompt, hooks, props, generics, RSC, typecheck, query, pipeline, etc.
- Preserve heading hierarchy and section order

## Don't

- Don't add disclaimers, intro paragraphs, or sign-offs that weren't in the original
- Don't generate new images
- Don't commit
- Don't touch other posts
