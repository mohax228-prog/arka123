import { chromium } from 'playwright-core';
const [url, outDir, w = 1440, h = 900, ...times] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
await page.goto(url);
let t0 = 0;
for (const t of times) { await page.waitForTimeout(+t - t0); t0 = +t; await page.screenshot({ path: `${outDir}/shot_${w}_${t}.png` }); }
console.log('errors:', errs);
await browser.close();
