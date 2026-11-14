/**
 * Single source of truth for site identity and chrome.
 * Nothing in the components hardcodes a name, URL or nav item.
 */

export const site = {
  name: 'Michael Bishai',
  role: 'Engineer',
  description:
    'Michael Bishai — interdisciplinary engineer in Los Angeles. Selected work in software, CNC fabrication and hardware.',
  location: 'Los Angeles, California · PST',
  /** Absolute origin, used for canonical URLs and Open Graph tags. */
  url: 'https://example.com',
  email: 'michael@wpm.design',
} as const;

/** Fixed links in the top bar. Work is listed by its own index route. */
export const primary = [
  { label: 'Work', href: '/work/' },
  { label: 'About', href: '/about/' },
] as const;

/** Rendered in the footer. */
export const socials = [
  { label: 'GitHub', href: 'https://github.com/cdnmonitor' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michael-bishai-4b1a44195/' },
  { label: 'wpm.design', href: 'https://wpm.design/' },
] as const;
