// Собирает index.html из текстов js/data.js и размеров js/images.js. Рантайму сайта Node не нужен.
//   node scripts/build-html.mjs
import fs from 'node:fs';
import { CONTACT as C, wa, MESSAGES as M, rituals, fitness, fitnessPrices, massage, PRICE_NOTE, details, gallery, voices, sections, money } from '../js/data.js';
import { IMAGES } from '../js/images.js';

const BASE_OG = 'https://purich755.github.io/Zaytun/';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const ext = (href) => `href="${esc(href)}" target="_blank" rel="noopener"`;

function srcset(key, type) {
  return IMAGES[key].widths.map((w) => `img/${key}-${w}.${type} ${w}w`).join(', ');
}
function pic(key, { sizes = '100vw', cls = '', eager = false, priority = false, alt, sources = '' } = {}) {
  const im = IMAGES[key];
  if (!im) throw new Error('нет картинки ' + key);
  const mid = im.widths.find((w) => w >= 1000) || im.widths.at(-1);
  return `<picture${cls ? ` class="${cls}"` : ''}>${sources}<source type="image/avif" srcset="${srcset(key, 'avif')}" sizes="${sizes}"><source type="image/webp" srcset="${srcset(key, 'webp')}" sizes="${sizes}"><img src="img/${key}-${mid}.jpg" srcset="${srcset(key, 'jpg')}" sizes="${sizes}" width="${im.w}" height="${im.h}" alt="${esc(alt ?? im.alt)}" ${eager ? '' : 'loading="lazy" '}decoding="async"${priority ? ' fetchpriority="high"' : ''}></picture>`;
}

// Вектор вордмарка: прямо из PDF макета вывески (tools/extract-logo.py)
const ru = fs.readFileSync('brand/wordmark-ru.svg', 'utf8');
const pathOf = (id) => ru.match(new RegExp(`id="wordmark-ru-${id}"[^>]* d="([^"]+)"`))[1];
const LETTERS = { z: 16, a: 11, i: 14, br: 15, t: 12, u: 13, n: 10 };
const leafPath = 'M0 0C5.5-5 8-12.5 7-21 6.4-26 3.8-30.5 0-34-3.8-30.5-6.4-26-7-21-8-12.5-5.5-5 0 0Z';

const sprite = `<svg class="sprite" aria-hidden="true" focusable="false"><defs>
${Object.entries(LETTERS).map(([k, id]) => `<path id="wm-${k}" d="${pathOf(id)}"/>`).join('\n')}
<clipPath id="branch-clip"><path d="M0 262H240L243 292 272 300H292V262H910V484H0Z"/></clipPath>
<clipPath id="z-top"><path d="M0 0H1443V262H292V300H272L243 292 240 262H0Z"/></clipPath>
<symbol id="logo" viewBox="0 0 1443.1 483.6"><use href="#wm-z"/><use href="#wm-a"/><use href="#wm-i"/><use href="#wm-br"/><use href="#wm-t"/><use href="#wm-u"/><use href="#wm-n"/></symbol>
<symbol id="branch" viewBox="0 262 910 222"><g clip-path="url(#branch-clip)"><use href="#wm-z"/></g></symbol>
<symbol id="leaf" viewBox="-9 -35 18 36"><path d="${leafPath}"/></symbol>
<filter id="goo" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -9" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
</defs></svg>`;

const messengers = (cls = '') => `<ul class="msgr ${cls}">
<li><a class="q-link" ${ext(wa(M.general))}>WhatsApp</a></li>
<li><a class="q-link" ${ext(C.telegram)}>Telegram</a></li>
<li><a class="q-link" ${ext(C.max)}>MAX</a></li>
</ul>`;

const nav = [['fitness', 'Фитнес'], ['rituals', 'SPA'], ['massage', 'Массаж'], ['space', 'Пространство'], ['gift', 'Подарок'], ['contacts', 'Контакты']];

