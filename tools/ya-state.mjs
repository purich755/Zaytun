import fs from 'node:fs';
const t=fs.readFileSync('tools/.cache/com_maps_org_zaytun_122462904652_reviews_.html','utf8');
const m=t.match(/<script type="application\/json" class="state-view">([\s\S]*?)<\/script>/);
if(!m){console.log('no state');process.exit()}
const s=JSON.parse(m[1]);
fs.writeFileSync('tools/.cache/state-reviews.json',JSON.stringify(s,null,1));
function walk(o,path,fn,depth=0){ if(!o||typeof o!=='object'||depth>9)return; for(const k of Object.keys(o)){const p=path+'.'+k;fn(k,o[k],p);walk(o[k],p,fn,depth+1)} }
const seen=[];
walk(s,'',(k,v,p)=>{ if(['coordinates','workingTime','metro','stops','features','reviewResults','photos','reviews','displayCoordinates','phones','urls'].includes(k)) seen.push(p+' '+(Array.isArray(v)?'['+v.length+']':typeof v)) });
console.log(seen.slice(0,40).join('\n'));
console.log(Object.keys(s));
