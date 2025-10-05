import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Replace TODO placeholders with actual translations from qiflow-ai source
 *
 * This script:
 * 1. Loads the current en.json with TODO placeholders
 * 2. Loads the qiflow-ai en.json source (normalized)
 * 3. Replaces TODO values with actual English translations
 *
 * Usage:
 *   npm run replace:todos
 *   tsx scripts/replace-todo-placeholders.ts
 */

const MESSAGES_DIR = join(process.cwd(), 'messages');

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Normalize keys to PascalCase (top-level only)
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
 * Flatten keys to dot notation with values
 */
function flattenKeysWithValues(obj: any, prefix = ''): Map<string, any> {
  const result = new Map<string, any>();

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const nested = flattenKeysWithValues(value, fullKey);
      nested.forEach((v, k) => result.set(k, v));
    } else {
      result.set(fullKey, value);
    }
  }

  return result;
}

/**
 * Set nested value using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !(key in current) ||
      typeof current[key] !== 'object' ||
      Array.isArray(current[key])
    ) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Load JSON file
 */
function loadJson(filePath: string): any {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save JSON file
 */
function saveJson(filePath: string, data: any): void {
  const content = JSON.stringify(data, null, 2) + '\n';
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Main replacement logic
 */
function main() {
  console.log('🔧 Replacing TODO placeholders with actual translations...\n');

  // Load current en.json
  console.log('📖 Loading current en.json...');
  const currentEnPath = join(MESSAGES_DIR, 'en.json');
  const currentEn = loadJson(currentEnPath);
  const currentFlat = flattenKeysWithValues(currentEn);
  console.log(`   Found ${currentFlat.size} keys\n`);

  // Load qiflow-ai en.json
  console.log('📖 Loading qiflow-ai en.json source...');
  const qiflowEnPath = join(MESSAGES_DIR, 'en-qiflow.json');
  const qiflowEnRaw = loadJson(qiflowEnPath);
  const qiflowEn = normalizeKeys(qiflowEnRaw);
  const qiflowFlat = flattenKeysWithValues(qiflowEn);
  console.log(`   Found ${qiflowFlat.size} keys\n`);

  // Find TODO placeholders
  const todoKeys: string[] = [];
  currentFlat.forEach((value, key) => {
    if (typeof value === 'string' && value.startsWith('TODO:')) {
      todoKeys.push(key);
    }
  });

  if (todoKeys.length === 0) {
    console.log('✅ No TODO placeholders found!\n');
    return;
  }

  console.log(`🔍 Found ${todoKeys.length} TODO placeholders\n`);
  console.log('🔄 Replacing with actual translations...\n');

  // Replace TODO values with actual translations
  let replacedCount = 0;
  let notFoundCount = 0;

  for (const key of todoKeys) {
    if (qiflowFlat.has(key)) {
      const actualValue = qiflowFlat.get(key);
      setNestedValue(currentEn, key, actualValue);
      replacedCount++;

      if (replacedCount <= 10) {
        console.log(`   ✓ ${key}: "${actualValue}"`);
      }
    } else {
      notFoundCount++;
      if (notFoundCount <= 5) {
        console.log(`   ⚠ ${key}: translation not found in qiflow source`);
      }
    }
  }

  if (replacedCount > 10) {
    console.log(`   ... and ${replacedCount - 10} more\n`);
  } else {
    console.log('');
  }

  if (notFoundCount > 5) {
    console.log(`   ... and ${notFoundCount - 5} more not found\n`);
  } else if (notFoundCount > 0) {
    console.log('');
  }

  // Save updated en.json
  saveJson(currentEnPath, currentEn);
  console.log(`✅ Replaced ${replacedCount} TODO placeholders\n`);

  if (notFoundCount > 0) {
    console.log(
      `⚠️  ${notFoundCount} placeholders could not be found in qiflow source`
    );
    console.log('   These will need manual translation\n');
  }

  console.log('Next steps:');
  console.log('  1. Run: npm run merge:i18n (to sync all locales)');
  console.log('  2. Run: npm run validate:i18n');
  console.log('  3. Review any remaining manual translations needed\n');
}

// Run the script
main();
