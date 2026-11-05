// Кастомный курсор только для мыши: точка, над фото «смотреть», над перетаскиваемым «тянуть»
import { ctx } from './main.js';

export function initCursor() {
  if (!ctx.fine || ctx.reduce) return;
  const el = document.querySelector('[data-cur]');
  const label = el.querySelector('span');
  document.body.classList.add('has-cursor');
  el.style.transform = 'translate3d(-100px,-100px,0)';
  let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
  const step = () => {
    x += (tx - x) * 0.18; y += (ty - y) * 0.18;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(step) : 0;
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });
  const TEXT = { view: 'смотреть', drag: 'тянуть' };
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.('[data-cursor]');
    const kind = t?.dataset.cursor;
    el.classList.toggle('is-big', !!kind);
    if (kind) label.textContent = TEXT[kind];
  });
  document.addEventListener('pointerleave', () => { tx = -100; ty = -100; x = -100; y = -100; el.style.transform = 'translate3d(-100px,-100px,0)'; });
}
