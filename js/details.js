// «Мелочи»: круглое окно меняет кадр при наведении на пункт, без наведения — само раз в 4 секунды
import { ctx } from './main.js';
import { IMAGES } from './images.js';

const srcsetOf = (key, type) => IMAGES[key].widths.map((w) => `img/${key}-${w}.${type} ${w}w`).join(', ');

export function initDetails() {
  const list = document.querySelector('[data-det-list]');
  const win = document.querySelector('[data-det-window]');
  if (!list || !win) return;
  const frame = win.querySelector('.det-frame');
  const items = [...list.children];
  items.forEach((li, i) => li.style.setProperty('--rd', `${i * 0.06}s`));
  if (!matchMedia('(min-width: 768px)').matches) return;

  const layers = new Map();
  layers.set(items[0].dataset.img, frame.querySelector('.det-layer'));
  const makeLayer = (key) => {
    if (layers.has(key)) return layers.get(key);
    const p = document.createElement('picture');
    p.className = 'det-layer';
    p.innerHTML = `<source type="image/avif" srcset="${srcsetOf(key, 'avif')}" sizes="34vw"><source type="image/webp" srcset="${srcsetOf(key, 'webp')}" sizes="34vw"><img src="img/${key}-${IMAGES[key].widths[0]}.jpg" srcset="${srcsetOf(key, 'jpg')}" sizes="34vw" width="${IMAGES[key].w}" height="${IMAGES[key].h}" alt="" decoding="async">`;
    frame.append(p);
    layers.set(key, p);
    return p;
  };

  let idx = 0, hovering = false, timer = 0, visible = false;
  const show = (i) => {
    idx = i;
    const key = items[i].dataset.img;
    const layer = makeLayer(key);
    const on = () => {
      frame.querySelectorAll('.det-layer.is-on').forEach((l) => { if (l !== layer) l.classList.remove('is-on'); });
      layer.classList.add('is-on');
    };
    const img = layer.querySelector('img');
    if (img.complete) requestAnimationFrame(on); else img.addEventListener('load', on, { once: true });
    items.forEach((li, n) => li.classList.toggle('is-cur', n === i));
  };
  const tick = () => { if (visible && !hovering) show((idx + 1) % items.length); };
  const restart = () => { clearInterval(timer); if (visible && !ctx.reduce) timer = setInterval(tick, 4000); };

  items.forEach((li, i) => {
    li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; show(i); } });
    li.addEventListener('pointerleave', () => { hovering = false; restart(); });
    li.addEventListener('focus', () => { hovering = true; show(i); });
    li.addEventListener('blur', () => { hovering = false; restart(); });
  });

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) {
      // Подгружаем остальные кадры, когда окно уже рядом
      items.forEach((li) => { const im = new Image(); im.srcset = srcsetOf(li.dataset.img, 'jpg'); im.sizes = '34vw'; });
      items[idx].classList.add('is-cur');
    }
    restart();
  }, { rootMargin: '20% 0px' }).observe(win);
}
