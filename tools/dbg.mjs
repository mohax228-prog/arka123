import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('console', m => console.log('console:', m.text()));
await p.goto('http://localhost:4173/');
for (let i = 0; i < 20; i++) {
  await p.waitForTimeout(1000);
  console.log(await p.evaluate(() => {
    const v = document.querySelector('.tour video');
    const st = [...document.querySelectorAll('.tour-step')].map(s => (+getComputedStyle(s).opacity).toFixed(2)).join(' ');
    return `t=${v.currentTime.toFixed(2)} paused=${v.paused} ended=${v.ended} steps=${st}`;
  }));
}
await b.close();
