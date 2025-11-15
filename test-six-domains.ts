/**
 * 六大领域分析集成测试
 * 
 * 测试 generateSixDomains 是否生成有意义的内容（非占位符）
 */

import { generateFullReportV22 } from './src/lib/report/report-generator-v2.2';

// 毛泽东八字样例
const maoZedong = {
  name: '毛泽东',
  date: '1893-12-26',
  time: '08:00',
  city: '湖南湘潭',
  gender: 'male',
};

// 周恩来八字样例
const zhouEnlai = {
  name: '周恩来',
  date: '1898-03-05',
  time: '14:00',
  city: '江苏淮安',
  gender: 'male',
};

async function testSixDomains() {
  console.log('====== 测试 1: 毛泽东六大领域分析 ======\n');
  const maoReport = await generateFullReportV22(maoZedong, {}, {});

  console.log('【才华优势】');
  console.log(maoReport.sixDomains.talent);
  console.log();

  console.log('【事业财运】');
  console.log(maoReport.sixDomains.careerFinance);
  console.log();

  console.log('【人际感情】');
  console.log(maoReport.sixDomains.relationship);
  console.log();

  console.log('【健康建议】');
  console.log(maoReport.sixDomains.health);
  console.log();

  console.log('【家庭关系】');
  console.log(maoReport.sixDomains.family);
  console.log();

  console.log('【社交网络】');
  console.log(maoReport.sixDomains.network);
  console.log('\n\n');

  // 验证非占位符
  const hasMeaningfulContent = (text: string) => {
    return !text.includes('...') && text.length > 50;
  };

  const checks = [
    { name: 'talent', text: maoReport.sixDomains.talent },
    { name: 'careerFinance', text: maoReport.sixDomains.careerFinance },
    { name: 'relationship', text: maoReport.sixDomains.relationship },
    { name: 'health', text: maoReport.sixDomains.health },
    { name: 'family', text: maoReport.sixDomains.family },
    { name: 'network', text: maoReport.sixDomains.network },
  ];

  console.log('====== 验证结果 ======');
  checks.forEach((check) => {
    const result = hasMeaningfulContent(check.text) ? '✅' : '❌';
    console.log(`${result} ${check.name}: ${check.text.length} 字`);
  });

  console.log('\n\n====== 测试 2: 周恩来六大领域分析（简要）======\n');
  const zhouReport = await generateFullReportV22(zhouEnlai, {}, {});
  console.log('才华优势片段:', zhouReport.sixDomains.talent.slice(0, 80));
  console.log('事业财运片段:', zhouReport.sixDomains.careerFinance.slice(0, 80));
  console.log('人际感情片段:', zhouReport.sixDomains.relationship.slice(0, 80));
}

testSixDomains().catch(console.error);
