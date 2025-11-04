import fs from 'fs';
import path from 'path';

// 剩余需要翻译的条目（手动翻译）
const remainingTranslations: Record<string, string> = {
  // Compliance.privacy.sections
  'Compliance.privacy.sections.dataCollection.title': 'Information We Collect',
  'Compliance.privacy.sections.dataCollection.content':
    'We only collect necessary personal information, including name, date/time of birth, birthplace, house orientation, etc.',
  'Compliance.privacy.sections.dataUsage.title': 'Purpose of Information Use',
  'Compliance.privacy.sections.dataUsage.content':
    'Your information is used solely for Bazi and Feng Shui analysis calculations and will not be used for other commercial purposes.',
  'Compliance.privacy.sections.dataProtection.title': 'Data Security',
  'Compliance.privacy.sections.dataProtection.content':
    'All data is encrypted using AES-256 and transmitted using HTTPS protocol.',
  'Compliance.privacy.sections.userRights.title': 'Your Rights',
  'Compliance.privacy.sections.userRights.content':
    'You have the right to view, modify, export, or delete your personal information at any time.',

  // Compliance.dsar
  'Compliance.dsar.types.access': 'View My Data',
  'Compliance.dsar.types.export': 'Export My Data',
  'Compliance.dsar.types.delete': 'Delete My Data',
  'Compliance.dsar.types.rectify': 'Modify My Data',
  'Compliance.dsar.reasonLabel': 'Reason for Request',
  'Compliance.dsar.reasonPlaceholder':
    'Please briefly describe your reason for request (optional)',
  'Compliance.dsar.submitButton': 'Submit Request',
  'Compliance.dsar.successMessage':
    'Your DSAR request has been submitted. We will process it within 30 business days.',
  'Compliance.dsar.pendingRequests': 'Pending Requests',
  'Compliance.dsar.noRequests': 'No DSAR Requests',

  // Compliance.sensitiveContent
  'Compliance.sensitiveContent.title': 'Sensitive Content Filtering',
  'Compliance.sensitiveContent.warning':
    'Sensitive keywords detected. This question may involve the following sensitive topics:',
  'Compliance.sensitiveContent.categories.politics':
    'Politically Sensitive Topics',
  'Compliance.sensitiveContent.categories.violence': 'Violence or Harm',
  'Compliance.sensitiveContent.categories.illegal': 'Illegal Activities',
  'Compliance.sensitiveContent.categories.adult': 'Adult Content',
  'Compliance.sensitiveContent.categories.discrimination':
    'Discriminatory Content',
  'Compliance.sensitiveContent.refusalMessage':
    'Sorry, we cannot answer questions involving sensitive topics. Please ask legal questions related to fortune-telling and Feng Shui.',

  // I18nTest 风水术语
  'I18nTest.good_pattern': 'Auspicious Pattern',
  'I18nTest.bad_pattern': 'Inauspicious Pattern',
  'I18nTest.wenchang_desc': 'Intelligence and Academic Fortune Direction',
  'I18nTest.caiwei_desc': 'Wealth and Career Development Direction',
  'I18nTest.items.desk_and_bookcase': 'Desk and Bookcase',
  'I18nTest.items.stationery': 'Stationery (Four Treasures of Study)',
  'I18nTest.items.study_area': 'Study and Work Area',
  'I18nTest.items.safe_and_cashier': 'Safe and Cashier Counter',
  'I18nTest.items.money_plant': 'Lucky Money Plants',
  'I18nTest.items.business_area': 'Office and Business Discussion Area',
  'I18nTest.key_points': 'Key Points',
  'I18nTest.specific_recommendations': 'Specific Recommendations',
  'I18nTest.pattern_explanation_text':
    "Xuankong Feixing patterns are the core of Feng Shui analysis. By analyzing the relationships between the Heaven, Mountain, and Facing plates, one can determine the fortune of a house and its impact on the occupants' luck, health, and wealth.",
};

function replaceRemainingTodos() {
  console.log('🔧 Translating remaining TODO placeholders...\n');

  const enFilePath = path.join(process.cwd(), 'messages', 'en.json');

  // 1. 读取 en.json
  console.log('📖 Loading en.json...');
  const enContent = fs.readFileSync(enFilePath, 'utf-8');
  const enData = JSON.parse(enContent);

  // 辅助函数：按 key 路径设置值
  function setByPath(obj: any, keyPath: string, value: string) {
    const keys = keyPath.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }

  // 辅助函数：按 key 路径获取值
  function getByPath(obj: any, keyPath: string): string | undefined {
    const keys = keyPath.split('.');
    let current = obj;
    for (const key of keys) {
      if (!current[key]) return undefined;
      current = current[key];
    }
    return current;
  }

  // 2. 统计 TODO 占位符
  let todoCount = 0;
  let replacedCount = 0;
  let notFoundCount = 0;

  function countTodos(obj: any, prefix = ''): void {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (typeof value === 'string' && value.startsWith('TODO:')) {
        todoCount++;
      } else if (typeof value === 'object' && value !== null) {
        countTodos(value, fullKey);
      }
    }
  }

  countTodos(enData);
  console.log(`   Found ${todoCount} TODO placeholders\n`);

  // 3. 替换 TODO 占位符
  console.log('🔄 Applying manual translations...\n');

  for (const [keyPath, translation] of Object.entries(remainingTranslations)) {
    const currentValue = getByPath(enData, keyPath);

    if (currentValue?.startsWith('TODO:')) {
      setByPath(enData, keyPath, translation);
      console.log(`   ✓ ${keyPath}: "${translation}"`);
      replacedCount++;
    } else if (!currentValue) {
      console.warn(`   ⚠ ${keyPath}: key not found in en.json`);
      notFoundCount++;
    } else {
      console.log(`   ℹ ${keyPath}: already translated (skipped)`);
    }
  }

  // 4. 保存更新后的 en.json
  const updatedContent = JSON.stringify(enData, null, 2) + '\n';
  fs.writeFileSync(enFilePath, updatedContent, 'utf-8');

  console.log(`\n✅ Replaced ${replacedCount} TODO placeholders`);

  // 统计剩余的 TODO
  let remainingTodoCount = 0;
  function countRemainingTodos(obj: any): void {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string' && value.startsWith('TODO:')) {
        remainingTodoCount++;
      } else if (typeof value === 'object' && value !== null) {
        countRemainingTodos(value);
      }
    }
  }

  countRemainingTodos(enData);

  if (remainingTodoCount > 0) {
    console.log(
      `\n⚠️  ${remainingTodoCount} placeholders still need manual translation`
    );
    console.log('   Please add them to the script or translate manually');
  } else {
    console.log('\n🎉 All TODO placeholders have been translated!');
  }

  console.log('\nNext steps:');
  console.log('  1. Run: npm run merge:i18n');
  console.log('  2. Run: npm run validate:i18n');
}

replaceRemainingTodos();
