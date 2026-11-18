#!/usr/bin/env node
/**
 * Writes the braille figures used in the Etezad Research Lab article.
 *
 *   node scripts/braille-figures.mjs
 *
 * Every plate shares one pin pitch and one pin size, so the single cell and the
 * chained grids are drawn at the same scale: the grid really is that cell,
 * twelve times over.
 *
 * The pins are not decorative. The character plates come from the Grade 1 table
 * in ./braille.mjs, so each one says what it looks like it says; the pixel plates
 * take their pins directly, because there the dots are pixels, not letters.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { braillePlate, brailleCollage } from './braille.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/img');

/** Icons on the 8 x 8 grid, one character per pin. */
const ICONS = {
  heart: [
    '..#..#..',
    '.#.##.#.',
    '#......#',
    '#......#',
    '#......#',
    '.#....#.',
    '..#..#..',
    '...##...',
  ],
  plus: [
    '...##...',
    '...##...',
    '...##...',
    '########',
    '########',
    '...##...',
    '...##...',
    '...##...',
  ],
  minus: [
    '........',
    '........',
    '........',
    '########',
    '########',
    '........',
    '........',
    '........',
    '........',
  ],
  x: [
    '#......#',
    '.#....#.',
    '..#..#..',
    '...##...',
    '...##...',
    '..#..#..',
    '.#....#.',
    '#......#',
  ],
};

/** The pins to raise on the paired plate, ticked in public/_braille-tick.html. */
const RAISED = [
  '#..#..#.',
  '##..#.#.',
  '......#.',
  '........',
  '........',
  '........',
  '#..#....',
  '#...#.##',
  '#..#..#.',
];

/**
 * A plate used for pixel art: the whole 8 x 9 grid the display actually is,
 * bottom row included and left resting when the drawing does not reach it.
 */
const pixelPlate = (pattern, extra = {}) => ({
  cellsX: 4,
  cellsY: 3,
  dropBottomRow: false,
  pattern,
  pad: 96,
  ...extra,
});

const figures = [
  {
    file: 'braille-cell.svg',
    // One cell: a single character, six pins, the unit a display is built from.
    render: () => braillePlate({
      cellsX: 1,
      cellsY: 1,
      text: 'r',
      pad: 64,
      well: false,
      label: 'One braille cell on a small backplate: two columns of three pins. '
        + 'Pins one, two, three and five are raised, which is the letter r.',
    }),
  },
  {
    file: 'braille-grid-hi.svg',
    // The empty grid beside a grid with pins raised, so the pair reads as one
    // device shown twice: what it holds, and what it can hold.
    render: () => {
      const plate = (extra) => ({ cellsX: 4, cellsY: 3, pad: 96, ...extra });
      return brailleCollage({
        columns: 2,
        gap: 56,
        plates: [
          plate({ text: '            ' }),
          plate({ pattern: RAISED }),
        ],
        label: 'Two braille backplates side by side, each twelve cells set edge to edge — eight dots '
          + 'across and nine dots down. On the left every pin rests; on the right a pattern of pins '
          + 'is raised.',
      });
    },
  },
  {
    file: 'braille-icons.svg',
    // The same square grid four times over, as an icon set.
    render: () => brailleCollage({
      columns: 2,
      gap: 60,
      plates: ['heart', 'plus', 'minus', 'x'].map((name) => pixelPlate(ICONS[name], {
        pad: 60,
        well: false,
        dotR: 14,
        pitch: 48,
      })),
      label: 'Four eight by nine braille grids in a square, each drawing one icon in raised pins: '
        + 'a heart, a plus, a minus and an X.',
    }),
  },
];

mkdirSync(OUT, { recursive: true });

for (const { file, render } of figures) {
  const { svg, W, H } = render();
  writeFileSync(resolve(OUT, file), svg);
  console.log(`${file} — ${W}x${H}, ${(svg.length / 1024).toFixed(1)} kB`);
}
