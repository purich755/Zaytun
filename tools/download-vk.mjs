// Зеркало VK orgs.biz: посты /news/N, берём тексты и самые большие картинки (параметр as=)
import fs from 'node:fs';
const UA='Mozilla/5.0';
const posts=[];
const nums=Array.from({length:140},(_,i)=>i+1);
let k=0;
await Promise.all(Array.from({length:4},async()=>{while(k<nums.length){const n=nums[k++];try{
 const r=await fetch(`https://zaytun-fitness-spa.orgs.biz/news/${n}`,{headers:{'User-Agent':UA}});if(!r.ok)continue;const t=await r.text();
 const title=(t.match(/<title>([^<]*)/)||[])[1]||'';
 const urls=[...t.matchAll(/https:\/\/[a-z0-9.-]*userapi\.com\/s\/v1\/[^"'\s)]+/g)].map(m=>m[0].replace(/&amp;/g,'&'));
 const seen=new Map();
 for(const u of urls){ if(/ava=1/.test(u))continue; const base=u.split('?')[0]; const as=(u.match(/as=([^&]+)/)||[])[1]; if(!as)continue; const max=as.split(',').map(s=>s.split('x').map(Number)).sort((a,b)=>b[0]*b[1]-a[0]*a[1])[0]; const full=u.replace(/cs=\d+x\d+/,'cs='+max.join('x')); seen.set(base,{full,w:max[0],h:max[1]}) }
 const body=t.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
 posts.push({n,title,imgs:[...seen.values()],text:body.slice(0,1500)});
}catch(e){}}}));
posts.sort((a,b)=>a.n-b.n);
fs.writeFileSync('tools/.cache/vk-posts.json',JSON.stringify(posts,null,1));
let c=0,dl=0;const q=posts.flatMap(p=>p.imgs.map((im,i)=>({...im,f:`img/raw/vk/vk${String(p.n).padStart(3,'0')}-${i}.jpg`})));
k=0;await Promise.all(Array.from({length:6},async()=>{while(k<q.length){const x=q[k++];if(fs.existsSync(x.f))continue;try{const r=await fetch(x.full,{headers:{'User-Agent':UA}});if(!r.ok)continue;fs.writeFileSync(x.f,Buffer.from(await r.arrayBuffer()));dl++}catch{}}}));
console.log('posts',posts.length,'imgs',q.length,'downloaded',dl);
