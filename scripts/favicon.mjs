#!/usr/bin/env node
/**
 * Writes the site icon: the login glyph — a pixel-art head and shoulders in
 * lavender with a dark-plum shadow, on nothing.
 *
 *   node scripts/favicon.mjs
 *
 * Source: scripts/favicon-source.png (login2). It is a 16 x 16 grid of 100px
 * cells with exactly three colours, so the art is stored here as that grid and
 * drawn as rectangles rather than resampled as an image. Every edge is snapped
 * to a whole pixel at each output size, so the icon is crisp instead of soft —
 * which is the whole point of pixel art, and what a downscale destroys.
 *
 * The background is transparent, as it is in the source: the mark carries its
 * own dark shadow, which reads on a light tab and disappears into a dark one.
 * apple-touch is the exception — iOS paints transparency black, so that one is
 * flattened onto white.
 *
 * favicon.svg is the primary icon: same grid, one rect per run of cells, so a
 * browser that takes SVG gets exact pixels at any size.
 */

import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public');

const MARK = '#b3b3fc';
const SHADOW = '#555287';
const PAPER = '#ffffff';

/** 16 rows of 16: `.` empty, `#` mark, `:` shadow. Traced from the source. */
const GRID = [
  '................',
  '......:::.......',
  '.....:###:......',
  '....:#####:.....',
  '....:#####:.....',
  '....:#####:.....',
  '.....:###:......',
  '......:::.......',
  '.....:###:......',
  '....:#####:.....',
  '....:#####:.....',
  '...:#######:....',
  '...:#######:....',
  '...:#######:....',
  '....:::::::.....',
  '................',
];

const COLORS = { '#': MARK, ':': SHADOW };
const CELLS = GRID[0].length;

/** Horizontal runs of one colour, in cell coordinates. */
function runs() {
  const out = [];
  GRID.forEach((row, y) => {
    let x = 0;
    while (x < CELLS) {
      const ch = row[x];
      if (!COLORS[ch]) {
        x += 1;
        continue;
      }
      let end = x + 1;
      while (end < CELLS && row[end] === ch) end += 1;
      out.push({ color: COLORS[ch], x, y, w: end - x });
      x = end;
    }
  });
  return out;
}

/**
 * The art at `size` device pixels. Cell edges are rounded per edge, so shares
 * stay exact and every rectangle is a whole number of pixels wide.
 */
function svg(size, { background = null } = {}) {
  const u = size / CELLS;
  const px = (n) => Math.round(n * u);
  const rects = runs()
    .map((r) => `<rect x="${px(r.x)}" y="${px(r.y)}" width="${px(r.x + r.w) - px(r.x)}" height="${px(r.y + 1) - px(r.y)}" fill="${r.color}"/>`)
    .join('');

  const flat = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" `
    + `viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`
    + `${flat}${rects}</svg>`;
}

/** Render at an exact size — drawing, not resampling, so nothing softens. */
const png = async (size, opts) => sharp(Buffer.from(svg(size, opts)))
  .png({ compressionLevel: 9 })
  .toBuffer();

const sizes = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-48x48.png', size: 48 },
  { file: 'apple-touch-icon.png', size: 180, background: PAPER },
];

writeFileSync(resolve(OUT, 'favicon.svg'), `${svg(sizes[1].size)}\n`);
for (const { file, size, background } of sizes) {
  writeFileSync(resolve(OUT, file), await png(size, { background: background ?? null }));
}

try {
  execFileSync('convert', [
    resolve(OUT, 'favicon-16x16.png'),
    resolve(OUT, 'favicon-32x32.png'),
    resolve(OUT, 'favicon-48x48.png'),
    resolve(OUT, 'favicon.ico'),
  ]);
  console.log('wrote public/favicon.ico');
} catch {
  console.warn('no ImageMagick on PATH — skipped favicon.ico');
}

console.log(`wrote public/favicon.svg, ${sizes.map((s) => `public/${s.file}`).join(', ')}`);
