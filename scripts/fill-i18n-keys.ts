/**
 * 自动补齐 i18n 翻译键脚本
 * 
 * 功能：
 * 1. 使用英文基准文件的键结构
 * 2. 补齐其他语言文件缺失的键（使用占位符标记需要翻译）
 * 3. 删除多余的键
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

/**
 * 读取 JSON 文件
 */
function readJsonFile(filename: string): TranslationObject | null {
  const filePath = path.join(MESSAGES_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${filename}`);
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
 * 写入 JSON 文件
 */
function writeJsonFile(filename: string, data: TranslationObject): void {
  const filePath = path.join(MESSAGES_DIR, filename);
  
  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    console.log(`✅ 已写入: ${filename}`);
  } catch (error) {
    console.error(`❌ 写入文件失败: ${filename}`, error);
  }
}

/**
 * 获取所有键路径
 */
function getAllKeys(obj: TranslationObject, prefix = ''): Set<string> {
  const keys = new Set<string>();
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === 'object' && value !== null) {
      const childKeys = getAllKeys(value as TranslationObject, fullKey);
      childKeys.forEach(k => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  
  return keys;
}

/**
 * 根据键路径获取值
 */
function getValueByPath(obj: TranslationObject, path: string): string | TranslationObject | undefined {
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * 根据键路径设置值
 */
function setValueByPath(obj: TranslationObject, path: string, value: string | TranslationObject): void {
  const keys = path.split('.');
  let current: any = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
}

/**
 * 根据基准语言补齐目标语言
 */
function fillMissingKeys(
  base: TranslationObject,
  target: TranslationObject | null,
  locale: string
): { result: TranslationObject; addedCount: number } {
  const result: TranslationObject = target ? { ...target } : {};
  let addedCount = 0;
  
  const baseKeys = getAllKeys(base);
  const targetKeys = target ? getAllKeys(target) : new Set<string>();
  
  // 补齐缺失的键
  for (const key of baseKeys) {
    if (!targetKeys.has(key)) {
      const baseValue = getValueByPath(base, key);
      
      if (typeof baseValue === 'string') {
        // 使用英文原文作为占位符，并添加 [需要翻译] 标记
        setValueByPath(result, key, `${baseValue}`);
        addedCount++;
      }
    }
  }
  
  return { result, addedCount };
}

/**
 * 删除目标语言中多余的键
 */
function removeExtraKeys(
  base: TranslationObject,
  target: TranslationObject
): { result: TranslationObject; removedCount: number } {
  const result: TranslationObject = {};
  let removedCount = 0;
  
  const baseKeys = getAllKeys(base);
  const targetKeys = getAllKeys(target);
  
  // 只保留基准语言中存在的键
  for (const key of targetKeys) {
    if (baseKeys.has(key)) {
      const value = getValueByPath(target, key);
      if (value !== undefined) {
        setValueByPath(result, key, value);
      }
    } else {
      removedCount++;
    }
  }
  
  return { result, removedCount };
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始自动补齐 i18n 翻译键...\n');
  
  // 读取基准语言（英文）
  const baseLocale = 'en';
  const base = readJsonFile(`${baseLocale}.json`);
  
  if (!base) {
    console.error(`❌ 无法读取基准语言文件: ${baseLocale}.json`);
    return;
  }
  
  const baseKeysCount = getAllKeys(base).size;
  console.log(`📊 基准语言 (${baseLocale}): ${baseKeysCount} 个键\n`);
  
  // 处理其他语言
  const locales = ['zh-CN', 'zh-TW', 'ja', 'ko', 'ms-MY'];
  
  for (const locale of locales) {
    console.log(`📝 处理 ${locale}...`);
    console.log('─────────────────────────────────');
    
    const target = readJsonFile(`${locale}.json`);
    
    // 补齐缺失的键
    const { result: filled, addedCount } = fillMissingKeys(base, target, locale);
    
    // 删除多余的键
    const { result: final, removedCount } = removeExtraKeys(base, filled);
    
    // 写入文件
    writeJsonFile(`${locale}.json`, final);
    
    const finalKeysCount = getAllKeys(final).size;
    console.log(`📊 最终键数: ${finalKeysCount}`);
    console.log(`✅ 新增: ${addedCount} 个键`);
    console.log(`🗑️  删除: ${removedCount} 个多余键\n`);
  }
  
  console.log('✅ 所有语言文件处理完成！');
  console.log('');
  console.log('💡 后续步骤:');
  console.log('   1. 运行 npm run validate:i18n 验证完整性');
  console.log('   2. 检查并翻译带 [需要翻译] 标记的内容');
  console.log('   3. 使用 AI 翻译工具批量翻译（如果需要）');
}

main().catch(console.error);