const leader = (name, price, note) => `<li class="row"><span class="row-main"><span class="row-name">${esc(name)}</span><span class="dots" aria-hidden="true"></span><span class="row-price">${money(price)}</span><svg class="row-leaf" aria-hidden="true"><use href="#leaf"/></svg></span>${note ? `<span class="row-note">${esc(note)}</span>` : ''}</li>`;

const drops = [30, 78, 44, 104, 26, 66, 92];

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Зайтун — студия фитнеса и SPA для женщин, Казань</title>
<meta name="description" content="Студия фитнеса и SPA только для женщин на Комсомольской, 1 в Казани. Аэройога, «Здоровая спина», массаж и банные ритуалы.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#F7F1E8">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="Зайтун — студия фитнеса и SPA для женщин, Казань">
<meta property="og:description" content="Здесь время замедляется. Тренировки, массаж и банные ритуалы на Комсомольской, 1.">
<meta property="og:url" content="${BASE_OG}">
<meta property="og:image" content="${BASE_OG}img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preload" as="image" type="image/avif" media="(min-width: 1024px), (min-width: 768px) and (orientation: landscape)" imagesrcset="${srcset('hero', 'avif')}" imagesizes="100vw" fetchpriority="high">
<link rel="preload" as="image" type="image/avif" media="(max-width: 767px), (max-width: 1023px) and (orientation: portrait)" imagesrcset="${srcset('hero-m', 'avif')}" imagesizes="100vw" fetchpriority="high">
<link rel="preload" as="font" type="font/woff2" href="fonts/cormorant-300.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="fonts/cormorant-300i.woff2" crossorigin>
<script>
(function(){var h=document.documentElement;h.setAttribute('data-js','');
try{var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(r)h.setAttribute('data-reduce','');
if(!r&&!sessionStorage.getItem('zaytun-pre')){h.setAttribute('data-pre','');sessionStorage.setItem('zaytun-pre','1')}}catch(e){}})();
</script>
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/sections.css">
<script>addEventListener('load',function(){import('./js/main.js')},{once:true})</script>
<noscript><style>.pre{display:none}</style></noscript>
</head>
<body>
${sprite}
<a class="skip" href="#about">К содержанию</a>

<div class="pre" aria-hidden="true" data-preloader>
  <div class="pre-in">
    <svg class="pre-logo" viewBox="-20 -10 1483 510">
      <mask id="pre-mask" maskUnits="userSpaceOnUse" x="-20" y="240" width="960" height="260"><path class="pre-stroke" pathLength="1" d="M-10 316C40 280 90 268 150 275S300 312 407 362 560 402 650 412 760 420 850 372 900 330 910 316" fill="none" stroke="#fff" stroke-width="84" stroke-linecap="round"/></mask>
      <g mask="url(#pre-mask)"><g clip-path="url(#branch-clip)"><use href="#wm-z"/></g></g>
      <g class="pre-letters">
        <g clip-path="url(#z-top)" style="--d:-.42" class="pre-z"><use href="#wm-z"/></g><use href="#wm-a" style="--d:-.28"/><use href="#wm-i" style="--d:-.14"/><use href="#wm-br" style="--d:-.14"/><use href="#wm-t" style="--d:.06"/><use href="#wm-u" style="--d:.2"/><use href="#wm-n" style="--d:.36"/>
      </g>
    </svg>
    <p class="pre-sub">фитнес &amp; спа</p>
  </div>
</div>

