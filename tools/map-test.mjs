import sharp from 'sharp';import fs from 'node:fs';
let s=fs.readFileSync('scripts/map.svg','utf8');
s=s.replace('<title','<style>.m-house path{fill:#e5d9c6;stroke:#d9c7ae}.m-road path{fill:none;stroke:#c9b79e;stroke-width:2}.m-big path{fill:none;stroke:#b5a48c;stroke-width:5}.m-kom path{fill:none;stroke:#6e6b45;stroke-width:4}.m-water path{fill:#cbd0cc;stroke:#b7bdb8}.m-park path{fill:#dcd9bd}.m-dot{fill:#6e6b45}.m-ring{fill:none;stroke:#4b3b2b;stroke-width:2}.m-halo{fill:#6e6b45;opacity:.2}</style><title');
await sharp(Buffer.from(s.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="800" height="640" '))).flatten({background:'#f7f1e8'}).jpeg().toFile('tools/.cache/map.jpg');
