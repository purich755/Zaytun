// Сертификат наклоняется за курсором, блик бежит следом
import { ctx } from './main.js';

export function initGift() {
  const { gsap, reduce, fine } = ctx;
  const box = document.querySelector('[data-gift]');
  const cert = box?.querySelector('[data-cert]');
  if (!cert || reduce || !fine || !matchMedia('(min-width: 1024px)').matches) return;
  const shine = cert.querySelector('.cert-shine');
  let tx = 0, ty = 0, x = 0, y = 0, gx = 30, gy = 20, tgx = 30, tgy = 20, running = false;
  const step = () => {
    x += (tx - x) * 0.1; y += (ty - y) * 0.1;
    gx += (tgx - gx) * 0.1; gy += (tgy - gy) * 0.1;
    gsap.set(cert, { rotationX: y, rotationY: x });
    shine.style.setProperty('--gx', `${gx.toFixed(1)}%`);
    shine.style.setProperty('--gy', `${gy.toFixed(1)}%`);
    if (Math.abs(tx - x) + Math.abs(ty - y) < 0.01 && tx === 0 && ty === 0) { running = false; gsap.ticker.remove(step); }
  };
  const run = () => { if (!running) { running = true; gsap.ticker.add(step); } };
  cert.addEventListener('pointermove', (e) => {
    const r = cert.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    tx = (px - 0.5) * 16; ty = -(py - 0.5) * 16;
    tgx = px * 100; tgy = py * 100;
    run();
  });
  cert.addEventListener('pointerleave', () => { tx = 0; ty = 0; run(); });
}
