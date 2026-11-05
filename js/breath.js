// «Минута на себя»: вдох 4 с, задержка 2 с, выдох 6 с — три цикла
import { ctx } from './main.js';

export function initBreath() {
  const { gsap, reduce } = ctx;
  const root = document.querySelector('[data-breath]');
  if (!root) return;
  const circle = root.querySelector('[data-br-circle]');
  const leaves = root.querySelector('[data-br-leaves]');
  const word = root.querySelector('[data-br-word]');
  const btn = root.querySelector('[data-br-btn]');
  const end = root.querySelector('[data-br-end]');
  let tl = null, spin = null;

  const stop = () => {
    tl?.kill(); tl = null;
    spin?.pause();
    if (!reduce) gsap.to(circle, { scale: 1, duration: 1.2, ease: 'sine.inOut' });
    word.textContent = '';
    btn.textContent = 'Начать';
    btn.classList.remove('is-run');
  };
  const finish = () => {
    stop();
    end.hidden = false;
    gsap.fromTo(end, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power1.out' });
  };
  const start = () => {
    end.hidden = true;
    btn.textContent = 'Остановить';
    btn.classList.add('is-run');
    if (!reduce) {
      spin = spin || gsap.to(leaves, { rotation: 360, duration: 60, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      spin.play();
    }
    tl = gsap.timeline({ onComplete: finish });
    for (let i = 0; i < 3; i++) {
      tl.call(() => { word.textContent = 'вдох'; })
        .to(circle, { scale: reduce ? 1 : 1.35, duration: 4, ease: 'sine.inOut' })
        .call(() => { word.textContent = 'задержка'; })
        .to({}, { duration: 2 })
        .call(() => { word.textContent = 'выдох'; })
        .to(circle, { scale: 1, duration: 6, ease: 'sine.inOut' });
    }
  };
  btn.addEventListener('click', () => { if (tl) stop(); else start(); });
}
