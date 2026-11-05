const r=JSON.parse(require('fs').readFileSync('tools/.cache/lh.json','utf8'));
const A=r.audits;
console.log('contrast',(A['color-contrast'].details?.items||[]).map(i=>i.node.selector+' :: '+(i.node.explanation||'').split('\n')[1]?.slice(0,110)));
console.log('resp',(A['uses-responsive-images'].details?.items||[]).map(i=>[i.url.split('/').pop(),Math.round(i.totalBytes/1024),Math.round(i.wastedBytes/1024)]));
console.log('deliv',(A['image-delivery-insight'].details?.items||[]).flatMap?.(x=>x.items||[]).map(i=>[String(i.url).split('/').pop(),Math.round((i.totalBytes||0)/1024),Math.round((i.wastedBytes||0)/1024)]));
console.log('blocking',(A['render-blocking-resources'].details?.items||[]).map(i=>[i.url.split('/').pop(),Math.round(i.totalBytes/1024),Math.round(i.wastedMs)]));
const reqs=A['network-requests'].details.items.map(i=>({u:i.url.split('/').slice(-2).join('/'),kb:Math.round(i.transferSize/1024),s:Math.round(i.networkRequestTime),e:Math.round(i.networkEndTime),p:i.priority}));
console.log(reqs.length,'total KB',reqs.reduce((a,b)=>a+b.kb,0));console.log(reqs.slice(0,40).map(x=>[x.u,x.kb,x.s,x.e,x.p].join(' ')).join('\n'));
console.log(A['largest-contentful-paint-element'].details.items[1]?.items);
