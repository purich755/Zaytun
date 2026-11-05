// Анимация — чистый CSS (см. sections.css), она не ждёт скриптов. Здесь только пропуск кликом и уборка.
export function initPreloader() {
  const el = document.querySelector('[data-preloader]');
  if (!el) return;
  if (!document.documentElement.hasAttribute('data-pre')) { el.remove(); return; }
  const done = () => el.remove();
  el.addEventListener('animationend', (e) => { if (e.animationName === 'pre-out') done(); });
  el.addEventListener('click', () => {
    el.style.transition = 'opacity .35s';
    el.style.animation = 'none';
    el.style.opacity = '0';
    setTimeout(done, 360);
  });
  setTimeout(done, 2600); // страховка, если анимация не сработала
}
