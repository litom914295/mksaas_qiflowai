import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * i18n Translation Validation Script
 *
 * Validates that all supported locales have complete translations
 * by comparing against the base locale (English).
 *
 * Usage:
 *   npm run validate:i18n
 *   tsx scripts/validate-i18n.ts
 *
 * Exit codes:
 *   0: All translations are valid
 *   1: Missing or extra keys found
 */

const LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ms-MY'];
const MESSAGES_DIR = join(process.cwd(), 'messages');
const BASE_LOCALE = 'en';

/**
 * Recursively flatten nested JSON keys into dot-notation paths
 *
 * @example
 * flattenKeys({ a: { b: 'value', c: 'value2' } })
 * // Returns: ['a.b', 'a.c']
 */
function flattenKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      keys = keys.concat(flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Load and parse a locale JSON file
 */
function loadLocaleMessages(locale: string): any {
  const localePath = join(MESSAGES_DIR, `${locale}.json`);

  if (!existsSync(localePath)) {
    throw new Error(`Locale file not found: ${localePath}`);
  }

  const content = readFileSync(localePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Main validation logic
 */
function main() {
  console.log('🌐 Validating i18n translations...\n');
  console.log(`Base locale: ${BASE_LOCALE}`);
  console.log(`Supported locales: ${LOCALES.join(', ')}\n`);

  // Load base locale
  let baseMessages: any;
  try {
    baseMessages = loadLocaleMessages(BASE_LOCALE);
  } catch (err) {
    console.error(`❌ Failed to load base locale (${BASE_LOCALE}):`, err);
    process.exit(1);
  }

  const baseKeys = new Set(flattenKeys(baseMessages));
  console.log(`✓ Base locale (${BASE_LOCALE}): ${baseKeys.size} keys\n`);

  let hasErrors = false;
  const results: Array<{
    locale: string;
    status: 'ok' | 'error' | 'missing';
    keyCount: number;
    missing: string[];
    extra: string[];
  }> = [];

  // Validate each locale
  for (const locale of LOCALES) {
    if (locale === BASE_LOCALE) {
      results.push({
        locale,
        status: 'ok',
        keyCount: baseKeys.size,
        missing: [],
        extra: [],
      });
      continue;
    }

    try {
      const messages = loadLocaleMessages(locale);
      const keys = new Set(flattenKeys(messages));

      const missing = Array.from(baseKeys).filter((k) => !keys.has(k));
      const extra = Array.from(keys).filter((k) => !baseKeys.has(k));

      if (missing.length > 0 || extra.length > 0) {
        results.push({
          locale,
          status: 'error',
          keyCount: keys.size,
          missing,
          extra,
        });
        hasErrors = true;
      } else {
        results.push({
          locale,
          status: 'ok',
          keyCount: keys.size,
          missing: [],
          extra: [],
        });
      }
    } catch (err) {
      results.push({
        locale,
        status: 'missing',
        keyCount: 0,
        missing: [],
        extra: [],
      });
      hasErrors = true;
    }
  }

  // Print results
  console.log('Results:\n');
  for (const result of results) {
    const { locale, status, keyCount, missing, extra } = result;

    if (status === 'ok') {
      console.log(`✓ ${locale.padEnd(8)} ${keyCount} keys (complete)`);
    } else if (status === 'missing') {
      console.log(`✗ ${locale.padEnd(8)} File not found`);
    } else {
      console.log(`✗ ${locale.padEnd(8)} ${keyCount} keys`);

      if (missing.length > 0) {
        console.log(`  ├─ Missing ${missing.length} key(s):`);
        const displayCount = Math.min(missing.length, 5);
        for (let i = 0; i < displayCount; i++) {
          console.log(`  │  • ${missing[i]}`);
        }
        if (missing.length > displayCount) {
          console.log(`  │  ... and ${missing.length - displayCount} more`);
        }
      }

      if (extra.length > 0) {
        console.log(`  └─ Extra ${extra.length} key(s) (not in base):`);
        const displayCount = Math.min(extra.length, 5);
        for (let i = 0; i < displayCount; i++) {
          console.log(`     • ${extra[i]}`);
        }
        if (extra.length > displayCount) {
          console.log(`     ... and ${extra.length - displayCount} more`);
        }
      }

      console.log('');
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(50));
  if (hasErrors) {
    console.log('❌ Translation validation FAILED');
    console.log('\nPlease fix the missing or extra keys in the locale files.');
    console.log('Tip: Use the base locale as a reference and ensure all');
    console.log('     translations have the same key structure.\n');
    process.exit(1);
  } else {
    console.log('✅ All translations validated successfully!\n');
    process.exit(0);
  }
}

// Run the validation
main();
