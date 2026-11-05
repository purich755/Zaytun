import sharp from 'sharp';import fs from 'node:fs';
const keys=[...new Set(fs.readdirSync('img').filter(f=>/-\d+\.jpg$/.test(f)).map(f=>f.replace(/-\d+\.jpg$/,'')))].sort();
const W=225,H=280,cols=8;const tiles=[];
for(let i=0;i<keys.length;i++){const f=fs.readdirSync('img').filter(x=>x.startsWith(keys[i]+'-')&&/^[a-z0-9-]+-\d+\.jpg$/.test(x)&&x.replace(/-\d+\.jpg$/,'')===keys[i]).sort((a,b)=>parseInt(a.match(/(\d+)\.jpg/)[1])-parseInt(b.match(/(\d+)\.jpg/)[1]))[0];
 const img=await sharp('img/'+f).resize(W-4,H-22,{fit:'contain',background:'#222'}).toBuffer();
 const l=Buffer.from(`<svg width="${W}" height="20"><rect width="100%" height="100%" fill="#000"/><text x="4" y="15" font-size="13" fill="#fff" font-family="Arial">${keys[i]}</text></svg>`);
 const x=(i%cols)*W,y=Math.floor(i/cols)*H;tiles.push({input:img,left:x+2,top:y+1},{input:l,left:x,top:y+H-21})}
await sharp({create:{width:W*cols,height:H*Math.ceil(keys.length/cols),channels:3,background:'#111'}}).composite(tiles).jpeg({quality:80}).toFile('tools/.cache/out.jpg');console.log(keys.length);
