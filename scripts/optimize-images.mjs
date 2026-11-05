// Одноразовый скрипт: берёт исходники из img/raw, кадрирует, применяет единую цветокоррекцию
// (чуть теплее, насыщенность −8 %, лёгкий контраст) и пишет avif + webp + jpg в ширинах 640/1280/2000.
// Заодно обновляет img/raw/manifest.json (файл → что на фото → куда идёт) и js/images.js (размеры для разметки).
//   node scripts/optimize-images.mjs [ключ …]
import sharp from 'sharp';
import fs from 'node:fs';

const WIDTHS = [640, 1280, 2000];
sharp.cache(false);

// crop — доли кадра после поворота по EXIF: [x, y, w, h]; px — те же четыре числа в пикселях.
const R = [
  // Первый экран: лампа-солнце стоит точно в центре круглого окна
  { key: 'hero', src: 'ya/ya006', px: [179, 876, 2843, 1777], alt: 'Комната отдыха: круглая лампа-солнце на тёплой стене', role: 'hero · десктоп' },
  { key: 'hero-m', src: 'ya/ya006', px: [775, 804, 1650, 3200], widths: [640, 900, 1280], q: 44, alt: 'Комната отдыха: круглая лампа-солнце на тёплой стене', role: 'hero · телефон' },
  // Манифест
  { key: 'tree', src: 'ya/ya029', crop: [0.1, 0.04, 0.8, 0.6], alt: 'Дерево в бетонной кадке у стойки администратора', role: 'манифест · круг' },
  // Движение и покой
  { key: 'move', src: 'ya/ya024', crop: [0.1, 0.36, 0.9, 0.64], alt: 'Зал с коврами, гамаками под потолком и большими окнами', role: 'разделитель · зал' },
  { key: 'rest', src: 'ya/ya044', crop: [0, 0.27, 1, 0.73], flop: true, alt: 'Дверь в сауну и полка со свёрнутыми полотенцами', role: 'разделитель · SPA' },
  // Фитнес: подвешенные карточки
  { key: 'fit-aero', src: 'tg/tg0865-0', alt: 'Прогиб в гамаке посреди зала с деревянным полом', role: 'карточка · аэройога' },
  { key: 'fit-back', src: 'tg/tg0646-0', crop: [0, 0.06, 1, 0.94], alt: 'Прогиб на коврике: силуэт в тёмной форме на фоне зала', role: 'карточка · здоровая спина' },
  { key: 'fit-plate', src: 'tg/tg0873-1', crop: [0, 0.12, 0.92, 0.88], alt: 'Ноги на виброплатформе Power Plate', role: 'карточка · Power Plate' },
  { key: 'fit-power', src: 'tg/tg0758-2', alt: 'Две гантели на чёрном коврике', role: 'карточка · силовые' },
  { key: 'fit-flex', src: 'vk/vk001-1', crop: [0.14, 0, 0.86, 0.64], alt: 'Рука с гантелью в один килограмм на фоне зала', role: 'карточка · бодифлекс' },
  { key: 'fit-mat', src: 'ya/ya023', crop: [0, 0.08, 1, 0.84], alt: 'Массажные мячи для МФР на коврике у зеркала', role: 'карточка · пилатес, МФР' },
  { key: 'fit-soft', src: 'tg/tg0209-0', crop: [0.12, 0.05, 0.72, 0.95], alt: 'Пустой зал утром: болстеры, блоки и коврики у окон', role: 'карточка · беременность' },
  // Оливия: три чаши из одного кадра и скраб на руке
  { key: 'ol-leaf', src: 'tg/tg0684-0', px: [59, 406, 144, 144], upscale: 720, alt: 'Чаша с измельчёнными зелёными листьями', role: 'оливия · листья' },
  { key: 'ol-honey', src: 'tg/tg0684-0', px: [217, 351, 128, 128], upscale: 720, alt: 'Чаша с мёдом', role: 'оливия · мёд' },
  { key: 'ol-salt', src: 'tg/tg0684-0', px: [184, 521, 148, 148], upscale: 720, alt: 'Чаша с белой солью', role: 'оливия · соль' },
  { key: 'ol-scrub', src: 'tg/tg0813-2', crop: [0, 0.1, 1, 0.68], alt: 'Руки мастера наносят скраб на предплечье', role: 'оливия · центр' },
  // Массаж
  { key: 'hands', src: 'vk/vk001-18', alt: 'Руки мастера и тёплый свет над кушеткой', role: 'меню рук' },
  // Мелочи: окно
  { key: 'd-door', src: 'ya/ya037', crop: [0, 0.34, 1, 0.66], alt: 'Стойка у входа и зал за стеклом', role: 'мелочи · встреча' },
  { key: 'd-robe', src: 'tg/tg0737-1', crop: [0, 0.12, 1, 0.8], alt: 'Сложенные руки на махровом халате', role: 'мелочи · халат' },
  { key: 'd-towels', src: 'ya/ya008', crop: [0.1, 0.28, 0.9, 0.55], alt: 'Полки со свёрнутыми полотенцами вдоль коридора', role: 'мелочи · полотенца' },
  { key: 'd-kit', src: 'ya/ya042', crop: [0, 0.14, 1, 0.56], alt: 'Открытые полки с вещами и большое растение', role: 'мелочи · форма' },
  { key: 'd-tea', src: 'ya/ya045', crop: [0, 0.2, 1, 0.75], alt: 'Чайник, чашка, миндаль и финики на плетёном подносе', role: 'мелочи · чай' },
  { key: 'd-mirror', src: 'ya/ya034', crop: [0, 0.12, 1, 0.56], alt: 'Каменная раковина и круглое зеркало с подсветкой', role: 'мелочи · раздевалка' },
  { key: 'd-light', src: 'ya/ya031', crop: [0, 0.05, 1, 0.75], alt: 'Лампа-солнце на стене в приглушённом свете', role: 'мелочи · свет' },
  { key: 'd-door2', src: 'ya/ya002', alt: 'Вход в студию со стороны улицы, круглая вывеска у двери', role: 'мелочи · парковка' },
  // Подарок
  { key: 'envelope', src: 'vk/vk001-27', crop: [0.12, 0, 0.72, 1], alt: 'Подарочный сертификат в конверте с восковой печатью', role: 'подарок · круг' },
  // Галерея
  { key: 'g-hall', src: 'ya/ya010', tag: 'hall', alt: 'Окна зала, растения и гамаки, подвязанные на день', role: 'галерея' },
  { key: 'g-relax', src: 'ya/ya001', tag: 'spa', alt: 'Комната отдыха: две кушетки, лампы-солнца, вентиляторы с плетёными лопастями', role: 'галерея' },
  { key: 'g-tree', src: 'ya/ya029', crop: [0, 0.12, 1, 0.88], tag: 'rest', alt: 'Дерево в кадке, кресло и лестница на антресоль', role: 'галерея' },
  { key: 'g-plate', src: 'ya/ya038', tag: 'hall', alt: 'Виброплатформа Power Plate в зале у окна', role: 'галерея' },
  { key: 'g-tea1', src: 'ya/ya019', crop: [0, 0.1, 1, 0.8], tag: 'rest', alt: 'Белый чайник, чашка и сухофрукты на подносе', role: 'галерея' },
  { key: 'g-sink', src: 'ya/ya012', tag: 'spa', alt: 'Бумажные фонари над каменной раковиной и круглое зеркало', role: 'галерея' },
  { key: 'g-glass', src: 'ya/ya011', tag: 'hall', alt: 'Стеклянная перегородка и гамаки в глубине зала', role: 'галерея' },
  { key: 'g-loft', src: 'ya/ya030', tag: 'rest', alt: 'Антресоль с мягкими креслами и деревянным полом', role: 'галерея' },
  { key: 'g-corridor', src: 'ya/ya022', tag: 'spa', alt: 'Коридор SPA: фонари, раковина и дверь с деревянной рамой', role: 'галерея' },
  { key: 'g-fruit', src: 'ya/ya013', tag: 'rest', alt: 'Фрукты и чайный поднос у кушетки', role: 'галерея' },
  { key: 'g-mats', src: 'tg/tg0943-1', skip: true },
  { key: 'g-fans', src: 'ya/ya004', crop: [0, 0, 1, 0.8], tag: 'spa', alt: 'Вентилятор с плетёными лопастями над полками с полотенцами', role: 'галерея' },
  { key: 'g-teapot', src: 'tg/tg0743-8', tag: 'rest', alt: 'Стеклянный чайник, финики и курага, чашка в руках', role: 'галерея' },
  { key: 'g-foam', src: 'tg/tg0743-7', tag: 'spa', alt: 'Мастер взбивает пену над деревянной шайкой в сауне', role: 'галерея' },
  { key: 'g-stool', src: 'ya/ya041', tag: 'rest', alt: 'Золотой чайник на деревянном кубе у кушетки', role: 'галерея' },
  { key: 'g-window', src: 'ya/ya037', crop: [0, 0.05, 1, 0.92], tag: 'hall', alt: 'Зал за стойкой: панорамные окна, шторы и коврики на полу', role: 'галерея' },
  { key: 'g-oil', src: 'tg/tg0263-0', tag: 'spa', alt: 'Масло льётся из керамического кувшина в деревянную чашу', role: 'галерея' },
  { key: 'g-robes', src: 'vk/vk001-4', crop: [0.16, 0.06, 0.8, 0.9], tag: 'spa', alt: 'Гостьи в белых халатах идут по коридору, вид со спины', role: 'галерея' },
  { key: 'g-sconce', src: 'ya/ya016', crop: [0, 0.1, 1, 0.85], tag: 'spa', alt: 'Кушетка, растение и лампа-солнце на стене', role: 'галерея' },
  { key: 'g-hammocks', src: 'ya/ya024', crop: [0, 0, 1, 0.72], tag: 'hall', alt: 'Гамаки под бетонным потолком и большие окна зала', role: 'галерея' },
  { key: 'g-candle', src: 'tg/tg0693-3', tag: 'rest', alt: 'Свечи, мандарины и конверт с сертификатом', role: 'галерея' },
  { key: 'g-tray', src: 'ya/ya005', crop: [0, 0.2, 1, 0.8], tag: 'rest', alt: 'Стеклянный чайник на плетёном подносе, деревянный столик', role: 'галерея' },
].filter((r) => !r.skip);

