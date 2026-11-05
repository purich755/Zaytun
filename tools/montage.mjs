import sharp from 'sharp';import fs from 'node:fs';
const [w,out,cols='3',tw='640',...filters]=process.argv.slice(2);
const files=fs.readdirSync('tools/shots').filter(f=>f.startsWith(w+'-')&&f.endsWith('.jpg')).filter(f=>!filters.length||filters.some(x=>f.includes(x))).sort();
const T=+tw;const metas=await Promise.all(files.map(f=>sharp('tools/shots/'+f).metadata()));const h=Math.round(T*metas[0].height/metas[0].width);
const C=+cols;const comps=[];for(let i=0;i<files.length;i++){comps.push({input:await sharp('tools/shots/'+files[i]).resize(T,h).toBuffer(),left:(i%C)*(T+6),top:Math.floor(i/C)*(h+6)})}
await sharp({create:{width:C*(T+6),height:Math.ceil(files.length/C)*(h+6),channels:3,background:'#000'}}).composite(comps).jpeg({quality:80}).toFile(out);console.log(files.length);
