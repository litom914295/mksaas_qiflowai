/**
 * i18n 合并和优化脚本
 * 
 * 功能：
 * 1. 合并 en.json 和 en-qiflow.json 到统一的 en.json
 * 2. 合并 zh.json、zh-CN.json、qiflow-zh.json 到 zh-CN.json
 * 3. 删除冗余文件
 * 4. 验证所有语言文件的键值完整性
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

/**
 * 深度合并两个对象
 */
function deepMerge(target: TranslationObject, source: TranslationObject): TranslationObject {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      if (typeof source[key] === 'object' && typeof target[key] === 'object') {
        output[key] = deepMerge(
          target[key] as TranslationObject,
          source[key] as TranslationObject
        );
      } else {
        // 如果源值不是对象或目标值不是对象，直接覆盖
        output[key] = source[key];
      }
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
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
    // 移除 BOM 标记
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
 * 删除文件
 */
function deleteFile(filename: string): void {
  const filePath = path.join(MESSAGES_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️  已删除: ${filename}`);
    } catch (error) {
      console.error(`❌ 删除文件失败: ${filename}`, error);
    }
  }
}

/**
 * 统计翻译键数量
 */
function countKeys(obj: TranslationObject, prefix = ''): number {
  let count = 0;
  
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      count += countKeys(value as TranslationObject, `${prefix}${key}.`);
    } else {
      count++;
    }
  }
  
  return count;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始优化 i18n 翻译文件...\n');
  
  // ========== 1. 合并英文翻译 ==========
  console.log('📝 步骤 1: 合并英文翻译文件');
  console.log('─────────────────────────────────');
  
  const enMain = readJsonFile('en.json');
  const enQiflow = readJsonFile('en-qiflow.json');
  
  if (enMain && enQiflow) {
    const mergedEn = deepMerge(enMain, enQiflow);
    const keysCount = countKeys(mergedEn);
    
    writeJsonFile('en.json', mergedEn);
    console.log(`📊 英文翻译键总数: ${keysCount}`);
    
    // 删除冗余文件
    deleteFile('en-qiflow.json');
  }
  
  console.log('');
  
  // ========== 2. 合并简体中文翻译 ==========
  console.log('📝 步骤 2: 合并简体中文翻译文件');
  console.log('─────────────────────────────────');
  
  const zhMain = readJsonFile('zh.json');
  const zhCN = readJsonFile('zh-CN.json');
  const zhQiflow = readJsonFile('qiflow-zh.json');
  
  if (zhMain || zhCN || zhQiflow) {
    let mergedZhCN: TranslationObject = {};
    
    // 按优先级合并：qiflow-zh (QiFlow特有) < zh-CN (已有简体) < zh (通用)
    if (zhQiflow) {
      mergedZhCN = deepMerge(mergedZhCN, zhQiflow);
    }
    if (zhCN) {
      mergedZhCN = deepMerge(mergedZhCN, zhCN);
    }
    if (zhMain) {
      mergedZhCN = deepMerge(mergedZhCN, zhMain);
    }
    
    const keysCount = countKeys(mergedZhCN);
    
    writeJsonFile('zh-CN.json', mergedZhCN);
    console.log(`📊 简体中文翻译键总数: ${keysCount}`);
    
    // 删除冗余文件
    deleteFile('zh.json');
    deleteFile('qiflow-zh.json');
  }
  
  console.log('');
  
  // ========== 3. 检查其他语言文件 ==========
  console.log('📝 步骤 3: 检查其他语言文件');
  console.log('─────────────────────────────────');
  
  const otherLocales = ['zh-TW', 'ja', 'ko', 'ms-MY'];
  
  for (const locale of otherLocales) {
    const filename = `${locale}.json`;
    const data = readJsonFile(filename);
    
    if (data) {
      const keysCount = countKeys(data);
      console.log(`✅ ${locale}: ${keysCount} 个键`);
    } else {
      console.log(`⚠️  ${locale}: 文件不存在或读取失败`);
    }
  }
  
  console.log('');
  
  // ========== 4. 最终报告 ==========
  console.log('📊 最终语言文件列表');
  console.log('─────────────────────────────────');
  
  const files = fs.readdirSync(MESSAGES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();
  
  for (const file of files) {
    const data = readJsonFile(file);
    if (data) {
      const keysCount = countKeys(data);
      console.log(`  ${file.padEnd(20)} → ${keysCount} 个键`);
    }
  }
  
  console.log('');
  console.log('✅ i18n 优化完成！');
  console.log('');
  console.log('💡 后续步骤:');
  console.log('   1. 运行 npm run validate:i18n 检查键值完整性');
  console.log('   2. 测试所有语言的显示效果');
  console.log('   3. 补充缺失的翻译内容');
}

main().catch(console.error);
