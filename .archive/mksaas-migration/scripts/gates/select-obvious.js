const fs = require('fs');
const path = require('path');

const ART = process.argv[2];
if (!ART) {
  console.error('Usage: node select-obvious.js <ArtifactsDir>');
  process.exit(1);
}
const cpath = path.join(ART, 'candidates.json');
let data;
try {
  data = JSON.parse(fs.readFileSync(cpath, 'utf8').replace(/^\uFEFF/, ''));
} catch (e) {
  console.error('Failed to read candidates.json:', e.message);
  process.exit(1);
}
const files = Array.isArray(data.files) ? data.files : [];

// Define conservative patterns for "obvious" demo/analytics UI code
const patterns = [
  /^src\/analytics\//,
  /^src\/components\/animate-ui\//,
  /^src\/components\/magicui\//,
];

const selected = files.filter((f) =>
  patterns.some((re) => re.test(f.replace(/\\/g, '/')))
);
const out = { files: selected, counts: { total: selected.length } };
fs.writeFileSync(
  path.join(ART, 'candidates.obvious.json'),
  JSON.stringify(out, null, 2)
);
console.log(`Obvious candidates: ${selected.length}`);
