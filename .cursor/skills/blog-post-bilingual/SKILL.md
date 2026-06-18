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

- `content/posts/2026-06-09-best-programming-language-for-llm-agents-en.mdx`
- `content/posts/2026-06-09-qual-a-melhor-linguagem-de-programacao-para-agentes-de-ia-pt-br.mdx`
- `content/posts/2026-06-07-the-harness-is-the-product-en.mdx`

## Output contract

Always create **2 files**:
1. One pt-BR file (`...-pt-br.mdx`)
2. One English file (`...-en.mdx`)

Both must:
- share the same `translationKey`
- keep equivalent section structure
- use localized title/description (not literal line-by-line translation)
- include contextual cover image in frontmatter
- keep equivalent tone, conclusion, and practical fix details

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

### Image text language (mandatory)

Any text embedded inside generated or selected blog images must be in English,
including covers, diagrams, OG images, and social previews, even for pt-BR posts.
Localize article copy and alt text, not the image text, unless the human explicitly
requests another language for the image itself.

### Image weight & format (mandatory)

Social previews (WhatsApp, Telegram, iMessage, X) silently drop OG images
above ~300 KB and fall back to the site favicon. To avoid that:

1. **Format:** prefer `.jpg` (quality 82–85) over `.png` for photographic /
   AI-generated covers. Only use `.png` when transparency is required.
2. **Dimensions:** exactly **1200×630** (1.91:1 OG ratio).
3. **Target size:** **< 300 KB** when possible. **Hard ceiling: 600 KB.**
4. After generating, verify with `ls -lh` and `sips -g pixelWidth -g pixelHeight`.
   If oversized, recompress:
   ```sh
   sips -z 630 1200 --setProperty format jpeg --setProperty formatOptions 85 \
     input.png --out public/images/blog/<slug>-cover.jpg
   ```
5. Never commit blog cover images larger than 600 KB.

### Blog image quality bar (mandatory)

Blog images must look like intentional editorial assets, not rough diagrams.
Before saving a cover or in-article diagram, apply this checklist:

1. **Prefer visual metaphor over text.** Use depth, light, paths, layers,
   objects, or composition to explain the idea. Text should support the visual,
   not carry the whole image.
2. **Keep in-image text minimal.** Cover images should usually have no more
   than 1 short headline or 3-5 short labels. In-article diagrams may use more
   labels only when they are essential to understand the architecture.
3. **Never put text on angled or perspective surfaces.** Text on 3D cubes,
   tilted planes, walls, device screens, or curved paths often looks cheap and
   becomes hard to read. Put labels on flat overlay cards, callouts, or captions
   instead.
4. **Do not let lines, edges, glows, or objects cross text.** Every label must
   remain readable at the displayed blog width, not only at full resolution.
5. **Avoid dense explanatory copy inside images.** Put explanations in the MDX
   body. The image should be scannable in 1-2 seconds.
6. **Use short English labels only.** Good examples: `DATABASE`, `API CALL`,
   `QUEUE`, `DISK`, `CPU mostly waiting`, `120 ms`. Avoid paragraphs, long
   subtitles, and localized text inside the image.
7. **Prefer polished 3D/isometric or editorial abstract visuals over wireframe
   boxes.** If using SVG/HTML/CSS, make it feel finished: clear hierarchy,
   restrained palette, proper spacing, soft shadows, consistent lighting, and
   no overlapping labels.
8. **Use the right tool for the asset.** Use image generation for rich bitmap
   covers, concept art, photoreal or 3D-style editorial visuals. Use SVG/HTML
   only for deterministic diagrams where text accuracy and precise layout matter.

### Technical diagrams and architecture images

For diagrams such as system architecture, I/O paths, agents, databases, or
network layers:

1. Start with a simple visual model: source -> application -> I/O targets.
2. Use shapes and paths to show flow. Use labels only for entities and key
   timings.
3. If using 3D/isometric blocks, keep text off the block faces. Place labels in
   flat HUD-style cards or below the object.
4. Keep each label visually independent. No label should overlap another object,
   connector, glow, grid line, or perspective edge.
5. Test the diagram both as a standalone image and inside the blog layout.
6. If the result looks amateur, busy, or text-heavy, simplify before finishing.

### Visual validation (mandatory)

After creating or editing a blog image:

1. Open or inspect the final JPG/PNG with the available image viewer.
2. Check at least these things:
   - no cropped objects
   - no overlapping text
   - no text crossed by perspective edges or connector lines
   - labels readable at blog display size
   - composition has a clear focal point
   - visual style matches the site's dark, cyan/magenta, agentic futurist look
3. If the image is used inside a post body, inspect it in the rendered page when
   a dev server is already running or easy to start.
4. Do not finish with "good enough" visuals. Iterate once when readability,
   composition, or polish is visibly weak.

## Localization rules

1. Translate meaning, not sentence shape.
2. Keep same narrative arc across both versions.
3. Preserve technical terms when standard (`RAG`, `MCP`, `typecheck`, etc.).
4. Adapt idioms and tone naturally for each language.
5. Define non-obvious acronyms on first use. Avoid acronym-only titles when a broader technical audience may not know the term. Prefer "Out Of Memory" over "OOM" in titles and first mentions, then use the acronym only when it improves readability.

