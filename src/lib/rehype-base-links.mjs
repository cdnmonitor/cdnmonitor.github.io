/**
 * Markdown links and images are authored root-absolute (`/work/`, `/img/x.svg`)
 * because that is how they read. A GitHub Pages project site is served from a
 * sub-path, so every one of them would 404 unless it carries the deploy base.
 *
 * Astro prefixes the URLs it generates itself; these are literals in the
 * source, so they are prefixed here — once, in the pipeline, instead of in
 * every content file. The base is passed in by astro.config (the config is
 * loaded by Node, where import.meta.env is not available), and an empty base
 * makes the plugin a no-op, which is the local-root build.
 */
const EXTERNAL = /^(\/\/|#|[a-z][a-z0-9+.-]*:)/i;

export default function rehypeBaseLinks(base = '/') {
  const prefix = base.replace(/\/$/, '');
  if (!prefix) return () => {};

  return (tree) => {
    const walk = (node) => {
      if (node?.type === 'element' && node.properties) {
        for (const attr of ['href', 'src']) {
          const value = node.properties[attr];
          if (typeof value !== 'string' || !value.startsWith('/')) continue;
          if (EXTERNAL.test(value) || value.startsWith(`${prefix}/`)) continue;
          node.properties[attr] = `${prefix}${value}`;
        }
      }

      for (const child of node?.children ?? []) walk(child);
    };

    walk(tree);
  };
}