<header class="hdr" data-hdr>
  <a class="hdr-logo" href="#top" aria-label="Зайтун, студия фитнеса и SPA — наверх"><svg aria-hidden="true"><use href="#logo"/></svg></a>
  <nav class="hdr-nav" aria-label="Разделы">
    ${nav.map(([id, t]) => `<a class="q-link" href="#${id}">${t}</a>`).join('')}
  </nav>
  <div class="hdr-act">
    <a class="q-link hdr-tel" href="${C.tel}">${C.phone}</a>
    <div class="book" data-book>
      <button class="btn btn-sm" type="button" aria-expanded="false" aria-controls="book-menu"><span>Записаться</span></button>
      <ul class="book-menu" id="book-menu" hidden>
        <li><a ${ext(wa(M.general))}>WhatsApp</a></li>
        <li><a ${ext(C.telegram)}>Telegram</a></li>
        <li><a ${ext(C.max)}>MAX</a></li>
        <li><a href="${C.tel}">Позвонить</a></li>
      </ul>
    </div>
    <button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="mob-menu" data-burger><i></i><i></i></button>
  </div>
</header>
<div class="mob-menu" id="mob-menu" data-lenis-prevent hidden>
  <nav aria-label="Разделы, мобильное меню">
    ${nav.map(([id, t], i) => `<a href="#${id}" style="--i:${i}">${t}</a>`).join('')}
  </nav>
  <div class="mob-foot">
    <ul class="msgr">
      <li><a ${ext(wa(M.general))}>WhatsApp</a></li><li><a ${ext(C.telegram)}>Telegram</a></li><li><a ${ext(C.max)}>MAX</a></li><li><a href="${C.tel}">Позвонить</a></li>
    </ul>
    <p>${C.address}</p>
  </div>
</div>

<nav class="branch" aria-label="Ветвь: разделы страницы" data-branch>
  <svg class="branch-svg" aria-hidden="true"><path class="branch-ghost" fill="none"/><path class="branch-stem" fill="none"/></svg>
  ${sections.map((s) => `<a class="leaf" href="#${s.id}" data-leaf="${s.id}"><svg aria-hidden="true"><use href="#leaf"/></svg><span class="leaf-label">${s.n} · ${s.label}</span></a>`).join('')}
</nav>
<div class="branch-m" aria-hidden="true" data-branch-m>
  <svg viewBox="0 0 400 10" preserveAspectRatio="none"><path pathLength="1" d="M0 6C60 2 110 9 170 6S290 2 400 5" fill="none" vector-effect="non-scaling-stroke"/></svg>
  <svg class="branch-m-leaf"><use href="#leaf"/></svg>
</div>

<main>

<section class="hero" id="top" data-hero>
  <div class="hero-frame" data-hero-frame>
    ${pic('hero', { sizes: '100vw', eager: true, priority: true, alt: 'Комната отдыха студии: круглая лампа-солнце на тёплой стене', sources: `<source media="(max-width: 767px), (max-width: 1023px) and (orientation: portrait)" type="image/avif" srcset="${srcset('hero-m', 'avif')}" sizes="100vw"><source media="(max-width: 767px), (max-width: 1023px) and (orientation: portrait)" type="image/webp" srcset="${srcset('hero-m', 'webp')}" sizes="100vw"><source media="(max-width: 767px), (max-width: 1023px) and (orientation: portrait)" srcset="${srcset('hero-m', 'jpg')}" sizes="100vw">` })}
    <p class="hero-h hero-h-in" aria-hidden="true" data-hero-h>Здесь время <em>замедляется</em></p>
  </div>
  <div class="hero-ring" aria-hidden="true" data-hero-ring></div>
  <p class="mg hero-mg" data-hero-fade>зәйтүн — по-татарски «олива»</p>
  <h1 class="hero-h" data-hero-h>Здесь время <em>замедляется</em></h1>
  <div class="hero-side" data-hero-fade>
    <p class="lead">Студия фитнеса и SPA только для женщин. Тренировки, массаж и банные ритуалы на Комсомольской,&nbsp;1.</p>
    <div class="hero-cta">
      <a class="btn" href="#rituals"><span>Выбрать ритуал</span></a>
      <a class="q-link" ${ext(wa(M.general))}>Записаться в WhatsApp</a>
    </div>
  </div>
</section>

