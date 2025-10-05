import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Sync Base Locale from Other Locales Script
 *
 * This script extracts keys that exist in other locales but are missing
 * from the base locale (en.json), and adds them to en.json with
 * placeholder values (copied from zh-CN as reference).
 *
 * Usage:
 *   npm run sync:i18n-base
 *   tsx scripts/sync-base-from-locales.ts
 */

const MESSAGES_DIR = join(process.cwd(), 'messages');
const BASE_LOCALE = 'en';
const REFERENCE_LOCALE = 'zh-CN'; // Use zh-CN as reference for new keys

/**
 * Recursively flatten nested object keys into dot-notation paths with values
 */
function flattenKeysWithValues(obj: any, prefix = ''): Map<string, any> {
  const result = new Map<string, any>();

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      const nested = flattenKeysWithValues(value, fullKey);
      nested.forEach((v, k) => result.set(k, v));
    } else {
      result.set(fullKey, value);
    }
  }

  return result;
}

/**
 * Recursively set a value in a nested object using dot-notation path
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
 * Load and parse a locale JSON file
 */
function loadMessages(locale: string): any {
  const path = join(MESSAGES_DIR, `${locale}.json`);
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
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
 * Translate Chinese text to English placeholder
 * (Simple heuristic - in production, use proper translation service)
 */
function translateToEnglishPlaceholder(chineseText: string): string {
  // For now, just prefix with [TODO: translate]
  // In production, you would use a translation API or keep original
  if (typeof chineseText !== 'string') {
    return chineseText;
  }

  // Keep it simple for now - just return a TODO marker
  return `TODO: ${chineseText}`;
}

/**
 * Main synchronization logic
 */
function main() {
  console.log(
    '🔄 Syncing base locale (en) with missing keys from other locales...\n'
  );

  // Load base locale
  console.log(`📖 Loading base locale (${BASE_LOCALE})...`);
  const baseMessages = loadMessages(BASE_LOCALE);
  const baseKeys = flattenKeysWithValues(baseMessages);
  console.log(`   Found ${baseKeys.size} keys in ${BASE_LOCALE}.json\n`);

  // Load reference locale for new key values
  console.log(`📖 Loading reference locale (${REFERENCE_LOCALE})...`);
  const referenceMessages = loadMessages(REFERENCE_LOCALE);
  const referenceKeys = flattenKeysWithValues(referenceMessages);
  console.log(
    `   Found ${referenceKeys.size} keys in ${REFERENCE_LOCALE}.json\n`
  );

  // Find missing keys
  const missingKeys: string[] = [];
  referenceKeys.forEach((value, key) => {
    if (!baseKeys.has(key)) {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length === 0) {
    console.log('✅ No missing keys found! Base locale is complete.\n');
    return;
  }

  console.log(
    `🔍 Found ${missingKeys.length} missing keys in ${BASE_LOCALE}.json\n`
  );
  console.log('📝 Adding missing keys with placeholder values...\n');

  // Add missing keys to base messages
  let addedCount = 0;
  for (const key of missingKeys) {
    const referenceValue = referenceKeys.get(key);

    // Create English placeholder
    let englishValue: any;
    if (typeof referenceValue === 'string') {
      englishValue = translateToEnglishPlaceholder(referenceValue);
    } else {
      englishValue = referenceValue;
    }

    setNestedValue(baseMessages, key, englishValue);
    addedCount++;

    if (addedCount <= 10) {
      console.log(`   + ${key}: "${englishValue}"`);
    }
  }

  if (addedCount > 10) {
    console.log(`   ... and ${addedCount - 10} more\n`);
  } else {
    console.log('');
  }

  // Save updated base messages
  saveMessages(BASE_LOCALE, baseMessages);
  console.log(`✅ Added ${addedCount} missing keys to ${BASE_LOCALE}.json\n`);

  console.log('⚠️  IMPORTANT:');
  console.log('   The new keys have placeholder values prefixed with "TODO:"');
  console.log(
    '   Please review and translate them properly before production.\n'
  );

  console.log('Next steps:');
  console.log('  1. Review messages/en.json for "TODO:" placeholders');
  console.log('  2. Replace placeholders with proper English translations');
  console.log('  3. Run: npm run validate:i18n');
  console.log('  4. If validation passes, all locales are in sync!\n');
}

// Run the script
main();
