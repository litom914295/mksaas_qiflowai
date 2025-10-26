const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ART = process.argv[2];
if (!ART) {
  console.error('Usage: node prune-candidates.js <ArtifactsDir>');
  process.exit(1);
}
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const cpath = path.join(ART, 'candidates.json');
const dpath = path.join(ART, 'denylist.json');
let files = [];
try { files = readJson(cpath).files || []; } catch {}
let deny = [];
try { deny = readJson(dpath).paths || []; } catch {}
const ok = [];
for (const f of files) {
  if (!f || deny.includes(f)) continue;
  try {
    if (!fs.existsSync(f)) continue;
    execSync(`git --no-pager ls-files --error-unmatch -- "${f}"`, { stdio: 'ignore' });
    ok.push(f);
  } catch {}
}
const out = { files: ok, counts: { total: ok.length } };
const outPath = path.join(ART, 'candidates.round2.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Round2 candidates: ${ok.length}`);
