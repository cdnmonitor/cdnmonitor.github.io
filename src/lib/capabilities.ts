import { getCollection, type CollectionEntry } from 'astro:content';

export type Capability = CollectionEntry<'capabilities'>;

/**
 * Every capability, in display order: the author's `order` first, then the
 * title. Capabilities have no route of their own, so this is the only place the
 * collection is read.
 */
export async function getCapabilities(): Promise<Capability[]> {
  const capabilities = await getCollection('capabilities', ({ data }) => !data.draft);
  return capabilities.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}
