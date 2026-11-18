/**
 * Single source of truth for site identity and chrome.
 * Nothing in the components hardcodes a name, URL or nav item.
 */

import { basePath } from './lib/site';

export const site = {
  name: 'Michael Bishai',
  role: 'Engineer',
  description:
    'Michael Bishai, interdisciplinary engineer in Los Angeles. Founder of wpm design; hardware, firmware, fabrication and assistive-technology research.',
  location: 'Los Angeles, California · PST',
  /** Absolute origin, used for canonical URLs and Open Graph tags. */
  url: 'https://example.com',
  email: 'michael@wpm.design',
} as const;

/** Fixed links in the top bar. Each collection has its own index route. */
export const primary = [
  { label: 'Work', href: basePath('/work/') },
  { label: 'Capabilities', href: basePath('/capabilities/') },
  { label: 'Experience', href: basePath('/experience/') },
  { label: 'Blog', href: basePath('/blog/') },
  { label: 'About', href: basePath('/about/') },
] as const;

/** Rendered in the footer. */
export const socials = [
  { label: 'Resume', href: 'https://michael.wpm.design/' },
  { label: 'GitHub', href: 'https://github.com/cdnmonitor' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michael-bishai-4b1a44195/' },
  { label: 'wpm.design', href: 'https://wpm.design/' },
] as const;
