import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const brief=`19532714/2a0000019e8edadb7edec3fba654aeb1165f
12721348/2a000001991fa2f05867e4b681ce17485f74
20456665/2a000001a080e82f6c56444c69241dbe7e33
14599414/2a00000198a200643a724815f396d5214f85
15416268/2a00000198a2003c5e1656bbdaf5b708bb8a
16417401/2a00000198a2005205ffd8720d6ed4f758d9
10285614/2a00000190dff19de6c39bf4405ce44268da
9830718/2a00000190dff1b5da2cf3623cd2d51f48a1
15608211/2a0000019a9b7ebfa7f25be934fb31fbafaf
15712112/2a0000019a9b7e8082cb0b330e025ea1b995
16021390/2a0000019a9b7f03d64fda97e52d8bb01358
16403814/2a0000019a9b7f3feeb2b136455f38821047
14703533/2a00000196b164182ee90faec8a8117f8938
9895050/2a000001925229d2e243bcd0faf042938208
5097872/2a0000018194cc828a579f4ec559145d030f
5106183/2a00000181f79488f46d3d2f2ff5bfc964da`.split('\n');
const st=JSON.parse(fs.readFileSync('tools/.cache/state-reviews.json','utf8'));
const items=st.stack[0].results.items[0];
const blocked=new Set();
// исключаем рекламу соседей: собираем get-altay из relatedAdverts/relatedPlaces
for(const o of [items.relatedAdverts,items.relatedPlaces,items.similarPlaces]){const j=JSON.stringify(o||{});for(const m of j.matchAll(/get-altay\/(\d+\/[0-9a-z]+)/gi))blocked.add(m[1])}
const page=fs.readFileSync('tools/.cache/ya-ids.txt','utf8').split('\n').filter(Boolean);
const all=[...new Set([...brief,...page])].filter(x=>!blocked.has(x));
console.log('blocked',blocked.size,'to fetch',all.length);
const res=[];
let idx=0;
await Promise.all(Array.from({length:6},async()=>{while(idx<all.length){const i=idx++;const id=all[i];const dest=`img/raw/ya/ya${String(i+1).padStart(3,'0')}.jpg`;let ok=null;for(const s of ['orig','XXXL','XXL_height','XXL']){try{const r=await fetch(`https://avatars.mds.yandex.net/get-altay/${id}/${s}`,{headers:{'User-Agent':UA,Referer:'https://yandex.ru/maps/'}});if(!r.ok)continue;const b=Buffer.from(await r.arrayBuffer());if(b.length<8000)continue;fs.writeFileSync(dest,b);ok=s;break}catch{}}res[i]={file:dest,id,size:ok,brief:brief.includes(id)}}}));
fs.writeFileSync('tools/.cache/ya-photos.json',JSON.stringify(res,null,1));
console.log(res.filter(r=>r.size).length,'ok',res.filter(r=>!r.size).map(r=>r.id));
