import { chromium } from 'playwright-core';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 1600 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
const els = (await p.$$('img')).filter(Boolean);
let i = 0;
for (const el of els) {
  const w = await el.evaluate(e => e.naturalWidth);
  if (w < 300) continue;
  const data = await el.evaluate(async e => { const c = document.createElement('canvas'); c.width = e.naturalWidth; c.height = e.naturalHeight; c.getContext('2d').drawImage(e, 0, 0); return c.toDataURL('image/png'); });
  (await import('fs')).writeFileSync(`${out}/img${i++}.png`, Buffer.from(data.split(',')[1], 'base64'));
}
const text = await p.evaluate(() => document.body.innerText.slice(0, 1500));
console.log(text);
await b.close();
