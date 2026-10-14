import { chromium } from 'playwright-core';
const [file, out, w] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto('file://' + file); await p.waitForTimeout(1500);
await p.screenshot({ path: out, fullPage: true });
await b.close();
