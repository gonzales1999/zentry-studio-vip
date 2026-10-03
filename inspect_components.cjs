const fs = require('fs');
const comp = fs.readFileSync('scratch_ViroComposition-Tyg57pS2.js', 'utf8');

function inspectComp(name) {
  console.log(`\n=================== COMPONENT: ${name} ===================`);
  const idx = comp.indexOf(`case"${name}":`);
  if (idx !== -1) {
    console.log(comp.slice(Math.max(0, idx - 50), Math.min(comp.length, idx + 400)));
  } else {
    console.log(`case "${name}" not found directly, searching...`);
    const idx2 = comp.indexOf(name);
    if (idx2 !== -1) {
      console.log(comp.slice(Math.max(0, idx2 - 50), Math.min(comp.length, idx2 + 400)));
    }
  }
}

inspectComp('CSS3DLayer');
inspectComp('KineticText');
inspectComp('CaptionTrack');
inspectComp('VideoLayer');
inspectComp('Mockup');
