// Циферблат ритуала: программа раскладывается шагами по кольцу
import { ctx } from './main.js';
import { rituals, wa, MESSAGES, money } from './data.js';

const SVG = 'http://www.w3.org/2000/svg';
const group = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export function initRitualDial() {
  const { gsap, reduce } = ctx;
  const root = document.querySelector('[data-rituals]');
  if (!root) return;
  const list = root.querySelector('[data-rit-list]');
  const tabs = [...list.querySelectorAll('.rit-tab')];
  const panel = root.querySelector('[data-dial-wrap]');
  const dial = root.querySelector('[data-dial]');
  const dotsG = dial.querySelector('.dial-dots');
  const beam = dial.querySelector('.dial-beam');
  const labels = dial.querySelector('[data-dial-labels]');
  const stepsList = root.querySelector('[data-dial-steps]');
  const elMin = dial.querySelector('[data-dial-min]');
  const elPrice = dial.querySelector('[data-dial-price]');
  const elLine = dial.querySelector('[data-dial-line]');
  const elSign = dial.querySelector('[data-dial-sign]');
  const cta = root.querySelector('[data-dial-cta]');
  const ctaText = cta.querySelector('span');

  // Включаем интерактивную версию только когда всё готово: без JS остаётся обычный список
  root.classList.add('dials-on');
  panel.hidden = false;
  panel.setAttribute('role', 'tabpanel');
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'SPA-программы');
  list.setAttribute('aria-orientation', 'vertical');
  list.querySelectorAll('li').forEach((li) => li.setAttribute('role', 'presentation'));
  tabs.forEach((t) => {
    t.setAttribute('role', 'tab');
    t.setAttribute('aria-controls', 'ritual-panel');
  });

  const R = 92;
  let current = null;
  let minutes = 0, price = 0;
  let tl = null;

  const buildDots = (r) => {
    dotsG.textContent = '';
    return r.steps.map((_, i) => {
      const g = document.createElementNS(SVG, 'g');
      g.setAttribute('class', 'dial-dot');
      g.dataset.i = i;
      const c = document.createElementNS(SVG, 'circle');
      c.setAttribute('cy', -R); c.setAttribute('r', 2);
      const t = document.createElementNS(SVG, 'text');
      t.setAttribute('y', -R); t.textContent = i + 1;
      g.append(c, t);
      dotsG.append(g);
      return g;
    });
  };

  const buildLabels = (r) => {
    labels.textContent = '';
    stepsList.textContent = '';
    const n = r.steps.length;
    // внутри контейнера-диала: кольцо занимает 62 % ширины, высота диала — 80 % ширины
    r.steps.forEach((s, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rx = 31 * 1.07; // в % от ширины
      const ry = (31 * 1.07) / 0.8; // в % от высоты
      const cx = Math.cos(a), sy = Math.sin(a);
      const li = document.createElement('li');
      li.textContent = s;
      li.tabIndex = 0;
      li.dataset.i = i;
      li.style.setProperty('--lx', `${(50 + cx * rx).toFixed(2)}%`);
      li.style.setProperty('--ly', `${(50 + sy * ry).toFixed(2)}%`);
      li.style.setProperty('--tx', Math.abs(cx) < 0.2 ? '-50%' : cx > 0 ? '0%' : '-100%');
      labels.append(li);
      const m = document.createElement('li');
      m.textContent = s;
      stepsList.append(m);
    });
  };

  const hi = (i) => {
    dial.classList.toggle('is-focus', i !== null);
    dial.querySelectorAll('.dial-dot, .dial-labels li').forEach((el) => el.classList.toggle('is-hi', String(el.dataset.i) === String(i)));
  };
  labels.addEventListener('pointerover', (e) => { const li = e.target.closest('li'); if (li) hi(li.dataset.i); });
  labels.addEventListener('pointerout', () => hi(null));
  labels.addEventListener('focusin', (e) => { const li = e.target.closest('li'); if (li) hi(li.dataset.i); });
  labels.addEventListener('focusout', () => hi(null));

  const setText = (r) => {
    elLine.textContent = r.line;
    elSign.hidden = !r.signature;
    ctaText.textContent = `Записаться на «${r.name}»`;
    cta.href = wa(MESSAGES.ritual(r.name));
  };

  const select = (id, { focus = false, first = false } = {}) => {
    const r = rituals.find((x) => x.id === id);
    if (!r || current === id) return;
    current = id;
    tabs.forEach((t) => {
      const on = t.dataset.id === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) {
        panel.setAttribute('aria-labelledby', t.id);
        if (focus) t.focus();
        // В мобильной ленте держим активную программу в поле зрения
        const strip = t.closest('.rit-list');
        if (strip && strip.scrollWidth > strip.clientWidth) {
          const li = t.parentElement;
          strip.scrollTo({ left: li.offsetLeft - (strip.clientWidth - li.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
        }
      }
    });
    tl?.kill();
    hi(null);
    const n = r.steps.length;
    const angle = (i) => (i / n) * 360;

    if (reduce || first) {
      const dots = buildDots(r);
      buildLabels(r);
      setText(r);
      minutes = r.minutes; price = r.price;
      elMin.textContent = minutes;
      elPrice.textContent = money(price);
      dots.forEach((d, i) => gsap.set(d, { rotation: angle(i), svgOrigin: '0 0' }));
      if (first && !reduce) {
        // Первое появление — разложить, когда диал виден
        gsap.set(dots, { rotation: 0 });
        gsap.set(labels.children, { opacity: 0 });
        tl = gsap.timeline({
          scrollTrigger: { trigger: dial, start: 'top 72%', once: true },
        });
        tl.to(dots, { rotation: (i) => angle(i), duration: 0.9, ease: 'power2.inOut', stagger: 0.08, svgOrigin: '0 0' }, 0)
          .to(labels.children, { opacity: 1, duration: 0.8, stagger: 0.08, clearProps: 'opacity' }, 0.3);
        runBeam(tl, 0);
      }
      return;
    }

    const oldDots = [...dotsG.children];
    const from = { m: minutes, p: price };
    tl = gsap.timeline();
    tl.to(oldDots, { rotation: 0, duration: 0.5, ease: 'power2.inOut', svgOrigin: '0 0' }, 0)
      .to(labels.children, { opacity: 0, duration: 0.3 }, 0)
      .to(elLine, { opacity: 0, duration: 0.3 }, 0)
      .add(() => {
        const dots = buildDots(r);
        buildLabels(r);
        setText(r);
        gsap.set(dots, { rotation: 0, svgOrigin: '0 0' });
        gsap.set(labels.children, { opacity: 0 });
        gsap.to(dots, { rotation: (i) => angle(i), duration: 0.9, ease: 'power2.inOut', stagger: 0.08, svgOrigin: '0 0' });
        gsap.to(labels.children, { opacity: 1, duration: 0.7, delay: 0.25, stagger: 0.08, clearProps: 'opacity' });
        gsap.to(elLine, { opacity: 1, duration: 0.7, delay: 0.15 });
      }, 0.5);
    tl.to(from, {
      m: r.minutes, p: r.price, duration: 1.1, ease: 'power2.out',
      onUpdate: () => { elMin.textContent = Math.round(from.m); elPrice.textContent = `${group(from.p)} ₽`; },
      onComplete: () => { minutes = r.minutes; price = r.price; },
    }, 0.1);
    minutes = r.minutes; price = r.price;
    runBeam(tl, 0);
  };

  function runBeam(timeline, at) {
    timeline.fromTo(beam, { rotation: 0, opacity: 0, svgOrigin: '0 0' }, { rotation: 360, duration: 1.6, ease: 'sine.inOut', svgOrigin: '0 0' }, at)
      .to(beam, { opacity: 1, duration: 0.3 }, at)
      .to(beam, { opacity: 0, duration: 0.4 }, at + 1.2);
  }

  list.addEventListener('click', (e) => {
    const t = e.target.closest('.rit-tab');
    if (t) select(t.dataset.id);
  });
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const go = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (go) { e.preventDefault(); select(tabs[(i + go + tabs.length) % tabs.length].dataset.id, { focus: true }); }
    if (e.key === 'Home') { e.preventDefault(); select(tabs[0].dataset.id, { focus: true }); }
    if (e.key === 'End') { e.preventDefault(); select(tabs.at(-1).dataset.id, { focus: true }); }
  });

  select('hanbike', { first: true });
}
