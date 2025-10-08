const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const replacements = [
  { from: '@/lib/bazi/luck-pillars', to: '@/lib/qiflow/bazi/luck-pillars' },
  { from: '@/lib/bazi/enhanced-calculator', to: '@/lib/qiflow/bazi/enhanced-calculator' },
  { from: '@/lib/fengshui/smart-recommendations', to: '@/lib/qiflow/fengshui/smart-recommendations' }
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('./src/components');

let totalChanges = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    totalChanges++;
  }
});

console.log(`\n✅ Total files updated: ${totalChanges}`);
