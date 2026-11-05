import sharp from 'sharp';import fs from 'node:fs';
const [dir,prefix,perArg]=process.argv.slice(2);
const files=fs.readdirSync(dir).filter(f=>/\.(jpe?g|png|webp)$/i.test(f)).sort();
const W=200,H=250,cols=9,per=+perArg||63;
for(let s=0;s*per<files.length;s++){const chunk=files.slice(s*per,s*per+per);
 const tiles=await Promise.all(chunk.map(async(f,i)=>{let img;try{img=await sharp(`${dir}/${f}`).rotate().resize(W-4,H-22,{fit:'contain',background:'#222'}).toBuffer()}catch{img=await sharp({create:{width:W-4,height:H-22,channels:3,background:'#500'}}).png().toBuffer()}
 const label=Buffer.from(`<svg width="${W}" height="20"><rect width="100%" height="100%" fill="#000"/><text x="4" y="15" font-size="13" fill="#fff" font-family="Arial">${f.replace(/\.[a-z]+$/,'')}</text></svg>`);
 const x=(i%cols)*W,y=Math.floor(i/cols)*H;return[{input:img,left:x+2,top:y+1},{input:label,left:x,top:y+H-21}]}));
 const rows=Math.ceil(chunk.length/cols);
 await sharp({create:{width:W*cols,height:H*rows,channels:3,background:'#111'}}).composite(tiles.flat()).jpeg({quality:72}).toFile(`tools/.cache/dense-${prefix}-${s+1}.jpg`);console.log(s+1,chunk.length)}
