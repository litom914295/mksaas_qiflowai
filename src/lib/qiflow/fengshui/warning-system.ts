/**
 * 智能预警系统
 *
 * 核心功能：
 * - 识别紧急风水问题（五黄、二黑、上山下水等）
 * - 按严重程度分级（critical/high/medium/low/info）
 * - 生成详细的影响说明和后果预警
 * - 提供针对性化解建议
 *
 * @author 玄空风水大师团队
 * @version 6.0.0
 */

import {
  BaziInfo,
  type IssueSeverity,
  type PersonalizedFengshuiInput,
  type UrgentIssue,
} from './personalized-engine';
import {
  type FlyingStarChart,
  XuankongCalculator,
} from './xuankong-calculator';

// ==================== 核心类 ====================

/**
 * 预警系统
 */
export class WarningSystem {
  /**
   * 识别所有紧急问题
   */
  static async identifyIssues(
    input: PersonalizedFengshuiInput
  ): Promise<UrgentIssue[]> {
    console.log('[预警系统] 开始识别紧急问题...');

    const issues: UrgentIssue[] = [];

    // 1. 计算飞星盘
    const chart = XuankongCalculator.calculateFlyingStars(
      input.house.facing,
      input.house.period
    );

    // 2. 检查特殊凶格局
    const patternIssues = WarningSystem.checkPatternIssues(chart, input);
    issues.push(...patternIssues);

    // 3. 检查五黄、二黑等凶星
    const starIssues = WarningSystem.checkStarIssues(chart, input);
    issues.push(...starIssues);

    // 4. 检查流年凶位
    const annualIssues = WarningSystem.checkAnnualIssues(chart, input);
    issues.push(...annualIssues);

    // 5. 检查房间布局问题
    const roomIssues = WarningSystem.checkRoomIssues(chart, input);
    issues.push(...roomIssues);

    // 6. 检查八字冲突
    const baziIssues = WarningSystem.checkBaziConflicts(chart, input);
    issues.push(...baziIssues);

    // 7. 按紧急度排序
    issues.sort((a, b) => {
      // 先按severity排序
      const severityOrder: Record<IssueSeverity, number> = {
        critical: 5,
        high: 4,
        medium: 3,
        low: 2,
        info: 1,
      };
      const severityDiff =
        severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;

      // 再按urgency排序
      return b.urgency - a.urgency;
    });

    console.log(`[预警系统] 识别完成，发现 ${issues.length} 个问题`);

    return issues;
  }

  /**
   * 检查格局问题
   */
  private static checkPatternIssues(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): UrgentIssue[] {
    const issues: UrgentIssue[] = [];

    // 1. 上山下水（最严重）
    if (chart.patterns.isUpMountainDownWater) {
      issues.push({
        id: 'pattern-updown',
        severity: 'critical',
        title: '上山下水格局',
        description:
          '您的住宅格局为"上山下水"，这是玄空风水中最凶险的格局之一。山星到向、向星到山，导致"财位见山、人位见水"，违背了"山管人丁水管财"的基本原则。',
        location: '整体格局',
        impact: [
          '人丁不旺：家人健康状况差，易生疾病',
          '财运不济：收入不稳定，开支大于收入',
          '事业受阻：工作不顺，难有晋升',
          '婚姻不和：夫妻争吵频繁，感情淡漠',
          '子女学业差：孩子成绩下滑，注意力不集中',
        ],
        consequences: [
          '长期居住可能导致家人身体虚弱，频繁就医',
          '财务状况持续恶化，可能负债累累',
          '婚姻关系破裂，家庭不和睦',
          '子女前途受影响，难以成才',
          '家族运势衰败，难以翻身',
        ],
        urgency: 5,
      });
    }

    // 2. 卦气分界线（空亡线）
    const facingInfo = XuankongCalculator.degreesToPalace(input.house.facing);
    if (facingInfo.isOnBoundary) {
      issues.push({
        id: 'pattern-boundary',
        severity: 'high',
        title: '房屋坐向在空亡线上',
        description:
          '您的房屋朝向落在卦气分界线（空亡线）上，这是风水学中的大忌。空亡线上的房屋气场不稳，难以聚气，影响全家运势。',
        location: '房屋朝向',
        impact: [
          '运势飘忽不定：好事难成，坏事接连',
          '财运不稳：收入时有时无',
          '健康堪忧：家人易患慢性疾病',
          '人际不顺：小人频现，贵人难遇',
        ],
        consequences: [
          '长期居住运势难以改善',
          '可能出现意外损失',
          '家人健康每况愈下',
        ],
        urgency: 4,
      });
    }

    // 3. 伏吟格局
    if (chart.patterns.specialPatterns.some((p) => p.includes('伏吟'))) {
      issues.push({
        id: 'pattern-fuyin',
        severity: 'medium',
        title: '伏吟格局',
        description:
          '飞星盘中出现伏吟格局（山向星与运星相同），主"吟吟哭泣"，家人易有悲伤之事，运势停滞不前。',
        location:
          chart.patterns.specialPatterns.find((p) => p.includes('伏吟')) ||
          '部分宫位',
        impact: ['运势停滞', '情绪低落', '易有悲伤之事', '难有突破性进展'],
        consequences: ['家人精神状态不佳', '事业停滞多年', '家庭氛围压抑'],
        urgency: 3,
      });
    }

    return issues;
  }

