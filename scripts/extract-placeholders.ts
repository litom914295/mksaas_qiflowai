/**
 * 提取需要翻译的英文占位符
 * 
 * 功能：
 * 1. 识别每种语言文件中的英文占位符
 * 2. 导出为 JSON 格式，方便批量翻译
 * 3. 生成翻译进度报告
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const OUTPUT_DIR = path.join(process.cwd(), '.taskmaster', 'i18n-translations');

interface TranslationObject {
  [key: string]: string | string[] | TranslationObject;
}

interface PlaceholderItem {
  key: string;
  value: string;
  context?: string;
}

/**
 * 读取 JSON 文件
 */
function readJsonFile(filename: string): TranslationObject | null {
  const filePath = path.join(MESSAGES_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const cleanContent = content.replace(/^\uFEFF/, '');
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error(`❌ 读取文件失败: ${filename}`, error);
    return null;
  }
}

/**
 * 检查字符串是否主要是英文
 */
function isEnglish(text: string): boolean {
  // 移除标点和空格
  const cleaned = text.replace(/[^\p{L}\p{N}]/gu, '');
  if (cleaned.length === 0) return false;
  
  // 检查是否包含大量英文字母
  const englishChars = cleaned.match(/[a-zA-Z]/g);
  if (!englishChars) return false;
  
  // 如果英文字母占比超过 50%，认为是英文
  return englishChars.length / cleaned.length > 0.5;
}

/**
 * 递归提取需要翻译的占位符
 */
function extractPlaceholders(
  obj: TranslationObject,
  prefix = ''
): PlaceholderItem[] {
  const placeholders: PlaceholderItem[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (Array.isArray(value)) {
      // 处理数组
      value.forEach((item, index) => {
        if (typeof item === 'string' && isEnglish(item)) {
          placeholders.push({
            key: `${fullKey}[${index}]`,
            value: item,
            context: `Array item ${index + 1} of ${value.length}`
          });
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      // 递归处理对象
      placeholders.push(...extractPlaceholders(value as TranslationObject, fullKey));
    } else if (typeof value === 'string' && isEnglish(value)) {
      // 字符串类型且是英文
      placeholders.push({
        key: fullKey,
        value: value
      });
    }
  }
  
  return placeholders;
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始提取需要翻译的占位符...\n');
  
  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const locales = [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'zh-TW', name: '繁体中文' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'ms-MY', name: '马来语' }
  ];
  
  const results: { [key: string]: number } = {};
  
  for (const locale of locales) {
    console.log(`📝 分析 ${locale.name} (${locale.code})...`);
    console.log('─────────────────────────────────');
    
    const data = readJsonFile(`${locale.code}.json`);
    
    if (!data) {
      console.log(`⚠️  文件不存在，跳过\n`);
      continue;
    }
    
    const placeholders = extractPlaceholders(data);
    results[locale.code] = placeholders.length;
    
    // 导出为 JSON
    const outputFile = path.join(OUTPUT_DIR, `to-translate-${locale.code}.json`);
    fs.writeFileSync(
      outputFile,
      JSON.stringify(placeholders, null, 2),
      'utf-8'
    );
    
    console.log(`✅ 找到 ${placeholders.length} 个需要翻译的项`);
    console.log(`📄 已导出到: ${outputFile.replace(process.cwd(), '.')}\n`);
  }
  
  // 生成总结报告
  console.log('📊 翻译进度总结');
  console.log('─────────────────────────────────');
  
  let total = 0;
  for (const locale of locales) {
    const count = results[locale.code] || 0;
    total += count;
    console.log(`  ${locale.name.padEnd(12)} → ${count.toString().padStart(4)} 个待翻译项`);
  }
  
  console.log(`  ${'总计'.padEnd(12)} → ${total.toString().padStart(4)} 个待翻译项`);
  console.log('');
  
  // 生成使用说明
  console.log('💡 后续步骤:');
  console.log('   1. 查看 .taskmaster/i18n-translations/ 目录下的 JSON 文件');
  console.log('   2. 使用 AI 翻译工具批量翻译（推荐）');
  console.log('   3. 或运行 npm run translate:apply 应用翻译结果');
  console.log('');
  console.log('💡 提示:');
  console.log('   - 可以使用 ChatGPT/Claude 批量翻译这些 JSON 文件');
  console.log('   - 保持 JSON 格式不变，只翻译 "value" 字段');
  console.log('   - 翻译完成后将文件重命名为 translated-{locale}.json');
}

main().catch(console.error);
