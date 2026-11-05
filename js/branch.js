// Ветвь-навигация. Стебель строится под высоту окна, лист садится туда, куда дорастёт стебель, когда начнётся его секция.
import { ctx } from './main.js';
import { sections } from './data.js';

const SVG_W = 88;

export function initBranch() {
  const { gsap, ScrollTrigger, reduce } = ctx;
  const root = document.querySelector('[data-branch]');
  const mobile = document.querySelector('[data-branch-m]');
  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const svg = root.querySelector('.branch-svg');
    const stem = root.querySelector('.branch-stem');
    const ghost = root.querySelector('.branch-ghost');
    const leaves = sections.map((s) => ({ ...s, el: root.querySelector(`[data-leaf="${s.id}"]`), target: document.getElementById(s.id) }));
    let drawTween;

    const layStem = () => {
      const H = innerHeight;
      const W = root.clientWidth || SVG_W;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const pts = [];
      const N = 44;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        // медленная неровная волна: две синусоиды, чтобы не было «синуса из учебника»
        const x = W * 0.46 + Math.sin(t * Math.PI * 2.3 + 0.4) * W * 0.17 + Math.sin(t * Math.PI * 6.1) * W * 0.05;
        pts.push([x, t * (H + 6) - 3]);
      }
      let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
        d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      const last = pts.at(-1);
      d += `L${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
      stem.setAttribute('d', d);
      ghost.setAttribute('d', d);
    };

    const layLeaves = () => {
      const max = ScrollTrigger.maxScroll(window) || 1;
      const len = stem.getTotalLength();
      leaves.forEach((l, i) => {
        const box = (l.target.closest('.pin-spacer') || l.target).getBoundingClientRect();
        const start = box.top + scrollY - innerHeight * 0.6;
        const p = gsap.utils.clamp(0.02, 0.985, start / max);
        const at = stem.getPointAtLength(len * p);
        const ahead = stem.getPointAtLength(Math.min(len, len * p + 3));
        const tan = (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI - 90;
        const side = i % 2 ? 1 : -1;
        l.el.style.transform = `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px)`;
        l.el.style.setProperty('--a', `${(tan + side * 118).toFixed(1)}deg`);
      });
      root.classList.add('is-laid');
    };

    layStem();
    if (reduce) {
      stem.style.strokeDasharray = 'none';
    } else {
      drawTween = gsap.fromTo(stem, { drawSVG: '0%' }, {
        drawSVG: '100%', ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 1.2, invalidateOnRefresh: true },
      });
    }
    layLeaves();

    // Лист распускается при входе секции и подсвечивает активную
    const triggers = leaves.map((l, i) => ScrollTrigger.create({
      trigger: l.target.closest('.pin-spacer') || l.target,
      start: 'top 60%',
      end: () => {
        const next = leaves[i + 1]?.target;
        return next ? `+=${Math.max(1, (next.closest('.pin-spacer') || next).getBoundingClientRect().top - (l.target.closest('.pin-spacer') || l.target).getBoundingClientRect().top)}` : 'max';
      },
      onToggle: (st) => {
        l.el.classList.toggle('is-active', st.isActive);
        if (st.isActive) l.el.setAttribute('aria-current', 'true'); else l.el.removeAttribute('aria-current');
      },
      onEnter: () => l.el.classList.add('is-open'),
      onLeaveBack: () => l.el.classList.remove('is-open'),
      onRefresh: (st) => { if (st.progress > 0 || st.isActive || scrollY > st.start) l.el.classList.add('is-open'); },
    }));
    if (reduce) leaves.forEach((l) => l.el.classList.add('is-open'));

    // На тёмных секциях ветвь светлеет
    const darks = gsap.utils.toArray('[data-dark]').map((sec) => ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 45%', toggleClass: { targets: root, className: 'on-dark' },
    }));

    const onRefresh = () => { layStem(); layLeaves(); };
    ScrollTrigger.addEventListener('refresh', onRefresh);
    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      drawTween?.scrollTrigger?.kill(); drawTween?.kill();
      [...triggers, ...darks].forEach((t) => t.kill());
    };
  });

  // Телефон и планшет: тонкая ветвь-прогресс под шапкой
  mm.add('(max-width: 1023px)', () => {
    const st = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => mobile.style.setProperty('--p', self.progress.toFixed(4)),
    });
    return () => st.kill();
  });
}
