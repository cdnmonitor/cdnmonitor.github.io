# markdown-portfolio

A portfolio site built from Markdown files. No CMS, no database, no client-side
JavaScript: every page with words on it is a file in `src/content/`, compiled to
static HTML by [Astro](https://astro.build).

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 5, `output: 'static'` |
| Content | Astro content collections (`glob` loader, zod-validated frontmatter) |
| Styling | Hand-written CSS, one inlined stylesheet per page |
| Type | Geist (reading) + Iosevka Charon Mono (labels), self-hosted subsets |
| Client JS | none — `document.scripts.length === 0` on every route |

## Layout

```
markdown-portfolio/
├── src/
│   ├── content/
│   │   ├── projects/        # one case study per file → /work/<filename>/
│   │   └── pages/           # standalone routes → /<filename>/ (home.md is the home page)
│   ├── pages/               # routes: index, projects/, experience/, skills/, [...slug], 404
│   ├── components/          # Row — one register row, used by work and writing
│   ├── layouts/             # BaseLayout — head, header, footer
│   ├── lib/                 # projects.ts, experience.ts (read + order), site.ts (shared helpers)
│   ├── styles/              # theme.css (tokens), fonts.css (@font-face), global.css
│   ├── content.config.ts    # collection schemas
│   └── site.config.ts       # name, email, nav, socials, canonical origin
├── public/
│   ├── fonts/               # subset woff2 (checked in — no font requests to a CDN)
│   ├── favicon.svg          # the mark: the 16x16 login glyph, drawn as rects
│   ├── favicon.ico          # same grid, for browsers that still probe for it
│   ├── favicon-16x16.png    # and at the three PNG sizes they ask for
│   ├── favicon-32x32.png
│   ├── favicon-48x48.png
│   └── apple-touch-icon.png # 180px home-screen icon, flattened onto white
├── scripts/                 # favicon.mjs draws the icons; favicon-source.png is the art
└── astro.config.mjs
```

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static output in dist/
pnpm preview    # serve dist/
pnpm check      # astro check — types + content schemas
pnpm favicon    # redraw public/favicon*.svg + the two PNG icons
```

Node 20.3+ (or 22) is required. This repo uses pnpm 12; build approvals for
`esbuild` and `sharp` live in `pnpm-workspace.yaml`.

## Adding a project

Create `src/content/projects/<slug>.md`. The filename is the URL:
`type65.md` → `/work/type65/`.

```yaml
---
title: Type65
summary: One line that shows in the register and under the title.
year: 2026
role: Design + firmware
tags: [QMK, KiCad, CNC]
order: 1          # optional: sort within the year
link: https://example.com   # optional: shown at the foot of the page
draft: false      # true hides it from the build
---

Body in plain markdown: headings, lists, tables, code, images.
```

Nothing else to edit — the register, the project count, the previous/next pager
and the build output all derive from the files on disk. A project with `draft:
true` is skipped everywhere.

A colocated image (`![alt](./photo.png)` next to the markdown file) goes through
Astro's asset pipeline: WebP, hashed URL, intrinsic width/height. A leading-slash
path (`/img/photo.png`) is copied from `public/` untouched.

Data tables wider than the reading measure break out to the page width
automatically — no markup needed.

## Adding a page

`src/content/pages/<slug>.md` → `/<slug>/`. `home.md` is the home page's copy
(frontmatter `heading` is the display line; the body is the lede). Pages use
`title`, optional `heading` and `summary`.

## Where to change things

- **Site identity, nav, socials, canonical origin** — `src/site.config.ts`.
  Set `site.url` to the real domain before deploying; it feeds canonical and
  Open Graph URLs.
- **Colour, type scale, measure, radii, motion tokens** — `src/styles/theme.css`.
  One shell (`--shell: 64rem`) and one gutter (`--wide-pad`) set every edge;
  the reading measure is `--measure: 36rem`.
- **Anything structural** — `src/styles/global.css` (shell, hero, register,
  article, prose, pager, print) and the route files.

## Deploy

Static output, so any host works. On Cloudflare Pages / Netlify / Vercel:

- build command: `pnpm build`
- output directory: `dist`
- Node 22

No environment variables and no runtime.

## Not built yet

- Composed page layouts driven from markdown (figures, galleries, columns) —
  today a case study's shape is the template's, not the author's.
- RSS/sitemap (`@astrojs/sitemap`) once the canonical domain is set.
- A print stylesheet for a résumé route.
