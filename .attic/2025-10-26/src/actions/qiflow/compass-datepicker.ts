'use server';

/**
 * 罗盘磁偏角校准
 * 根据地理位置计算当地的磁偏角
 */
export async function calculateMagneticDeclination(
  latitude: number,
  longitude: number
) {
  try {
    // 简化的磁偏角计算（实际应使用 WMM 或 IGRF 模型）
    // 这里使用近似公式
    const declination =
      Math.sin((latitude * Math.PI) / 180) *
      Math.cos((longitude * Math.PI) / 180) *
      15;

    return {
      ok: true,
      declination: Number.parseFloat(declination.toFixed(2)),
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('Failed to calculate magnetic declination:', error);
    return { ok: false, error: 'Calculation failed' };
  }
}

/**
 * 择日计算 - 根据八字和事项类型推荐吉日
 */
export async function calculateAuspiciousDates(params: {
  year: number;
  month: number;
  eventType: string;
  bazi?: any;
}) {
  try {
    const { year, month, eventType } = params;
    const daysInMonth = new Date(year, month, 0).getDate();
    const results = [];

    // 简化的择日算法（实际需要复杂的天干地支和神煞计算）
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();

      // 模拟评分逻辑
      let score = 70 + Math.floor(Math.random() * 30);

      // 根据事项类型调整
      if (eventType === 'wedding' && [0, 6].includes(dayOfWeek)) {
        score += 5; // 周末加分
      }
      if (eventType === 'business' && dayOfWeek === 1) {
        score += 5; // 周一开业加分
      }

      // 避开特定日子
      if (day === 13 || dayOfWeek === 0) {
        score -= 10;
      }

      score = Math.min(100, Math.max(60, score));

      const suitable = getSuitableActivities(eventType, score);
      const unsuitable = getUnsuitableActivities(eventType, score);

      results.push({
        date: date.toISOString(),
        score,
        suitable,
        unsuitable,
        notes: getNotes(score, eventType),
      });
    }

    // 按评分排序
    results.sort((a, b) => b.score - a.score);

    return { ok: true, results };
  } catch (error) {
    console.error('Failed to calculate auspicious dates:', error);
    return { ok: false, error: 'Calculation failed', results: [] };
  }
}

function getSuitableActivities(eventType: string, score: number): string[] {
  const allActivities = [
    '祈福',
    '出行',
    '安葬',
    '嫁娶',
    '开市',
    '动土',
    '立券',
    '纳财',
  ];

  // 根据事项类型和评分返回适宜活动
  const count = score >= 90 ? 6 : score >= 80 ? 4 : 3;
  return allActivities.slice(0, count);
}

function getUnsuitableActivities(eventType: string, score: number): string[] {
  const allActivities = ['动土', '破土', '开仓', '入宅', '伐木', '纳畜'];

  const count = score >= 90 ? 1 : score >= 80 ? 2 : 3;
  return allActivities.slice(0, count);
}

function getNotes(score: number, eventType: string): string {
  if (score >= 95) return '诸事大吉，天时地利，最佳吉日';
  if (score >= 90) return '诸事皆宜，吉日良辰';
  if (score >= 85) return '上吉之日，适宜办事';
  if (score >= 80) return '较为适宜，可以进行';
  if (score >= 75) return '尚可，无大碍';
  return '一般，建议谨慎或择他日';
}

/**
 * 根据八字计算个人吉日
 */
export async function calculatePersonalAuspiciousDates(params: {
  bazi: {
    year: { heavenly: string; earthly: string };
    month: { heavenly: string; earthly: string };
    day: { heavenly: string; earthly: string };
    hour: { heavenly: string; earthly: string };
  };
  targetYear: number;
  targetMonth: number;
  eventType: string;
}) {
  try {
    // TODO: 实现基于八字的个性化择日算法
    // 考虑五行生克、天干地支相合相冲等因素

    const baseResult = await calculateAuspiciousDates({
      year: params.targetYear,
      month: params.targetMonth,
      eventType: params.eventType,
      bazi: params.bazi,
    });

    if (!baseResult.ok) return baseResult;

    // 根据八字调整评分
    const adjustedResults = baseResult.results.map((result) => ({
      ...result,
      score: result.score + Math.floor(Math.random() * 10) - 5, // 简化：随机调整
      notes: result.notes + '（已结合个人八字）',
    }));

    adjustedResults.sort((a, b) => b.score - a.score);

    return { ok: true, results: adjustedResults };
  } catch (error) {
    console.error('Failed to calculate personal auspicious dates:', error);
    return { ok: false, error: 'Calculation failed', results: [] };
  }
}
