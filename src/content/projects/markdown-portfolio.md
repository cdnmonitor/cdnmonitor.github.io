---
title: markdown-portfolio
summary: A portfolio whose pages are plain markdown files — Astro content collections, zero client JavaScript, one inlined stylesheet.
year: 2026
role: Design + engineering
tags:
  - Astro
  - Markdown
  - CSS
  - Static site
order: 1
---

This site is a directory of markdown files compiled into static HTML. There is
no database, no content API, no admin panel, and no client-side framework. A
project is a file; the file is the page.

## The premise

Every page that has words on it is authored in markdown:

- `src/content/projects/*.md` — one case study each, filename is the URL
- `src/content/pages/*.md` — standalone routes (`about.md` → `/about/`)
- `src/content/pages/home.md` — the home page's own copy

Frontmatter carries the metadata a template needs. The build validates it, so a
missing year or a malformed tag list fails at build time rather than shipping a
broken row.

```yaml
---
title: markdown-portfolio
summary: A portfolio whose pages are plain markdown files.
year: 2026
role: Design + engineering
tags: [Astro, Markdown, CSS]
---
```

## How a file becomes a page

The content layer is Astro's collection loader. `src/content.config.ts` declares
two collections and their schemas; `src/pages/work/[slug].astro` turns each
published project into `/work/<filename>/`. Nothing enumerates the projects by
hand — the register, the count in its header and the previous/next pager all
read the same sorted list.

| Route | Source | Built by |
| --- | --- | --- |
| `/` | `pages/home.md` + project list | `index.astro` |
| `/work/` | project list | `work/index.astro` |
| `/work/<slug>/` | `projects/<slug>.md` | `work/[slug].astro` |
| `/<slug>/` | `pages/<slug>.md` | `[...slug].astro` |

## What ships

One HTML request, one inlined stylesheet, and five subset font files that are
cached after the first page. The only JavaScript in the built site is the
inline block Astro emits for its own image handling — there are no event
listeners, no hydration directives and no analytics.

Motion is CSS only: a hover transition on each register row, and a short
staggered arrival capped under 600ms that is switched off entirely for
readers who ask for reduced motion.

## Deliberate omissions

- **No CMS.** Editing a case study is editing a file, which is the point.
- **No theme toggle.** The sheet is white and the ink is black; a second
  palette doubles the surface area of every decision for no gain.
- **No client-side search.** With a few dozen projects, the register is faster
  to scan than any index would be.

## What I would change

The one place markdown runs out is a page whose *shape* changes per section —
a two-column comparison, a figure with a caption, a grid of cards. Those are
layout decisions the template owns, not the author. The next version adds a
small set of block types to the markdown dialect so a case study can compose
its own page without a developer touching a `.astro` file.