const only = process.argv.slice(2);
const OUT = 'img';
const metaPath = 'img/raw/.images-meta.json';
const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};

async function one(r) {
  const input = await sharp(`img/raw/${r.src}.jpg`).rotate().toBuffer();
  const m = await sharp(input).metadata();
  let [x, y, w, h] = r.px || (r.crop ? [r.crop[0] * m.width, r.crop[1] * m.height, r.crop[2] * m.width, r.crop[3] * m.height] : [0, 0, m.width, m.height]);
  x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y));
  w = Math.min(m.width - x, Math.round(w)); h = Math.min(m.height - y, Math.round(h));
  let base = sharp(input).extract({ left: x, top: y, width: w, height: h });
  if (r.flop) base = sharp(await base.toBuffer()).flop();
  if (r.upscale) { base = base.resize(r.upscale, null, { kernel: 'lanczos3' }).sharpen({ sigma: 0.9 }); w = r.upscale; h = Math.round((r.upscale / (x + w > 0 ? w : 1)) * h) || r.upscale; const mm = await base.clone().toBuffer({ resolveWithObject: true }); w = mm.info.width; h = mm.info.height; }
  // Единая «съёмка»: чуть теплее, −8 % насыщенности, лёгкий контраст
  const graded = await base
    .recomb([[1.03, 0.012, 0], [0, 1, 0], [0, 0.012, 0.94]])
    .modulate({ saturation: 0.92 })
    .linear(1.05, -5)
    .toColourspace('srgb')
    .png({ compressionLevel: 1 })
    .toBuffer();
  const widths = r.widths || [...new Set(WIDTHS.filter((v) => v < w).concat(w <= 2000 ? [w] : []))].sort((a, b) => a - b);
  for (const out of widths) {
    const s = () => sharp(graded).resize(out);
    const name = `${OUT}/${r.key}-${out}`;
    await s().avif({ quality: r.q || 52, effort: 4 }).toFile(`${name}.avif`);
    await s().webp({ quality: 74, effort: 5 }).toFile(`${name}.webp`);
    await s().jpeg({ quality: 76, mozjpeg: true }).toFile(`${name}.jpg`);
  }
  const W = Math.min(w, widths.at(-1));
  return { w, h: Math.round((h / w) * W), W, widths };
}

