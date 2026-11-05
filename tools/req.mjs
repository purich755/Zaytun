import { chromium } from 'playwright-core';
const b=await chromium.launch({channel:'chrome',headless:true});const c=await b.newContext({viewport:{width:1440,height:900}});
await c.addInitScript(()=>{try{sessionStorage.setItem('zaytun-pre','1')}catch{}});
const p=await c.newPage();const m={};p.on('request',r=>{const u=r.url().replace(/^https?:\/\/[^/]+/,'');m[u]=(m[u]||0)+1});
p.on('requestfailed',r=>console.log('FAIL',r.url().slice(0,90),r.failure()?.errorText));
const t0=Date.now();await p.goto('http://localhost:8560/',{waitUntil:'load'});console.log('load',Date.now()-t0);await p.waitForTimeout(4000);
const e=Object.entries(m).sort((a,b)=>b[1]-a[1]);console.log('total',e.reduce((a,x)=>a+x[1],0),'uniq',e.length);console.log(e.slice(0,12));
const big=await p.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.encodedBodySize>200000).map(r=>[r.name.split('/').pop(),Math.round(r.encodedBodySize/1024)]));console.log(big);
await b.close();
