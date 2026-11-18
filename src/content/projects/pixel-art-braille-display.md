---
title: Pixel art braille display
summary: Chaining refreshable braille cells into one 8 × 9 dot field, so a display can draw a shape and not only spell a word.
year: 2023
role: Research + design
tags:
  - Braille
  - Accessibility
  - Hardware
order: 2
---

Dr. Etezad's lab at Chapman works on making refreshable braille displays cheap
enough to be ordinary. I worked on the display itself, on what its cells can
show when they are treated as one field instead of one character at a time.

## The problem

A refreshable braille display is a row of cells. Each cell is six pins in two
columns of three, and each cell shows one character. That is the right shape for
text and the wrong shape for almost everything else: a graph, a diagram, the
layout of a page, the outline of an object.

![One braille cell: two columns of three pins, four of them raised.](/img/braille-cell.svg)

## What was built

[Add: what you actually built: the board, the firmware, the shape-to-braille
mapping, who did which part.]

The part I keep coming back to is that the cells are already a grid. Twelve of
them, set edge to edge, are eight dots across and nine dots down. Remove the
last row and the field is eight by eight, square, and the right place for
pixel art.

| Cells | Field | What it holds |
| --- | --- | --- |
| 1 | 2 × 3 | one character |
| 12 | 8 × 9 | four cells by three, chained |
| 12 | 8 × 8 | the same, bottom row removed |

So the same hardware can spell three letters to a row, or draw a heart, a plus
sign, a star: one pin per pixel. Text and iconography stop being two devices.

![Four eight by eight braille grids, each drawing one icon in raised pins: a heart, a plus, a minus and a star.](/img/braille-icons.svg)

## Where it went

Two papers came out of the work:

- Cheng, Alexander, Garofalo, Shankland, Smith, **Bishai**, Sun, Etezad. “The
  Roadmap to an Improved Braille Display Design.” Student Scholar Symposium,
  Chapman University, 2023.
- **Bishai**, Sun, Parlette, Etezad. “AI Powered Web Shape to Braille for the
  Visually Impaired.” 38th Annual CSUN Assistive Technology Conference, Anaheim.

[Add: what happened after the papers: was any of it picked up, tested with
users, or built into a second revision?]

## What it cost

[Add: the honest numbers or the honest absence of them: what the parts were,
what the lab time came to, what broke, what you would not do again.]

The figures on this page are drawn from the same pin geometry as the display,
generated rather than illustrated, so what you see is what the cells can
actually hold.
