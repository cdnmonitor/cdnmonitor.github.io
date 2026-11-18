/**
 * A markdown table needs two things a bare <table> cannot do at once: it has to
 * be able to scroll sideways when a phone cannot fit its columns, and it has to
 * sit centred against the reading column when it does fit.
 *
 * `overflow-x` only works on a box that is not the table itself, and the
 * `display: block` that would make a table scrollable throws away the table box
 * — the rows get wrapped in an anonymous shrink-to-fit table pinned to the left
 * edge of the band, so a short table hangs out to the left of the text column
 * with dead space on the right. Wrapping the table in a div keeps the table a
 * table and gives the scroll and the centring to the wrapper.
 */
export default function rehypeWrapTables() {
  return (tree) => {
    const walk = (node) => {
      const kids = node?.children;
      if (!Array.isArray(kids)) return;

      for (let i = 0; i < kids.length; i++) {
        const child = kids[i];

        if (child?.type === 'element' && child.tagName === 'table') {
          kids[i] = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'] },
            children: [child],
          };
          continue;
        }

        walk(child);
      }
    };

    walk(tree);
  };
}
