/**
 * 测试formatAnalysisResultForAI方法的输出
 * 验证传递给AI的数据是否包含正确的算法计算结果
 */

// 模拟算法计算结果
const mockAnalysisResult = {
  type: 'bazi',
  success: true,
  data: {
    pillars: {
      year: {
        stem: '癸',
        branch: '丑',
        chinese: '癸丑',
        heavenlyStem: '癸',
        earthlyBranch: '丑',
      },
      month: {
        stem: '壬',
        branch: '寅',
        chinese: '壬寅',
        heavenlyStem: '壬',
        earthlyBranch: '寅',
      },
      day: {
        stem: '癸',
        branch: '卯',
        chinese: '癸卯',
        heavenlyStem: '癸',
        earthlyBranch: '卯',
      },
      hour: {
        stem: '癸',
        branch: '丑',
        chinese: '癸丑',
        heavenlyStem: '癸',
        earthlyBranch: '丑',
      },
    },
    elements: {
      wood: 2,
      fire: 0,
      earth: 2,
      metal: 0,
      water: 4,
    },
  },
  executionTime: 50,
  timestamp: '2025-01-21T10:30:00.000Z',
  sessionId: 'test-session',
  userId: 'test-user',
};

// 模拟formatAnalysisResultForAI方法
function formatAnalysisResultForAI(analysisResult) {
  if (!analysisResult.success || !analysisResult.data) {
    return `分析失败: ${analysisResult.error}`;
  }

  let resultText = `分析类型: ${analysisResult.type}\n`;
  resultText += `分析时间: ${analysisResult.timestamp}\n`;
  resultText += `执行时间: ${analysisResult.executionTime}ms\n\n`;

  if (analysisResult.type === 'bazi' && 'pillars' in analysisResult.data) {
    const baziData = analysisResult.data;
    resultText += `八字信息:\n`;
    resultText += `- 年柱: ${baziData.pillars?.year?.chinese || baziData.pillars?.year?.stem + baziData.pillars?.year?.branch || '未知'}\n`;
    resultText += `- 月柱: ${baziData.pillars?.month?.chinese || baziData.pillars?.month?.stem + baziData.pillars?.month?.branch || '未知'}\n`;
    resultText += `- 日柱: ${baziData.pillars?.day?.chinese || baziData.pillars?.day?.stem + baziData.pillars?.day?.branch || '未知'}\n`;
    resultText += `- 时柱: ${baziData.pillars?.hour?.chinese || baziData.pillars?.hour?.stem + baziData.pillars?.hour?.branch || '未知'}\n`;
    resultText += `- 五行: ${JSON.stringify(baziData.elements) || '未知'}\n`;
    resultText += `- 日主: ${baziData.pillars?.day?.stem || '未知'}\n`;
  }

  return resultText;
}

// 测试格式化输出
console.log('=== 测试formatAnalysisResultForAI输出 ===');
const formattedResult = formatAnalysisResultForAI(mockAnalysisResult);
console.log(formattedResult);

// 模拟完整的AI Prompt
const userContent = `基于以下算法计算结果，请提供专业的八字分析解读：

${formattedResult}

【输出要求】
请严格按照以下结构输出，每个部分都要详细完整：

## 一、输入确认
- 出生时间：[确认年月日时]
- 性别：[确认性别]
- 时区：[确认时区]

## 二、四柱结果
- 年柱：[天干地支及其含义]
- 月柱：[天干地支及其含义]
- 日柱：[天干地支及其含义]
- 时柱：[天干地支及其含义]

## 三、关键结论
- 日主强弱：[基于算法判断]
- 格局判定：[正格/特殊格局]
- 用神分析：[喜用神和忌神]
- 十神配置：[主要十神关系]

## 四、详细解读
- 五行分析：[五行分布与平衡]
- 性格特质：[基于十神组合分析]
- 事业财运：[职业方向与财运]
- 感情婚姻：[婚姻感情指导]
- 健康提示：[需注意的健康问题]

## 五、建议与注意
- 有利颜色：[基于用神]
- 有利方位：[基于用神]
- 适合职业：[基于格局]
- 开运时机：[大运流年]

## 六、复核提示
提醒：以上分析基于传统八字算法引擎计算，您可以验证四柱天干地支的准确性。如需深入了解某个方面，请随时询问。`;

console.log('\n=== 完整的AI Prompt ===');
console.log(userContent);

console.log('\n=== 问题分析 ===');
console.log('1. 算法计算结果: 癸丑年壬寅月癸卯日癸丑时');
console.log('2. 传递给AI的数据包含正确的四柱信息: ✓');
console.log('3. Prompt明确要求基于算法结果: ✓');
console.log('4. 问题可能在于:');
console.log('   - AI模型可能忽略了提供的数据');
console.log('   - AI模型可能从训练数据中生成了"典型"八字');
console.log('   - 可能有其他未检查的数据传递问题');

// 模拟错误情况：AI可能收到的是硬编码数据
const mockBadResult = {
  type: 'bazi',
  success: true,
  data: {
    pillars: {
      year: { chinese: '癸丑' },
      month: { chinese: '甲子' }, // 这是错误的！
      day: { chinese: '癸卯' },
      hour: { chinese: '戊午' }, // 这也是错误的！
    },
  },
  executionTime: 50,
  timestamp: '2025-01-21T10:30:00.000Z',
};

console.log('\n=== 如果传递了错误数据会怎样 ===');
const badFormattedResult = formatAnalysisResultForAI(mockBadResult);
console.log(badFormattedResult);
console.log('这样的错误数据会导致AI输出: 癸丑年甲子月癸卯日戊午时');
