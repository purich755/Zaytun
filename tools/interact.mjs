// Самопроверка поведения. node tools/interact.mjs [ширина]; URL= для живого адреса.
import { chromium } from 'playwright-core';
const W = Number(process.argv[2] || 1440), H = W < 768 ? 844 : 900, mobile = W < 768;
const URL = process.env.URL || 'http://localhost:8560/';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const ok = (n, c, x = '') => { results.push([n, !!c]); console.log((c ? 'ok  ' : 'FAIL') + ' ' + n + (x ? '  [' + x + ']' : '')); };
const newCtx = (o = {}) => b.newContext({ viewport: { width: W, height: H }, isMobile: mobile, hasTouch: mobile, locale: 'ru-RU', ...o });
const wait = (p) => p.waitForFunction(() => document.body.classList.contains('js-ready'), null, { timeout: 20000 });

// Прелоадер
{
  const c = await newCtx(); const p = await c.newPage();
  await p.goto(URL, { waitUntil: 'commit' });
  await p.waitForSelector('[data-preloader]', { state: 'attached' });
  const vis = await p.evaluate(() => { const e = document.querySelector('[data-preloader]'); return e && getComputedStyle(e).display !== 'none'; });
  ok('прелоадер виден при первом визите', vis);
  await p.waitForTimeout(2300);
  ok('прелоадер исчезает за ≤2.3 с', !(await p.$('[data-preloader]')));
  await p.reload(); await p.waitForTimeout(300);
  ok('второй раз за сессию без прелоадера', !(await p.$('[data-preloader]')));
  await c.close();
}

const c = await newCtx();
await c.addInitScript(() => { try { sessionStorage.setItem('zaytun-pre', '1'); } catch {} });
const p = await c.newPage(); const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(URL, { waitUntil: 'load' }); await wait(p); await p.waitForTimeout(800);
const go = async (id, frac = 0) => {
  const y = await p.evaluate(([id, frac]) => { const el = document.getElementById(id) || document.querySelector(id), sp = el.closest('.pin-spacer') || el, r = sp.getBoundingClientRect(); return r.top + scrollY + Math.max(0, r.height - innerHeight) * frac; }, [id, frac]);
  const cur = await p.evaluate(() => scrollY);
  for (let s = 1; s <= 6; s++) { await p.evaluate((y) => { const l = window.__zaytun.lenis; l ? l.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, cur + ((y - cur) * s) / 6); await p.waitForTimeout(70); }
  await p.waitForTimeout(500);
};

ok('нет горизонтального скролла', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
ok('ширина раскладки равна ширине устройства', await p.evaluate((W) => innerWidth === W, W));
ok('Lenis работает', await p.evaluate(() => !!window.__zaytun.lenis));
ok('hero pin', await p.evaluate(() => !!document.querySelector('[data-hero]').closest('.pin-spacer')));
ok('кольцо по центру круга', await p.evaluate(() => { const r = document.querySelector('[data-hero-ring]').getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - innerWidth / 2) < 2; }));

// Шапка
if (W >= 1024) {
  await p.click('[data-book] button');
  ok('меню «Записаться» раскрывается', await p.isVisible('#book-menu'));
  ok('в меню 4 способа, WhatsApp с текстом', await p.evaluate(() => { const a = [...document.querySelectorAll('#book-menu a')]; return a.length === 4 && a[0].href.includes('wa.me/79172401555?text='); }));
  await p.keyboard.press('Escape');
  ok('Esc закрывает меню', !(await p.isVisible('#book-menu')));
  await p.click('.hdr-nav a[href="#massage"]'); await p.waitForTimeout(2600);
  const t = await p.evaluate(() => document.getElementById('massage').getBoundingClientRect().top);
  ok('якорь из шапки доезжает до секции', Math.abs(t) < 6, 'top ' + t.toFixed(0));
  ok('шапка спрятана при скролле вниз', await p.evaluate(() => document.body.classList.contains('hdr-hidden')));
} else {
  await p.click('[data-burger]'); await p.waitForTimeout(1200);
  ok('бургер открывает меню', await p.isVisible('#mob-menu'));
  ok('меню закрывает экран', await p.evaluate(() => !!document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('#mob-menu')));
  await p.click('[data-burger]'); await p.waitForTimeout(1000);
  ok('бургер закрывает меню', !(await p.isVisible('#mob-menu')));
}

// Разделитель
await go('balance');
const bal = await p.$('.bal-handle');
await p.waitForTimeout(1800);
const box = await bal.boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
if (!mobile) {
  await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx + 260, cy, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(700);
  const x = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-balance]')).getPropertyValue('--x')));
  ok('ручка тянется мышью', x > 60, 'x=' + x.toFixed(1));
}
await bal.focus();
const before = await bal.getAttribute('aria-valuenow');
await p.keyboard.press(mobile ? 'ArrowDown' : 'ArrowLeft'); await p.keyboard.press(mobile ? 'ArrowDown' : 'ArrowLeft'); await p.waitForTimeout(600);
const after = await bal.getAttribute('aria-valuenow');
ok('стрелки двигают разделитель', after !== before, before + '→' + after);

