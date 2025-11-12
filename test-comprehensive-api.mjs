import { comprehensiveAnalysis } from './src/lib/qiflow/xuankong/comprehensive-engine.ts';

console.log('开始测试 comprehensive-engine...\n');

try {
  const buildDate = new Date(2020, 0, 1);

  const options = {
    observedAt: buildDate,
    facing: { degrees: 180 },
    includeQixingdajie: true,
    includeChengmenjue: true,
    includeLingzheng: true,
  };

  console.log('调用参数:', JSON.stringify(options, null, 2));

  const result = await comprehensiveAnalysis(options);

  console.log('\n✅ 测试成功！');
  console.log('版本:', result.metadata.version);
  console.log('分析深度:', result.metadata.analysisDepth);
  console.log('计算时间:', result.metadata.computationTime, 'ms');
  console.log('综合评分:', result.overallAssessment.score);

  console.log('\n高级格局数据:');
  console.log(
    '  - 七星打劫:',
    result.qixingdajieAnalysis ? '✅ 存在' : '❌ null'
  );
  console.log(
    '  - 零正理论:',
    result.lingzhengAnalysis ? '✅ 存在' : '❌ null'
  );
  console.log(
    '  - 城门诀:',
    result.chengmenjueAnalysis ? '✅ 存在' : '❌ null'
  );
} catch (error) {
  console.error('\n❌ 测试失败');
  console.error('错误:', error.message);
  console.error('堆栈:', error.stack);
  process.exit(1);
}
