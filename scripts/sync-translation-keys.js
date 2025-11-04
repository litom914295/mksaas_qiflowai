/**
 * 翻译键同步脚本
 * 确保所有语言文件都包含相同的键结构
 * 使用 zh-CN 作为主参考文件，补全其他语言缺失的键
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  messagesDir: path.join(__dirname, '..', 'messages'),
  locales: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'],
  referenceLocale: 'zh-CN', // 使用中文简体作为参考
  backupSuffix: '.sync-backup',
};

/**
 * 深度获取对象所有键路径
 */
function getAllKeyPaths(obj, prefix = '') {
  const paths = [];

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      paths.push(fullPath);
      paths.push(...getAllKeyPaths(obj[key], fullPath));
    } else {
      paths.push(fullPath);
    }
  }

  return paths;
}

/**
 * 根据键路径获取值
 */
function getValueByPath(obj, path) {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * 根据键路径设置值
 */
function setValueByPath(obj, path, value) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * 深度合并，保留目标对象中已存在的值
 */
function deepMergeKeys(target, source) {
  const result = JSON.parse(JSON.stringify(target)); // 深拷贝

  function merge(targetObj, sourceObj, currentPath = '') {
    for (const key in sourceObj) {
      if (!sourceObj.hasOwnProperty(key)) continue;

      const fullPath = currentPath ? `${currentPath}.${key}` : key;

      if (
        typeof sourceObj[key] === 'object' &&
        sourceObj[key] !== null &&
        !Array.isArray(sourceObj[key])
      ) {
        // 对象类型，递归合并
        if (!(key in targetObj) || typeof targetObj[key] !== 'object') {
          targetObj[key] = {};
        }
        merge(targetObj[key], sourceObj[key], fullPath);
      } else {
        // 叶子节点，只在目标对象中不存在时才添加
        if (!(key in targetObj)) {
          targetObj[key] = sourceObj[key];
          console.log(`  ➕ 添加键: ${fullPath}`);
        }
      }
    }
  }

  merge(result, source);
  return result;
}

/**
 * 读取JSON文件
 */
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ 读取文件失败: ${filePath}`);
    console.error(`   错误: ${error.message}`);
    return null;
  }
}

/**
 * 写入JSON文件
 */
function writeJsonFile(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`❌ 写入文件失败: ${filePath}`);
    console.error(`   错误: ${error.message}`);
    return false;
  }
}

/**
 * 创建备份
 */
function createBackup(filePath) {
  try {
    const backupPath = filePath + CONFIG.backupSuffix;
    fs.copyFileSync(filePath, backupPath);
    return true;
  } catch (error) {
    console.error(`❌ 创建备份失败: ${filePath}`);
    return false;
  }
}

/**
 * 统计键数量
 */
function countKeys(obj) {
  let count = 0;

  function traverse(o) {
    for (const key in o) {
      if (!o.hasOwnProperty(key)) continue;

      if (
        typeof o[key] === 'object' &&
        o[key] !== null &&
        !Array.isArray(o[key])
      ) {
        traverse(o[key]);
      } else {
        count++;
      }
    }
  }

  traverse(obj);
  return count;
}

/**
 * 合并所有翻译文件以获取完整的键集合
 */
function buildMasterKeyStructure() {
  console.log('🔍 扫描所有语言文件，构建主键结构...\n');

  let masterStructure = {};

  for (const locale of CONFIG.locales) {
    const filePath = path.join(CONFIG.messagesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = readJsonFile(filePath);
    if (!data) continue;

    const keyCount = countKeys(data);
    console.log(`📄 ${locale}: ${keyCount} 个键`);

    // 合并到主结构
    masterStructure = deepMergeKeys(masterStructure, data);
  }

  const totalKeys = countKeys(masterStructure);
  console.log(`\n✅ 主键结构构建完成，共 ${totalKeys} 个唯一键\n`);

  return masterStructure;
}

/**
 * 同步单个语言文件
 */
function syncLocale(locale, masterStructure) {
  console.log(`\n📝 同步语言: ${locale}`);
  console.log('─'.repeat(50));

  const filePath = path.join(CONFIG.messagesDir, `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    console.log('⚠️  文件不存在，将创建新文件');
    if (writeJsonFile(filePath, masterStructure)) {
      console.log(`✅ 创建成功: ${locale}.json`);
      return true;
    }
    return false;
  }

  const currentData = readJsonFile(filePath);
  if (!currentData) return false;

  const beforeCount = countKeys(currentData);
  console.log(`📊 当前键数: ${beforeCount}`);

  // 创建备份
  createBackup(filePath);

  // 合并键
  const syncedData = deepMergeKeys(currentData, masterStructure);
  const afterCount = countKeys(syncedData);
  const addedCount = afterCount - beforeCount;

  console.log(`📊 同步后键数: ${afterCount}`);
  console.log(`✨ 新增键数: ${addedCount}`);

  if (addedCount === 0) {
    console.log('✅ 无需更新');
    return true;
  }

  // 写入文件
  if (writeJsonFile(filePath, syncedData)) {
    console.log(`✅ 同步成功: ${locale}.json`);
    return true;
  }

  return false;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始同步翻译键\n');
  console.log('='.repeat(50));
  console.log(`消息目录: ${CONFIG.messagesDir}`);
  console.log(`支持语言: ${CONFIG.locales.join(', ')}`);
  console.log(`参考语言: ${CONFIG.referenceLocale}`);
  console.log('='.repeat(50));

  // 检查目录
  if (!fs.existsSync(CONFIG.messagesDir)) {
    console.error(`\n❌ 消息目录不存在: ${CONFIG.messagesDir}`);
    process.exit(1);
  }

  // 构建主键结构
  const masterStructure = buildMasterKeyStructure();

  // 同步所有语言
  let successCount = 0;
  let failCount = 0;

  for (const locale of CONFIG.locales) {
    if (syncLocale(locale, masterStructure)) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // 输出统计
  console.log('\n' + '='.repeat(50));
  console.log('📊 同步完成统计');
  console.log('─'.repeat(50));
  console.log(`✅ 成功: ${successCount} 个语言`);
  console.log(`❌ 失败: ${failCount} 个语言`);

  if (failCount === 0) {
    console.log('\n🎉 所有翻译键同步成功！');
    console.log('\n📝 后续步骤：');
    console.log('1. 停止开发服务器 (Ctrl+C)');
    console.log('2. 删除缓存: Remove-Item -Recurse -Force .next');
    console.log('3. 重启服务器: npm run dev');
    console.log('4. 硬刷新浏览器 (Ctrl+Shift+R)');
  } else {
    console.log('\n⚠️  部分语言同步失败');
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { deepMergeKeys, syncLocale, buildMasterKeyStructure };
