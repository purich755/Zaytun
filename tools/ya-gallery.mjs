import fs from 'node:fs';
const t=fs.readFileSync('tools/.cache/com_maps_org_zaytun_122462904652_gallery_.html','utf8');
const m=t.match(/<script type="application\/json" class="state-view">([\s\S]*?)<\/script>/);
const s=JSON.parse(m[1]);
function find(o,key,out=[],d=0){if(!o||typeof o!=='object'||d>12)return out;for(const k in o){if(k===key)out.push(o[k]);find(o[k],key,out,d+1)}return out}
console.log(JSON.stringify(Object.keys(s.photos||{})).slice(0,300));
const ph=find(s,'urlTemplate');console.log('templates',new Set(ph).size);
const cnt=find(s.stack[0],'photos');console.log(cnt.map(c=>Array.isArray(c)?'arr'+c.length:(c&&c.count)).slice(0,10));
const it=s.stack[0].results.items[0];console.log(JSON.stringify(it.photos).slice(0,800));
console.log(JSON.stringify(s.photos).slice(0,800));
