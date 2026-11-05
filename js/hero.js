// Круг-окно расширяется на весь экран, кольцо растворяется, заголовок уходит вверх
import { ctx } from './main.js';

export function initHero() {
  const { gsap, reduce } = ctx;
  const hero = document.querySelector('[data-hero]');
  const frame = hero.querySelector('[data-hero-frame]');
  const ring = hero.querySelector('[data-hero-ring]');
  const h1 = hero.querySelectorAll('[data-hero-h]');
  const fades = hero.querySelectorAll('[data-hero-fade]');
  document.body.classList.add('hero-ready');
  if (reduce) return;

  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 768px)', mob: '(max-width: 767px)' }, (c) => {
    const isMob = c.conditions.mob;
    const measure = () => {
      const r = ring.getBoundingClientRect();
      const box = hero.getBoundingClientRect();
      const radius = r.width / 2 - 6;
      const cy = isMob ? parseFloat(getComputedStyle(hero).getPropertyValue('--r')) : 0;
      return { radius, x: box.width / 2, y: r.top - box.top + r.height / 2, cy, max: Math.hypot(box.width, box.height) * 1.02 };
    };
    let m = measure();
    const at = () => `${m.x}px ${m.y}px`;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero, start: 'top top', end: isMob ? '+=80%' : '+=120%',
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onRefreshInit: () => { gsap.set(frame, { clearProps: 'clipPath' }); gsap.set(ring, { clearProps: 'opacity,scale' }); m = measure(); },
      },
    });
    tl.fromTo(frame, { clipPath: () => `circle(${m.radius}px at ${at()})` }, { clipPath: () => `circle(${m.max}px at ${at()})`, duration: 1, ease: 'power1.in' }, 0)
      .to(ring, { scale: () => (isMob ? 1.7 : 1.5), opacity: 0, duration: 0.4 }, 0)
      .to(fades, { opacity: 0, duration: 0.22 }, 0)
      .to(h1, { y: isMob ? -60 : -110, opacity: 0, duration: 0.56, ease: 'power1.in' }, 0)
      .to({}, { duration: 0.14 });
    return () => { gsap.set([frame, ring, ...h1, ...fades], { clearProps: 'all' }); };
  });
}
