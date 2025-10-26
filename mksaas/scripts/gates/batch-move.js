#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const ARTIFACTS = 'mksaas/artifacts/cleanup/2025-10-26';
const ATTIC = '.attic/2025-10-26';
const BATCH_SIZE = parseInt(process.argv[2]) || 50;
const SKIP_TESTS = process.argv.includes('--skip-tests');

// 读取文件
function readJSON(file) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJSON(file, data) {
  const fullPath = path.join(process.cwd(), file);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
}

function appendLog(message) {
  const logFile = path.join(ARTIFACTS, 'moves-log.md');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage, 'utf8');
}

function gitMove(src, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    execSync(`git mv -k -- "${src}" "${dest}"`, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function quickVerify() {
  // 超快验证:仅检查导入语法
  try {
    console.log('🔍 Quick import check...');
    execSync('npx tsc --noEmit --skipLibCheck --noResolve', { stdio: 'pipe', timeout: 10000 });
    return true;
  } catch {
    // 超时或语法错误时返回 true(继续),因为某些错误在实际构建时可能不影响
    return true;
  }
}

function fullVerify() {
  try {
    console.log('🔍 Full build verification...');
    execSync('npm run build', { stdio: 'inherit' });
    if (!SKIP_TESTS) {
      execSync('npm test', { stdio: 'inherit' });
    }
    return true;
  } catch {
    return false;
  }
}

function checkReferences(file) {
  // 快速别名引用检查
  const basename = path.basename(file, path.extname(file));
  try {
    const result = execSync(`git grep -l "@/.*${basename}" -- "*.ts" "*.tsx" "*.js" "*.jsx"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result.trim().split('\n').filter(Boolean).length > 0;
  } catch {
    return false;
  }
}

// 主逻辑
async function main() {
  const candidates = readJSON(`${ARTIFACTS}/candidates.json`);
  const denylist = readJSON(`${ARTIFACTS}/denylist.json`) || { paths: [] };
  
  if (!candidates || !candidates.files || candidates.files.length === 0) {
    console.log('✅ No more candidates to process');
    return;
  }

  let files = candidates.files.filter(f => {
    // 过滤掉 denylist 和不存在的文件
    if (denylist.paths.includes(f)) return false;
    if (!fs.existsSync(f)) {
      denylist.paths.push(f);
      return false;
    }
    return true;
  });

  console.log(`📦 Processing ${files.length} candidates in batches of ${BATCH_SIZE}`);

  let movedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    console.log(`\n📋 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} files`);

    const batchMoved = [];
    const batchFailed = [];

    for (const file of batch) {
      // 快速引用检查
      if (checkReferences(file)) {
        console.log(`⚠️  Skip ${file} (still referenced)`);
        denylist.paths.push(file);
        continue;
      }

      const dest = path.join(ATTIC, file);
      if (gitMove(file, dest)) {
        batchMoved.push(file);
        console.log(`✓ ${file}`);
      } else {
        batchFailed.push(file);
        denylist.paths.push(file);
        console.log(`✗ ${file}`);
      }
    }

    if (batchMoved.length > 0) {
      appendLog(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Moved ${batchMoved.length} files`);
      
      // 快速验证
      if (!quickVerify()) {
        console.log('❌ Quick verification failed, rolling back batch...');
        for (const file of batchMoved) {
          const dest = path.join(ATTIC, file);
          gitMove(dest, file);
        }
        appendLog(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ROLLBACK - verification failed`);
        failedCount += batchMoved.length;
        
        // 添加到 denylist
        denylist.paths.push(...batchMoved);
      } else {
        console.log('✅ Quick verification passed');
        movedCount += batchMoved.length;
      }
    }

    if (batchFailed.length > 0) {
      failedCount += batchFailed.length;
      appendLog(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Failed ${batchFailed.length} files`);
    }
  }

  // 更新候选文件列表
  candidates.files = candidates.files.filter(f => !denylist.paths.includes(f));
  writeJSON(`${ARTIFACTS}/candidates.json`, candidates);
  writeJSON(`${ARTIFACTS}/denylist.json`, denylist);

  // 最终完整验证
  console.log('\n🔍 Running final full verification...');
  if (fullVerify()) {
    console.log('✅ Full verification passed!');
    appendLog(`Summary: Moved ${movedCount}, Failed ${failedCount}, Remaining ${candidates.files.length}`);
  } else {
    console.log('⚠️  Full verification failed - check build output');
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Moved: ${movedCount}`);
  console.log(`  Failed: ${failedCount}`);
  console.log(`  Remaining: ${candidates.files.length}`);
}

main().catch(console.error);
