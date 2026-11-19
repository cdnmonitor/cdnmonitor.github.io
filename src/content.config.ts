import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * A PROJECT is one markdown file in src/content/projects/.
 * The filename is the URL: `projects/type65.md` becomes `/projects/type65/`.
 * Frontmatter is the metadata that appears in the register; the body is the
 * case study itself.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One line, shown in the register and under the title on the page. */
    summary: z.string(),
    /** Year of completion; also the default sort key. */
    year: z.number().int().min(2000).max(2100),
    /** What the work was — "Design + firmware", "Machining", etc. */
    role: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** Sort within a year. Lower first; defaults to alphabetical by title. */
    order: z.number().optional(),
    /** Hidden from the register and the build when true. */
    draft: z.boolean().default(false),
    /** External link shown at the foot of the case study. */
    link: z.string().url().optional(),
    /** What that link says. Defaults to "Visit". */
    linkLabel: z.string().optional(),
  }),
});

/**
 * A POST is one markdown file in src/content/posts/.
 * Filename is the URL: `posts/homelab.md` -> `/blog/homelab/`.
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /** Publication date; also the sort key. */
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    /** Optional one-line standfirst override (defaults to summary). */
    standfirst: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * A PAGE is a standalone route: src/content/pages/about.md -> `/about/`.
 * The id `home` is special-cased: it is the home page's copy, not a route.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    /** The display line; may differ from the <title>. */
    heading: z.string().optional(),
    /** Meta description + the line under the heading. */
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * AN EXPERIENCE is one markdown file in src/content/experience/: a company or lab
 * with its own article at /experience/<file name>/. The frontmatter is what the
 * register and the article header need; the body is the article itself.
 */
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    title: z.string(),
    /** One line, shown in the register and under the title on the article. */
    summary: z.string(),
    /** The role, in the meta voice: "Founder · engineer". */
    role: z.string(),
    /** Years as printed on the right of the register row: "2020 —". */
    years: z.string(),
    /** The one place a reader can still find the company, if anywhere. */
    link: z.string().url().optional(),
    /** What that link says. Defaults to "Visit". */
    linkLabel: z.string().optional(),
    /** Display order, lowest first. */
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

/**
 * A CAPABILITY is one markdown file in src/content/capabilities/: a discipline
 * the shop actually covers. It has no route of its own — /skills/ renders
 * them all in order — so the frontmatter is what that page's entry line needs
 * and the body is the claim plus links to the work that proves it.
 */
const capabilities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/capabilities' }),
  schema: z.object({
    title: z.string(),
    /** One line under the title: what this discipline actually delivers. */
    summary: z.string(),
    /** Display order, lowest first. */
    order: z.number().default(0),
    /** Image file beside this markdown, printed to the right of the entry. */
    image: z.string().optional(),
    /** What that image shows. Required in practice whenever `image` is set. */
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, posts, pages, experience, capabilities };