let k = 0;
const list = R.filter((r) => !only.length || only.includes(r.key));
await Promise.all(Array.from({ length: 4 }, async () => {
  while (k < list.length) {
    const r = list[k++];
    const t = await one(r);
    meta[r.key] = { w: t.W, h: Math.round(t.h), widths: t.widths };
    console.log(r.key.padEnd(12), `${t.W}x${Math.round(t.h)}`, t.widths.join('/'));
  }
}));
for (const key of Object.keys(meta)) if (!R.find((r) => r.key === key)) delete meta[key];
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 1));

// Манифест для людей
fs.writeFileSync('img/raw/manifest.json', JSON.stringify(R.map((r) => ({ file: `img/raw/${r.src}.jpg`, key: r.key, what: r.alt, goes_to: r.role, tag: r.tag || null })), null, 1));

// Данные для разметки и интерактивов
const images = Object.fromEntries(R.map((r) => [r.key, { ...meta[r.key], alt: r.alt, tag: r.tag || null }]));
fs.writeFileSync('js/images.js', `// Генерирует scripts/optimize-images.mjs. Руками не править.\nexport const IMAGES = ${JSON.stringify(images, null, 1)};\n`);
const kb = fs.readdirSync(OUT).filter((f) => /\.(avif|webp|jpg)$/.test(f)).reduce((a, f) => a + fs.statSync(`${OUT}/${f}`).size, 0) / 1048576;
console.log('готово, img/ весит', kb.toFixed(1), 'МБ');
