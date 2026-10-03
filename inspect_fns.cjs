const fs = require('fs');
const comp = fs.readFileSync('scratch_ViroComposition-Tyg57pS2.js', 'utf8');

function findFnDefinition(fnName) {
  console.log(`\n=================== FUNCTION: ${fnName} ===================`);
  // search for const fnName = or function fnName(
  const patterns = [
    new RegExp(`const\\s+${fnName}\\s*=`),
    new RegExp(`function\\s+${fnName}\\s*\\(`),
    new RegExp(`var\\s+${fnName}\\s*=`),
    new RegExp(`${fnName}\\s*=\\s*\\(`),
    new RegExp(`${fnName}\\s*=\\s*\\{`)
  ];

  for (const p of patterns) {
    const m = p.exec(comp);
    if (m) {
      console.log(`Matched pattern ${p}:`);
      console.log(comp.slice(m.index, Math.min(comp.length, m.index + 1200)));
      return;
    }
  }
  console.log('Not found with standard patterns');
}

findFnDefinition('md'); // CSS3DLayer
findFnDefinition('Rc'); // KineticText
findFnDefinition('xd'); // CaptionTrack
findFnDefinition('Yd'); // Main Composition
