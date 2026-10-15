import { chromium } from 'playwright-core';
const [file, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 900, height: 1200 } });
await p.goto('file://' + file); await p.waitForTimeout(2500);
await p.screenshot({ path: out });
await b.close();
