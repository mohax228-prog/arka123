// Рендер металлической броши из векторного знака и вклейка в фото.
import sharp from 'sharp';
const [src, out, cx, cy, width, angle, zoomOut] = process.argv.slice(2);
const OUTER = 'M288 1028 V595 A337.5 337.5 0 0 1 963 595 V1028 Z';
const WIN = 'M342 975 V595 A283.5 283.5 0 0 1 909 595 V975 Z';
const lines = `
  <path d="M465.5 1001 H315 V595 A310.5 310.5 0 0 1 936 595 V1001 H465.5"/>
  <path d="M465.5 1001 V562"/>
  <path d="M540 662 V641 A61.5 61.5 0 0 1 663 641 C663 662 655 676 644 692 L540 840 V873 H669"/>
  <path d="M704 585 H849 L759 714 A79 79 0 1 1 701 796" stroke-linejoin="bevel"/>`;
const FLAG = 'M372 621 L422 562 H493 V621 Z';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="260 230 732 826" width="732" height="826">
<defs>
  <linearGradient id="silver" gradientUnits="userSpaceOnUse" x1="288" y1="258" x2="963" y2="1028">
    <stop offset="0" stop-color="#f4f4f2"/><stop offset=".35" stop-color="#b9bcbf"/>
    <stop offset=".55" stop-color="#eeeeec"/><stop offset="1" stop-color="#8d9196"/>
  </linearGradient>
  <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#e2ddd3"/><stop offset="1" stop-color="#c9c3b8"/>
  </linearGradient>
  <linearGradient id="enamel" gradientUnits="userSpaceOnUse" x1="288" y1="258" x2="963" y2="1028">
    <stop offset="0" stop-color="#2c4153"/><stop offset="1" stop-color="#1b2934"/>
  </linearGradient>
</defs>
<path d="${OUTER}" fill="url(#silver)" stroke="url(#silver)" stroke-width="22" stroke-linejoin="round"/>
<path d="${WIN}" fill="url(#field)"/>
<g fill="none" stroke="url(#silver)" stroke-width="76" stroke-linejoin="miter">${lines}</g>
<path d="${FLAG}" fill="url(#silver)" stroke="url(#silver)" stroke-width="22"/>
<g fill="none" stroke="url(#enamel)" stroke-width="44" stroke-linejoin="miter">${lines}</g>
<path d="${FLAG}" fill="url(#enamel)"/>
<path d="M330 420 Q625 160 920 420" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="10"/>
</svg>`;
const w = +width, h = Math.round(w * 826 / 732);
let pin = await sharp(Buffer.from(svg), { density: 300 }).resize(w * 4, h * 4).png().toBuffer();
pin = await sharp(pin).rotate(+angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const m = await sharp(pin).metadata();
const tw = Math.round(m.width / 4), th = Math.round(m.height / 4);
pin = await sharp(pin).resize(tw, th).blur(0.45).png().toBuffer();
// мягкая тень под брошью
const shadow = await sharp(pin).ensureAlpha().linear(0, 0).blur(1.6).modulate({ brightness: 0 }).png().toBuffer();
const left = Math.round(+cx - tw / 2), top = Math.round(+cy - th / 2);
await sharp(src).composite([
  { input: shadow, left: left + 1, top: top + 2, blend: 'multiply' },
  { input: pin, left, top },
]).png().toFile(out);
if (zoomOut) await sharp(out).extract({ left: left - 60, top: top - 50, width: tw + 120, height: th + 100 }).resize({ width: 560 }).toFile(zoomOut);
