/**
 * Shared drawing code for the braille figures in the Etezad Research Lab
 * article: one plate, whatever grid of cells you ask for, pins either encoded
 * from the standard Grade 1 table or given directly as a pixel pattern.
 *
 * Colours are the site's tokens, copied because an SVG cannot read a stylesheet:
 * ink #0a0a0a, resting pin #dcdcdc, plate #ffffff, hairline #e6e6e6.
 */

/** Grade 1: character -> the pins it raises, numbered 1-6 down the two columns. */
export const BRAILLE = {
  a: [1], b: [1, 2], c: [1, 4], d: [1, 4, 5], e: [1, 5],
  f: [1, 2, 4], g: [1, 2, 4, 5], h: [1, 2, 5], i: [2, 4], j: [2, 4, 5],
  k: [1, 3], l: [1, 2, 3], m: [1, 3, 4], n: [1, 3, 4, 5], o: [1, 3, 5],
  p: [1, 2, 3, 4], q: [1, 2, 3, 4, 5], r: [1, 2, 3, 5], s: [2, 3, 4],
  t: [2, 3, 4, 5], u: [1, 3, 6], v: [1, 2, 3, 6], w: [2, 4, 5, 6],
  x: [1, 3, 4, 6], y: [1, 3, 4, 5, 6], z: [1, 3, 5, 6],
  ' ': [], '.': [2, 5, 6], ',': [2], '-': [3, 6], '!': [2, 3, 5], '?': [2, 3, 6],
};

/** A capital letter is its own cell: dot 6 alone, before the letter. */
const CAPITAL = [6];

/** Pin number -> which of the six slots in a cell it occupies (col, row). */
const SLOT = {
  1: [0, 0], 2: [0, 1], 3: [0, 2],
  4: [1, 0], 5: [1, 1], 6: [1, 2],
};

const INK = '#0a0a0a';
const DOWN = '#dcdcdc';
const PLATE = '#ffffff';
const HAIRLINE = '#e6e6e6';

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Text -> one array of raised pin numbers per cell.
 *
 * A capital costs a cell of its own (dot 6 in front of the letter), which is
 * fine until the grid is exactly as wide as the word: "HEL" needs six cells
 * that way. `capital: false` sets the letters alone, so a word can be laid out
 * within a fixed number of cells — the case is then carried by the layout, not
 * by a pin.
 */
export function cellsFor(text, { capital = true } = {}) {
  const cells = [];
  for (const ch of text) {
    const lower = ch.toLowerCase();
    if (capital && ch !== lower && BRAILLE[lower]) cells.push(CAPITAL);
    cells.push(BRAILLE[lower] ?? []);
  }
  return cells;
}

/**
 * The drawing of one backplate, without the <svg> wrapper, so plates can be
 * laid out next to each other.
 *
 * The pins are described one of two ways, because the article needs both:
 *   - `text`, one character per cell, encoded through the Grade 1 table;
 *   - `pattern`, rows of '#' and '.', the grid read as pixels instead of as
 *     characters, one pin per pixel.
 *
 * @param {object} o
 * @param {number} o.cellsX  cells across
 * @param {number} o.cellsY  cells down
 * @param {string} [o.text]  one character per cell, in reading order; a newline
 *                           starts the next row of cells
 * @param {boolean} [o.capital] put a dot-6 cell before every capital letter
 * @param {string[]} [o.pattern] rows of '#' and '.' for pin-level control
 * @param {boolean} [o.dropBottomRow] leave the last row of pins off — the eight
 *                                    by eight grid the article cuts down to
 * @param {number} [o.pitch] distance between neighbouring pins, both axes
 * @param {number} [o.dotR]  pin radius
 * @param {number} [o.pad]   plate margin around the pin field
 * @param {boolean} [o.well] draw the recessed well around the pins; on a small
 *                           plate the frame collides with the corner screws
 */
