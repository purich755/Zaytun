// Живой индикатор «открыто сейчас» по времени Europe/Moscow (Казань живёт по Москве)
import { CONTACT as C } from './data.js';

export function initContacts() {
  const el = document.querySelector('[data-now]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('ru-RU', { timeZone: C.timezone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
  const pad = (h) => `${String(h).padStart(2, '0')}:00`;
  const paint = () => {
    const parts = fmt.formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === 'hour').value);
    const m = Number(parts.find((p) => p.type === 'minute').value);
    const t = h + m / 60;
    const open = t >= C.open && t < C.close;
    el.classList.toggle('is-open', open);
    el.textContent = open ? `Сейчас открыто · до ${pad(C.close)}` : `Сейчас закрыто · откроемся в ${pad(C.open)}`;
  };
  paint();
  setInterval(paint, 60000);
}