  /**
   * 检查凶星问题
   */
  private static checkStarIssues(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): UrgentIssue[] {
    const issues: UrgentIssue[] = [];

    // 检查每个宫位的五黄、二黑
    for (const [pos, palace] of Object.entries(chart.palaces)) {
      const position = Number.parseInt(pos);

      // 1. 五黄煞
      if (palace.facingStar === 5 || palace.mountainStar === 5) {
        const room = input.house.layout?.find((r) => r.position === position);
        const locationName = room ? room.name : palace.name;

        // 判断严重程度
        let severity: IssueSeverity = 'medium';
        let urgency = 3;
        const facingPalace = XuankongCalculator.degreesToPalace(
          input.house.facing
        ).palace;

        if (position === facingPalace) {
          severity = 'high';
          urgency = 4;
        }

        if (room?.type === 'bedroom' && room.isPrimary) {
          severity = 'high';
          urgency = 5;
        }

        issues.push({
          id: `star-wuhuang-${position}`,
          severity,
          title: `${locationName}有五黄凶星`,
          description:
            '五黄星是玄空风水中最凶险的煞星，又称"五黄大煞"，主凶灾、疾病、意外。五黄所到之处，必须化解，否则后果严重。',
          location: locationName,
          impact: [
            '健康损害：易生重病，手术住院',
            '意外频发：车祸、跌打损伤等',
            '财运受损：破财、官非',
            '精神压力：焦虑、抑郁',
          ],
          consequences: [
            '家人可能遭遇严重疾病或意外',
            '可能面临巨额医疗费用或损失',
            '工作事业受到严重影响',
          ],
          urgency,
        });
      }

      // 2. 二黑病符
      if (palace.facingStar === 2 || palace.mountainStar === 2) {
        const room = input.house.layout?.find((r) => r.position === position);
        const locationName = room ? room.name : palace.name;

        let severity: IssueSeverity = 'low';
        let urgency = 2;

        if (room?.type === 'bedroom') {
          severity = 'medium';
          urgency = 3;
        }

        issues.push({
          id: `star-erhei-${position}`,
          severity,
          title: `${locationName}有二黑病符星`,
          description:
            '二黑星又称"病符星"，主疾病、慢性病。长期在二黑位停留，易引发身体不适，尤其影响老人和体弱者。',
          location: locationName,
          impact: [
            '慢性疾病：关节炎、肠胃病等',
            '免疫力下降：易感冒生病',
            '精神不振：睡眠质量差',
          ],
          consequences: ['家人健康逐渐恶化', '医疗开支增加', '生活质量下降'],
          urgency,
        });
      }
    }

    return issues;
  }

  /**
   * 检查流年问题
   */
  private static checkAnnualIssues(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): UrgentIssue[] {
    const issues: UrgentIssue[] = [];
    const { currentYear } = input.time;

    // 流年五黄位（简化算法）
    const annualWuhuang = ((currentYear - 1) % 9) + 1;
    const room = input.house.layout?.find((r) => r.position === annualWuhuang);
    const locationName = room ? room.name : chart.palaces[annualWuhuang].name;

    issues.push({
      id: 'annual-wuhuang',
      severity: 'medium',
      title: `${currentYear}年流年五黄在${locationName}`,
      description: `${currentYear}年的流年五黄飞临${locationName}，该位置在今年内需特别注意，避免动土、装修等工程，否则易招凶灾。`,
      location: locationName,
      impact: [
        '该方位不宜动土、装修',
        '长时间停留可能引发疾病或意外',
        '该位置的家人今年运势较差',
      ],
      consequences: ['动土可能引发严重凶灾', '家人健康受损', '财运不济'],
      urgency: 3,
    });

    // TODO: 可以继续添加流年三煞、太岁方位等

    return issues;
  }