// Циферблат
await go('rituals', 0.5); await p.waitForTimeout(1500);
ok('шагов на кольце 5 у «Ханбике»', await p.evaluate(() => document.querySelectorAll('.dial-dot').length === 5));
await p.evaluate(() => document.getElementById('tab-olivia').click()); await p.waitForTimeout(2200);
const st = await p.evaluate(() => ({ n: document.querySelectorAll('.dial-dot').length, min: document.querySelector('[data-dial-min]').textContent, price: document.querySelector('[data-dial-price]').textContent, cta: document.querySelector('[data-dial-cta]').href, txt: document.querySelector('[data-dial-cta]').textContent, sign: !document.querySelector('[data-dial-sign]').hidden, rots: [...document.querySelectorAll('.dial-dot')].map((d) => Math.round(gsap.getProperty(d, 'rotation'))) }));
ok('«Оливия»: 4 шага, 120 минут, 7 900 ₽', st.n === 4 && st.min === '120' && /7.900/.test(st.price), JSON.stringify([st.n, st.min, st.price, st.rots]));
ok('CTA обновился и ведёт в WhatsApp', st.txt.includes('Оливия') && decodeURIComponent(st.cta).includes('SPA-программу «Оливия»'));
ok('пометка «фирменная» у «Оливии»', st.sign);
ok('точки разложены по кругу', JSON.stringify(st.rots) === JSON.stringify([0, 90, 180, 270]));
await p.evaluate(() => document.getElementById('tab-olivia').focus());
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(1900);
ok('стрелки меняют программу', await p.evaluate(() => document.getElementById('tab-wife').getAttribute('aria-selected') === 'true' && document.activeElement.id === 'tab-wife'));
await p.evaluate(() => { for (const id of ['gold', 'party', 'honey', 'hanbike']) document.getElementById('tab-' + id).click(); });
await p.waitForTimeout(2400);
const st2 = await p.evaluate(() => ({ n: document.querySelectorAll('.dial-dot').length, min: document.querySelector('[data-dial-min]').textContent, price: document.querySelector('[data-dial-price]').textContent, lab: document.querySelectorAll('.dial-labels li').length, op: [...document.querySelectorAll('.dial-labels li')].map((l) => getComputedStyle(l).opacity).join(), line: getComputedStyle(document.querySelector('[data-dial-line]')).opacity }));
ok('быстрые клики не ломают циферблат', st2.n === 5 && st2.min === '150' && /11.100/.test(st2.price) && st2.lab === 5 && st2.line === '1' && !st2.op.split(',').some((v) => v !== '1'), JSON.stringify(st2));

// Оливия
if (W >= 1024) {
  await go('olivia', 0.95); await p.waitForTimeout(1400);
  const o = await p.evaluate(() => getComputedStyle(document.querySelector('[data-ol-core]')).opacity);
  ok('«Оливия»: центр проявился в конце сцены', Number(o) > 0.9, o);
}

