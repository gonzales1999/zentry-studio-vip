const fs = require('fs');

const editor = fs.readFileSync('scratch_ViroEditor-rvj8I3Vi.js', 'utf8');
const bundle = fs.readFileSync('scratch_viro_bundle.js', 'utf8');

function searchAll(str, kw, limit = 5) {
  let idx = 0;
  let count = 0;
  console.log(`=== Matches for ${kw} ===`);
  while ((idx = str.indexOf(kw, idx)) !== -1 && count < limit) {
    console.log(str.slice(Math.max(0, idx - 100), Math.min(str.length, idx + 300)));
    console.log('---');
    idx += kw.length;
    count++;
  }
}

searchAll(editor, 'aiMotion');
searchAll(editor, 'mgOverlays');
searchAll(bundle, 'generate-ai-motion');
