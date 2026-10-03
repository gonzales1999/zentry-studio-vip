const fs = require('fs');

const indexChunk = fs.readFileSync('scratch_Index-CN8skoXz.js', 'utf8');

function searchIndex(kw) {
  let idx = 0;
  console.log(`\n=== KEYWORD: ${kw} ===`);
  let count = 0;
  while ((idx = indexChunk.indexOf(kw, idx)) !== -1 && count < 5) {
    console.log(indexChunk.slice(Math.max(0, idx - 100), Math.min(indexChunk.length, idx + 300)));
    console.log('---');
    idx += kw.length;
    count++;
  }
}

searchIndex('ViroComposition');
searchIndex('scenes');
searchIndex('Player');
searchIndex('broll');
