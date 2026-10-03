const fs = require('fs');
const comp = fs.readFileSync('scratch_ViroComposition-Tyg57pS2.js', 'utf8');

const idx = comp.indexOf('const wd=');
if (idx !== -1) {
  console.log('=== DEFINITION OF wd (Word renderer) ===');
  console.log(comp.slice(idx, idx + 1500));
} else {
  // search wd=
  const idx2 = comp.indexOf('wd=');
  console.log(comp.slice(idx2, idx2 + 1500));
}
