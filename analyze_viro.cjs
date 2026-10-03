const fs = require('fs');

const bundle = fs.readFileSync('scratch_viro_bundle.js', 'utf8');

console.log('Searching bundle for keywords...');

function search(term) {
  let idx = 0;
  const results = [];
  while ((idx = bundle.indexOf(term, idx)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(bundle.length, idx + 200);
    results.push(bundle.slice(start, end).replace(/\n/g, ' '));
    idx += term.length;
    if (results.length >= 10) break;
  }
  return results;
}

const terms = ['motion', '3d', 'template', 'broll', 'pexels', 'remotion', 'caption', 'subtitle', 'supabase', 'api', 'fal', 'runway', 'openai', 'whisper', 'groq', 'elevenlabs'];

for (const t of terms) {
  const matches = search(t);
  console.log(`=== Matches for "${t}": ${matches.length} ===`);
  matches.slice(0, 3).forEach((m, i) => console.log(`  [${i+1}] ${m}`));
}
