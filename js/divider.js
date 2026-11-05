// «Движение и покой»: перетягиваемая граница между двумя кадрами. Работает без GSAP.
import { ctx } from './main.js';

export function initDivider() {
  const box = document.querySelector('[data-balance]');
  if (!box) return;
  const handle = box.querySelector('.bal-handle');
  const capL = box.querySelector('[data-bal-l]');
  const capR = box.querySelector('[data-bal-r]');
  const vertical = () => matchMedia('(max-width: 767px)').matches;
  let x = 50, target = 50, raf = 0, dragging = false, touched = false;

  const paint = () => {
    box.style.setProperty('--x', `${x.toFixed(2)}%`);
    capL.style.opacity = Math.min(1, Math.max(0.15, x / 50)).toFixed(2);
    capR.style.opacity = Math.min(1, Math.max(0.15, (100 - x) / 50)).toFixed(2);
    const v = Math.round(x);
    handle.setAttribute('aria-valuenow', String(v));
    handle.setAttribute('aria-valuetext', v > 60 ? 'Больше зала' : v < 40 ? 'Больше SPA' : 'Поровну зала и SPA');
  };
  const loop = () => {
    x += (target - x) * (dragging ? 0.28 : 0.12);
    paint();
    raf = Math.abs(target - x) > 0.04 ? requestAnimationFrame(loop) : 0;
    if (!raf) { x = target; paint(); }
  };
  const go = (v) => { target = Math.min(100, Math.max(0, v)); if (!raf) raf = requestAnimationFrame(loop); };

  const fromEvent = (e) => {
    const r = box.getBoundingClientRect();
    return vertical() ? ((e.clientY - r.top) / r.height) * 100 : ((e.clientX - r.left) / r.width) * 100;
  };
  const move = (e) => { if (dragging) go(fromEvent(e)); };
  const up = () => { dragging = false; removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
  const start = (e) => {
    touched = true;
    dragging = true;
    e.preventDefault();
    go(fromEvent(e));
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  };
  handle.addEventListener('pointerdown', start);
  // На десктопе можно тянуть за любое место кадра; на телефоне кадр оставляем для прокрутки страницы
  box.addEventListener('pointerdown', (e) => { if (!vertical() && e.pointerType === 'mouse' && e.target !== handle) start(e); });

  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 12 : 4;
    const map = { ArrowLeft: -step, ArrowDown: vertical() ? step : -step, ArrowRight: step, ArrowUp: vertical() ? -step : step };
    if (e.key in map) { e.preventDefault(); touched = true; go(target + map[e.key]); }
    if (e.key === 'Home') { e.preventDefault(); go(0); }
    if (e.key === 'End') { e.preventDefault(); go(100); }
  });

  // Подсказка: один раз покачивается при первом появлении
  if (!ctx.reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      if (touched) return;
      const t0 = performance.now(), D = 1400;
      const wobble = (t) => {
        if (touched) return;
        const k = Math.min(1, (t - t0) / D);
        x = target = 50 + Math.sin(k * Math.PI * 2) * 12 * (1 - k * 0.25) * (k < 1 ? 1 : 0);
        paint();
        if (k < 1) requestAnimationFrame(wobble);
      };
      requestAnimationFrame(wobble);
    }, { threshold: 0.55 });
    io.observe(box);
  }
  paint();
}
