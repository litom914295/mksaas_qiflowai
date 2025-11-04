import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Manually translate TODO placeholders based on Chinese and context
 * This script provides reasonable English translations for missing keys
 */

const MESSAGES_DIR = join(process.cwd(), 'messages');

// Manual translations based on zh-CN context
const MANUAL_TRANSLATIONS: Record<string, string> = {
  // Bazi gender (already exists in zh-CN.json under Bazi.gender)
  'Bazi.male': 'Male',
  'Bazi.female': 'Female',

  // Compass - from Compass_legacy in zh-CN.json
  'Compass.measuring': 'Measuring...',
  'Compass.calibrate_device': 'Calibrate Device',
  'Compass.calibration_instructions':
    'Please follow the instructions to calibrate your device',
  'Compass.magnetic_declination': 'Magnetic Declination',
  'Compass.true_north': 'True North',
  'Compass.magnetic_north': 'Magnetic North',
  'Compass.direction': 'Direction',
  'Compass.degree': 'Degree',
  'Compass.measurement_history': 'Measurement History',
  'Compass.save_measurement': 'Save Measurement',
  'Compass.clear_history': 'Clear History',
  'Compass.device_not_supported': 'Device does not support compass function',
  'Compass.permission_required': 'Sensor permission required',
  'Compass.interference_detected': 'Magnetic interference detected',
  'Compass.move_away_from_metal': 'Please move away from metal objects',
  'Compass.measurement_saved': 'Measurement saved',
  'Compass.high_accuracy': 'High Accuracy',
  'Compass.medium_accuracy': 'Medium Accuracy',
  'Compass.low_accuracy': 'Low Accuracy',

  // Compliance - from zh-CN.json
  'Compliance.ageVerification.title': '18+ Age Verification',
  'Compliance.ageVerification.description':
    'This platform is only for users aged 18 and above. Please confirm you are 18 or older:',
  'Compliance.ageVerification.reason1':
    'Important life decisions require mature judgment',
  'Compliance.ageVerification.reason2':
    'Personal destiny analysis involves privacy information',
  'Compliance.ageVerification.reason3':
    'Comply with relevant laws and regulations',
  'Compliance.ageVerification.confirmPrompt':
    'By clicking "Confirm", you certify that you are 18 years or older and agree to use this platform.',
  'Compliance.ageVerification.confirmButton': 'Confirm, I am 18+',
  'Compliance.ageVerification.rejectButton': 'No, I am under 18',
  'Compliance.ageVerification.underageMessage':
    'Sorry, this platform is only for users aged 18 and above.',

  'Compliance.disclaimer.title': 'Disclaimer',
  'Compliance.disclaimer.content':
    'The Bazi analysis, Feng Shui analysis and other services provided by this platform are based on traditional metaphysics theory and AI algorithms, for reference and entertainment purposes only.',
  'Compliance.disclaimer.acceptButton': 'I have read and understand',

  'Compliance.privacy.title': 'Privacy Policy',
  'Compliance.privacy.lastUpdated': 'Last Updated: 2025-01-03',

  'Compliance.dsar.title': 'Data Subject Access Request (DSAR)',
  'Compliance.dsar.description':
    'According to relevant laws and regulations, you have the right to request to view, modify, export or delete your personal data.',
  'Compliance.dsar.requestType': 'Request Type',

  // Dashboard
  'Dashboard.title': 'Dashboard',
  'Dashboard.welcome': 'Welcome back',
  'Dashboard.recentAnalyses': 'Recent Analyses',
  'Dashboard.quickActions': 'Quick Actions',

  // Fengshui
  'Fengshui.title': 'Feng Shui Analysis',
  'Fengshui.xuankong': 'Flying Star Feng Shui',
  'Fengshui.analysis': 'Analysis',
  'Fengshui.recommendations': 'Recommendations',

  // Home
  'Home.hero.title': 'AI Feng Shui · Deep Insights',
  'Home.hero.subtitle': 'Combine traditional wisdom with modern AI technology',

  // Navigation
  'Navigation.analysis': 'Analysis',
  'Navigation.compass': 'Compass',
  'Navigation.reports': 'Reports',
  'Navigation.settings': 'Settings',

  // Payment
  'Payment.title': 'Payment',
  'Payment.selectPlan': 'Select Plan',
  'Payment.billing': 'Billing Information',
  'Payment.insufficientCredits': 'Insufficient Credits',
  'Payment.recharge': 'Recharge',

  // PDF Export
  'PdfExport.title': 'Export to PDF',
  'PdfExport.generating': 'Generating PDF...',
  'PdfExport.download': 'Download PDF',
  'PdfExport.reportTitle': 'Analysis Report',

  // Profile
  'Profile.title': 'Profile',
  'Profile.editProfile': 'Edit Profile',
  'Profile.personalInfo': 'Personal Information',

  // Reports
  'Reports.title': 'Reports',
  'Reports.myReports': 'My Reports',
  'Reports.viewReport': 'View Report',

  // Settings
  'Settings.title': 'Settings',
  'Settings.language': 'Language',
  'Settings.theme': 'Theme',
  'Settings.notifications': 'Notifications',
};

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
 * Flatten keys to dot notation
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
 * Main translation logic
 */
function main() {
  console.log('🔧 Translating TODO placeholders with manual translations...\n');

  // Load current en.json
  console.log('📖 Loading en.json...');
  const enPath = join(MESSAGES_DIR, 'en.json');
  const enMessages = loadJson(enPath);
  const enFlat = flattenKeysWithValues(enMessages);
  console.log(`   Found ${enFlat.size} keys\n`);

  // Find TODO placeholders
  const todoKeys: string[] = [];
  enFlat.forEach((value, key) => {
    if (typeof value === 'string' && value.startsWith('TODO:')) {
      todoKeys.push(key);
    }
  });

  if (todoKeys.length === 0) {
    console.log('✅ No TODO placeholders found!\n');
    return;
  }

  console.log(`🔍 Found ${todoKeys.length} TODO placeholders\n`);
  console.log('🔄 Applying manual translations...\n');

  // Replace TODO values with manual translations
  let replacedCount = 0;
  let notFoundCount = 0;

  for (const key of todoKeys) {
    if (MANUAL_TRANSLATIONS[key]) {
      const translation = MANUAL_TRANSLATIONS[key];
      setNestedValue(enMessages, key, translation);
      replacedCount++;

      if (replacedCount <= 15) {
        console.log(`   ✓ ${key}: "${translation}"`);
      }
    } else {
      notFoundCount++;
      if (notFoundCount <= 5) {
        console.log(`   ⚠ ${key}: no manual translation available`);
      }
    }
  }

  if (replacedCount > 15) {
    console.log(`   ... and ${replacedCount - 15} more\n`);
  } else {
    console.log('');
  }

  if (notFoundCount > 5) {
    console.log(`   ... and ${notFoundCount - 5} more without translation\n`);
  } else if (notFoundCount > 0) {
    console.log('');
  }

  // Save updated en.json
  saveJson(enPath, enMessages);
  console.log(`✅ Replaced ${replacedCount} TODO placeholders\n`);

  if (notFoundCount > 0) {
    console.log(
      `⚠️  ${notFoundCount} placeholders still need manual translation`
    );
    console.log('   Please add them to the script or translate manually\n');
  }

  console.log('Next steps:');
  console.log('  1. Run: npm run merge:i18n');
  console.log('  2. Run: npm run validate:i18n\n');
}

// Run the script
main();
