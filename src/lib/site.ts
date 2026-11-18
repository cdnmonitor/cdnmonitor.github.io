/** Small shared helpers — one definition, used by every collection. */

/** Reading time from a markdown body, at ~220 words per minute. */
export function readingTime(body = ''): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min`;
}

/** 14 Mar 2026 — used on every post byline. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** 2026-03-14 — for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Site-relative path with the deploy base applied: '' when the site is served
 * from a domain root, '/markdown-portfolio' on a GitHub Pages project site
 * (astro.config passes the base through Vite, so BASE_URL is already resolved
 * here). Every route the templates emit goes through this, which is why no page
 * or content file has to know where the site is mounted.
 */
export function basePath(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
