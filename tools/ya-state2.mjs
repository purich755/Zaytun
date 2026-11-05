import fs from 'node:fs';
process.stdout.setDefaultEncoding?.('utf8');
const s=JSON.parse(fs.readFileSync('tools/.cache/state-reviews.json','utf8'));
const it=s.stack[0].results.items[0];
console.log(it.title,it.coordinates,it.displayCoordinates,it.address,it.fullAddress);
console.log('metro',it.metro.map(m=>[m.name,m.distance,m.distanceValue]));
console.log('stops',it.stops.map(m=>[m.name,m.distance]));
console.log('work',JSON.stringify(it.workingTime),it.workingTimeText);
console.log('features',it.features.map(f=>f.name+':'+JSON.stringify(f.value)).join(' | '));
console.log('photos',Object.keys(it.photos),it.photos.count,JSON.stringify(it.photos.items?.slice(0,2)));
console.log('aspects',it.aspects.map(a=>[a.text||a.name,a.photos?.length]));
const r=s.reviews; console.log('reviews keys',Object.keys(r||{}));
function find(o,key,out=[],d=0){if(!o||typeof o!=='object'||d>10)return out;for(const k in o){if(k===key)out.push(o[k]);find(o[k],key,out,d+1)}return out}
const rv=find(s.stack[0],'reviews').flat();
console.log('reviews',rv.length, rv[0]&&Object.keys(rv[0]));
const all=[...new Map(rv.filter(x=>x&&x.text).map(x=>[x.reviewId||x.text.slice(0,30),x])).values()];
fs.writeFileSync('tools/.cache/reviews.json',JSON.stringify(all.map(x=>({id:x.reviewId,author:x.author?.name,date:x.updatedTime,rating:x.rating,text:x.text,photos:(x.photos||[]).map(p=>p.urlTemplate||p)})),null,1));
console.log('uniq',all.length);
