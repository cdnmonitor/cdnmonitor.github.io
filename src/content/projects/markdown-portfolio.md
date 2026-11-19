---
title: markdown-portfolio
summary: 'A portfolio whose pages are plain markdown files: Astro content collections, one inlined stylesheet, and a router that animates navigation.'
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

- `src/content/projects/*.md`: one case study each, filename is the URL
- `src/content/pages/*.md`: standalone routes (`contact.md` → `/contact/`)
- `src/content/pages/home.md`: the home page's own copy

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
two collections and their schemas; `src/pages/projects/[slug].astro` turns each
published project into `/projects/<filename>/`. Nothing enumerates the projects by
hand. The register, the count in its header and the previous/next pager all read
the same sorted list.

| Route | Source | Built by |
| --- | --- | --- |
| `/` | `pages/home.md` + project list | `index.astro` |
| `/projects/` | project list | `projects/index.astro` |
| `/projects/<slug>/` | `projects/<slug>.md` | `projects/[slug].astro` |
| `/<slug>/` | `pages/<slug>.md` | `[...slug].astro` |

## What ships

One HTML request, one inlined stylesheet, and four subset font files that are
cached after the first page. The script is Astro's own router, about 13 kB,
which fetches the next page and swaps it in the same document inside
`document.startViewTransition`. That is what makes navigation animate without a
framework. Hovering a link fetches that page's HTML before the click, so the
swap has the document already in hand; that is another kilobyte. Venture pages
carry roughly 300 bytes more: on the way out, that script names the register row
you are returning to, because only the document being left still knows which
article it was. Remove all three and every link still works, just instantly.

Photographs are the only thing here that can be heavy, so they do the work:
every image in the body is served from a srcset with a sizes hint, so a phone
fetches a 640 wide file where a desktop fetches 1280, and the first image in an
article loads eagerly at high priority because it is usually the largest thing
on the page. The home page's portrait tops out at 800 pixels wide and 74 kB. It
is displayed at 280.

Motion is CSS: a hover transition on each register row, a short staggered
arrival capped under 600ms, and the page transition itself: the row you click
lifts away, the article head rises in behind it, the body follows, and the back
link plays the same three beats in reverse, ending with the register row
settling into place. All of it is off for readers who ask for reduced motion.

## Deliberate omissions

- **No CMS.** Editing a case study is editing a file, which is the point.
- **No theme toggle.** The sheet is white and the ink is black; a second
  palette doubles the surface area of every decision for no gain.
- **No client-side search.** With a few dozen projects, the register is faster
  to scan than any index would be.

## What I would change

The one place markdown runs out is a page whose *shape* changes per section:
a two-column comparison, a figure with a caption, a grid of cards. Those are
layout decisions the template owns, not the author. The next version adds a
small set of block types to the markdown dialect so a case study can compose
its own page without a developer touching a `.astro` file.
