import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const posts=JSON.parse(fs.readFileSync('tools/.cache/tg-posts.json','utf8'));
const list=[];for(const p of posts){p.photos.forEach((u,i)=>list.push({u,f:`img/raw/tg/tg${String(p.id).padStart(4,'0')}-${i}.jpg`,id:p.id}));}
let k=0,ok=0;
await Promise.all(Array.from({length:8},async()=>{while(k<list.length){const x=list[k++];if(fs.existsSync(x.f))continue;try{const r=await fetch(x.u,{headers:{'User-Agent':UA}});if(!r.ok)continue;fs.writeFileSync(x.f,Buffer.from(await r.arrayBuffer()));ok++}catch{}}}));
console.log('tg ok',ok,'of',list.length);
