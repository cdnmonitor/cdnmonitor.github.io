// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Fully static: no SSR adapter, no server runtime.
  output: 'static',

  // No client-side JS anywhere on this site.
  prefetch: false,

  build: {
    // One stylesheet, inlined into the HTML — no render-blocking round trip.
    inlineStylesheets: 'always',
  },

  compressHTML: true,

  markdown: {
    // Shiki paints a dark, multi-colour block into a black-and-white page.
    // Code is plain text styled by `.prose pre` in global.css.
    syntaxHighlight: false,
  },

  trailingSlash: 'ignore',
});
