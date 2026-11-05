import fs from 'node:fs';
const ph=JSON.parse(fs.readFileSync('tools/.cache/ya-photos.json','utf8'));
const st=JSON.parse(fs.readFileSync('tools/.cache/state-reviews.json','utf8'));
const it=st.stack[0].results.items[0];
const gal=JSON.stringify(it.photos);
const asp=JSON.stringify(it.aspects);
const rev=JSON.stringify(st.reviews||{})+JSON.stringify(st.stack[0].results.items[0].reviewResults||{});
const rj=JSON.parse(fs.readFileSync('tools/.cache/reviews.json','utf8'));
const adv=JSON.stringify([it.relatedAdverts,it.relatedPlaces]);
for(const p of ph){const k=p.id.split('/')[1];console.log(p.file.slice(-9),p.brief?'BRIEF':'     ',gal.includes(k)?'GAL':'   ',asp.includes(k)?'ASP':'   ',JSON.stringify(rj).includes(k)?'REV':'   ',adv.includes(k)?'ADV':'',)}
console.log('gal items',it.photos.items.length,'reviews with photos',rj.filter(r=>r.photos.length).map(r=>r.author+':'+r.photos.length).join(', '));
for(const r of rj){ if(/Amira|Элина|Elina/i.test(r.author)||/золот/i.test(r.text)) console.log('\n##',r.author,r.date,r.text)}
const posts=JSON.parse(fs.readFileSync('tools/.cache/tg-posts.json','utf8'));
console.log('\nTG',posts.length,posts[0].date,posts.at(-1).date);
const kw=/олив|дерев|гамак|power|скраб|девичник|сауна|хорошее место/i;
for(const p of posts.filter(p=>/олив|дерев/i.test(p.text)).slice(-25))console.log('--',p.id,p.date?.slice(0,10),p.photos.length,p.videos.length,p.thumbs.length,p.text.replace(/\n/g,' ').slice(0,420));
