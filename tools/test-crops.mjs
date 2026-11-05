import sharp from 'sharp';
const items=[['ya021',.5,.36,1,.62],['ya043',.5,.46,1,.62],['ya006',.5,.40,1,.62],['ya001',.5,.45,1,.62],['ya024',.5,.60,1,.62],['ya044',.5,.55,1,.62],['ya010',.5,.55,1,.62],['ya037',.5,.6,1,.62]];
const W=560;const tiles=[];
for(let i=0;i<items.length;i++){const [n,cx,cy,wf,hf]=items[i];const b=await sharp(`img/raw/ya/${n}.jpg`).rotate().toBuffer();const m=await sharp(b).metadata();
 const w=Math.round(m.width*wf),h=Math.round(w*.625);const top=Math.max(0,Math.min(m.height-h,Math.round(m.height*cy-h/2)));const left=Math.round((m.width-w)/2);
 const c=await sharp(b).extract({left,top,width:w,height:h}).resize(W).toBuffer();
 const H=Math.round(W*.625);const svg=Buffer.from(`<svg width="${W}" height="${H}"><circle cx="${W/2}" cy="${H/2}" r="${H*.31}" fill="none" stroke="#fff" stroke-width="3"/><text x="8" y="24" fill="#fff" font-size="20" font-family="Arial">${n} ${m.width}x${m.height}</text></svg>`);
 tiles.push({input:c,left:(i%4)*W,top:Math.floor(i/4)*H},{input:svg,left:(i%4)*W,top:Math.floor(i/4)*H});
}
await sharp({create:{width:W*4,height:Math.round(W*.625)*2,channels:3,background:'#000'}}).composite(tiles).jpeg({quality:78}).toFile('tools/.cache/crops.jpg');
