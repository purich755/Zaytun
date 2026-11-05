// «Оливия»: листья, соль и мёд сходятся в один круг
import { ctx } from './main.js';

export function initOlivia() {
  const { gsap, reduce } = ctx;
  const sec = document.querySelector('[data-olivia]');
  if (!sec) return;
  const items = gsap.utils.toArray('[data-ol]', sec);
  const caps = gsap.utils.toArray('[data-ol-cap]', sec);
  const core = sec.querySelector('[data-ol-core]');
  const goo = sec.querySelector('[data-ol-goo]');
  const stage = sec.querySelector('[data-ol-stage]');

  if (reduce) return; // раскладка без сцены — в CSS

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    const toCenter = (el) => {
      const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { x: s.left + s.width / 2 - (r.left + r.width / 2), y: s.top + s.height / 2 - (r.top + r.height / 2) };
    };
    const offs = items.map(toCenter);
    gsap.set(core, { scale: 0.62 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: '+=140%', pin: true, scrub: 1, anticipatePin: 1,
        onUpdate: (st) => { goo.classList.toggle('is-goo', st.progress > 0.22 && st.progress < 0.8); },
      },
    });
    items.forEach((el, i) => {
      tl.to(el, { x: offs[i].x, y: offs[i].y, scale: 0.6, duration: 0.56, ease: 'sine.inOut' }, 0.08);
    });
    tl.to(caps, { opacity: 0, duration: 0.18 }, 0.12)
      .to(core, { opacity: 1, scale: 1, duration: 0.3, ease: 'sine.out' }, 0.56)
      .to(items, { opacity: 0, duration: 0.14 }, 0.68)
      .to({}, { duration: 0.14 });
    return () => { gsap.set([...items, ...caps, core], { clearProps: 'all' }); goo.classList.remove('is-goo'); };
  });

  // Телефон: три круга наезжают друг на друга при появлении
  mm.add('(max-width: 1023px)', () => {
    gsap.set(core, { opacity: 1 });
    const anims = items.map((el, i) => (i === 0 ? null : gsap.from(el, {
      y: 70, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    })));
    return () => { anims.forEach((a) => a?.scrollTrigger?.kill()); gsap.set(items, { clearProps: 'all' }); };
  });
}
