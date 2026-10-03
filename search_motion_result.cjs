const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.startsWith('scratch_') && f.endsWith('.js'));

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  ['responseUrl', 'statusUrl', 'requestId', 'generate-ai-motion'].forEach(term => {
    let idx = 0;
    while ((idx = content.indexOf(term, idx)) !== -1) {
      console.log(`[${f}] Match for "${term}":`);
      console.log(content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + 200)));
      console.log('---');
      idx += term.length;
    }
  });
}
