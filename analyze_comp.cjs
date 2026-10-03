const fs = require('fs');
const comp = fs.readFileSync('scratch_ViroComposition-Tyg57pS2.js', 'utf8');

// Find all occurrences of component names or layer types in ViroComposition
const layerTypes = new Set();
const switchMatches = [...comp.matchAll(/case\s*["']([A-Za-z0-9_-]+)["']\s*:/g)];
for (const m of switchMatches) {
  layerTypes.add(m[1]);
}
console.log('Layer Types found in switches:', [...layerTypes]);

// Find all preset or template identifiers
const ids = [...comp.matchAll(/id\s*:\s*["']([a-zA-Z0-9_\-]+)["']/g)].map(m => m[1]);
console.log('IDs found (sample):', [...new Set(ids)].slice(0, 30));

// Search for 3D elements or scenes
const threeMatches = [...comp.matchAll(/(three|webgl|gltf|fbx|obj|perspective|mesh|scene|camera)/gi)].map(m => m[1]);
console.log('3D-related terms count:', threeMatches.length);

// Look at how Viro sequences clips
console.log('\n--- Checking clip / scene sequencing ---');
const idx = comp.indexOf('TransitionLayer');
if (idx !== -1) {
  console.log(comp.slice(Math.max(0, idx - 400), Math.min(comp.length, idx + 600)));
}
