/**
 * 修复 i18n 键冲突和数组问题
 *
 * 功能：
 * 1. 修复重复的键（大小写不同）
 * 2. 统一数组结构
 * 3. 确保所有语言文件结构一致
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface TranslationObject {
  [key: string]: string | string[] | TranslationObject;
}

/**
 * 读取 JSON 文件（手动解析避免大小写冲突）
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
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ 已写入: ${filename}`);
  } catch (error) {
    console.error(`❌ 写入文件失败: ${filename}`, error);
  }
}

/**
 * 修复重复键（移除 Metadata，保留 metadata）
 */
function fixDuplicateKeys(obj: TranslationObject): TranslationObject {
  const result: TranslationObject = {};
  const keysLower = new Map<string, string>();

  for (const key in obj) {
    const lowerKey = key.toLowerCase();

    if (keysLower.has(lowerKey)) {
      const existingKey = keysLower.get(lowerKey)!;
      console.log(
        `⚠️  发现重复键: "${existingKey}" 和 "${key}"，保留 "${lowerKey}"`
      );

      // 保留小写版本
      if (key === lowerKey) {
        result[key] = obj[key];
        keysLower.set(lowerKey, key);
      }
    } else {
      const value = obj[key];

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        result[key] = fixDuplicateKeys(value as TranslationObject);
      } else {
        result[key] = value;
      }

      keysLower.set(lowerKey, key);
    }
  }

  return result;
}

/**
 * 标准化数组为对象（keywords.0 -> keywords）
 */
function normalizeArrays(obj: TranslationObject): TranslationObject {
  const result: TranslationObject = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nested = value as TranslationObject;

      // 检查是否是数组形式（0, 1, 2...）
      const keys = Object.keys(nested);
      const isArrayLike = keys.every((k) => /^\d+$/.test(k));

      if (isArrayLike && keys.length > 0) {
        // 转换为数组
        const arr: string[] = [];
        keys
          .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
          .forEach((k) => {
            const val = nested[k];
            if (typeof val === 'string') {
              arr.push(val);
            }
          });
        result[key] = arr;
      } else {
        result[key] = normalizeArrays(nested);
      }
    } else if (Array.isArray(value)) {
      // 保留数组
      result[key] = value;
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始修复 i18n 问题...\n');

  const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ms-MY'];

  for (const locale of locales) {
    console.log(`📝 处理 ${locale}...`);
    console.log('─────────────────────────────────');

    const data = readJsonFile(`${locale}.json`);

    if (!data) {
      console.log('');
      continue;
    }

    // 1. 修复重复键
    let fixed = fixDuplicateKeys(data);

    // 2. 标准化数组
    fixed = normalizeArrays(fixed);

    // 3. 写入文件
    writeJsonFile(`${locale}.json`, fixed);

    console.log('');
  }

  console.log('✅ 所有问题修复完成！');
  console.log('');
  console.log('💡 下一步:');
  console.log('   运行 npm run validate:i18n 验证修复结果');
}

main().catch(console.error);
