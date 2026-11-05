// Две бегущие строки навстречу, ~30 px/с, бесшовно. При reduced motion и без JS — статичная сетка.
import { ctx } from './main.js';

export function initVoices() {
  const root = document.querySelector('[data-voices]');
  if (!root || ctx.reduce) return;
  const rows = [...root.querySelectorAll('.voi-row')].map((el) => {
    const originals = [...el.children];
    return { el, originals, dir: Number(el.dataset.dir), x: 0, w: 0 };
  });
  root.classList.add('is-run');

  const fill = () => {
    rows.forEach((r) => {
      [...r.el.children].slice(r.originals.length).forEach((c) => c.remove());
      const gap = parseFloat(getComputedStyle(r.el).columnGap) || 0;
      const setW = r.originals.reduce((a, li) => a + li.offsetWidth + gap, 0);
      r.w = setW;
      const copies = Math.max(1, Math.ceil(innerWidth / setW));
      for (let i = 0; i < copies; i++) {
        r.originals.forEach((li) => {
          const c = li.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          r.el.append(c);
        });
      }
      if (r.dir > 0) r.x = -setW;
    });
  };
  fill();
  document.fonts?.ready.then(fill);
  let lastW = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; fill(); } });

  let paused = false, visible = false, last = 0, raf = 0;
  const step = (t) => {
    const dt = Math.min(64, t - last || 16) / 1000;
    last = t;
    if (!paused) {
      rows.forEach((r) => {
        r.x += r.dir * 30 * dt;
        if (r.dir < 0 && r.x <= -r.w) r.x += r.w;
        if (r.dir > 0 && r.x >= 0) r.x -= r.w;
        r.el.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0)`;
      });
    }
    raf = visible ? requestAnimationFrame(step) : 0;
  };
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  }).observe(root);
  root.addEventListener('pointerenter', () => { paused = true; });
  root.addEventListener('pointerleave', () => { paused = false; });
  root.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  root.addEventListener('touchend', () => { paused = false; }, { passive: true });
}
