import { chromium } from 'playwright-core';
const [url, out, w = 1440, h = 900] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(url); await p.waitForTimeout(6000);
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 400) { await p.mouse.wheel(0, 400); await p.waitForTimeout(120); }
await p.waitForTimeout(1500);
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500);
await p.screenshot({ path: out, fullPage: true });
console.log('height', H, 'errors', errs);
await b.close();
