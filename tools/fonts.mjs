// Локальные копии Google Fonts: css2?…&text=<алфавит> отдаёт один woff2 на начертание, без блокировки рендера.
// Алфавит — весь русский и латинский + татарские буквы для «зәйтүн».   node tools/fonts.mjs
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const RU='абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const base=RU+RU.toUpperCase()+'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'+'  .,:;!?«»„“”"\'()[]—–-+−%№#&/·•→←↗×₽@…©әүңөһҗӘҮҢӨҺҖ';
const FAMS=[['Cormorant','300','normal',base,'cormorant-300'],['Cormorant','400','normal',base,'cormorant-400'],['Cormorant','300','italic',base,'cormorant-300i'],['Cormorant','400','italic',base,'cormorant-400i'],['Tenor Sans','400','normal',base,'tenor-400'],['Commissioner','300','normal',base,'commissioner-300'],['Commissioner','400','normal',base,'commissioner-400'],['Commissioner','500','normal',base,'commissioner-500']];
let css='/* Генерирует tools/fonts.mjs: Cormorant, Tenor Sans, Commissioner из Google Fonts, локальные копии */\n';
for(const [fam,w,st,text,file] of FAMS){
 const spec=st==='italic'?`ital,wght@1,${w}`:`wght@${w}`;
 const u=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:${spec}&text=${encodeURIComponent(text)}&display=swap`;
 const r=await(await fetch(u,{headers:{'User-Agent':UA}})).text();
 const src=r.match(/url\((https:[^)]+)\)/)?.[1];if(!src)throw new Error('нет '+fam+' '+w+'\n'+r);
 const buf=Buffer.from(await(await fetch(src)).arrayBuffer());fs.writeFileSync(`fonts/${file}.woff2`,buf);
 css+=`@font-face{font-family:'${fam}';font-style:${st};font-weight:${w};font-display:swap;src:url(../fonts/${file}.woff2) format('woff2')}\n`;
 console.log(file.padEnd(20),(buf.length/1024).toFixed(1),'КБ');
}
fs.writeFileSync('css/fonts.css',css);
