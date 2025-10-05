import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Sync extra keys from other locales to English base
 *
 * This script finds keys that exist in other locales but not in en.json,
 * extracts them from the most complete locale, and adds them to en.json
 *
 * Usage:
 *   npm run sync:extra-keys
 *   tsx scripts/sync-extra-keys-to-en.ts
 */

const MESSAGES_DIR = join(process.cwd(), 'messages');
const LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ms-MY'];

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
function loadJson(locale: string): any {
  const path = join(MESSAGES_DIR, `${locale}.json`);
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save JSON file
 */
function saveJson(locale: string, data: any): void {
  const path = join(MESSAGES_DIR, `${locale}.json`);
  const content = JSON.stringify(data, null, 2) + '\n';
  writeFileSync(path, content, 'utf-8');
}

/**
 * Main sync logic
 */
function main() {
  console.log('🔄 Syncing extra keys to English base...\\n');

  // Load all locales
  console.log('📖 Loading all locales...');
  const localesData = new Map<string, Map<string, any>>();

  for (const locale of LOCALES) {
    const data = loadJson(locale);
    const flattened = flattenKeysWithValues(data);
    localesData.set(locale, flattened);
    console.log(`   ${locale}: ${flattened.size} keys`);
  }
  console.log('');

  // Find all unique keys across all locales
  const allKeys = new Set<string>();
  localesData.forEach((keys) => {
    keys.forEach((_, key) => allKeys.add(key));
  });

  console.log(`📊 Total unique keys across all locales: ${allKeys.size}\\n`);

  // Find keys missing from English
  const enKeys = localesData.get('en')!;
  const missingFromEn: string[] = [];

  allKeys.forEach((key) => {
    if (!enKeys.has(key)) {
      missingFromEn.push(key);
    }
  });

  if (missingFromEn.length === 0) {
    console.log('✅ No missing keys! English base is complete.\\n');
    return;
  }

  console.log(`🔍 Found ${missingFromEn.length} keys missing from English:\\n`);

  // Load English messages object
  const enMessages = loadJson('en');

  // Add missing keys from the locale that has them
  let addedCount = 0;
  for (const key of missingFromEn) {
    // Find which locale has this key and extract value
    let valueToAdd: any = `TODO: translate ${key}`;

    // Try to find an English-like value from another locale
    // Prefer zh-CN as it usually has complete translations
    const zhCnKeys = localesData.get('zh-CN')!;
    if (zhCnKeys.has(key)) {
      const zhValue = zhCnKeys.get(key);
      valueToAdd = typeof zhValue === 'string' ? `TODO: ${zhValue}` : zhValue;
    }

    setNestedValue(enMessages, key, valueToAdd);
    addedCount++;

    if (addedCount <= 10) {
      console.log(`   + ${key}`);
    }
  }

  if (addedCount > 10) {
    console.log(`   ... and ${addedCount - 10} more\\n`);
  } else {
    console.log('');
  }

  // Save updated English messages
  saveJson('en', enMessages);
  console.log(`✅ Added ${addedCount} keys to English base\\n`);

  console.log('⚠️  NOTE: New keys have TODO placeholders');
  console.log('   Please replace them with proper English translations\\n');

  console.log('Next steps:');
  console.log('  1. Review messages/en.json for "TODO:" values');
  console.log('  2. Run: npm run merge:i18n');
  console.log('  3. Run: npm run validate:i18n\\n');
}

// Run the script
main();
