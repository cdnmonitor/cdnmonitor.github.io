import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * A PROJECT is one markdown file in src/content/projects/.
 * The filename is the URL: `projects/type65.md` becomes `/work/type65/`.
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

export const collections = { projects, pages };