<section class="about wrap" id="about">
  <div class="about-grid">
    <p class="about-text" data-manifest>Олива растёт медленно и живёт веками. Мы назвали студию в её честь — потому что всё хорошее с телом тоже происходит не спеша. Здесь нет мужчин, суеты и чужих взглядов. Есть тёплый халат, тишина, сауна, руки мастера и чай после.</p>
    <dl class="facts">
      <div data-reveal><dt>Только для женщин</dt><dd>Можно прийти одной, с подругой, с мамой или дочкой</dd></div>
      <div data-reveal style="--rd:.15s"><dt>С уважением к традициям</dt><dd>Молельная зона, раздевалка с ширмой, шторы на окнах</dd></div>
      <div data-reveal style="--rd:.3s"><dt>Две половины</dt><dd>Тренировочный зал и SPA с сауной под одной крышей</dd></div>
    </dl>
    <figure class="about-photo">
      <div class="circle" data-parallax="-0.2">${pic('tree', { sizes: '(min-width: 1024px) 30vw, 72vw' })}</div>
      <figcaption class="mg">дерево у стойки встречает вас первым</figcaption>
    </figure>
  </div>
</section>

<section class="balance" id="balance" data-dark>
  <div class="bal" data-balance style="--x:50%">
    ${pic('rest', { sizes: '100vw', cls: 'bal-img' })}
    <div class="bal-top">${pic('move', { sizes: '100vw', cls: 'bal-img' })}</div>
    <div class="bal-cap bal-cap-l" data-bal-l><span class="lab">Движение</span><strong>Выложиться</strong></div>
    <div class="bal-cap bal-cap-r" data-bal-r><span class="lab">Покой</span><strong>Восстановиться</strong></div>
    <div class="bal-line" aria-hidden="true"></div>
    <div class="bal-handle" role="slider" tabindex="0" aria-label="Сдвинуть границу между залом и SPA" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="Поровну зала и SPA" data-cursor="drag">
      <svg aria-hidden="true"><use href="#leaf"/></svg>
    </div>
  </div>
  <p class="bal-note wrap" data-reveal>Сначала тренировка, потом SPA — так здесь проводят вечер многие гостьи</p>
</section>

<section class="fit" id="fitness">
  <div class="wrap fit-head">
    <h2 data-reveal>Зал, который почти всегда только ваш</h2>
    <div class="fit-lead">
      <p class="lead" data-reveal>Небольшие группы и персональные тренировки. Тренер видит технику каждой — об этом пишут в отзывах.</p>
      <p class="mg" data-reveal style="--rd:.2s">«чаще всего ты занимаешься одна в зале» — из отзыва</p>
    </div>
  </div>
  <div class="fit-scroll" data-fit-scroll data-cursor="drag" tabindex="0" role="group" aria-label="Направления, лента листается вбок">
    <ol class="fit-row">
      ${fitness.map((f, i) => `<li class="fcard" style="--drop:${drops[i]}px"><div class="fcard-swing" data-swing><i class="strap" aria-hidden="true"></i><article class="fcard-body">
        <div class="fcard-img">${pic(f.img, { sizes: '(min-width: 1024px) 24vw, 72vw' })}</div>
        <span class="lab">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(f.name)}</h3>
        <p>${esc(f.text)}</p>
      </article></div></li>`).join('\n      ')}
    </ol>
  </div>
  <div class="wrap fit-prices">
    <div>
      <h3 class="lab">Группы: аэройога и «Здоровая спина»</h3>
      <ul class="menu" data-rows>${fitnessPrices.map(([n, p]) => leader(n, p)).join('')}</ul>
      <p class="foot">${PRICE_NOTE}</p>
    </div>
    <div class="fit-aside">
      <p class="mg" data-reveal>к абонементу — заморозка на 30 дней и гостевой визит для подруги</p>
      <a class="btn" ${ext(wa(M.trial))}><span>Записаться на пробную</span></a>
    </div>
  </div>
</section>

