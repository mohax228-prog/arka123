import { chromium } from 'playwright-core';
import sharp from 'sharp';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url); await p.waitForTimeout(7000);
await p.evaluate(() => document.querySelector('#tariffs').scrollIntoView());
await p.waitForTimeout(2000);
const a = await p.screenshot();
await p.hover('.tariff:nth-child(1)'); await p.waitForTimeout(700);
const c = await p.screenshot();
await sharp({ create: { width: 1440, height: 450, channels: 3, background: '#fff' } })
  .composite([{ input: await sharp(a).resize(720).toBuffer(), left: 0, top: 0 }, { input: await sharp(c).resize(720).toBuffer(), left: 720, top: 0 }]).jpeg().toFile(out);
await b.close();
