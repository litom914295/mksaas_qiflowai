#!/usr/bin/env node

/**
 * 分析请求检测测试脚本
 */

// 复制检测逻辑
function isAnalysisRequest(message) {
  const analysisKeywords = [
    // 八字相关
    '八字',
    '命理',
    '出生',
    '生辰',
    '命盘',
    '四柱',
    '天干',
    '地支',
    '五行',
    '年柱',
    '月柱',
    '日柱',
    '时柱',
    '十神',
    '用神',
    '喜神',
    '忌神',
    // 风水相关
    '风水',
    '房屋',
    '朝向',
    '布局',
    '玄空',
    '飞星',
    '九宫',
    '方位',
    '坐向',
    '山向',
    '罗盘',
    '指南针',
    // 时间相关
    '年',
    '月',
    '日',
    '时',
    '时辰',
    '农历',
    '阳历',
    // 分析相关
    '分析',
    '计算',
    '排盘',
    '算命',
    '占卜',
    '预测',
  ];

  const hasAnalysisKeyword = analysisKeywords.some(keyword =>
    message.includes(keyword)
  );

  // 检查是否包含出生信息
  const hasBirthInfo = /\d{4}年|\d{1,2}月|\d{1,2}日|\d{1,2}时/.test(message);

  // 检查是否包含房屋信息
  const hasHouseInfo = /[东西南北]向|朝向|坐向/.test(message);

  return hasAnalysisKeyword || hasBirthInfo || hasHouseInfo;
}

const testMessages = [
  '我是男性，1990年5月15日14时出生，请帮我分析八字',
  '帮我算一下八字，我是女性，1985年3月20日9时出生',
  '我的房子是坐北朝南，请帮我分析风水',
  '你好，你是谁',
  '你能干什么',
  '帮我分析八字',
  '什么是风水',
];

console.log('🧪 测试分析请求检测逻辑...\n');

testMessages.forEach((message, index) => {
  const result = isAnalysisRequest(message);
  const keywords = ['八字', '命理', '出生', '风水', '房屋'].filter(k =>
    message.includes(k)
  );
  const hasBirthInfo = /\d{4}年|\d{1,2}月|\d{1,2}日|\d{1,2}时/.test(message);
  const hasHouseInfo = /[东西南北]向|朝向|坐向/.test(message);

  console.log(`📝 测试 ${index + 1}: "${message}"`);
  console.log(`   🔍 关键词匹配: ${keywords.join(', ') || '无'}`);
  console.log(`   📅 出生信息: ${hasBirthInfo}`);
  console.log(`   🏠 房屋信息: ${hasHouseInfo}`);
  console.log(`   ✅ 分析请求: ${result}`);
  console.log('');
});