## Writing style (non-negotiable)

1. **Never use em dashes (`—`) or en dashes (`–`) for emphasis or asides**, in either language. Restructure with a comma, colon, parentheses, or a period. Don't just swap `—` for a hyphen; rewrite so it reads naturally. The em dash is a recognizable LLM tell, and in 2026 readers carry a bias against it because AI overuses it; avoiding it keeps the prose from reading as machine-written.
2. **English content stays in plain English:** short sentences, common words, active voice. The pt-BR may be a touch more expressive; the EN stays simple.
3. **Professional, concise, direct tone:** less is more. Remove jokes, filler, "cute" phrasing, war-story padding, and sentences that do not add diagnosis, context, decision, or action.
4. **Debugging posts must show the applied fix:** state exactly what fixed or temporarily stabilized the issue. Include the relevant command, config, flag, or setting. Do not end with vague future plans unless the human explicitly asks for roadmap framing.

## SEO + GEO (search engines and AI engines)

Every post must be written to rank on Google **and** to be cited by AI engines
(ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews). The acronym for
the latter is **GEO** (Generative Engine Optimization); related terms are AEO
(Answer Engine Optimization) and LLMO. The repository already emits JSON-LD
`BlogPosting`, OpenGraph, hreflang, and `llms.txt`, so the leverage is in the
**copy itself**. Apply these four rules to both language versions:

1. **Answer-first opening.** The first paragraph must answer the title in 2-3
   sentences, standalone, no preamble. This is the passage AI engines quote and
   Google lifts as a snippet. Bury the lede and you lose the citation.
2. **Headings as questions.** Prefer `## How do you X?` / `## Como fazer X?`
   over noun-phrase headings. Matches voice search and AI Overview extraction.
3. **Bold the key term, not the sentence.** One `**term**` per paragraph, on the
   concept/entity (`**Server Components**`, `**RAG**`), never on a whole clause.
   AI engines treat bolded entities as extractable facts; more than ~2 per
   paragraph reads as keyword stuffing to Google. Bold the definition right after
   introducing a term (`**X** is ...` / `**X** é ...`), a pattern AEO favors.
4. **Extractable structure.** Use lists and tables for any enumerable content,
   and close with a short TL;DR / resumo. These formats are the easiest for LLMs
   to lift and reuse verbatim.

**Description field = meta description.** Write `description` at 150-160 chars,
leading with the primary keyword and an action verb. It is what Google shows and
what AI engines read as the summary. Keep `categories` tight and keyword-bearing:
they populate both the page `keywords` meta tag and the JSON-LD `keywords`.

## Workflow

```txt
- [ ] Define core thesis (one sentence)
- [ ] Define shared outline (4-8 sections)
- [ ] Write pt-BR version first
- [ ] Write English version with same structure
- [ ] Remove filler and make both versions professional, concise, and direct
- [ ] Define non-obvious acronyms on first use
- [ ] For debugging posts, include the exact applied fix or temporary mitigation
- [ ] Apply the four SEO+GEO rules (answer-first, question headings, key-term bold, extractable structure)
- [ ] Write keyword-bearing description (150-160 chars) and tight categories
- [ ] Create/generate contextual cover image
- [ ] Apply the blog image quality bar: minimal text, no text on perspective surfaces, no overlapping labels
- [ ] Convert cover to 1200×630 JPG, target under 300 KB and never above 600 KB
- [ ] Inspect the final image visually and iterate if it looks rough, busy, cropped, or hard to read
- [ ] Set same translationKey in both files
- [ ] Validate frontmatter fields and categories
- [ ] Save both files in content/posts/
- [ ] Run bun velite
```

## Naming conventions

Every file name starts with the post `date` (ISO `YYYY-MM-DD`), then the slug, then the language suffix. The date prefix keeps `content/posts/` sorted chronologically at a glance. The file name does **not** affect the URL slug (that comes from frontmatter), so the prefix is purely organizational.

Prefer:
- `YYYY-MM-DD-tema-do-post-pt-br.mdx`
- `YYYY-MM-DD-post-topic-en.mdx`

Both files of a bilingual pair use the **same date prefix** (they are the same article).

Avoid:
- a file without the date prefix
- mixed language slugs
- uppercase letters
- vague slugs like `new-post.mdx`

## One post per day (date rule)

Each calendar day holds **at most one article** (a bilingual pair counts as one, since both share a `translationKey`). This includes drafts (`published: false`): a draft still reserves its day.

Before setting `date`, pick a day that no other post already uses. Check with:

```sh
grep -rhoE '^date: "[0-9-]+"' content/posts | sort | uniq -d   # must print nothing
```

For a brand-new post, the simplest safe choice is the first free day at or after today. Both files of the pair get that same date, and both file names get that same `YYYY-MM-DD` prefix.

## Examples

See:
- [examples.md](examples.md)
