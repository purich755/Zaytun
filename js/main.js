// Порядок: лёгкое без GSAP — сразу; GSAP и Lenis — после load, чтобы не мешать первой отрисовке.
import { initPreloader } from './preloader.js';
import { initBranch } from './branch.js';
import { initHero } from './hero.js';
import { initManifest } from './manifest.js';
import { initDivider } from './divider.js';
import { initFitness } from './fitness.js';
import { initRitualDial } from './ritual-dial.js';
import { initOlivia } from './olivia.js';
import { initDetails } from './details.js';
import { initGallery } from './gallery.js';
import { initGift } from './gift.js';
import { initVoices } from './voices.js';
import { initBreath } from './breath.js';
import { initContacts } from './contacts.js';
import { initCursor } from './cursor.js';

const CDN = 'https://cdn.jsdelivr.net/npm/';
const LIBS = [
  `${CDN}gsap@3.13.0/dist/gsap.min.js`,
  `${CDN}gsap@3.13.0/dist/ScrollTrigger.min.js`,
  `${CDN}gsap@3.13.0/dist/SplitText.min.js`,
  `${CDN}gsap@3.13.0/dist/DrawSVGPlugin.min.js`,
  `${CDN}lenis@1.3.11/dist/lenis.min.js`,
];

// Общий контекст всех модулей. gsap и lenis появляются после загрузки библиотек.
export const ctx = {
  reduce: document.documentElement.hasAttribute('data-reduce'),
  fine: matchMedia('(pointer: fine)').matches,
  gsap: null,
  ScrollTrigger: null,
  lenis: null,
};
window.__zaytun = ctx;

/* ---------- Появления: IntersectionObserver без GSAP ---------- */
function initReveals() {
  const els = document.querySelectorAll('[data-reveal], .det-list li');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach((e) => io.observe(e));
}

/* ---------- Кнопка: заливка кругом от курсора ---------- */
function initButtons() {
  document.addEventListener('pointerover', (e) => {
    const b = e.target.closest?.('.btn');
    if (!b || e.pointerType !== 'mouse') return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', `${e.clientX - r.left}px`);
    b.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

/* ---------- Шапка ---------- */
function initHeader() {
  const body = document.body;
  let last = window.scrollY, ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    body.classList.toggle('hdr-solid', y > 80);
    if (Math.abs(y - last) > 6) {
      body.classList.toggle('hdr-hidden', y > last && y > 160 && !body.classList.contains('menu-open'));
      last = y;
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  // Меню «Записаться»
  const book = document.querySelector('[data-book]');
  const bookBtn = book.querySelector('button');
  const bookMenu = book.querySelector('ul');
  const setBook = (open) => { bookMenu.hidden = !open; bookBtn.setAttribute('aria-expanded', String(open)); };
  bookBtn.addEventListener('click', (e) => { e.stopPropagation(); setBook(bookMenu.hidden); });
  document.addEventListener('click', (e) => { if (!book.contains(e.target)) setBook(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !bookMenu.hidden) { setBook(false); bookBtn.focus(); } });

  // Мобильное меню
  const burger = document.querySelector('[data-burger]');
  const menu = document.getElementById('mob-menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      ctx.lenis?.stop();
    } else {
      menu.classList.remove('is-open');
      ctx.lenis?.start();
      setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 900);
    }
    if (!ctx.lenis) document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
}

/* ---------- Якоря ---------- */
function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    scrollToSection(el);
    if (id !== 'top') el.setAttribute('tabindex', '-1');
    history.replaceState(null, '', `#${id}`);
  });
}
export function scrollToSection(el) {
  const target = el.closest('.pin-spacer') || el;
  if (ctx.lenis) {
    ctx.lenis.scrollTo(target, { duration: 2, easing: (t) => 1 - Math.pow(1 - t, 4), force: true });
  } else {
    const y = target.getBoundingClientRect().top + scrollY;
    scrollTo({ top: y, behavior: ctx.reduce ? 'auto' : 'smooth' });
  }
}

/* ---------- Параллакс ---------- */
function initParallax() {
  const { gsap, reduce } = ctx;
  if (reduce) return;
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const k = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -k * 18 }, {
      yPercent: k * 18, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
  });
}

/* ---------- Загрузка библиотек ---------- */
function loadLibs() {
  return Promise.all(LIBS.map((src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = false; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = () => rej(new Error(src));
    document.head.appendChild(s);
  })));
}

function initLenis() {
  const { gsap, ScrollTrigger, reduce } = ctx;
  if (reduce) return;
  const lenis = new window.Lenis({
    duration: 1.65,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    wheelMultiplier: 0.86,
    touchMultiplier: 1.1,
  });
  ctx.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
}

async function boot() {
  try {
    await loadLibs();
  } catch (err) {
    // CDN недоступен: страница остаётся статичной, но читаемой
    console.warn('Библиотеки анимации не загрузились', err.message);
    document.body.classList.add('js-ready');
    return;
  }
  const { gsap, ScrollTrigger, SplitText, DrawSVGPlugin } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  gsap.config({ nullTargetWarn: false });
  ctx.gsap = gsap;
  ctx.ScrollTrigger = ScrollTrigger;
  ScrollTrigger.config({ ignoreMobileResize: true });

  initLenis();
  // Сцены с pin — первыми: триггеры ниже по странице должны учитывать их длину
  initHero();
  initOlivia();
  initManifest();
  initFitness();
  initRitualDial();
  initBreath();
  initGift();
  initParallax();
  initFooter();
  initBranch();

  document.body.classList.add('js-ready');
  ScrollTrigger.refresh();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // Высота страницы могла измениться: картинки, шрифты, смена программы
  let h = document.body.scrollHeight, t;
  new ResizeObserver(() => {
    const nh = document.body.scrollHeight;
    if (Math.abs(nh - h) < 4) return;
    h = nh;
    clearTimeout(t);
    t = setTimeout(() => ScrollTrigger.refresh(), 240);
  }).observe(document.body);

  // Если страница открыта с якорем
  if (location.hash.length > 1) {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) { const y = (el.closest('.pin-spacer') || el).getBoundingClientRect().top + scrollY; ctx.lenis ? ctx.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }
  }
}

function initFooter() {
  const { gsap, reduce } = ctx;
  const stroke = document.querySelector('.ft-stroke');
  const flip = document.querySelector('[data-flip]');
  flip?.addEventListener('click', () => flip.setAttribute('aria-pressed', String(flip.getAttribute('aria-pressed') !== 'true')));
  if (!stroke || reduce) return;
  gsap.fromTo(stroke, { drawSVG: '0%' }, {
    drawSVG: '100%', duration: 2.6, ease: 'power2.inOut',
    scrollTrigger: { trigger: '.ft-mark', start: 'clamp(top 88%)', once: true },
  });
}

/* ---------- Запуск ---------- */
initPreloader();
initReveals();
initButtons();
initHeader();
initAnchors();
initDivider();
initDetails();
initGallery();
initVoices();
initContacts();
initCursor();

setTimeout(boot, 60);
