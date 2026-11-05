// Публичное превью Telegram-канала: t.me/s/<канал>?before=<id>. Тексты постов, фото (background-image)
// и превью видео.   node tools/tg-dump.mjs → tools/.cache/tg-posts.json
import fs from 'node:fs';
const CH = 'fitnes_spa_Zaytun';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const posts = new Map();
const strip = (h) => h.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
let before = '';
for (let i = 0; i < 40; i++) {
  const r = await fetch(`https://t.me/s/${CH}${before ? `?before=${before}` : ''}`, { headers: { 'User-Agent': UA, 'Accept-Language': 'ru' } });
  const html = await r.text();
  const blocks = html.split('<div class="tgme_widget_message_wrap').slice(1);
  let minId = Infinity;
  for (const b of blocks) {
    const id = Number(b.match(/data-post="[^/]+\/(\d+)"/)?.[1]);
    if (!id) continue;
    minId = Math.min(minId, id);
    const text = strip(b.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/)?.[1] || '');
    const photos = [...b.matchAll(/tgme_widget_message_photo_wrap[^>]*background-image:url\('([^']+)'\)/g)].map((m) => m[1]);
    const videos = [...b.matchAll(/<video[^>]*src="([^"]+)"/g)].map((m) => m[1]);
    const thumbs = [...b.matchAll(/tgme_widget_message_video_thumb"[^>]*background-image:url\('([^']+)'\)/g)].map((m) => m[1]);
    const date = b.match(/<time datetime="([^"]+)"/)?.[1];
    posts.set(id, { id, date, text, photos, videos, thumbs });
  }
  console.log('страница', before || 'last', blocks.length, 'мин', minId, 'всего', posts.size);
  if (!blocks.length || minId === Infinity || String(minId) === before) break;
  before = String(minId);
  await new Promise((r) => setTimeout(r, 700));
}
const list = [...posts.values()].sort((a, b) => a.id - b.id);
fs.writeFileSync('tools/.cache/tg-posts.json', JSON.stringify(list, null, 1));
console.log('✓ постов', list.length, 'фото', list.reduce((a, p) => a + p.photos.length, 0), 'видео', list.reduce((a, p) => a + p.videos.length + p.thumbs.length, 0));
