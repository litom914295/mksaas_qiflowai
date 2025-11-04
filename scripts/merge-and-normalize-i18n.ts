import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import deepmerge from 'deepmerge';

/**
 * i18n Translation Merge and Key Normalization Script
 *
 * This script:
 * 1. Normalizes all keys from camelCase to PascalCase
 * 2. Merges qiflow-ai translations with qiflowai base translations
 * 3. Ensures all locales have consistent key structure
 *
 * Usage:
 *   npm run merge:i18n
 *   tsx scripts/merge-and-normalize-i18n.ts
 */

const MESSAGES_DIR = join(process.cwd(), 'messages');
const LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ms-MY'];

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to PascalCase for top-level keys
 * Examples:
 *   metadata -> Metadata
 *   common -> Common
 *   testPages -> TestPages
 */
function normalizeTopLevelKey(key: string): string {
  // Handle special cases with consecutive capitals
  return capitalize(key);
}

/**
 * Recursively normalize all keys in an object to PascalCase (top-level only)
 * Nested keys remain unchanged
 */
function normalizeKeys(obj: any, isTopLevel = true): any {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const normalized: any = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    // Only normalize top-level keys to PascalCase
    const newKey = isTopLevel ? normalizeTopLevelKey(key) : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively process nested objects, but don't normalize nested keys
      normalized[newKey] = normalizeKeys(value, false);
    } else {
      normalized[newKey] = value;
    }
  }

  return normalized;
}

/**
 * Sort object keys alphabetically (top-level only)
 */
function sortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const sorted: any = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Keep nested objects as-is (don't sort nested keys)
      sorted[key] = value;
    } else {
      sorted[key] = value;
    }
  }

  return sorted;
}

/**
 * Load and parse a locale JSON file
 */
function loadMessages(locale: string): any {
  const path = join(MESSAGES_DIR, `${locale}.json`);
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.warn(`⚠️  Failed to load ${locale}.json, returning empty object`);
    return {};
  }
}

/**
 * Save messages to a locale JSON file
 */
function saveMessages(locale: string, messages: any): void {
  const path = join(MESSAGES_DIR, `${locale}.json`);
  const content = JSON.stringify(messages, null, 2) + '\n';
  writeFileSync(path, content, 'utf-8');
}

/**
 * Main merge and normalization logic
 */
function main() {
  console.log('🔧 Merging and normalizing i18n translations...\n');

  // Load base locale (qiflowai en.json)
  console.log('📖 Loading base locale (en)...');
  const baseMessages = loadMessages('en');
  console.log(`   Found ${Object.keys(baseMessages).length} top-level keys\n`);

  // Process each locale
  for (const locale of LOCALES) {
    console.log(`🌐 Processing ${locale}...`);

    // Load locale messages
    const localeMessages = loadMessages(locale);

    // Normalize keys to PascalCase
    const normalized = normalizeKeys(localeMessages);
    console.log('   ✓ Normalized keys to PascalCase');

    // For base locale (en), just normalize and save
    if (locale === 'en') {
      const sorted = sortKeys(normalized);
      saveMessages(locale, sorted);
      console.log('   ✓ Saved normalized en.json\n');
      continue;
    }

    // For other locales, merge with base to ensure consistent structure
    // But preserve locale-specific translations
    const merged = deepmerge(baseMessages, normalized, {
      // Array merge: replace instead of concatenate
      arrayMerge: (destinationArray, sourceArray) => sourceArray,
    });

    const sorted = sortKeys(merged);
    saveMessages(locale, sorted);
    console.log(`   ✓ Merged with base and saved ${locale}.json\n`);
  }

  console.log('✅ All translations merged and normalized successfully!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run validate:i18n');
  console.log('  2. Review the merged files in messages/');
  console.log('  3. Fill in any missing translations if needed\n');
}

// Run the script
main();