<section class="rit tex" id="rituals" data-dark>
  <div class="wrap">
    <div class="rit-head">
      <h2 data-reveal>Ритуалы, а не процедуры</h2>
      <p class="lead" data-reveal>Каждая программа начинается с прогрева в сауне и заканчивается чаем. Между — то, ради чего вы пришли.</p>
    </div>
    <div class="rit-grid" data-rituals>
      <ul class="rit-list" data-rit-list>
        ${rituals.map((r) => `<li class="rit-item">
          <button class="rit-tab" type="button" id="tab-${r.id}" data-id="${r.id}"><svg aria-hidden="true"><use href="#leaf"/></svg><span>${esc(r.name)}</span></button>
          <div class="rit-ssr"><p>${r.minutes} минут · ${money(r.price)}${r.signature ? ' · фирменная' : ''}</p><p>${esc(r.steps.join(' → '))}</p><p>${esc(r.line)}</p></div>
        </li>`).join('\n        ')}
      </ul>
      <div class="dial-wrap" id="ritual-panel" hidden data-dial-wrap>
        <div class="dial" data-dial>
          <svg class="dial-svg" viewBox="-100 -100 200 200" aria-hidden="true">
            <defs><linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2E5D7" stop-opacity="0"/><stop offset="1" stop-color="#F2E5D7"/></linearGradient></defs>
            <circle class="dial-ring" r="92"/>
            <circle class="dial-ring2" r="84"/>
            <g class="dial-beam"><path d="M-46-79.67A92 92 0 0 1 0-92" fill="none" stroke="url(#beam)" stroke-width="1.4" stroke-linecap="round"/></g>
            <g class="dial-dots"></g>
          </svg>
          <ol class="dial-labels" data-dial-labels></ol>
          <div class="dial-c">
            <p class="dial-min"><span data-dial-min>150</span> минут</p>
            <p class="dial-price" data-dial-price>11 100 ₽</p>
            <p class="dial-line" data-dial-line></p>
            <a class="dial-sign" href="#olivia" hidden data-dial-sign>фирменная — как мы её готовим</a>
          </div>
        </div>
        <ol class="dial-steps" data-dial-steps></ol>
        <div class="dial-foot">
          <a class="btn btn-light" ${ext(wa(M.ritual('Ханбике')))} data-dial-cta><span>Записаться на «Ханбике»</span></a>
          <p class="mg">шаги — схема, а не шкала времени</p>
        </div>
      </div>
    </div>
    <p class="foot foot-d">${PRICE_NOTE}</p>
  </div>
</section>

<section class="ol" id="olivia" data-olivia>
  <div class="wrap ol-in">
    <div class="ol-stage" data-ol-stage>
      <div class="ol-goo" data-ol-goo>
        <div class="ol-i ol-leaf" data-ol="leaf"><div class="circle">${pic('ol-leaf', { sizes: '(min-width: 1024px) 18vw, 62vw' })}</div></div>
        <div class="ol-i ol-salt" data-ol="salt"><div class="circle">${pic('ol-salt', { sizes: '(min-width: 1024px) 18vw, 62vw' })}</div></div>
        <div class="ol-i ol-honey" data-ol="honey"><div class="circle">${pic('ol-honey', { sizes: '(min-width: 1024px) 18vw, 62vw' })}</div></div>
      </div>
      <p class="ol-cap ol-cap-leaf" data-ol-cap><b>листья оливы</b><span class="mg">мягко измельчаем вручную</span></p>
      <p class="ol-cap ol-cap-salt" data-ol-cap><b>магниевая соль</b><span class="mg">успокаивает и расслабляет</span></p>
      <p class="ol-cap ol-cap-honey" data-ol-cap><b>мёд</b><span class="mg">питает кожу</span></p>
      <figure class="ol-core" data-ol-core>
        <div class="circle">${pic('ol-scrub', { sizes: '(min-width: 1024px) 34vw, 80vw' })}</div>
        <figcaption>Оливия</figcaption>
      </figure>
    </div>
    <div class="ol-text">
      <span class="lab">Фирменная · 2 часа · ${money(7900)}</span>
      <h2>Скраб, который мы готовим сами</h2>
      <p class="lead">Фирменная программа Зайтун. Прогрев в сауне, скраб, который мы готовим в студии сами, расслабляющий массаж и чай. Два часа только для вас.</p>
      <a class="btn" ${ext(wa(M.olivia))}><span>Хочу на «Оливию»</span></a>
    </div>
  </div>
