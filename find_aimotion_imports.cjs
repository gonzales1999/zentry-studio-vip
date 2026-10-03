const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.startsWith('scratch_') && f.endsWith('.js'));
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('aiMotionDefaults')) {
    console.log(f, 'imports aiMotionDefaults');
    const matches = [...content.matchAll(/import\{[^}]*\}from["']\.\/aiMotionDefaults[^"']*["']/g)];
    matches.forEach(m => console.log('  ', m[0]));
  }
}
