#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error(
      'Usage: node move-from-list.js <list.json> [--batchSize 8] [--maxBatches 8]'
    );
    process.exit(1);
  }
  const opts = { listPath: args[0], batchSize: 8, maxBatches: 8 };
  for (let i = 1; i < args.length; i++) {
    const k = args[i];
    const v = args[i + 1];
    if (k === '--batchSize' && v) {
      opts.batchSize = Number.parseInt(v, 10);
      i++;
    } else if (k === '--maxBatches' && v) {
      opts.maxBatches = Number.parseInt(v, 10);
      i++;
    }
  }
  return opts;
}

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  return JSON.parse(cleaned);
}

function normalizeRel(p) {
  // Convert backslashes to forward slashes and make relative to CWD
  const cwd = process.cwd();
  let rel = p;
  if (path.isAbsolute(p)) {
    rel = path.relative(cwd, p);
  }
  return rel.replace(/\\/g, '/');
}

function isTracked(file) {
  try {
    execSync(`git ls-files --error-unmatch "${file}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function moveOne(src, dest) {
  ensureDir(path.dirname(dest));
  execSync(`git mv "${src}" "${dest}"`, { stdio: 'ignore' });
}

function listCodeFiles(root) {
  const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx']);
  const results = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const fp = path.join(dir, e.name);
      if (fp.includes(`${path.sep}.attic${path.sep}`)) continue;
      if (e.isDirectory()) walk(fp);
      else if (exts.has(path.extname(e.name))) results.push(fp);
    }
  }
  walk(root);
  return results;
}

function quickReferenceCheck(movedOriginalPaths) {
  // Search for any source code that imports from components/tailark/preview
  const needles = ['components/tailark/preview'];
  const files = ['src', 'app'].flatMap((dir) =>
    fs.existsSync(dir) ? listCodeFiles(dir) : []
  );
  const offenders = [];
  for (const f of files) {
    let content;
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    if (needles.some((n) => content.includes(n))) {
      // crude, but fast; exclude offenders that are themselves under .attic (already excluded)
      offenders.push(f.replace(/\\/g, '/'));
    }
  }
  return Array.from(new Set(offenders));
}

function main() {
  const { listPath, batchSize, maxBatches } = parseArgs();
  const list = readJson(listPath);
  const files = (list.files || []).map(normalizeRel).filter(Boolean);
  const dateStamp = new Date().toISOString().split('T')[0];
  const atticBase = path.join('.attic', dateStamp);

  console.log(`Loaded ${files.length} files from ${listPath}`);
  let batch = [];
  let totalMoved = 0;
  let batches = 0;
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn(`Skip (missing): ${file}`);
      continue;
    }
    if (!isTracked(file)) {
      console.warn(`Skip (untracked): ${file}`);
      continue;
    }
    batch.push(file);
    if (batch.length === batchSize) {
      batches++;
      console.log(`\n=== Batch ${batches}/${maxBatches} ===`);
      for (const f of batch) {
        const dest = path.join(atticBase, f.replace(/\\/g, '/'));
        try {
          moveOne(f, dest);
          totalMoved++;
          console.log(`moved: ${f} -> ${dest}`);
        } catch (e) {
          console.warn(`failed: ${f} (${e.message})`);
        }
      }
      // quick reference check
      const offenders = quickReferenceCheck(batch);
      if (offenders.length) {
        console.warn(
          `\nReferences to 'components/tailark/preview' still found in:`
        );
        offenders.slice(0, 20).forEach((x) => console.warn(` - ${x}`));
        console.warn('Stopping to avoid breaking references.');
        break;
      }
      batch = [];
      if (batches >= maxBatches) break;
    }
  }
  // flush remaining
  if (batch.length && batches < maxBatches) {
    batches++;
    console.log(`\n=== Batch ${batches}/${maxBatches} ===`);
    for (const f of batch) {
      const dest = path.join(atticBase, f.replace(/\\/g, '/'));
      try {
        moveOne(f, dest);
        totalMoved++;
        console.log(`moved: ${f} -> ${dest}`);
      } catch (e) {
        console.warn(`failed: ${f} (${e.message})`);
      }
    }
    const offenders = quickReferenceCheck(batch);
    if (offenders.length) {
      console.warn(
        `\nReferences to 'components/tailark/preview' still found in:`
      );
      offenders.slice(0, 20).forEach((x) => console.warn(` - ${x}`));
      console.warn('Stopping to avoid breaking references.');
    }
  }

  console.log(
    `\nDone. Total moved: ${totalMoved}. Destination base: ${atticBase}`
  );
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