export function brailleBody({
  cellsX, cellsY, text = '', pattern = null, dropBottomRow = false,
  pitch = 60, dotR = 18, pad = 96, well = true, capital = true,
}) {
  const cols = cellsX * 2;
  const rows = cellsY * 3 - (dropBottomRow ? 1 : 0);

  const canvasPad = 30;
  const fieldW = (cols - 1) * pitch;
  const fieldH = (rows - 1) * pitch;
  const plateW = fieldW + 2 * pad;
  const plateH = fieldH + 2 * pad;
  const W = plateW + 2 * canvasPad;
  const H = plateH + 2 * canvasPad;

  const plateX = canvasPad;
  const plateY = canvasPad;
  const fieldX = plateX + pad;
  const fieldY = plateY + pad;

  // which pins are up, as up[row][col]
  const up = Array.from({ length: rows }, () => new Array(cols).fill(false));

  if (pattern) {
    pattern.forEach((line, row) => {
      if (row >= rows) return;
      for (let col = 0; col < cols; col++) up[row][col] = line[col] === '#';
    });
  } else {
    // A newline starts a new row of cells, so text can be laid out line by line
    // instead of wrapping at the width of the grid.
    text.split('\n').forEach((line, lineIndex) => {
      const cells = cellsFor(line, { capital });
      cells.forEach((pins, cellIndex) => {
        const cellCol = cellIndex * 2;
        const cellRow = lineIndex * 3;
        for (const pin of pins) {
          const [col, row] = SLOT[pin];
          if (cellRow + row < rows && cellCol + col < cols) up[cellRow + row][cellCol + col] = true;
        }
      });
    });
  }

  const parts = [];

  parts.push(`<rect x="${plateX}" y="${plateY}" width="${r2(plateW)}" height="${r2(plateH)}" rx="26" `
    + `fill="${PLATE}" stroke="${INK}" stroke-width="1.8"/>`);

  // the well the pins sit in
  if (well) {
    parts.push(`<rect x="${r2(fieldX - 44)}" y="${r2(fieldY - 44)}" width="${r2(fieldW + 88)}" `
      + `height="${r2(fieldH + 88)}" rx="18" fill="none" stroke="${HAIRLINE}" stroke-width="1.2"/>`);
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = fieldX + col * pitch;
      const py = fieldY + row * pitch;
      parts.push(`<circle cx="${r2(px)}" cy="${r2(py)}" r="${dotR}" fill="${up[row][col] ? INK : DOWN}"/>`);
    }
  }

  return { body: parts.join('\n'), W, H };
}

const wrap = (body, W, H, label) => [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" `
    + `role="img" aria-label="${label}">`,
  body,
  '</svg>',
  '',
].join('\n');

/** One plate, as a standalone file. */
export function braillePlate({ label, ...opts }) {
  const { body, W, H } = brailleBody(opts);
  return { svg: wrap(body, W, H, label), W, H };
}

/** Several plates laid out in a grid, sharing the space evenly. */
export function brailleCollage({ plates, columns = 1, gap = 56, label }) {
  const bodies = plates.map((p) => brailleBody(p));

  const rows = [];
  for (let i = 0; i < bodies.length; i += columns) rows.push(bodies.slice(i, i + columns));

  const rowW = (r) => r.reduce((sum, b) => sum + b.W, 0) + gap * (r.length - 1);
  const rowH = (r) => Math.max(...r.map((b) => b.H));

  const W = Math.max(...rows.map(rowW));
  const H = rows.reduce((sum, r) => sum + rowH(r), 0) + gap * (rows.length - 1);

  const placed = [];
  let y = 0;
  for (const r of rows) {
    let x = (W - rowW(r)) / 2;
    for (const b of r) {
      placed.push(`<g transform="translate(${r2(x)} ${r2(y)})">\n${b.body}\n</g>`);
      x += b.W + gap;
    }
    y += rowH(r) + gap;
  }

  return { svg: wrap(placed.join('\n'), W, H, label), W, H };
}
