// Скриншоты секций и базовый аудит. node tools/shots.mjs [ширина] [высота]; ONLY=a,b — выборочно. URL= — другой адрес.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const W=Number(process.argv[2]||1440),H=Number(process.argv[3]||(W<768?844:900));
const URL=process.env.URL||'http://localhost:8560/';
const mobile=W<768;const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
fs.mkdirSync('tools/shots',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,locale:'ru-RU'});
await ctx.addInitScript(()=>{try{sessionStorage.setItem('zaytun-pre','1')}catch{}});
const page=await ctx.newPage();const errors=[];
page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(`${m.type()}: ${m.text()}`)});
page.on('pageerror',e=>errors.push('pageerror: '+e.message+' '+(e.stack||'').split('\n')[1]));
page.on('requestfailed',r=>errors.push('failed: '+r.url()));
await page.goto(URL,{waitUntil:'load'});
await page.waitForFunction(()=>document.body.classList.contains('js-ready'),null,{timeout:20000});
await page.waitForTimeout(1500);
const go=y=>page.evaluate(y=>{const l=window.__zaytun.lenis;if(l)l.scrollTo(y,{immediate:true,force:true});else scrollTo(0,y)},y);
const topOf=(id,frac=0)=>page.evaluate(([id,frac])=>{const el=document.getElementById(id)||document.querySelector(id),sp=el.closest('.pin-spacer')||el,r=sp.getBoundingClientRect();return r.top+scrollY+Math.max(0,r.height-innerHeight)*frac},[id,frac]);
const shots=[['top',0],['top',.45,'b'],['about',0],['about',1,'b'],['balance',0],['fitness',0],['fitness',.75,'b'],['rituals',0],['rituals',.8,'b'],['olivia',0],['olivia',.42,'b'],['olivia',.95,'c'],['massage',0],['massage',1,'b'],['details',.4],['space',0],['space',.8,'b'],['gift',.3],['voices',0],['pause',0],['contacts',0],['contacts',1,'b'],['.ft',1]];
let n=0;
for(const [id,frac,suf='']of shots){n++;const key=id.replace('.','');if(ONLY&&!ONLY.includes(key))continue;
 const y=await topOf(id,frac);const cur=await page.evaluate(()=>scrollY);
 for(let s=1;s<=8;s++){await go(cur+((y-cur)*s)/8);await page.waitForTimeout(90)}
 await go(y);await page.waitForTimeout(1500);
 await page.screenshot({path:`tools/shots/${W}-${String(n).padStart(2,'0')}-${key}${suf}.jpg`,quality:66,type:'jpeg'});}
const audit=await page.evaluate(()=>({innerWidth,docWidth:document.documentElement.scrollWidth,height:document.body.scrollHeight,noAlt:[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).length,hot:[...document.querySelectorAll('[src],[srcset]')].map(e=>e.getAttribute('src')||e.getAttribute('srcset')).filter(u=>/^https?:/.test(u)&&!/cdn\.jsdelivr/.test(u)),fonts:[...new Set([...document.querySelectorAll('h1,h2,p,.lab,.mg')].map(e=>getComputedStyle(e).fontFamily.split(',')[0]))],wide:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0&&r.height>0&&!e.closest('.gal,.fit-scroll,.voi-rows,.lb,.branch,.rit-list,.sprite,.hero-frame,.mob-menu,.cert,.bal')}).slice(0,8).map(e=>e.className?.baseVal??e.className??e.tagName)}));
console.log(JSON.stringify(audit));console.log(errors.length?[...new Set(errors)].join('\n'):'консоль чистая');
await browser.close();