  /**
   * 检查房间布局问题
   */
  private static checkRoomIssues(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): UrgentIssue[] {
    const issues: UrgentIssue[] = [];

    if (!input.house.layout) return issues;

    for (const room of input.house.layout) {
      const palace = chart.palaces[room.position];

      // 检查宫位是否存在
      if (!palace) {
        console.warn(`找不到位置 ${room.position} 的宫位数据`);
        continue;
      }

      // 1. 厕所在中宫
      if (room.type === 'bathroom' && room.position === 5) {
        issues.push({
          id: 'room-bathroom-center',
          severity: 'critical',
          title: '厕所在中宫',
          description:
            '中宫是全宅的核心，代表太极中心，主管全家人的健康和运势。厕所污秽之气聚集，若在中宫，则污染全宅气场，大凶。',
          location: room.name,
          impact: [
            '全家人健康受损：易生重病',
            '财运严重受损：难以聚财',
            '事业受阻：处处碰壁',
            '家庭不和：争吵频繁',
          ],
          consequences: [
            '家人可能患上严重疾病',
            '财务状况持续恶化',
            '家运衰败，难以翻身',
          ],
          urgency: 5,
        });
      }

      // 2. 厕所在向首
      const facingPalace = XuankongCalculator.degreesToPalace(
        input.house.facing
      ).palace;
      if (room.type === 'bathroom' && room.position === facingPalace) {
        issues.push({
          id: 'room-bathroom-facing',
          severity: 'high',
          title: '厕所在向首',
          description:
            '向首是房屋的"纳气口"，主管财运。厕所在向首，污秽之气迎面而来，导致财运受阻，难以进财。',
          location: room.name,
          impact: [
            '财运不佳：收入减少',
            '开支增多：钱财留不住',
            '事业不顺：机会流失',
          ],
          consequences: ['财务状况恶化', '可能负债', '事业发展受限'],
          urgency: 4,
        });
      }

      // 3. 厨房在五黄、二黑位
      if (room.type === 'kitchen') {
        if (palace.facingStar === 5 || palace.mountainStar === 5) {
          issues.push({
            id: 'room-kitchen-wuhuang',
            severity: 'high',
            title: '厨房在五黄位',
            description:
              '厨房是火旺之地，五黄属土，火生土，会催旺五黄凶性，导致家人易生病、意外频发。',
            location: room.name,
            impact: [
              '健康受损：消化系统疾病',
              '意外频发：烫伤、火灾等',
              '家人脾气暴躁',
            ],
            consequences: ['家人健康每况愈下', '可能发生火灾等严重意外'],
            urgency: 4,
          });
        }
      }

      // 4. 主卧在凶位
      if (room.type === 'bedroom' && room.isPrimary) {
        const evaluation = XuankongCalculator.evaluateStarCombination(
          palace.mountainStar,
          palace.facingStar,
          chart.period
        );

        if (evaluation.level === 'terrible' || evaluation.level === 'bad') {
          issues.push({
            id: 'room-master-bedroom-bad',
            severity: 'high',
            title: '主卧位置不佳',
            description: `主卧位于${palace.name}，该位置星曜组合不吉（${evaluation.description}），会影响主人的健康、睡眠和运势。`,
            location: room.name,
            impact: [
              '睡眠质量差：失眠、多梦',
              '健康下降：慢性疾病',
              '夫妻关系紧张',
              '事业运势不佳',
            ],
            consequences: [
              '长期影响主人健康和运势',
              '夫妻感情恶化',
              '事业发展受阻',
            ],
            urgency: 4,
          });
        }
      }
    }

    return issues;
  }

  /**
   * 检查八字冲突
   */
  private static checkBaziConflicts(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): UrgentIssue[] {
    const issues: UrgentIssue[] = [];
    const { bazi } = input;

    // 检查向首方位与忌神的冲突
    const facingPalace = XuankongCalculator.degreesToPalace(
      input.house.facing
    ).palace;
    const facingElement = WarningSystem.getElementByPalace(facingPalace);

    if (bazi.unfavorableElements.includes(facingElement)) {
      const elementName = WarningSystem.getElementName(facingElement);
      issues.push({
        id: 'bazi-facing-conflict',
        severity: 'medium',
        title: '房屋朝向与您的八字忌神冲突',
        description: `您的房屋朝向五行为${elementName}，恰好是您八字中的忌神。长期居住会削弱您的运势，影响健康和事业。`,
        location: '房屋朝向',
        impact: [
          '个人运势受压制',
          '健康状况不佳',
          '事业发展受阻',
          '难以发挥个人优势',
        ],
        consequences: ['长期影响个人发展', '健康逐渐恶化', '事业难有起色'],
        urgency: 3,
      });
    }

    return issues;
  }

  // ==================== 辅助方法 ====================

  /**
   * 根据宫位获取五行
   */
  private static getElementByPalace(
    palace: number
  ): import('./personalized-engine').Element {
    const palaceElements: Record<
      number,
      import('./personalized-engine').Element
    > = {
      1: 'water',
      2: 'earth',
      3: 'wood',
      4: 'wood',
      5: 'earth',
      6: 'metal',
      7: 'metal',
      8: 'earth',
      9: 'fire',
    };
    return palaceElements[palace] || 'earth';
  }

  /**
   * 获取五行中文名
   */
  private static getElementName(
    element: import('./personalized-engine').Element
  ): string {
    const names: Record<import('./personalized-engine').Element, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    return names[element];
  }
}
