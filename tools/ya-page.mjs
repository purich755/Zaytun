// Обычный GET публичных страниц организации; из HTML берём все упоминания get-altay и state-view
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const hosts=['https://yandex.ru','https://yandex.com'];
const paths=['/maps/org/zaytun/122462904652/gallery/','/maps/org/zaytun/122462904652/reviews/','/maps/org/zaytun/122462904652/','/maps/org/zaytun/122462904652/prices/'];
const ids=new Set();
for(const h of hosts)for(const p of paths){
  try{
    const r=await fetch(h+p,{headers:{'User-Agent':UA,'Accept-Language':'ru'},redirect:'follow'});
    const t=await r.text();
    const name=(h.includes('.ru')?'ru':'com')+p.replace(/\W+/g,'_');
    fs.writeFileSync('tools/.cache/'+name+'.html',t);
    const m=[...t.matchAll(/get-altay\/(\d+)\/([0-9a-z]+)/gi)].map(x=>x[1]+'/'+x[2]);
    m.forEach(x=>ids.add(x));
    console.log(r.status,r.url.slice(0,70),t.length,'altay',new Set(m).size,/captcha|showcaptcha/i.test(r.url)?'CAPTCHA':'');
  }catch(e){console.log('ERR',h+p,e.message)}
}
fs.writeFileSync('tools/.cache/ya-ids.txt',[...ids].join('\n'));
console.log('total',ids.size);