// Мелочи
await go('details', 0.3); await p.waitForTimeout(1500);
ok('строки «написаны»', await p.evaluate(() => [...document.querySelectorAll('.det-list li')].filter((l) => l.classList.contains('is-in')).length >= 4));
if (!mobile) {
  const li = await p.$$('.det-list li'); const bb = await li[4].boundingBox();
  await p.mouse.move(bb.x + 60, bb.y + bb.height / 2); await p.waitForTimeout(1500);
  const on = await p.evaluate(() => [...document.querySelectorAll('.det-layer.is-on img')].map((i) => i.currentSrc || i.src));
  ok('окно меняет кадр при наведении', on.length === 1 && on[0].includes('d-tea'), on.join(','));
}

// Галерея
await go('space'); await p.waitForTimeout(800);
const g = await p.$('[data-gal]'); const gb = await g.boundingBox();
if (!mobile) {
  await p.mouse.move(gb.x + gb.width * 0.7, gb.y + gb.height / 2); await p.mouse.down(); await p.mouse.move(gb.x + gb.width * 0.2, gb.y + gb.height / 2, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(1800);
  const tx = await p.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-gal-track]')).transform).m41);
  ok('лента тянется', tx < -200, 'tx ' + tx.toFixed(0));
  ok('перетаскивание не открыло лайтбокс', !(await p.isVisible('[data-lb]')));
}
ok('счётчик работает', /^\d\d$/.test(await p.textContent('[data-gal-now]')));
const pt = await p.evaluate(() => { const it = [...document.querySelectorAll('.g-item:not(.is-off)')].find((i) => { const r = i.getBoundingClientRect(); return r.left > 40 && r.right < innerWidth - 10; }) || document.querySelector('.g-item'); const r = it.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, k: it.querySelector('a').dataset.key }; });
await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(1200);
ok('лайтбокс открылся', await p.isVisible('[data-lb]'));
ok('в лайтбоксе нужный кадр', await p.evaluate((k) => document.querySelector('[data-lb-stage] img')?.src.includes(k), pt.k), pt.k);
ok('aria-modal и фокус внутри', await p.evaluate(() => document.querySelector('[data-lb]').getAttribute('aria-modal') === 'true' && !!document.activeElement.closest('[data-lb]')));
const c1 = await p.textContent('[data-lb-count]');
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(700);
const c2 = await p.textContent('[data-lb-count]');
ok('стрелка листает', c1 !== c2, c1 + '→' + c2);
for (let i = 0; i < 4; i++) await p.keyboard.press('Tab');
ok('фокус не выходит из лайтбокса', await p.evaluate(() => !!document.activeElement.closest('[data-lb]')));
await p.keyboard.press('Escape'); await p.waitForTimeout(1300);
ok('Esc закрывает лайтбокс', !(await p.isVisible('[data-lb]')));
ok('Lenis снова работает после лайтбокса', await p.evaluate(() => !window.__zaytun.lenis || !window.__zaytun.lenis.isStopped));
await p.evaluate(() => document.querySelector('.chip[data-f="spa"]').click()); await p.waitForTimeout(900);
const fl = await p.evaluate(() => ({ vis: document.querySelectorAll('.g-item:not(.is-off)').length, bad: [...document.querySelectorAll('.g-item:not(.is-off)')].filter((i) => i.dataset.tag !== 'spa').length, all: document.querySelector('[data-gal-all]').textContent }));
ok('фильтр SPA', fl.vis > 0 && fl.bad === 0 && Number(fl.all) === fl.vis, JSON.stringify(fl));
await p.evaluate(() => document.querySelector('.chip[data-f="all"]').click()); await p.waitForTimeout(700);

// Голоса
await go('voices');
const v1 = await p.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.voi-row')).transform).m41);
await p.waitForTimeout(1000);
const v2 = await p.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.voi-row')).transform).m41);
ok('строки бегут ~30 px/с', Math.abs(v2 - v1) > 15 && Math.abs(v2 - v1) < 60, (v2 - v1).toFixed(1));
ok('нет звёзд и цифр рейтинга', await p.evaluate(() => !/★|⭐|рейтинг|\b5[.,]0\b/i.test(document.body.innerText)));

