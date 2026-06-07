# Examples — Bilingual Blog Post Pair

## Example 1: visual identity post

PT file:
- `content/posts/2026-05-07-nova-identidade-visual-website-blog-pt-br.mdx`

EN file:
- `content/posts/2026-05-07-new-website-visual-identity-agentic-futurism-en.mdx`

Shared:
- `translationKey: "new-website-visual-identity-agentic-futurism"`
- same section progression:
  - problem
  - direction
  - palette
  - typography
  - primitives
  - outcomes
  - next steps

## Example 2: frontmatter pair template

PT-BR:

```yaml
---
title: "Como eu estruturo contexto para agentes de IA"
description: "Um framework prático para reduzir ambiguidade e aumentar previsibilidade em times que desenvolvem com agentes."
date: "2026-05-07"
published: true
slug: "como-eu-estruturo-contexto-para-agentes-de-ia-pt-br"
language: "pt-BR"
translationKey: "structured-context-for-ai-agents"
categories: ["ai", "software-engineering", "pt-br"]
---
```

EN:

```yaml
---
title: "How I structure context for AI agents"
description: "A practical framework to reduce ambiguity and improve delivery predictability for teams building with AI agents."
date: "2026-05-07"
published: true
slug: "how-i-structure-context-for-ai-agents-en"
language: "en"
translationKey: "structured-context-for-ai-agents"
categories: ["ai", "software-engineering", "en"]
---
```

## Example 3: localization quality check

- ✅ PT-BR natural: "não foi só um refresh visual"
- ✅ EN natural: "this was not just a visual refresh"
- ❌ Avoid literal translation that sounds robotic in one language

## Anti-patterns

- Different `translationKey` across language versions
- Same slug for both languages
- Different section order between PT and EN (without reason)
- Categories missing `pt-br` or `en`
