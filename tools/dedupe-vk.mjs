import fs from 'node:fs';import crypto from 'node:crypto';
const dir='img/raw/vk';const seen=new Map();let del=0;
for(const f of fs.readdirSync(dir).sort()){const p=`${dir}/${f}`;const h=crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');if(seen.has(h)){fs.unlinkSync(p);del++}else seen.set(h,f)}
console.log('kept',seen.size,'deleted',del);
