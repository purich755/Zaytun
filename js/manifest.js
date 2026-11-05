// Манифест проявляется по словам по мере скролла
import { ctx } from './main.js';

export function initManifest() {
  const { gsap, reduce } = ctx;
  const el = document.querySelector('[data-manifest]');
  if (!el || reduce) return;
  const split = new window.SplitText(el, { type: 'words', aria: 'none', wordsClass: 'mw' });
  // До входа в экран текст полный (важно для контраста и для тех, кто не докрутил); бледнеет за нижним краем окна
  gsap.fromTo(split.words, { opacity: 0.12 }, {
    opacity: 1, ease: 'none', stagger: 0.05, immediateRender: false,
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 52%', scrub: 0.8 },
  });
}
