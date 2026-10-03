const fs = require('fs');

const comp = fs.readFileSync('scratch_ViroComposition-Tyg57pS2.js', 'utf8');

// Find config structure / mock config / validation
const idx = comp.indexOf('generate-video');
if (idx !== -1) {
  console.log('=== AROUND generate-video ===');
  console.log(comp.slice(idx, idx + 1000));
}
