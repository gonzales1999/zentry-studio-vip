const fs = require('fs');

const comp = fs.readFileSync('scratch_ViroComposition-Tyg57pS2.js', 'utf8');

let idx = 0;
while ((idx = comp.indexOf('generate:', idx)) !== -1) {
  console.log('=== MATCH FOR generate: ===');
  console.log(comp.slice(Math.max(0, idx - 100), Math.min(comp.length, idx + 800)));
  idx += 'generate:'.length;
}

idx = 0;
while ((idx = comp.indexOf('/functions/v1/', idx)) !== -1) {
  console.log('=== MATCH FOR /functions/v1/ ===');
  console.log(comp.slice(Math.max(0, idx - 100), Math.min(comp.length, idx + 400)));
  idx += '/functions/v1/'.length;
}
