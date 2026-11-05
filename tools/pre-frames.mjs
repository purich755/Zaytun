// Кадры прелоадера и наведений для визуальной проверки
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
await p.goto('http://localhost:8560/', { waitUntil: 'commit' });
const t0 = Date.now();
for (const at of [350, 800, 1150, 1500]) {
  const d = at - (Date.now() - t0);
  if (d > 0) await p.waitForTimeout(d);
  await p.screenshot({ path: `tools/shots/pre-${at}.jpg`, type: 'jpeg', quality: 70 });
}
await b.close();
