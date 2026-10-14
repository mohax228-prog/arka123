import { chromium } from 'playwright-core';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await p.goto(url); await p.waitForTimeout(7000);
await p.evaluate(() => document.querySelector('#space').scrollIntoView());
await p.waitForTimeout(400);
for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(300); }
await p.waitForTimeout(1500);
await p.screenshot({ path: out });
await b.close();
