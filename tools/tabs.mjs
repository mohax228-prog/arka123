import { chromium } from 'playwright-core';
import sharp from 'sharp';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(url); await p.waitForTimeout(7000);
await p.evaluate(() => document.querySelector('#space').scrollIntoView());
await p.waitForTimeout(2500);
const shots = [];
for (const k of ['empty', 'lecture', 'table', 'tables']) {
  await p.click(`.layouts button[data-layout="${k}"]`); await p.waitForTimeout(900);
  shots.push(await sharp(await p.screenshot()).resize(720).toBuffer());
}
await sharp({ create: { width: 1440, height: 900, channels: 3, background: '#fff' } })
  .composite(shots.map((s, i) => ({ input: s, left: (i % 2) * 720, top: Math.floor(i / 2) * 450 }))).jpeg().toFile(out);
console.log('errors', errs); await b.close();