</section>

<section class="mas wrap" id="massage">
  <figure class="mas-photo">
    <div class="mas-frame"><div data-parallax="-0.12" class="mas-par">${pic('hands', { sizes: '(min-width: 1024px) 36vw, 100vw' })}</div></div>
    <figcaption class="mg">мастер спросит, что важно именно вам</figcaption>
  </figure>
  <div class="mas-menu">
    <h2 data-reveal>Меню рук</h2>
    <h3 class="lab">Тело</h3>
    <ul class="menu" data-rows>${massage.body.map((m) => leader(m.name, m.price, m.note)).join('')}</ul>
    <h3 class="lab">Лицо</h3>
    <ul class="menu" data-rows>${massage.face.map((m) => leader(m.name, m.price, m.note)).join('')}</ul>
    <p class="foot">${PRICE_NOTE}</p>
    <div class="mas-help">
      <p>Не знаете, что выбрать? Напишите — администратор подскажет</p>
      ${messengers()}
    </div>
  </div>
</section>

<section class="det wrap" id="details">
  <div class="det-main">
    <h2 data-reveal>Мелочи, о которых не нужно просить</h2>
    <p class="mg" data-reveal>всё это — из отзывов гостий, не из рекламы</p>
    <ol class="det-list" data-det-list>
      ${details.map((d, i) => `<li data-i="${i}" tabindex="0" data-img="${d.img}">${pic(d.img, { sizes: '56px', cls: 'det-thumb circle', alt: '' })}<span class="lab">${String(i + 1).padStart(2, '0')}</span><span class="det-t">${esc(d.text)}</span></li>`).join('\n      ')}
    </ol>
  </div>
  <div class="det-window" aria-hidden="true" data-det-window>
    <div class="circle det-frame">${pic(details[0].img, { sizes: '34vw', alt: '', cls: 'det-layer is-on' })}</div>
  </div>
</section>

<section class="sp" id="space">
  <div class="wrap sp-head">
    <div>
      <h2 data-reveal>Посмотрите, куда вы придёте</h2>
      <p class="lead" data-reveal>Зал с гамаками, сауна, массажные комнаты, зона отдыха и чай.</p>
    </div>
    <div class="sp-side">
      <p class="mg" data-reveal>лампы на стене — те самые, из первого кадра</p>
      <div class="chips" role="group" aria-label="Фильтр фотографий" data-chips hidden>
        <button type="button" class="chip" aria-pressed="true" data-f="all">Все</button>
        <button type="button" class="chip" aria-pressed="false" data-f="hall">Зал</button>
        <button type="button" class="chip" aria-pressed="false" data-f="spa">SPA</button>
        <button type="button" class="chip" aria-pressed="false" data-f="rest">Отдых</button>
      </div>
    </div>
  </div>
  <div class="gal" data-gal data-cursor="drag">
    <ul class="gal-track" data-gal-track>
      ${gallery.map((k, i) => {
        const im = IMAGES[k];
        return `<li class="g-item" data-tag="${im.tag}" style="--r:${(im.w / im.h).toFixed(3)}"><a href="img/${k}-${im.widths.at(-1)}.jpg" data-key="${k}" data-i="${i}" data-cursor="view"><span class="g-in">${pic(k, { sizes: `(max-width: 767px) 74vw, ${Math.round((64 * im.w) / im.h)}vh` })}</span></a></li>`;
      }).join('\n      ')}
    </ul>
  </div>
  <div class="wrap gal-ctl" data-gal-ctl hidden>
    <button class="q-link" type="button" data-gal-prev>назад</button>
    <div class="gal-bar" aria-hidden="true"><svg viewBox="0 0 600 10" preserveAspectRatio="none"><path pathLength="1" d="M0 6C100 2 190 9 300 6S500 2 600 5" fill="none" vector-effect="non-scaling-stroke"/></svg></div>
    <p class="lab gal-count" aria-live="polite"><span data-gal-now>01</span> / <span data-gal-all>${String(gallery.length).padStart(2, '0')}</span></p>
    <button class="q-link" type="button" data-gal-next>дальше</button>
  </div>
