// Схема квартала из OSM (tools/.cache/osm.json). Выход: scripts/map.svg (вставляется в index.html инлайном).
import fs from 'node:fs';
const ORG=[49.096931,55.809921];const W=800,H=640;
const kx=Math.cos(ORG[1]*Math.PI/180)*111320,ky=111200,S=0.82,OX=W*.46,OY=H*.56;
const pr=([lon,lat])=>[OX+(lon-ORG[0])*kx*S,OY-(lat-ORG[1])*ky*S];
const r=v=>Math.round(v);
const osm=JSON.parse(fs.readFileSync('tools/.cache/osm.json','utf8'));
const roads=[],big=[],kom=[],houses=[],water=[],parks=[];
const toD=(g,close)=>{const p=g.map(x=>pr([x.lon,x.lat]));if(p.every(([x,y])=>x<-10||x>W+10||y<-10||y>H+10))return null;return'M'+p.map(q=>q.map(r).join(',')).join('L')+(close?'Z':'')};
for(const el of osm.elements){const t=el.tags||{};
 if(el.type==='relation'&&t.natural==='water'){for(const m of el.members||[]){if(m.role==='outer'&&m.geometry){const d=toD(m.geometry,false);if(d)water.push(d)}}continue}
 if(!el.geometry)continue;
 if(t.natural==='water'){const d=toD(el.geometry,true);if(d)water.push(d);continue}
 if(t.leisure){const d=toD(el.geometry,true);if(d)parks.push(d);continue}
 if(t.waterway)continue;
 if(t.building){const d=toD(el.geometry,true);if(d)houses.push(d);continue}
 if(/footway|path|steps|service|cycleway|construction|track|pedestrian|living/.test(t.highway||''))continue;
 const d=toD(el.geometry);if(!d)continue;
 if(t.name==='Комсомольская улица')kom.push(d);else if(/^(trunk|primary|secondary)/.test(t.highway))big.push(d);else roads.push(d);
}
const svg=`<svg class="map-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="map-t" preserveAspectRatio="xMidYMid slice"><title id="map-t">Схема квартала: студия Зайтун на улице Комсомольская, 1, Казань</title>
<g class="m-park">${parks.map(d=>`<path d="${d}"/>`).join('')}</g><g class="m-water">${water.map(d=>`<path d="${d}"/>`).join('')}</g><g class="m-house">${houses.map(d=>`<path d="${d}"/>`).join('')}</g><g class="m-road">${roads.map(d=>`<path d="${d}"/>`).join('')}</g><g class="m-big">${big.map(d=>`<path d="${d}"/>`).join('')}</g><g class="m-kom">${kom.map(d=>`<path d="${d}"/>`).join('')}</g>
<text class="m-l" transform="translate(205 292) rotate(-21)">Комсомольская</text><text class="m-l" transform="translate(628 300) rotate(84)">ул. Декабристов</text><text class="m-l-i" x="705" y="400">Казанка</text>
<g transform="translate(${r(OX)} ${r(OY)})"><circle class="m-halo" r="26"/><circle class="m-ring" r="15"/><circle class="m-dot" r="5"/><text class="m-org" x="26" y="8">Зайтун</text></g></svg>`;
fs.writeFileSync('scripts/map.svg',svg);console.log((svg.length/1024).toFixed(1),'КБ',{houses:houses.length,roads:roads.length,big:big.length,kom:kom.length,water:water.length,parks:parks.length});
