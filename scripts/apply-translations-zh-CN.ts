/**
 * 应用简体中文翻译
 *
 * 直接翻译 zh-CN.json 中真正需要翻译的英文内容
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface TranslationObject {
  [key: string]: string | string[] | TranslationObject;
}

// 翻译映射表（英文 -> 简体中文）
const translations: { [key: string]: string } = {
  // Bazi 相关
  'TODO: translate Bazi.male': '男',
  'TODO: translate Bazi.female': '女',

  // BaziHome 相关
  'Precise Algorithm': '精准算法',
  'Privacy Protected': '隐私保护',
  'Instant Analysis': '即时分析',
  'Trusted by 10,000+ users': '超过 10,000 名用户的信赖',

  // Compass 相关
  'Calibrating...': '校准中...',
  'TODO: translate Compass.measuring': '测量中',
  'TODO: translate Compass.calibrate_device': '校准设备',
  'TODO: translate Compass.calibration_instructions': '校准说明',
  'TODO: translate Compass.magnetic_declination': '磁偏角',
  'TODO: translate Compass.true_north': '真北',
  'TODO: translate Compass.magnetic_north': '磁北',
  'TODO: translate Compass.direction': '方向',
  'TODO: translate Compass.degree': '度数',
  'TODO: translate Compass.measurement_history': '测量历史',
  'TODO: translate Compass.save_measurement': '保存测量',
  'TODO: translate Compass.clear_history': '清除历史',
  'TODO: translate Compass.device_not_supported': '设备不支持',
  'TODO: translate Compass.permission_required': '需要权限',
  'TODO: translate Compass.interference_detected': '检测到干扰',
  'TODO: translate Compass.move_away_from_metal': '请远离金属物体',
  'TODO: translate Compass.measurement_saved': '测量已保存',
  'TODO: translate Compass.high_accuracy': '高精度',
  'TODO: translate Compass.medium_accuracy': '中等精度',
  'TODO: translate Compass.low_accuracy': '低精度',

  // Forms
  'your@email.com': 'your@email.com',

  // HomePage
  MkSaaS: 'MkSaaS',

  // I18nTest
  'Switch Language': '切换语言',
  'Current Language': '当前语言',
  Welcome: '欢迎',
  'This is a test page for language switching': '这是一个语言切换测试页面',
  'Try switching to different languages': '尝试切换到不同的语言',
  'Click the button below': '点击下面的按钮',
  'Language Test': '语言测试',

  // Metadata
  'TODO: translate metadata.title': 'QiFlow AI - 智能风水分析平台',
  'TODO: translate metadata.description':
    '结合传统中国玄学与现代 AI 技术的智能风水分析平台',

  // PricingPage
  $: '$',
  '/month': '/月',
  'Get Started': '开始使用',

  // Reports
  'TODO: translate Reports.tab.overview': '概览',
  'TODO: translate Reports.tab.details': '详情',
  'TODO: translate Reports.tab.analysis': '分析',
  'TODO: translate Reports.tab.recommendations': '建议',
  'TODO: translate Reports.empty.title': '暂无报告',
  'TODO: translate Reports.empty.description': '完成分析后报告将在此显示',
  'TODO: translate Reports.empty.action': '开始分析',
  'TODO: translate Reports.export': '导出报告',
  'TODO: translate Reports.share': '分享报告',
  'TODO: translate Reports.download': '下载报告',
  'TODO: translate Reports.print': '打印报告',
  'TODO: translate Reports.view.basic': '基础视图',
  'TODO: translate Reports.view.detailed': '详细视图',
  'TODO: translate Reports.view.professional': '专业视图',
  'TODO: translate Reports.status.generating': '生成中',
  'TODO: translate Reports.status.ready': '已就绪',
  'TODO: translate Reports.status.error': '出错了',
  'TODO: translate Reports.date.generated': '生成日期',
  'TODO: translate Reports.date.accessed': '访问日期',

  // Settings
  Dark: '深色',
  Light: '浅色',
  System: '跟随系统',

  // Subscription
  'TODO: translate Subscription.active': '活跃',
  'TODO: translate Subscription.cancelled': '已取消',
  'TODO: translate Subscription.expired': '已过期',
  'TODO: translate Subscription.renews_on': '续订于',
  'TODO: translate Subscription.expires_on': '过期于',
  'TODO: translate Subscription.manage': '管理订阅',
  'TODO: translate Subscription.cancel': '取消订阅',
  'TODO: translate Subscription.reactivate': '重新激活',

  // TestGuest
  'TODO: translate TestGuest.welcome': '欢迎，游客',
  'TODO: translate TestGuest.description':
    '游客模式允许您在不注册的情况下试用部分功能',
  'TODO: translate TestGuest.limitations.title': '游客限制',
  'TODO: translate TestGuest.limitations.noSave': '无法保存数据',
  'TODO: translate TestGuest.limitations.basicOnly': '仅限基础功能',
  'TODO: translate TestGuest.limitations.timeLimited': '时间限制',
  'TODO: translate TestGuest.upgrade.title': '升级您的账户',
  'TODO: translate TestGuest.upgrade.benefits': '获得完整功能访问权限',
  'TODO: translate TestGuest.register': '立即注册',

  // GuestAnalysis
  'TODO: translate GuestAnalysis.title': '游客分析',
  'TODO: translate GuestAnalysis.subtitle': '体验我们的分析功能',
  'TODO: translate GuestAnalysis.limited': '功能受限',
  'TODO: translate GuestAnalysis.register_for_full': '注册以获得完整功能',

  // Common abbreviations
  'L. Zhang': 'L. Zhang',
  'Y. Chen': 'Y. Chen',
  'H. Wang': 'H. Wang',
  ID: 'ID',
  Bazi: '八字',
};

/**
 * 递归翻译对象
 */
function translateObject(obj: TranslationObject): TranslationObject {
  const result: TranslationObject = {};

  for (const key in obj) {
    const value = obj[key];

    if (Array.isArray(value)) {
      // 处理数组
      result[key] = value.map((item) => {
        if (typeof item === 'string' && translations[item]) {
          return translations[item];
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      // 递归处理对象
      result[key] = translateObject(value as TranslationObject);
    } else if (typeof value === 'string' && translations[value]) {
      // 字符串且有翻译
      result[key] = translations[value];
    } else {
      // 保持原样
      result[key] = value;
    }
  }

  return result;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始应用简体中文翻译...\n');

  const filename = 'zh-CN.json';
  const filePath = path.join(MESSAGES_DIR, filename);

  // 读取文件
  console.log(`📖 读取 ${filename}...`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const cleanContent = content.replace(/^\uFEFF/, '');
  const data: TranslationObject = JSON.parse(cleanContent);

  // 应用翻译
  console.log('🔄 应用翻译...');
  const translated = translateObject(data);

  // 写入文件
  console.log('💾 保存翻译结果...');
  fs.writeFileSync(filePath, JSON.stringify(translated, null, 2), 'utf-8');

  // 统计
  const translatedCount = Object.keys(translations).length;
  console.log('\n✅ 完成！');
  console.log(`📊 应用了 ${translatedCount} 条翻译规则`);
  console.log('\n💡 下一步:');
  console.log('   运行 npm run validate:i18n 检查结果');
}

main().catch(console.error);
