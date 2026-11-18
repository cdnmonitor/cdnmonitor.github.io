import { getCollection, type CollectionEntry } from 'astro:content';
import { basePath } from './site';

export type Experience = CollectionEntry<'experience'>;

/* ---------- path helper: the entry id IS the url path ---------- */

/** `experience/wpm-design.md` -> `/experience/wpm-design/`. */
export const experiencePath = (experience: Experience) => basePath(`/experience/${experience.id}/`);

/* ---------- ordering ---------- */

const byOrder = (a: Experience, b: Experience) =>
  a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

/**
 * Every published experience, in display order. The only place the collection is
 * read for listing, so the home page, /experience/ and the pager cannot disagree.
 */
export async function getExperiences(): Promise<Experience[]> {
  const experiences = await getCollection('experience', ({ data }) => !data.draft);
  return experiences.sort(byOrder);
}

/** The experience before and after this one in the register. */
export function experienceNeighbours(experiences: Experience[], experience: Experience) {
  const index = experiences.findIndex((v) => v.id === experience.id);
  return {
    prev: index > 0 ? experiences[index - 1] : null,
    next: index >= 0 && index < experiences.length - 1 ? experiences[index + 1] : null,
  };
}
