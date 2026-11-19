import { getCollection, type CollectionEntry } from 'astro:content';
import { basePath } from './site';

export type Project = CollectionEntry<'projects'>;
/* ---------- path helpers: the entry id IS the url path ---------- */

export const projectPath = (project: Project) => basePath(`/projects/${project.id}/`);

/* ---------- ordering ---------- */

/** Newest first, then the author's explicit order, then title. */
const byRecency = (a: Project, b: Project) =>
  b.data.year - a.data.year ||
  (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER) ||
  a.data.title.localeCompare(b.data.title);

/**
 * Every published project, in register order. The only place the collection
 * is read for listing, so the home page, /work and the pager cannot disagree.
 */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  return projects.sort(byRecency);
}

/** The project before and after this one in the register. */
export function neighbours(projects: Project[], project: Project) {
  const index = projects.findIndex((p) => p.id === project.id);
  return {
    prev: index > 0 ? projects[index - 1] : null,
    next: index >= 0 && index < projects.length - 1 ? projects[index + 1] : null,
  };
}
