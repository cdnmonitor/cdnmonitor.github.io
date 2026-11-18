// @ts-check
import { defineConfig } from 'astro/config';
import rehypeEagerFirstImage from './src/lib/rehype-eager-first-image.mjs';
import rehypeWrapTables from './src/lib/rehype-wrap-tables.mjs';
import rehypeBaseLinks from './src/lib/rehype-base-links.mjs';

// Where the site is mounted. Local preview and the Tailscale preview serve the
// domain root; the GitHub Pages project site is served from /<repo>/, so the
// deploy workflow sets SITE_BASE. Every route and every root-absolute link is
// generated through BASE_URL, so no content or template hardcodes either case.
const base = process.env.SITE_BASE ?? '/';

// Absolute origin for canonical and Open Graph URLs. Overridden per deploy.
const site = process.env.SITE_URL ?? 'https://example.com';

export default defineConfig({
  site,
  base,

  // Fully static: no SSR adapter, no server runtime.
  output: 'static',

  // Hovering a link fetches its HTML before the click, so the router swaps a
  // document it already holds. Hover only — never on viewport — so a page with
  // a lot of links does not pull the whole site.
  prefetch: {
    prefetchAll: true,
  },

  build: {
    // One stylesheet, inlined into the HTML — no render-blocking round trip.
    inlineStylesheets: 'always',
  },

  compressHTML: true,

  image: {
    // Markdown images get a srcset and a sizes hint instead of one fixed file,
    // and an explicit height:auto so their box is reserved before they load.
    layout: 'constrained',
    responsiveStyles: true,
  },

  markdown: {
    // Shiki paints a dark, multi-colour block into a black-and-white page.
    // Code is plain text styled by `.prose pre` in global.css.
    syntaxHighlight: false,

    // The lead image of an article should not wait for the reader to scroll.
    // Tables get a scroll wrapper so they can break out to the shell width and
    // still centre when their columns are narrower than that band. Root-absolute
    // links written in markdown get the deploy base.
    rehypePlugins: [rehypeEagerFirstImage, rehypeWrapTables, [rehypeBaseLinks, base]],
  },

  trailingSlash: 'ignore',

  server: {
    // Dev and preview reject requests whose Host header is not recognised
    // (403 "Blocked request"). Allow tailnet names so the site can be viewed
    // from a phone over Tailscale: http://<machine>.<tailnet>.ts.net:4321/.
    // The bare short name resolves too (MagicDNS), and its Host header carries
    // no dot, so it does not match '.ts.net' — list it explicitly.
    allowedHosts: ['.ts.net', 'wpm-home', 'wpmhome'],
  },
});