</section>

<section class="gift tex" id="gift" data-dark>
  <div class="wrap gift-in">
    <div class="gift-vis" data-gift>
      <div class="cert" data-cert>
        <div class="cert-shine" aria-hidden="true"></div>
        <span class="cert-ring" aria-hidden="true"></span>
        <svg class="cert-logo" role="img" aria-label="Зайтун"><use href="#logo"/></svg>
        <p class="cert-kind">подарочный сертификат</p>
        <p class="cert-for">для<i></i></p>
      </div>
      <figure class="gift-env">
        <div class="circle">${pic('envelope', { sizes: '160px' })}</div>
        <figcaption class="mg">настоящий — в конверте с печатью</figcaption>
      </figure>
    </div>
    <div class="gift-text">
      <h2 data-reveal>Подарите ей паузу</h2>
      <p class="lead" data-reveal>Маме, жене, сестре, подруге — или себе. Сертификат на программу или на сумму: выберем вместе в переписке.</p>
      <ul class="gift-list">
        <li data-reveal>на SPA-программу</li>
        <li data-reveal style="--rd:.12s">на часы массажа</li>
        <li data-reveal style="--rd:.24s">на SPA-девичник для компании</li>
      </ul>
      <a class="btn btn-light" ${ext(wa(M.gift))}><span>Оформить сертификат</span></a>
    </div>
  </div>
</section>

<section class="voi" id="voices" aria-label="Голоса гостий">
  <h2 class="lab wrap voi-h">Голоса гостий</h2>
  <div class="voi-rows" data-voices>
    ${voices.map((row, i) => `<ul class="voi-row" data-dir="${i ? 1 : -1}">
      ${row.map((v) => `<li><blockquote>«${esc(v.q)}»</blockquote><p>${v.who ? `<span class="lab">${esc(v.who)}</span>` : ''}${v.about ? `<small>${esc(v.about)}</small>` : ''}</p></li>`).join('\n      ')}
    </ul>`).join('\n    ')}
  </div>
  <p class="wrap voi-more"><a class="q-link" ${ext(C.reviews)}>Все отзывы на Яндекс Картах ↗</a></p>
</section>

<section class="pau" id="pause" data-breath>
  <div class="wrap pau-in">
    <div class="pau-copy">
      <h2 data-reveal>Минута на себя</h2>
      <p class="lead" data-reveal>Три спокойных дыхания. Прямо здесь, ничего больше не нужно.</p>
    </div>
    <div class="br">
      <svg class="br-leaves" viewBox="-100 -100 200 200" aria-hidden="true" data-br-leaves>
        ${[0, 60, 120, 180, 240, 300].map((a, i) => `<use href="#leaf" width="11" height="22" x="-5.5" y="-98" transform="rotate(${a + (i % 2 ? 9 : -5)})"/>`).join('')}
      </svg>
      <div class="br-circle" data-br-circle></div>
      <p class="br-word" aria-live="polite" data-br-word></p>
      <button class="br-btn" type="button" data-br-btn>Начать</button>
    </div>
    <div class="br-end" data-br-end hidden>
      <p>Вот так у нас проходит каждый визит. Только дольше.</p>
      <a class="btn" ${ext(wa(M.general))}><span>Записаться</span></a>
    </div>
  </div>
</section>

