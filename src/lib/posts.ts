import { getCollection, type CollectionEntry } from 'astro:content';
import { basePath } from './site';

export type Post = CollectionEntry<'posts'>;

/** Filename is the URL: `posts/homelab.md` -> `/blog/homelab/`. */
export const postPath = (post: Post) => basePath(`/blog/${post.id}/`);

/** Newest first. The only place posts are read for listing. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title));
}

export function postNeighbours(posts: Post[], post: Post) {
  const index = posts.findIndex((p) => p.id === post.id);
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
  };
}