// Дыхание
await go('pause');
await p.evaluate(() => document.querySelector('[data-br-btn]').click()); await p.waitForTimeout(1500);
const w1 = await p.textContent('[data-br-word]');
const sc = await p.evaluate(() => gsap.getProperty(document.querySelector('[data-br-circle]'), 'scale'));
ok('дыхание: вдох', w1 === 'вдох' && sc > 1.02, w1 + ' ' + sc);
await p.evaluate(() => document.querySelector('[data-br-btn]').click()); await p.waitForTimeout(400);
ok('кнопка «Остановить» останавливает', (await p.textContent('[data-br-btn]')) === 'Начать');

// Контакты
await go('contacts');
ok('индикатор часов', /Сейчас (открыто|закрыто)/.test(await p.textContent('[data-now]')));
ok('внешние ссылки с noopener', await p.evaluate(() => [...document.querySelectorAll('a[target=_blank]')].every((a) => a.rel === 'noopener')));
ok('нет Instagram и форм', await p.evaluate(() => !document.querySelector('form') && !/instagram/i.test(document.documentElement.innerHTML)));

// Футер
await go('.ft', 1); await p.waitForTimeout(3200);
await p.evaluate(() => document.querySelector('[data-flip]').click());
ok('вывеска переворачивается', await p.evaluate(() => document.querySelector('[data-flip]').getAttribute('aria-pressed') === 'true'));
ok('конец страницы достижим', await p.evaluate(() => Math.abs(innerHeight + scrollY - document.documentElement.scrollHeight) < 3));
if (W >= 1024) {
  const leaf = await p.$('[data-leaf="rituals"]'); const lb = await leaf.boundingBox();
  await p.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2); await p.waitForTimeout(2800);
  const t = await p.evaluate(() => document.getElementById('rituals').getBoundingClientRect().top);
  ok('клик по листу ведёт к секции', Math.abs(t) < 6, 'top ' + t.toFixed(0));
  ok('лист активной секции подписан', await p.evaluate(() => document.querySelector('[data-leaf="rituals"]').classList.contains('is-active')));
}
ok('консоль без ошибок', !errs.length, errs.join(' | ').slice(0, 300));
await c.close();

// Reduced motion
{
  const c = await newCtx({ reducedMotion: 'reduce' }); const p = await c.newPage();
  await p.goto(URL, { waitUntil: 'load' }); await wait(p); await p.waitForTimeout(500);
  ok('reduced: нет прелоадера', !(await p.$('[data-preloader]')));
  ok('reduced: нет Lenis и pin', await p.evaluate(() => !window.__zaytun.lenis && !document.querySelector('.pin-spacer')));
  ok('reduced: голоса статичны', await p.evaluate(() => !document.querySelector('[data-voices]').classList.contains('is-run')));
  ok('reduced: без скролла вбок', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await p.evaluate(() => document.getElementById('tab-gold').click()); await p.waitForTimeout(200);
  ok('reduced: циферблат работает', await p.evaluate(() => document.querySelector('[data-dial-min]').textContent === '120'));
  await c.close();
}
// Без JS
{
  const c = await newCtx({ javaScriptEnabled: false }); const p = await c.newPage();
  await p.goto(URL, { waitUntil: 'load' });
  const t = await p.innerText('body');
  ok('без JS: тексты на месте', ['Здесь время', 'Олива растёт', 'Ханбике', 'Массаж 60 минут', 'Подарите ей паузу', 'Тот самый случай', 'Комсомольская'].every((s) => t.includes(s)));
  ok('без JS: программы списком', t.includes('150 минут') && t.includes('11 100'));
  ok('без JS: прелоадер не мешает', !(await p.isVisible('[data-preloader]')));
  await c.close();
}
const bad = results.filter((r) => !r[1]);
console.log(`\n${results.length - bad.length}/${results.length}`, bad.length ? 'провалено: ' + bad.map((r) => r[0]).join('; ') : '');
await b.close();
