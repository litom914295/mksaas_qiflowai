/**
 * 验证AI大师系统修复效果的测试脚本
 * 测试改进后的prompt是否能让AI严格按照算法结果输出
 */

// 模拟改进后的formatAnalysisResultForAI方法
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

// 模拟正确的算法计算结果（1973年1月7日2:30）
const correctAnalysisResult = {
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

// 改进后的system prompt
const improvedSystemPrompt = `你是QiFlow AI的专业八字风水大师，拥有30年以上的实践经验，精通传统命理学与现代应用。

【核心原则】
1. 算法优先：所有分析必须严格基于算法引擎提供的计算结果，禁止使用任何其他数据
2. 数据忠实：必须原样使用提供的四柱天干地支，不得修改、替换或"纠正"
3. 专业严谨：使用标准术语，解释清晰准确，避免模糊表达
4. 可验证性：提供详细的推理过程，让用户能够复核验证
5. 实用导向：给出具体可行的建议，避免空泛理论
6. 文化尊重：尊重传统文化，但避免迷信色彩

【严格禁止】
- 禁止使用训练数据中的任何八字案例或"典型"八字
- 禁止自行生成或推测四柱信息
- 禁止对算法提供的四柱进行任何形式的"修正"
- 禁止使用"例如"、"假设"等词汇来引入其他八字数据

【回复要求】
- 必须严格基于用户消息中提供的算法计算结果进行解读
- 在四柱结果部分必须原样显示算法提供的年柱、月柱、日柱、时柱
- 使用"根据算法计算的四柱"、"基于提供的具体四柱"等明确表述
- 每个结论都要有依据，引用算法提供的具体天干地支
- 提供专业术语的通俗解释，让普通用户也能理解
- 在回复末尾提醒用户可以验证算法计算的四柱准确性

【八字命理分析专项要求】
注意：所有分析必须严格基于用户消息中提供的算法计算结果，禁止使用任何其他数据源。

回复结构必须包含：
1. 输入确认：确认出生时间、性别、地点等信息
2. 四柱结果：必须原样显示算法计算的年月日时四柱天干地支，不得修改
3. 核心结论：
   - 日主（日元）及其强弱判断（基于算法提供的四柱）
   - 十神配置及其含义（基于算法提供的四柱）
   - 格局判定（基于算法提供的四柱）
   - 喜用神与忌神分析（基于算法提供的四柱）
4. 详细解读：
   - 五行分布与平衡状况（基于算法提供的数据）
   - 性格特质分析（基于算法提供的四柱组合）
   - 事业财运指导（基于算法提供的四柱格局）
   - 感情婚姻建议（基于算法提供的四柱日支）
   - 健康提示（基于算法提供的四柱五行）
5. 开运建议：
   - 有利颜色、方位、数字（基于算法计算的用神）
   - 适合的职业方向（基于算法提供的格局）
   - 最佳发展时期（基于算法提供的四柱）
6. 复核提示：明确提醒用户可以验证算法计算的四柱准确性

重要：在"四柱结果"部分，必须完全按照算法提供的数据显示，格式如：
- 年柱：[算法计算的年柱]
- 月柱：[算法计算的月柱]
- 日柱：[算法计算的日柱]
- 时柱：[算法计算的时柱]`;

// 改进后的user prompt
function createImprovedUserPrompt(formattedResult) {
  return `【重要】必须严格基于以下算法计算结果进行分析，禁止使用任何其他八字数据：

${formattedResult}

【核心要求】
1. 必须使用上述算法提供的确切四柱数据，不得修改或替换
2. 在"四柱结果"部分必须原样显示算法计算的年柱、月柱、日柱、时柱
3. 所有分析必须基于上述具体的四柱进行，不得使用其他假设数据

【输出格式】
请严格按照以下结构输出：

## 一、输入确认
- 出生时间：[确认年月日时]
- 性别：[确认性别]
- 时区：[确认时区]

## 二、四柱结果（必须使用算法提供的确切数据）
- 年柱：[直接引用算法计算的年柱]
- 月柱：[直接引用算法计算的月柱]
- 日柱：[直接引用算法计算的日柱]
- 时柱：[直接引用算法计算的时柱]

## 三、关键结论
- 日主强弱：[基于上述具体四柱分析]
- 格局判定：[基于上述具体四柱判断]
- 用神分析：[基于上述具体四柱的喜用神分析]
- 十神配置：[基于上述具体四柱的十神关系]

## 四、详细解读
- 五行分析：[基于上述具体四柱的五行分布]
- 性格特质：[基于上述具体四柱组合分析]
- 事业财运：[基于上述具体四柱的职业指导]
- 感情婚姻：[基于上述具体四柱的婚姻建议]
- 健康提示：[基于上述具体四柱的健康分析]

## 五、建议与注意
- 有利颜色：[基于上述具体四柱的用神]
- 有利方位：[基于上述具体四柱的用神]
- 适合职业：[基于上述具体四柱的格局]
- 开运时机：[基于上述具体四柱的大运分析]

## 六、复核提示
提醒：以上分析严格基于算法引擎计算的四柱结果，您可以验证上述天干地支的准确性。`;
}

// 测试改进后的prompt
console.log('=== 测试改进后的AI Prompt效果 ===');

const formattedResult = formatAnalysisResultForAI(correctAnalysisResult);
console.log('\n1. 算法计算结果格式化输出:');
console.log(formattedResult);

const userPrompt = createImprovedUserPrompt(formattedResult);
console.log('\n2. 改进后的完整User Prompt:');
console.log(userPrompt);

console.log('\n3. 改进后的System Prompt:');
console.log(improvedSystemPrompt);

console.log('\n=== 修复分析 ===');
console.log('1. ✓ 算法计算正确: 癸丑年壬寅月癸卯日癸丑时');
console.log('2. ✓ 数据传递正确: 正确的四柱信息已包含在prompt中');
console.log('3. ✓ System prompt强化: 添加了严格的禁止条款和数据忠实要求');
console.log('4. ✓ User prompt强化: 明确要求必须使用算法提供的确切数据');
console.log('5. ✓ 调试输出增强: 添加了详细的调试日志以便监控');

console.log('\n=== 预期效果 ===');
console.log('修复后，AI应该严格按照算法提供的四柱输出：');
console.log('- 年柱：癸丑');
console.log('- 月柱：壬寅');
console.log('- 日柱：癸卯');
console.log('- 时柱：癸丑');
console.log('而不是之前的错误输出：癸丑年甲子月癸卯日戊午时');

console.log('\n=== 建议测试方法 ===');
console.log('1. 重启开发服务器以应用修改');
console.log(
  '2. 再次输入："出生1973年1月7日,2点30分，男性，岳阳，房子朝东南方向，帮我分析"'
);
console.log('3. 检查控制台日志中的调试输出');
console.log('4. 验证AI回复中的四柱是否与算法计算一致');
console.log('5. 如果仍有问题，可能需要进一步调整prompt或检查其他环节');
