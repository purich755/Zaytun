import sharp from 'sharp';
const names=process.argv.slice(3);const out=process.argv[2];
const W=300,H=400,cols=6;
const res=async n=>{const d=n.startsWith('tg')?'tg':n.startsWith('vk')?'vk':'ya';return `img/raw/${d}/${n}.jpg`};
const tiles=[];
for(let i=0;i<names.length;i++){const p=await res(names[i]);const buf=await sharp(p).rotate().toBuffer();const m=await sharp(buf).metadata();
const img=await sharp(buf).resize(W-4,H-22,{fit:'contain',background:'#222'}).toBuffer();
const label=Buffer.from(`<svg width="${W}" height="20"><rect width="100%" height="100%" fill="#000"/><text x="4" y="15" font-size="13" fill="#fff" font-family="Arial">${names[i]} ${m.width}x${m.height}</text></svg>`);
const x=(i%cols)*W,y=Math.floor(i/cols)*H;tiles.push({input:img,left:x+2,top:y+1},{input:label,left:x,top:y+H-21})}
await sharp({create:{width:W*cols,height:H*Math.ceil(names.length/cols),channels:3,background:'#111'}}).composite(tiles).jpeg({quality:80}).toFile(out);
