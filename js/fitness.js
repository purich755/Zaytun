// Подвешенные карточки: качаются от скорости скролла, ряд тянется мышью
import { ctx } from './main.js';

export function initFitness() {
  const { gsap, ScrollTrigger, reduce } = ctx;
  const scroller = document.querySelector('[data-fit-scroll]');
  if (!scroller) return;
  const cards = gsap.utils.toArray('[data-swing]');

  // Перетаскивание мышью. Слушаем window, указатель не захватываем: клики внутри остаются рабочими.
  let down = false, sx = 0, sl = 0, moved = 0, vel = 0, lastX = 0, lastT = 0, glide = 0;
  scroller.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; sx = e.clientX; sl = scroller.scrollLeft; moved = 0; vel = 0; lastX = e.clientX; lastT = e.timeStamp;
    cancelAnimationFrame(glide);
    e.preventDefault();
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    moved = Math.max(moved, Math.abs(e.clientX - sx));
    if (moved > 4) scroller.classList.add('is-drag');
    scroller.scrollLeft = sl - (e.clientX - sx);
    const dt = e.timeStamp - lastT;
    if (dt > 0) vel = (e.clientX - lastX) / dt;
    lastX = e.clientX; lastT = e.timeStamp;
  }, { passive: true });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    scroller.classList.remove('is-drag');
    if (reduce) return;
    let v = vel * 16;
    const step = () => {
      if (Math.abs(v) < 0.2) return;
      scroller.scrollLeft -= v;
      v *= 0.95;
      glide = requestAnimationFrame(step);
    };
    step();
  });
  scroller.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      scroller.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * 320, behavior: reduce ? 'auto' : 'smooth' });
    }
  });

  if (reduce) return;

  // Качание: только пока секция на экране
  const small = matchMedia('(max-width: 767px)').matches;
  const maxAngle = small ? 1.3 : 2.5;
  let settled = true, lastLeft = scroller.scrollLeft, visible = false;
  const clamp = gsap.utils.clamp(-maxAngle, maxAngle);
  ScrollTrigger.create({ trigger: scroller, start: 'top bottom', end: 'bottom top', onToggle: (s) => { visible = s.isActive; } });

  gsap.ticker.add(() => {
    if (!visible) return;
    const vy = ctx.lenis ? ctx.lenis.velocity : ScrollTrigger.getVelocity?.() / 60 || 0;
    const vx = scroller.scrollLeft - lastLeft;
    lastLeft = scroller.scrollLeft;
    const v = vy * 0.09 - vx * 0.11;
    if (Math.abs(v) > 0.08) {
      settled = false;
      cards.forEach((c, i) => gsap.to(c, { rotation: clamp(v * (1 + (i % 3) * 0.14)), duration: 0.45, ease: 'sine.out', overwrite: true }));
    } else if (!settled) {
      settled = true;
      cards.forEach((c, i) => gsap.to(c, { rotation: 0, duration: 1.2, delay: i * 0.02, ease: 'elastic.out(1, .6)', overwrite: true }));
    }
  });
}
