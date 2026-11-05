// Лента с инерцией на Pointer Events и лайтбокс, раскрывающийся кругом от точки клика. Без внешних библиотек.
import { ctx } from './main.js';
import { IMAGES } from './images.js';

const types = ['avif', 'webp', 'jpg'];
const srcsetOf = (key, type) => IMAGES[key].widths.map((w) => `img/${key}-${w}.${type} ${w}w`).join(', ');
const pad = (n) => String(n).padStart(2, '0');

export function initGallery() {
  const gal = document.querySelector('[data-gal]');
  if (!gal) return;
  const track = gal.querySelector('[data-gal-track]');
  const all = [...track.children];
  const ctl = document.querySelector('[data-gal-ctl]');
  const nowEl = ctl.querySelector('[data-gal-now]');
  const allEl = ctl.querySelector('[data-gal-all]');
  const bar = ctl.querySelector('.gal-bar');
  const chips = document.querySelector('[data-chips]');
  ctl.hidden = false;
  chips.hidden = false;
  gal.classList.add('is-on');

  let items = all.slice();
  let centers = [], widths = [];
  let vw = 0, x = 0, target = 0, min = 0, max = 0, cur = -1;
  let raf = 0, visible = false, dragging = false, moved = 0, downX = 0, downT = 0, vel = 0, lastX = 0, lastT = 0;

  const measure = () => {
    vw = gal.clientWidth;
    const prevTransform = track.style.transform;
    track.style.transform = 'none';
    items.forEach((it, i) => { centers[i] = it.offsetLeft + it.offsetWidth / 2; widths[i] = it.offsetWidth; });
    track.style.transform = prevTransform;
    centers.length = items.length;
    min = 0;
    max = Math.max(0, track.scrollWidth - vw);
    target = Math.min(max, Math.max(min, target));
    x = Math.min(max, Math.max(min, x));
  };

  const render = () => {
    track.style.transform = `translate3d(${-x.toFixed(2)}px,0,0)`;
    const mid = x + vw / 2;
    let best = 0, bestD = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(centers[i] - mid);
      if (d < bestD) { bestD = d; best = i; }
      const k = Math.min(1, d / (widths[i] * 0.9 + 40));
      const inner = it.firstElementChild.firstElementChild;
      inner.style.transform = ctx.reduce ? '' : `scale(${(1 - 0.08 * k).toFixed(4)})`;
      inner.style.setProperty('--dim', (0.15 * k).toFixed(3));
    });
    if (best !== cur) {
      cur = best;
      nowEl.textContent = pad(best + 1);
    }
    bar.style.setProperty('--p', (max ? x / max : 0).toFixed(4));
  };

  const loop = () => {
    raf = 0;
    x += (target - x) * 0.08;
    if (Math.abs(target - x) < 0.1) x = target;
    render();
    if (x !== target || dragging) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const clampT = (v) => Math.min(max, Math.max(min, v));
  const toItem = (i, instant) => {
    const c = centers[Math.max(0, Math.min(items.length - 1, i))];
    target = clampT(c - vw / 2);
    if (instant || ctx.reduce) x = target;
    kick();
  };

  const snap = () => {
    // Мягко довозим до ближайшего кадра, если не упёрлись в край
    if (target <= min + 1 || target >= max - 1) return;
    const mid = target + vw / 2;
    let best = 0, bd = Infinity;
    centers.forEach((c, i) => { const d = Math.abs(c - mid); if (d < bd) { bd = d; best = i; } });
    toItem(best);
  };

  gal.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    dragging = true; moved = 0; downX = e.clientX; downT = target; vel = 0; lastX = e.clientX; lastT = e.timeStamp;
    if (e.pointerType === 'mouse') e.preventDefault();
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
  });
  function onMove(e) {
    if (!dragging) return;
    const dx = e.clientX - downX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 5) gal.classList.add('is-drag');
    target = clampT(downT - dx * 1.15);
    const dt = e.timeStamp - lastT;
    if (dt > 0) vel = (e.clientX - lastX) / dt;
    lastX = e.clientX; lastT = e.timeStamp;
    kick();
  }
  function onUp() {
    dragging = false;
    gal.classList.remove('is-drag');
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', onUp);
    removeEventListener('pointercancel', onUp);
    if (moved > 5) { target = clampT(target - vel * 260); snap(); }
    kick();
  }
  gal.addEventListener('dragstart', (e) => e.preventDefault());
  gal.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) && !e.shiftKey) return;
    e.preventDefault();
    target = clampT(target + (e.deltaX || e.deltaY));
    kick();
  }, { passive: false });

  gal.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const i = Math.max(0, Math.min(items.length - 1, cur + (e.key === 'ArrowRight' ? 1 : -1)));
      toItem(i);
      items[i].querySelector('a').focus({ preventScroll: true });
    }
  });
  gal.addEventListener('focusin', (e) => {
    const li = e.target.closest('.g-item');
    if (li) { gal.scrollLeft = 0; toItem(items.indexOf(li)); }
  });
  ctl.querySelector('[data-gal-prev]').addEventListener('click', () => toItem(cur - 1));
  ctl.querySelector('[data-gal-next]').addEventListener('click', () => toItem(cur + 1));

  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    const f = b.dataset.f;
    track.style.opacity = 0;
    setTimeout(() => {
      all.forEach((it) => it.classList.toggle('is-off', f !== 'all' && it.dataset.tag !== f));
      items = all.filter((it) => !it.classList.contains('is-off'));
      allEl.textContent = pad(items.length);
      x = target = 0;
      cur = -1;
      measure();
      render();
      track.style.opacity = 1;
    }, ctx.reduce ? 0 : 420);
  });

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) { measure(); render(); }
  }, { rootMargin: '15% 0px' }).observe(gal);
  new ResizeObserver(() => { measure(); render(); }).observe(gal);
  measure();
  render();

  /* ---------- Лайтбокс ---------- */
  const lb = document.querySelector('[data-lb]');
  const stage = lb.querySelector('[data-lb-stage]');
  const capEl = lb.querySelector('[data-lb-cap]');
  const countEl = lb.querySelector('[data-lb-count]');
  const btnClose = lb.querySelector('[data-lb-close]');
  const btnPrev = lb.querySelector('[data-lb-prev]');
  const btnNext = lb.querySelector('[data-lb-next]');
  let idx = 0, opener = null, busy = false;

  const pictureOf = (key) => {
    const p = document.createElement('picture');
    p.innerHTML = types.slice(0, 2).map((t) => `<source type="image/${t}" srcset="${srcsetOf(key, t)}" sizes="92vw">`).join('')
      + `<img src="img/${key}-${IMAGES[key].widths.at(-1)}.jpg" srcset="${srcsetOf(key, 'jpg')}" sizes="92vw" width="${IMAGES[key].w}" height="${IMAGES[key].h}" alt="${IMAGES[key].alt.replace(/"/g, '&quot;')}">`;
    return p;
  };
  const keyOf = (i) => items[i].querySelector('a').dataset.key;
  const preload = (i) => {
    if (i < 0 || i >= items.length) return;
    const im = new Image(); im.sizes = '92vw'; im.srcset = srcsetOf(keyOf(i), 'jpg');
  };
  const setSlide = (i, dir = 0) => {
    idx = (i + items.length) % items.length;
    const key = keyOf(idx);
    const next = pictureOf(key);
    const old = stage.firstElementChild;
    stage.append(next);
    if (old && !ctx.reduce && dir) {
      next.animate([{ opacity: 0, transform: `translateX(${dir * 26}px)` }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.22,.61,.12,1)' });
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).onfinish = () => old.remove();
    } else if (old) old.remove();
    capEl.textContent = IMAGES[key].alt;
    countEl.textContent = `${pad(idx + 1)} / ${pad(items.length)}`;
    preload(idx + 1); preload(idx - 1);
  };
  const lock = (on) => {
    if (ctx.lenis) { on ? ctx.lenis.stop() : ctx.lenis.start(); } else document.documentElement.style.overflow = on ? 'hidden' : '';
  };
  const circle = (x0, y0, kf) => {
    const R = Math.hypot(Math.max(x0, innerWidth - x0), Math.max(y0, innerHeight - y0)) * 1.05;
    const a = `circle(0px at ${x0}px ${y0}px)`, b = `circle(${R}px at ${x0}px ${y0}px)`;
    return lb.animate({ clipPath: kf === 'open' ? [a, b] : [b, a] }, { duration: ctx.reduce ? 200 : 900, easing: 'cubic-bezier(.87,0,.13,1)', fill: 'both' });
  };
  const open = (i, x0, y0, a) => {
    if (busy) return;
    busy = true;
    opener = a;
    lb.hidden = false;
    setSlide(i);
    lock(true);
    const anim = ctx.reduce ? lb.animate({ opacity: [0, 1] }, { duration: 200 }) : circle(x0, y0, 'open');
    anim.onfinish = () => { busy = false; if (!ctx.reduce) { anim.cancel(); } };
    btnClose.focus({ preventScroll: true });
  };
  const close = () => {
    if (busy) return;
    busy = true;
    // Лента догоняет текущий кадр, закрываемся в его миниатюру
    toItem(idx, true);
    render();
    const r = items[idx].getBoundingClientRect();
    const x0 = r.left + r.width / 2, y0 = Math.max(0, Math.min(innerHeight, r.top + r.height / 2));
    const anim = ctx.reduce ? lb.animate({ opacity: [1, 0] }, { duration: 200, fill: 'both' }) : circle(x0, y0, 'close');
    anim.onfinish = () => {
      lb.hidden = true;
      anim.cancel();
      stage.textContent = '';
      lock(false);
      busy = false;
      (items[idx].querySelector('a') || opener)?.focus({ preventScroll: true });
    };
  };

  track.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-key]');
    if (!a) return;
    e.preventDefault();
    if (moved > 5) return;
    const li = a.parentElement;
    const i = items.indexOf(li);
    const cx = e.clientX || li.getBoundingClientRect().left + li.offsetWidth / 2;
    const cy = e.clientY || li.getBoundingClientRect().top + li.offsetHeight / 2;
    open(i, cx, cy, a);
  });
  btnClose.addEventListener('click', close);
  btnNext.addEventListener('click', () => setSlide(idx + 1, 1));
  btnPrev.addEventListener('click', () => setSlide(idx - 1, -1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'ArrowRight') setSlide(idx + 1, 1);
    if (e.key === 'ArrowLeft') setSlide(idx - 1, -1);
    if (e.key === 'Tab') {
      const f = [btnClose, btnPrev, btnNext];
      const at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  // Свайп
  let sx = null;
  lb.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
  lb.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const d = e.clientX - sx; sx = null;
    if (Math.abs(d) > 50) setSlide(idx + (d < 0 ? 1 : -1), d < 0 ? 1 : -1);
  });
}
