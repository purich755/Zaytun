import { chromium } from 'playwright-core';
const b=await chromium.launch({channel:'chrome',headless:true});
for(const [name,o] of [['reduce',{reducedMotion:'reduce'}],['nojs',{javaScriptEnabled:false}]]){
 const c=await b.newContext({viewport:{width:1440,height:900},...o});const p=await c.newPage();await p.goto('http://localhost:8560/',{waitUntil:'load'});await p.waitForTimeout(2500);
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);
 if(o.reducedMotion){for(let y=0;y<H;y+=700){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(120)}await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(400)}
 else{for(let y=0;y<H;y+=700){await p.evaluate(y=>0,y)}}
 await p.screenshot({path:`tools/shots/mode-${name}.jpg`,type:'jpeg',quality:60,fullPage:true});console.log(name,H);await c.close();}
await b.close();
