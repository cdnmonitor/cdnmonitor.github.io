#!/usr/bin/env node
/**
 * Writes the customer-post cards used in the Vanish Proxies article.
 *
 *   node scripts/tweet-cards.mjs
 *
 * Each card is the post as it appeared: avatar, name and handle, the
 * replying-to line where there is one, the text verbatim, the timestamp, and the
 * reply and like counts. Monochrome rather than Twitter blue, so the cards sit on
 * the page as typography instead of as a foreign screenshot.
 *
 * Text, timestamps and counts come from X's syndication payload, captured once
 * and kept here so a rebuild never touches the network. Avatars are downloaded
 * into scripts/tweet-avatars/ and inlined as base64 at render time.
 *
 * Output: public/img/tweet-<handle>.png, plus one collage of all six.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/img');
const FONTS = resolve(ROOT, 'public/fonts');
const AVATARS = resolve(ROOT, 'scripts/tweet-avatars');
const MEDIA = resolve(ROOT, 'scripts/tweet-media');
const CHROME = process.env.CHROME
  || '/home/wpm/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';

/** Verbatim post text and its metadata. Order is the order on the page. */
const TWEETS = [
  {
    handle: 'kevin_borgh',
    used: true,
    name: 'Kevin Borgh',
    date: '8:22 AM · Aug 6, 2021',
    replyTo: 'StormeIO',
    replies: 3,
    likes: 12,
    media: ['kevin_borgh-1.jpg'],
    text: '@StormeIO had profile issues for the 30 minutes of the drop and still managed to hit ~400 clip\n\nSubscribe to @QuokkaBrew if you need Storme 1.0 access 👀\n\n@patekproxies @NOCTURNALPROX @Sole_Proxies @KermitProxies @hypeproxiesio @ProxyWorId @vanishtech',
  },
  {
    handle: 'lovelyshai444',
    used: true,
    name: 'Shai Nicole',
    date: '7:37 PM · Jun 18, 2021',
    likes: 7,
    media: ['lovelyshai444-1.jpg'],
    text: 'Dunking on the haters lol\nTeam: @gumpboyfnf @IncSloths\nThe Best Bot Ever :@wrathsoftware\nProxies:@VantaProxies @VanishTech',
  },
  {
    handle: 'bmasood87',
    used: true,
    name: '.',
    date: '8:59 AM · Aug 21, 2021',
    likes: 2,
    media: ['bmasood87-1.jpg'],
    text: "Ready for Lightning's 😈\nB:@PrismAIO\nP:@AMGProxies @OculusProxies @proxydrop_com @VanishTech\nCG: @CarbnIO @ahiddensociety\nS:@PersonalsOnly",
  },
  {
    handle: 'S4Goonie',
    name: 'Shane Vulgamott',
    date: '7:18 PM · Apr 29, 2021',
    likes: 1,
    media: ['s4goonie-1.jpg'],
    text: "Actually hit 14\nbig shout-out to @PrismAIO // @FzlipeAIO\nTHANKS ALOT @VantaProxies !\n\n@BypassProxiesI0\n@aycd_io // @toolboxowner\n@LiveProxies\n@VanishTech // @monitorthat\nWanted to run @HayhaBots can't seem to get it to install on server and been having auth issues local D=",
  },
  {
    handle: 'demarcojake7',
    name: 'micro',
    date: '12:47 PM · Apr 29, 2021',
    likes: 2,
    media: ['demarcojake7-1.jpg'],
    text: 'oops i rate limited webhook\n@OminousAIO @OminousSuccess @VanishTech @monitorthat',
  },
  {
    handle: 'myclosetbetter',
    name: '®',
    date: '8:20 PM · Apr 10, 2021',
    replies: 2,
    likes: 4,
    media: ['myclosetbetter-1.jpg', 'myclosetbetter-2.jpg', 'myclosetbetter-3.jpg'],
    text: 'ty @ValorAIO dont need anymore @VanishTech @_HellWorld',
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const REPLY_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
const HEART_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

const CSS = `
@font-face { font-family: 'Geist'; src: url('file://${FONTS}/geist-400.woff2') format('woff2'); font-weight: 400; }
@font-face { font-family: 'Geist'; src: url('file://${FONTS}/geist-500.woff2') format('woff2'); font-weight: 500; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body {
  font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
  color: #0a0a0a;
  -webkit-font-smoothing: antialiased;
  width: 680px;
}
.card {
  border: 1px solid #e8e8e8;
  border-radius: 14px;
  background: #fff;
  padding: 22px 24px 14px;
  margin-bottom: 18px;
  break-inside: avoid;
}
.head { display: flex; gap: 12px; align-items: flex-start; }
.avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; flex: 0 0 46px; background: #f0f0f0; }
.who { min-width: 0; padding-top: 2px; }
.nameline { display: flex; align-items: baseline; gap: 6px; }
.name { font-size: 15px; font-weight: 500; letter-spacing: -0.006em; }
.handle { font-size: 14px; color: #707070; }
.replyto { font-size: 13px; color: #707070; margin-top: 3px; }
.replyto b { font-weight: 400; color: #4d4d4d; }
.text { font-size: 15.5px; line-height: 1.52; margin: 13px 0 0 58px; white-space: pre-wrap; overflow-wrap: anywhere; }
.media { margin: 14px 0 0 58px; }
.media img { display: block; max-width: 100%; max-height: 470px; width: auto; height: auto; border-radius: 12px; border: 1px solid #ececec; }
.media.multi { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; align-items: start; }
.media.multi img { width: 100%; height: 190px; max-height: none; object-fit: contain; background: #fafafa; }
.stamp { font-size: 13px; color: #707070; margin: 15px 0 0 58px; }
.metrics { display: flex; gap: 24px; align-items: center; margin: 13px 0 0 58px; padding-top: 12px; border-top: 1px solid #ececec; color: #4d4d4d; font-size: 13px; }
.metrics span { display: inline-flex; align-items: center; gap: 7px; }
.grid { columns: 2; column-gap: 18px; }
.grid .card { padding: 17px 17px 11px; }
.grid .avatar { width: 36px; height: 36px; flex: 0 0 36px; }
.grid .name { font-size: 13px; }
.grid .handle, .grid .replyto { font-size: 11.5px; }
.grid .text { font-size: 12.5px; line-height: 1.45; margin-left: 0; margin-top: 11px; }
.grid .stamp { font-size: 11px; margin-left: 0; margin-top: 11px; }
.grid .metrics { font-size: 11px; margin-left: 0; margin-top: 9px; padding-top: 9px; gap: 16px; }
.grid .metrics svg { width: 12px; height: 12px; }
`;

const avatarData = (t) => {
  const f = join(AVATARS, `${t.handle.toLowerCase()}.jpg`);
  return existsSync(f) ? `data:image/jpeg;base64,${readFileSync(f).toString('base64')}` : '';
};

const mediaData = (f) => {
  const p = join(MEDIA, f);
  return existsSync(p) ? `data:image/jpeg;base64,${readFileSync(p).toString('base64')}` : '';
};

const mediaBlock = (t) => {
  if (!t.media || !t.media.length) return '';
  const imgs = t.media.map(mediaData).filter(Boolean).map((src) => `<img src="${src}" alt="">`).join('');
  if (!imgs) return '';
  return `<div class="media${t.media.length > 1 ? ' multi' : ''}">${imgs}</div>`;
};

const card = (t) => {
  const av = avatarData(t);
  return `<article class="card">
    <div class="head">
      ${av ? `<img class="avatar" src="${av}" alt="">` : '<div class="avatar"></div>'}
      <div class="who">
        <div class="nameline"><span class="name">${esc(t.name)}</span><span class="handle">@${esc(t.handle)}</span></div>
        ${t.replyTo ? `<div class="replyto">Replying to <b>@${esc(t.replyTo)}</b></div>` : ''}
      </div>
    </div>
    <div class="text">${esc(t.text)}</div>
    ${mediaBlock(t)}
    <div class="stamp">${esc(t.date)}</div>
    <div class="metrics">
      ${t.replies ? `<span>${REPLY_ICON}${t.replies}</span>` : ''}
      <span>${HEART_ICON}${t.likes}</span>
    </div>
  </article>`;
};

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;

const shoot = (html, out, width) => {
  const dir = mkdtempSync(join(tmpdir(), 'tweet-cards-'));
  const file = join(dir, 'card.html');
  writeFileSync(file, html);
  execFileSync(CHROME, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=2',
    `--window-size=${width},7000`,
    `--screenshot=${out}`,
    `file://${file}`,
  ], { stdio: 'ignore' });
  rmSync(dir, { recursive: true, force: true });
};

/**
 * Chromium only writes PNG, and a PNG of a photograph is 3 to 6 times the weight
 * of the same pixels as JPEG. Trim the empty page below the card, then write a
 * progressive JPEG: the cards are screenshots and type, so 2x is enough.
 */
const finish = (png, out) => {
  const code = `
import sys
from PIL import Image, ImageChops
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
bbox = ImageChops.difference(im, Image.new('RGB', im.size, (255, 255, 255))).getbbox()
pad = 8
im.crop((max(0, bbox[0]-pad), max(0, bbox[1]-pad),
         min(im.size[0], bbox[2]+pad), min(im.size[1], bbox[3]+pad))
  ).save(dst, 'JPEG', quality=84, progressive=True, optimize=True)
`;
  execFileSync('python3', ['-c', code, png, out]);
};

mkdirSync(OUT, { recursive: true });

for (const t of TWEETS) {
  if (!t.used && !process.env.ALL) continue;
  const png = resolve(tmpdir(), `tweet-${t.handle.toLowerCase()}.png`);
  const out = resolve(OUT, `tweet-${t.handle.toLowerCase()}.jpg`);
  shoot(page(card(t)), png, 680);
  finish(png, out);
  rmSync(png, { force: true });
  console.log(`${out} — ${(readFileSync(out).length / 1024).toFixed(0)} kB`);
}
