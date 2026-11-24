#!/usr/bin/env node
/**
 * Writes the site icon from the photograph of the green m — the object as shot,
 * shadow and all.
 *
 *   node scripts/favicon.mjs
 *
 * Source: scripts/favicon-source.png. It is cropped once, here, to the print
 * plus its shadow with an even margin, squared off on white, then resampled to
 * every size a browser asks for.
 *
 * Two things were tried, and both are worth knowing before anyone "cleans this
 * up":
 *
 *   - A flat traced silhouette holds its edges at 16px, but it is a different
 *     drawing: without the shading it stops reading as a printed part.
 *   - The photograph survives 16px better than expected, because the object is
 *     a solid green mass on white. The shadow goes soft; the silhouette does
 *     not. The small sizes get a light unsharp to keep the edge.
 *
 * There is no SVG: a photograph has no vector form, so this set is raster only,
 * and favicon.ico is there for the browsers that still probe for it.
 */

import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public');
const SOURCE = resolve(ROOT, 'scripts/favicon-source.png');

const PAPER = { r: 255, g: 255, b: 255 };

/** Crop to the object plus its shadow, with a margin, on a square canvas. */
async function framed() {
  const { data, info } = await sharp(SOURCE)
    .flatten({ background: PAPER })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let x0 = width;
  let y0 = height;
  let x1 = 0;
  let y1 = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      // anything that is not the white paper — the shadow counts
      if (Math.min(data[i], data[i + 1], data[i + 2]) < 250) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }

  const side = Math.round(Math.max(x1 - x0, y1 - y0) * 1.18);
  const left = Math.round((x0 + x1) / 2 - side / 2);
  const top = Math.round((y0 + y1) / 2 - side / 2);

  // pad rather than crop where the square runs off the photo
  const padLeft = Math.max(0, -left);
  const padTop = Math.max(0, -top);
  const padRight = Math.max(0, left + side - width);
  const padBottom = Math.max(0, top + side - height);

  return sharp(SOURCE)
    .flatten({ background: PAPER })
    .extend({ left: padLeft, top: padTop, right: padRight, bottom: padBottom, background: PAPER })
    .extract({ left: left + padLeft, top: top + padTop, width: side, height: side })
    .png()
    .toBuffer();
}

const squareIcon = await framed();

/** One size. Small icons get a light unsharp so the edge survives the downscale. */
const render = async (size, sharpen = 0) => {
  let img = sharp(squareIcon).resize(size, size, { kernel: 'lanczos3' });
  if (sharpen) img = img.sharpen({ sigma: sharpen });
  return img.png({ compressionLevel: 9 }).toBuffer();
};

const sizes = [
  { file: 'favicon-16x16.png', size: 16, sharpen: 0.8 },
  { file: 'favicon-32x32.png', size: 32, sharpen: 0.7 },
  { file: 'favicon-48x48.png', size: 48, sharpen: 0.6 },
  { file: 'apple-touch-icon.png', size: 180, sharpen: 0 },
];

for (const { file, size, sharpen } of sizes) {
  writeFileSync(resolve(OUT, file), await render(size, sharpen));
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

console.log(`wrote ${sizes.map((s) => `public/${s.file}`).join(', ')}`);
