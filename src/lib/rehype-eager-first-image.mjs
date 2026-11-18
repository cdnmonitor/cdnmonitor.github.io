/**
 * The first image in a post is the lead image: it sits above the fold and is
 * usually the largest paint on the page, so lazy-loading it delays the one
 * thing the reader is waiting for. Markdown images are lazy by default; this
 * flips the first one to eager + high priority and leaves every other image
 * exactly as it was.
 */
export default function rehypeEagerFirstImage() {
  return (tree) => {
    let done = false;

    const walk = (node) => {
      if (done || !node || typeof node !== 'object') return;

      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = node.properties ?? {};
        node.properties.loading = 'eager';
        node.properties.fetchpriority = 'high';
        node.properties.decoding = 'async';
        done = true;
        return;
      }

      for (const child of node.children ?? []) walk(child);
    };

    walk(tree);
  };
}