<section class="con wrap" id="contacts">
  <div class="con-info">
    <h2 data-reveal>Как нас найти</h2>
    <dl class="con-dl">
      <div><dt class="lab">Адрес</dt><dd>${C.address}</dd></div>
      <div><dt class="lab">Каждый день</dt><dd>${C.hours}<span class="con-now" data-now></span></dd></div>
      <div><dt class="lab">Как добраться</dt><dd>${C.transport}</dd></div>
      <div><dt class="lab">Запись</dt><dd><a class="con-tel" href="${C.tel}">${C.phone}</a>
        <ul class="msgr">
          <li><a class="q-link" ${ext(wa(M.general))}>WhatsApp</a></li>
          <li><a class="q-link" ${ext(C.telegram)}>Telegram</a></li>
          <li><a class="q-link" ${ext(C.max)}>MAX</a></li>
          <li><a class="q-link" ${ext(C.vk)}>ВКонтакте</a></li>
        </ul></dd></div>
    </dl>
  </div>
  <figure class="con-map">
    ${fs.readFileSync('scripts/map.svg', 'utf8')}
    <a class="btn con-map-btn" ${ext(C.maps)}><span>Открыть в Яндекс Картах ↗</span></a>
    <figcaption>Схема: © участники OpenStreetMap</figcaption>
  </figure>
</section>

</main>

<footer class="ft tex" data-dark data-footer>
  <div class="wrap">
    <div class="ft-mark">
      <svg class="ft-logo" viewBox="0 0 1443.1 483.6" role="img" aria-label="Зайтун">
        <mask id="ft-mask" maskUnits="userSpaceOnUse" x="-20" y="240" width="960" height="260"><path class="ft-stroke" d="M-10 316C40 280 90 268 150 275S300 312 407 362 560 402 650 412 760 420 850 372 900 330 910 316" fill="none" stroke="#fff" stroke-width="84" stroke-linecap="round"/></mask>
        <use href="#wm-a"/><use href="#wm-i"/><use href="#wm-br"/><use href="#wm-t"/><use href="#wm-u"/><use href="#wm-n"/>
        <g clip-path="url(#z-top)"><use href="#wm-z"/></g>
        <g mask="url(#ft-mask)"><g clip-path="url(#branch-clip)"><use href="#wm-z"/></g></g>
      </svg>
    </div>
    <div class="ft-row">
      <p class="ft-sub"><span class="lab">Zaytun · fitness &amp; spa</span></p>
      <button class="flip" type="button" aria-pressed="false" aria-label="Перевернуть вывеску: две стороны, русская и латинская" data-flip>
        <span class="flip-in"><img src="img/sign-a.webp" width="360" height="360" alt="" loading="lazy" decoding="async"><img src="img/sign-b.webp" width="360" height="360" alt="" loading="lazy" decoding="async"></span>
      </button>
    </div>
    <div class="ft-grid">
      <p>${C.address}</p>
      <p><a class="q-link" href="${C.tel}">${C.phone}</a></p>
      ${messengers()}
      <p class="ft-copy">© Зайтун, Казань<br><small>Сайт-концепция</small></p>
    </div>
  </div>
</footer>

<div class="lb" role="dialog" aria-modal="true" aria-label="Просмотр фотографии" hidden data-lb>
  <div class="lb-stage" data-lb-stage></div>
  <p class="lb-cap" data-lb-cap></p>
  <p class="lab lb-count" data-lb-count></p>
  <button class="lb-btn lb-close" type="button" data-lb-close>Закрыть</button>
  <button class="lb-btn lb-prev" type="button" data-lb-prev>Назад</button>
  <button class="lb-btn lb-next" type="button" data-lb-next>Дальше</button>
</div>
<div class="cur" aria-hidden="true" data-cur><span></span></div>
</body>
</html>
`;

fs.writeFileSync('index.html', html);
console.log('index.html', (html.length / 1024).toFixed(1), 'КБ');
