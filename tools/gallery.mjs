import { chromium } from 'playwright-core';
const [url, out, w, h] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(url); await p.waitForTimeout(7000);
await p.evaluate(() => document.querySelector('#gallery').scrollIntoView());
for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(150); }
await p.waitForTimeout(1500);
const el = await p.$('.gallery-grid');
await el.screenshot({ path: out });
await b.close();
