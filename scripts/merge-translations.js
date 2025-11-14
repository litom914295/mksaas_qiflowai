/**
 * 翻译文件合并脚本
 * 将旧项目（qiflow-ai）的翻译键合并到当前项目
 *
 * 功能：
 * 1. 读取旧项目翻译文件
 * 2. 读取当前项目翻译文件
 * 3. 合并翻译键（保留当前项目的现有键，添加旧项目的新键）
 * 4. 为所有支持的语言执行合并
 * 5. 生成备份文件
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  oldProjectPath: path.join(__dirname, '..', 'qiflow-ai', 'src', 'locales'),
  currentProjectPath: path.join(__dirname, '..', 'messages'),
  supportedLocales: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'],
  backupSuffix: '.backup',
  dryRun: false, // 设置为 true 进行测试运行，不实际写入文件
};

/**
 * 深度合并两个对象
 * 当前项目的键优先，只添加旧项目中新的键
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        // 如果是对象，递归合并
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else if (!Object.hasOwn(result, key)) {
        // 只添加当前项目中不存在的键
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * 读取 JSON 文件
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
 * 写入 JSON 文件
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
 * 创建备份文件
 */
function createBackup(filePath) {
  try {
    const backupPath = filePath + CONFIG.backupSuffix;
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ 已创建备份: ${path.basename(backupPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ 创建备份失败: ${filePath}`);
    console.error(`   错误: ${error.message}`);
    return false;
  }
}

/**
 * 统计对象中的键数量（递归）
 */
function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        count += countKeys(obj[key]);
      } else {
        count++;
      }
    }
  }
  return count;
}

/**
 * 合并单个语言的翻译文件
 */
function mergeLocale(locale) {
  console.log(`\n📝 处理语言: ${locale}`);
  console.log('─'.repeat(50));

  const oldFilePath = path.join(CONFIG.oldProjectPath, `${locale}.json`);
  const currentFilePath = path.join(
    CONFIG.currentProjectPath,
    `${locale}.json`
  );

  // 检查文件是否存在
  if (!fs.existsSync(oldFilePath)) {
    console.log(`⚠️  旧项目文件不存在: ${locale}.json`);
    return false;
  }

  if (!fs.existsSync(currentFilePath)) {
    console.log(`⚠️  当前项目文件不存在: ${locale}.json`);
    return false;
  }

  // 读取文件
  const oldTranslations = readJsonFile(oldFilePath);
  const currentTranslations = readJsonFile(currentFilePath);

  if (!oldTranslations || !currentTranslations) {
    return false;
  }

  // 统计原始键数量
  const oldKeyCount = countKeys(oldTranslations);
  const currentKeyCount = countKeys(currentTranslations);

  console.log(`📊 旧项目键数量: ${oldKeyCount}`);
  console.log(`📊 当前项目键数量: ${currentKeyCount}`);

  // 合并翻译
  const mergedTranslations = deepMerge(currentTranslations, oldTranslations);
  const mergedKeyCount = countKeys(mergedTranslations);
  const addedKeyCount = mergedKeyCount - currentKeyCount;

  console.log(`📊 合并后键数量: ${mergedKeyCount}`);
  console.log(`✨ 新增键数量: ${addedKeyCount}`);

  if (addedKeyCount === 0) {
    console.log('✅ 无需更新，当前项目已包含所有键');
    return true;
  }

  if (CONFIG.dryRun) {
    console.log('🔍 测试模式：跳过写入文件');
    return true;
  }

  // 创建备份
  if (!createBackup(currentFilePath)) {
    return false;
  }

  // 写入合并后的文件
  if (writeJsonFile(currentFilePath, mergedTranslations)) {
    console.log(`✅ 成功合并并写入: ${locale}.json`);
    return true;
  }

  return false;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始合并翻译文件');
  console.log('='.repeat(50));
  console.log(`旧项目路径: ${CONFIG.oldProjectPath}`);
  console.log(`当前项目路径: ${CONFIG.currentProjectPath}`);
  console.log(`支持的语言: ${CONFIG.supportedLocales.join(', ')}`);
  console.log(`测试模式: ${CONFIG.dryRun ? '是' : '否'}`);

  // 检查目录是否存在
  if (!fs.existsSync(CONFIG.oldProjectPath)) {
    console.error(`\n❌ 旧项目目录不存在: ${CONFIG.oldProjectPath}`);
    console.error('请确认 qiflow-ai 项目位置正确');
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG.currentProjectPath)) {
    console.error(`\n❌ 当前项目目录不存在: ${CONFIG.currentProjectPath}`);
    process.exit(1);
  }

  // 合并所有语言
  let successCount = 0;
  let failCount = 0;

  for (const locale of CONFIG.supportedLocales) {
    if (mergeLocale(locale)) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // 输出总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 合并完成统计');
  console.log('─'.repeat(50));
  console.log(`✅ 成功: ${successCount} 个语言`);
  console.log(`❌ 失败: ${failCount} 个语言`);

  if (failCount === 0) {
    console.log('\n🎉 所有翻译文件合并成功！');
    console.log('\n📝 后续步骤：');
    console.log('1. 检查合并后的翻译文件');
    console.log('2. 重启开发服务器: npm run dev');
    console.log('3. 清除浏览器缓存并刷新页面');
    console.log('4. 如果有问题，可以从 .backup 文件恢复');
  } else {
    console.log('\n⚠️  部分文件合并失败，请检查错误信息');
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { deepMerge, mergeLocale };
