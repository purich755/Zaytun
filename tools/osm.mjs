import fs from 'node:fs';
const q=`[out:json][timeout:40];(way(around:650,55.809921,49.096931)[highway];way(around:650,55.809921,49.096931)[building];way(around:900,55.809921,49.096931)[natural=water];way(around:900,55.809921,49.096931)[waterway];relation(around:900,55.809921,49.096931)[natural=water];way(around:650,55.809921,49.096931)[leisure~"park|garden"];);out geom;`;
const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'User-Agent':'zaytun-demo-map/1.0','Content-Type':'application/x-www-form-urlencoded'},body:'data='+encodeURIComponent(q)});
console.log(r.status);const t=await r.text();fs.writeFileSync('tools/.cache/osm.json',t);const j=JSON.parse(t);console.log(j.elements.length);
const names=new Set(j.elements.filter(e=>e.tags?.highway&&e.tags.name).map(e=>e.tags.name));console.log([...names].join(', '));
console.log(j.elements.filter(e=>e.tags?.building&&e.tags['addr:street']?.includes('Комсомольская')).map(e=>e.tags['addr:housenumber']).join(','));
console.log(j.elements.filter(e=>e.tags?.natural==='water'||e.tags?.waterway).map(e=>(e.tags.name||e.tags.natural||e.tags.waterway)+':'+e.type).join(', '));
