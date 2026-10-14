import { chromium } from 'playwright-core';
import sharp from 'sharp';
const [url, out, w = 1440, h = 900, ...ys] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(url); await p.waitForTimeout(6000);
const shots = [];
for (const y of ys) {
  await p.evaluate(y => window.scrollTo(0, y * innerHeight), +y);
  await p.waitForTimeout(1500);
  shots.push(await sharp(await p.screenshot()).resize(Math.round(w / 2)).toBuffer());
}
const tw = Math.round(w / 2), th = Math.round(h / 2), cols = 2;
await sharp({ create: { width: tw * cols, height: th * Math.ceil(shots.length / cols), channels: 3, background: '#fff' } })
  .composite(shots.map((s, i) => ({ input: s, left: (i % cols) * tw, top: Math.floor(i / cols) * th }))).jpeg().toFile(out);
console.log('errors', errs);
await b.close();
