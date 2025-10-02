/**
 * 实际测试API调用 - 验证1973年1月7日的八字计算
 */

const testInput = {
  message: '出生1973年1月7日,2点30分，男性，岳阳，房子朝东南方向，帮我分析',
  sessionId: 'test-session-1973',
  userId: 'test-user',
  locale: 'zh-CN',
};

// 发送实际API请求
async function testActualAPI() {
  try {
    console.log('=== 发送实际API请求 ===');
    console.log('请求数据:', JSON.stringify(testInput, null, 2));

    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-qiflow-trace': 'debug-1973-test',
      },
      body: JSON.stringify(testInput),
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('\n=== API响应结果 ===');
    console.log(JSON.stringify(result, null, 2));

    // 分析响应中的八字信息
    if (result.success && result.data) {
      console.log('\n=== 八字信息分析 ===');

      // 检查回复内容中的八字
      const reply = result.data.reply;
      console.log('AI回复:', reply);

      // 使用正则表达式提取四柱
      const pillarMatch = reply.match(
        /([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])年.*?([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])月.*?([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])日.*?([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])时/
      );

      if (pillarMatch) {
        const [, year, month, day, hour] = pillarMatch;
        console.log('提取的四柱:', { year, month, day, hour });
        console.log('完整四柱:', `${year}年${month}月${day}日${hour}时`);

        // 对比正确结果
        const correctResult = '癸丑年壬寅月癸卯日癸丑时';
        const extractedResult = `${year}年${month}月${day}日${hour}时`;

        console.log('\n=== 结果对比 ===');
        console.log('正确算法结果:', correctResult);
        console.log('AI输出结果:  ', extractedResult);
        console.log(
          '是否匹配:',
          correctResult === extractedResult ? '✓ 正确' : '✗ 错误'
        );

        if (correctResult !== extractedResult) {
          console.log('\n=== 错误分析 ===');
          console.log(
            '年柱:',
            year === '癸丑' ? '✓' : `✗ 应为癸丑，实际为${year}`
          );
          console.log(
            '月柱:',
            month === '壬寅' ? '✓' : `✗ 应为壬寅，实际为${month}`
          );
          console.log(
            '日柱:',
            day === '癸卯' ? '✓' : `✗ 应为癸卯，实际为${day}`
          );
          console.log(
            '时柱:',
            hour === '癸丑' ? '✓' : `✗ 应为癸丑，实际为${hour}`
          );
        }
      } else {
        console.log('未能从AI回复中提取四柱信息');
        console.log('回复内容:', reply.substring(0, 500) + '...');
      }

      // 检查原始数据
      if (result.data.analysisResult) {
        console.log('\n=== 原始分析数据 ===');
        console.log('分析类型:', result.data.analysisResult.type);
        console.log('分析成功:', result.data.analysisResult.success);

        if (result.data.rawData && result.data.rawData.pillars) {
          const rawPillars = result.data.rawData.pillars;
          console.log('原始四柱数据:');
          console.log('年柱:', rawPillars.year?.chinese || '未知');
          console.log('月柱:', rawPillars.month?.chinese || '未知');
          console.log('日柱:', rawPillars.day?.chinese || '未知');
          console.log('时柱:', rawPillars.hour?.chinese || '未知');

          const rawResult = `${rawPillars.year?.chinese || '未知'}年${rawPillars.month?.chinese || '未知'}月${rawPillars.day?.chinese || '未知'}日${rawPillars.hour?.chinese || '未知'}时`;
          console.log('原始算法结果:', rawResult);

          // 如果原始数据正确但AI输出错误
          if (
            rawResult === '癸丑年壬寅月癸卯日癸丑时' &&
            extractedResult !== rawResult
          ) {
            console.log('\n!!! 关键发现 !!!');
            console.log('算法计算正确，但AI没有严格按照算法结果输出');
            console.log('这确认了问题在AI解读阶段，而非算法计算阶段');
          }
        }
      }
    } else {
      console.log('API调用失败或返回错误:', result);
    }
  } catch (error) {
    console.error('API调用出错:', error);

    // 可能是服务未启动，显示说明
    console.log('\n=== 注意 ===');
    console.log('如果看到连接错误，请确保开发服务器正在运行：');
    console.log('npm run dev');
    console.log('然后重新运行此测试脚本');
  }
}

// 执行测试
testActualAPI();
