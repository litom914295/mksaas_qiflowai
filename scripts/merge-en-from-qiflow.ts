import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import deepmerge from 'deepmerge';

/**
 * Merge English translations from qiflow-ai into mksaas base
 *
 * This script:
 * 1. Loads mksaas base en.json (733 keys)
 * 2. Loads qiflow-ai en.json (normalized to PascalCase)
 * 3. Merges both, preserving mksaas base and adding qiflow business keys
 *
 * Usage:
 *   npm run merge:en-qiflow
 *   tsx scripts/merge-en-from-qiflow.ts
 */

const MESSAGES_DIR = join(process.cwd(), 'messages');

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Recursively normalize all keys in an object to PascalCase (top-level only)
 */
function normalizeKeys(obj: any, isTopLevel = true): any {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const normalized: any = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const newKey = isTopLevel ? capitalize(key) : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      normalized[newKey] = normalizeKeys(value, false);
    } else {
      normalized[newKey] = value;
    }
  }

  return normalized;
}

/**
 * Load and parse a JSON file
 */
function loadJson(filePath: string): any {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save JSON to file
 */
function saveJson(filePath: string, data: any): void {
  const content = JSON.stringify(data, null, 2) + '\n';
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Count total keys recursively
 */
function countKeys(obj: any): number {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return 0;
  }

  let count = 0;
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      count += countKeys(value);
    } else {
      count++;
    }
  }
  return count;
}

/**
 * Main merge logic
 */
function main() {
  console.log('🔧 Merging English translations from qiflow-ai...\n');

  // Load mksaas base en.json
  console.log('📖 Loading mksaas base en.json...');
  const mksaasEnPath = join(MESSAGES_DIR, 'en.json');
  const mksaasEn = loadJson(mksaasEnPath);
  const mksaasKeyCount = countKeys(mksaasEn);
  console.log(`   Found ${mksaasKeyCount} keys (mksaas base)\n`);

  // Load qiflow-ai en.json (copy)
  console.log('📖 Loading qiflow-ai en.json...');
  const qiflowEnPath = join(MESSAGES_DIR, 'en-qiflow.json');
  const qiflowEnRaw = loadJson(qiflowEnPath);

  // Normalize qiflow keys to PascalCase
  console.log('🔄 Normalizing qiflow keys to PascalCase...');
  const qiflowEn = normalizeKeys(qiflowEnRaw);
  const qiflowKeyCount = countKeys(qiflowEn);
  console.log(`   Found ${qiflowKeyCount} keys (qiflow-ai)\n`);

  // Merge: mksaas base + qiflow business keys
  console.log('🔀 Merging translations...');
  const merged = deepmerge(mksaasEn, qiflowEn, {
    // Preserve mksaas values, only add new qiflow keys
    arrayMerge: (destinationArray, sourceArray) => destinationArray,
  });
  const mergedKeyCount = countKeys(merged);
  console.log(`   Merged ${mergedKeyCount} keys total\n`);

  // Save merged en.json
  saveJson(mksaasEnPath, merged);
  console.log(`✅ Saved merged en.json (${mergedKeyCount} keys)\n`);

  console.log('Summary:');
  console.log(`  - mksaas base: ${mksaasKeyCount} keys`);
  console.log(`  - qiflow-ai:   ${qiflowKeyCount} keys`);
  console.log(`  - merged:      ${mergedKeyCount} keys\n`);

  console.log('Next steps:');
  console.log('  1. Run: npm run merge:i18n (to sync all locales)');
  console.log('  2. Run: npm run validate:i18n');
  console.log('  3. All locales should be complete!\n');
}

// Run the script
main();
