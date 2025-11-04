import { exportQiflowPdfAction } from '@/actions/qiflow/pdf-export';

async function main() {
  // 构造示例 Bazi 数据（含评分与四柱），以展示图表与图例
  const result = {
    score: {
      overall: 0.78,
      wealth: 0.7,
      career: 0.66,
      health: 0.8,
      relationship: 0.74,
    },
    pillars: {
      year: { heavenly: '甲', earthly: '子' },
      month: { heavenly: '乙', earthly: '丑' },
      day: { heavenly: '丙', earthly: '寅' },
      hour: { heavenly: '丁', earthly: '卯' },
    },
  };
  const interpretation = {
    overview: '基于评分与四柱的简要阅读指引示例。',
    highlights: ['综合评分 78%', '财运稳定', '注意作息平衡'],
    suggestions: ['稳健规划', '保持运动'],
  };

  const fd = new FormData();
  fd.set('type', 'bazi');
  fd.set('language', 'zh');
  fd.set('result', JSON.stringify(result));
  fd.set('interpretation', JSON.stringify(interpretation));

  const out = await exportQiflowPdfAction(fd);
  if (!out || out.ok !== true) {
    console.error('Export failed:', out);
    process.exit(1);
  }
  // 输出 URL（S3 或 data URI）
  console.log(out.url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
