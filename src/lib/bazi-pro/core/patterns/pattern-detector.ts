/**
 * 八字格局识别引擎
 * 识别各种复杂的八字格局，支持正格、变格、从格等多种格局判断
 */

import {
  type BaziChart,
  Element,
  PatternType as ImportedPatternType,
  type PatternDetail,
  PatternResult,
} from '../../types/index';
import { tenGodRelationAnalyzer } from '../analyzer/ten-gods-relations';
import { WuxingStrengthCalculator } from '../analyzer/wuxing-strength';

export interface PatternAnalysisResult {
  mainPattern: ImportedPatternType; // 主格局类型
  subPatterns: ImportedPatternType[]; // 辅助格局
  strength: number; // 格局纯粹度 (0-100)
  details: PatternDetail[]; // 详细分析
  recommendations: string[]; // 运用建议
  conflicts: string[]; // 格局冲突点
  potentials: string[]; // 发展潜力
}

export class PatternDetector {
  private strengthCalculator: typeof WuxingStrengthCalculator;
  private tenGods = tenGodRelationAnalyzer;

  constructor() {
    this.strengthCalculator = WuxingStrengthCalculator as any;
  }

  /**
   * 综合格局分析
   */
  analyzePatterns(chart: BaziChart): PatternAnalysisResult {
    // 计算日主强弱
    const dayMasterStrength =
      (this.strengthCalculator as any).calculateDayMasterStrength?.(chart) ??
      50;

    // 分析十神分布
    const tenGodsDistribution =
      (this.tenGods as any).analyzeTenGodRelations?.(chart, {} as any) ?? {};

    // 检测各种格局
    const patterns: PatternDetail[] = [];

    // 1. 正格检测
    const regularPattern = this.detectRegularPattern(
      chart,
      dayMasterStrength,
      tenGodsDistribution
    );
    if (regularPattern) patterns.push(regularPattern);

    // 2. 从格检测
    const followPattern = this.detectFollowPattern(chart, dayMasterStrength);
    if (followPattern) patterns.push(followPattern);

    // 3. 化格检测
    const transformPattern = this.detectTransformPattern(chart);
    if (transformPattern) patterns.push(transformPattern);

    // 4. 专旺格检测
    const dominantPattern = this.detectDominantPattern(
      chart,
      dayMasterStrength
    );
    if (dominantPattern) patterns.push(dominantPattern);

    // 5. 特殊格局检测
    const specialPatterns = this.detectSpecialPatterns(chart);
    patterns.push(...specialPatterns);

    // 确定主格局
    const mainPattern = this.determineMainPattern(patterns);
    const subPatterns = patterns
      .filter((p) => p.type !== mainPattern)
      .map((p) => p.type);

    // 计算格局纯粹度
    const strength = this.calculatePatternStrength(
      chart,
      mainPattern,
      patterns
    );

    // 生成建议和分析
    const recommendations = this.generateRecommendations(
      mainPattern,
      patterns,
      chart
    );
    const conflicts = this.identifyConflicts(patterns, chart);
    const potentials = this.analyzePotentials(mainPattern, chart);

    return {
      mainPattern,
      subPatterns,
      strength,
      details: patterns,
      recommendations,
      conflicts,
      potentials,
    };
  }

  /**
   * 检测正格（建禄格、月刃格、正财格、偏财格等）
   */
  private detectRegularPattern(
    chart: BaziChart,
    strength: number,
    tenGods: any
  ): PatternDetail | null {
    const monthBranch = chart.pillars.month.earthlyBranch;
    const dayMaster = chart.pillars.day.heavenlyStem;

    // 建禄格检测
    if (this.isJianLuPattern(dayMaster, monthBranch)) {
      return {
        type: ImportedPatternType.JIAN_LU,
        name: '建禄格',
        description: '日主临月支禄位，自身强旺有力',
        strength: 85,
        characteristics: ['自身能力强', '独立自主', '事业心重', '宜取财官为用'],
      };
    }

    // 月刃格检测
    if (this.isYueRenPattern(dayMaster, monthBranch)) {
      return {
        type: ImportedPatternType.YUE_REN,
        name: '月刃格',
        description: '日主月支逢羊刃，个性刚强',
        strength: 80,
        characteristics: ['性格刚烈', '行动力强', '竞争意识强', '需制化方显贵'],
      };
    }

    // 正官格检测
    if (tenGods.zhengGuan > 2 && strength >= 40 && strength <= 60) {
      return {
        type: ImportedPatternType.ZHENG_GUAN,
        name: '正官格',
        description: '正官透出有力，贵气十足',
        strength: 75,
        characteristics: ['品行端正', '有领导才能', '责任心强', '适合公职管理'],
      };
    }

    // 正财格检测
    if (tenGods.zhengCai > 2 && strength >= 50) {
      return {
        type: ImportedPatternType.ZHENG_CAI,
        name: '正财格',
        description: '正财透出有根，财运稳定',
        strength: 70,
        characteristics: ['理财能力强', '勤俭持家', '事业稳定', '财运亨通'],
      };
    }

    // 食神格检测
    if (tenGods.shiShen > 2 && strength >= 45) {
      return {
        type: ImportedPatternType.SHI_SHEN,
        name: '食神格',
        description: '食神透出有力，才华横溢',
        strength: 70,
        characteristics: ['才华出众', '心地善良', '享受生活', '适合艺术创作'],
      };
    }

    return null;
  }

  /**
   * 检测从格（从财、从官、从儿等）
   */
  private detectFollowPattern(
    chart: BaziChart,
    strength: number
  ): PatternDetail | null {
    // 日主极弱，小于20%
    if (strength > 20) return null;

    const dominantElement = this.findDominantElement(chart);
    const relationship = this.getElementRelationship(
      chart.pillars.day.heavenlyStem,
      dominantElement
    );

    switch (relationship) {
      case 'wealth':
        return {
          type: ImportedPatternType.CONG_CAI,
          name: '从财格',
          description: '日主极弱从财，宜顺从财势',
          strength: 75,
          characteristics: ['重视物质', '善于经营', '财运旺盛', '忌比劫帮身'],
        };

      case 'officer':
        return {
          type: ImportedPatternType.CONG_GUAN,
          name: '从官格',
          description: '日主极弱从官，贵人扶持',
          strength: 80,
          characteristics: ['依附贵人', '仕途顺遂', '地位尊贵', '忌印绶生身'],
        };

      case 'output':
        return {
          type: ImportedPatternType.CONG_ER,
          name: '从儿格',
          description: '日主极弱从食伤，才华出众',
          strength: 70,
          characteristics: ['才华横溢', '创造力强', '艺术天赋', '忌印克食伤'],
        };

      default:
        return null;
    }
  }

  /**
   * 检测化格（五种化格）
   */
  private detectTransformPattern(chart: BaziChart): PatternDetail | null {
    const heavenStems = [
      chart.pillars.year.heavenlyStem,
      chart.pillars.month.heavenlyStem,
      chart.pillars.day.heavenlyStem,
      chart.pillars.hour.heavenlyStem,
    ];

    // 甲己合化土
    if (this.hasTransform(heavenStems, '甲', '己', '土')) {
      return {
        type: ImportedPatternType.HUA_TU,
        name: '化土格',
        description: '甲己合化土格，稳重厚德',
        strength: 70,
        characteristics: ['性格稳重', '诚信可靠', '适合地产农业', '宜土运'],
      };
    }

    // 乙庚合化金
    if (this.hasTransform(heavenStems, '乙', '庚', '金')) {
      return {
        type: ImportedPatternType.HUA_JIN,
        name: '化金格',
        description: '乙庚合化金格，刚毅果断',
        strength: 70,
        characteristics: ['意志坚定', '执行力强', '适合金融军警', '宜金运'],
      };
    }

    // 其他化格类似...

    return null;
  }

  /**
   * 检测专旺格（曲直格、炎上格、稼穑格、从革格、润下格）
   */
  private detectDominantPattern(
    chart: BaziChart,
    strength: number
  ): PatternDetail | null {
    if (strength < 80) return null;

    const dayElement = this.getElementFromStem(chart.pillars.day.heavenlyStem);
    const elementCount = this.countElements(chart);

    // 曲直格（木专旺）
    if (dayElement === '木' && elementCount.木 >= 5) {
      return {
        type: ImportedPatternType.QU_ZHI,
        name: '曲直格',
        description: '木势专旺，生机勃勃',
        strength: 85,
        characteristics: ['生命力旺盛', '成长迅速', '适合教育医疗', '忌金克制'],
      };
    }

    // 炎上格（火专旺）
    if (dayElement === '火' && elementCount.火 >= 5) {
      return {
        type: ImportedPatternType.YAN_SHANG,
        name: '炎上格',
        description: '火势炎上，光明磊落',
        strength: 85,
        characteristics: ['热情洋溢', '创造力强', '适合文化艺术', '忌水克制'],
      };
    }

    // 其他专旺格类似...

    return null;
  }

  /**
   * 检测特殊格局（魁罡、金神、日贵等）
   */
  private detectSpecialPatterns(chart: BaziChart): PatternDetail[] {
    const patterns: PatternDetail[] = [];

    // 魁罡格检测
    if (this.isKuiGangPattern(chart)) {
      patterns.push({
        type: ImportedPatternType.KUI_GANG,
        name: '魁罡格',
        description: '魁罡入命，威武不凡',
        strength: 75,
        characteristics: ['性格刚强', '有威严', '执法能力强', '宜武职'],
      });
    }

    // 金神格检测
    if (this.isJinShenPattern(chart)) {
      patterns.push({
        type: ImportedPatternType.JIN_SHEN,
        name: '金神格',
        description: '金神入命，智勇双全',
        strength: 70,
        characteristics: ['聪明机智', '勇敢果断', '适合军警', '需火炼成器'],
      });
    }

    // 日贵格检测
    if (this.isRiGuiPattern(chart)) {
      patterns.push({
        type: ImportedPatternType.RI_GUI,
        name: '日贵格',
        description: '日坐天乙贵人，贵气天成',
        strength: 65,
        characteristics: ['品德高尚', '贵人相助', '地位尊贵', '一生顺遂'],
      });
    }

    return patterns;
  }

  /**
   * 辅助方法
   */
  private isJianLuPattern(dayMaster: string, monthBranch: string): boolean {
    const jianLuMap: Record<string, string> = {
      甲: '寅',
      乙: '卯',
      丙: '巳',
      丁: '午',
      戊: '巳',
      己: '午',
      庚: '申',
      辛: '酉',
      壬: '亥',
      癸: '子',
    };
    return jianLuMap[dayMaster] === monthBranch;
  }

  private isYueRenPattern(dayMaster: string, monthBranch: string): boolean {
    const yueRenMap: Record<string, string> = {
      甲: '卯',
      乙: '寅',
      丙: '午',
      丁: '巳',
      戊: '午',
      己: '巳',
      庚: '酉',
      辛: '申',
      壬: '子',
      癸: '亥',
    };
    return yueRenMap[dayMaster] === monthBranch;
  }

  private isKuiGangPattern(chart: BaziChart): boolean {
    const kuiGangDays = ['庚辰', '庚戌', '壬辰', '戊戌'];
    const dayPillar =
      chart.pillars.day.heavenlyStem + chart.pillars.day.earthlyBranch;
    return kuiGangDays.includes(dayPillar);
  }

  private isJinShenPattern(chart: BaziChart): boolean {
    const jinShenDays = ['甲午', '甲寅', '己巳', '己酉'];
    const dayPillar =
      chart.pillars.day.heavenlyStem + chart.pillars.day.earthlyBranch;
    return jinShenDays.includes(dayPillar);
  }

  private isRiGuiPattern(chart: BaziChart): boolean {
    const riGuiDays = ['丁酉', '丁亥', '癸卯', '癸巳'];
    const dayPillar =
      chart.pillars.day.heavenlyStem + chart.pillars.day.earthlyBranch;
    return riGuiDays.includes(dayPillar);
  }

  private hasTransform(
    stems: string[],
    stem1: string,
    stem2: string,
    element: string
  ): boolean {
    return stems.includes(stem1) && stems.includes(stem2);
  }

  private findDominantElement(chart: BaziChart): string {
    const elements = this.countElements(chart);
    return Object.entries(elements).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }

  private getElementRelationship(dayMaster: string, element: string): string {
    // 简化的五行关系判断
    const dayElement = this.getElementFromStem(dayMaster);
    const relationships = {
      木: { 火: 'output', 土: 'wealth', 金: 'officer', 水: 'resource' },
      火: { 土: 'output', 金: 'wealth', 水: 'officer', 木: 'resource' },
      土: { 金: 'output', 水: 'wealth', 木: 'officer', 火: 'resource' },
      金: { 水: 'output', 木: 'wealth', 火: 'officer', 土: 'resource' },
      水: { 木: 'output', 火: 'wealth', 土: 'officer', 金: 'resource' },
    };
    return (relationships as any)[dayElement]?.[element] || 'none';
  }

  private getElementFromStem(stem: string): string {
    const stemElements: Record<string, string> = {
      甲: '木',
      乙: '木',
      丙: '火',
      丁: '火',
      戊: '土',
      己: '土',
      庚: '金',
      辛: '金',
      壬: '水',
      癸: '水',
    };
    return stemElements[stem] || '土';
  }

  private countElements(chart: BaziChart): Record<string, number> {
    const count: Record<string, number> = {
      木: 0,
      火: 0,
      土: 0,
      金: 0,
      水: 0,
    };

    // 统计四柱八字中的五行
    Object.values(chart.pillars).forEach((pillar) => {
      const stemElement = this.getElementFromStem(pillar.heavenlyStem);
      const branchElement = this.getElementFromBranch(pillar.earthlyBranch);
      count[stemElement]++;
      count[branchElement]++;
    });

    return count;
  }

  private getElementFromBranch(branch: string): string {
    const branchElements: Record<string, string> = {
      子: '水',
      丑: '土',
      寅: '木',
      卯: '木',
      辰: '土',
      巳: '火',
      午: '火',
      未: '土',
      申: '金',
      酉: '金',
      戌: '土',
      亥: '水',
    };
    return branchElements[branch] || '土';
  }

  private determineMainPattern(patterns: PatternDetail[]): PatternType {
    if (patterns.length === 0) return ImportedPatternType.NORMAL;

    // 按强度排序，选择最强的格局
    patterns.sort((a, b) => b.strength - a.strength);
    return patterns[0].type;
  }

  private calculatePatternStrength(
    chart: BaziChart,
    mainPattern: PatternType,
    patterns: PatternDetail[]
  ): number {
    // 基础强度
    let strength = 50;

    // 主格局强度
    const mainPatternDetail = patterns.find((p) => p.type === mainPattern);
    if (mainPatternDetail) {
      strength = mainPatternDetail.strength;
    }

    // 格局冲突减分
    if (patterns.length > 2) {
      strength -= (patterns.length - 2) * 5;
    }

    // 格局纯粹度加分
    if (patterns.length === 1) {
      strength += 10;
    }

    return Math.max(0, Math.min(100, strength));
  }

  private generateRecommendations(
    mainPattern: PatternType,
    patterns: PatternDetail[],
    chart: BaziChart
  ): string[] {
    const recommendations: string[] = [];

    const mainPatternDetail = patterns.find((p) => p.type === mainPattern);
    if (mainPatternDetail) {
      recommendations.push(
        `您的命格为${mainPatternDetail.name}，${mainPatternDetail.description}`
      );
      recommendations.push(
        ...mainPatternDetail.characteristics.map((c) => `• ${c}`)
      );
    }

    // 根据格局类型给出具体建议
    switch (mainPattern) {
      case ImportedPatternType.JIAN_LU:
      case ImportedPatternType.YUE_REN:
        recommendations.push('建议：身强宜泄，可取食伤生财为用');
        recommendations.push('事业：适合自主创业或担任管理职位');
        break;

      case ImportedPatternType.CONG_CAI:
        recommendations.push('建议：顺从财势，以财为用神');
        recommendations.push('事业：适合经商、投资理财等与财富相关的领域');
        break;

      case ImportedPatternType.CONG_GUAN:
        recommendations.push('建议：依附贵人，以官为用神');
        recommendations.push('事业：适合公职、大企业等稳定的工作环境');
        break;

      default:
        recommendations.push('建议：保持平衡，顺应天时');
    }

    return recommendations;
  }

  private identifyConflicts(
    patterns: PatternDetail[],
    chart: BaziChart
  ): string[] {
    const conflicts: string[] = [];

    // 检查格局之间的冲突
    if (
      patterns.some((p) => p.type === ImportedPatternType.JIAN_LU) &&
      patterns.some((p) => p.type === ImportedPatternType.CONG_CAI)
    ) {
      conflicts.push('身强格局与从财格局存在冲突，需要仔细判断主格');
    }

    // 检查地支相冲
    const branches = [
      chart.pillars.year.earthlyBranch,
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch,
    ];

    const clashPairs = [
      ['子', '午'],
      ['丑', '未'],
      ['寅', '申'],
      ['卯', '酉'],
      ['辰', '戌'],
      ['巳', '亥'],
    ];

    clashPairs.forEach(([b1, b2]) => {
      if (branches.includes(b1 as any) && branches.includes(b2 as any)) {
        conflicts.push(`地支${b1}${b2}相冲，影响格局稳定性`);
      }
    });

    return conflicts;
  }

  private analyzePotentials(
    mainPattern: PatternType,
    chart: BaziChart
  ): string[] {
    const potentials: string[] = [];

    switch (mainPattern) {
      case ImportedPatternType.JIAN_LU:
      case ImportedPatternType.YUE_REN:
        potentials.push('领导潜力：具备天生的领导才能');
        potentials.push('创业潜力：适合自主创业，开创事业');
        potentials.push('管理潜力：善于管理和组织');
        break;

      case ImportedPatternType.ZHENG_GUAN:
        potentials.push('仕途潜力：适合走仕途，担任公职');
        potentials.push('管理潜力：具备优秀的管理能力');
        potentials.push('信誉潜力：容易获得他人信任');
        break;

      case ImportedPatternType.ZHENG_CAI:
        potentials.push('理财潜力：天生的理财能手');
        potentials.push('经商潜力：适合经商，财运亨通');
        potentials.push('投资潜力：投资眼光独到');
        break;

      case ImportedPatternType.SHI_SHEN:
        potentials.push('创作潜力：具备艺术创作天赋');
        potentials.push('表达潜力：口才出众，表达能力强');
        potentials.push('享受潜力：懂得享受生活');
        break;

      default:
        potentials.push('发展潜力：顺应天时，把握机遇');
    }

    return potentials;
  }
}

// 导出格局类型枚举
export enum PatternType {
  NORMAL = 'normal', // 普通格局

  // 正格
  JIAN_LU = 'jianlu', // 建禄格
  YUE_REN = 'yueren', // 月刃格
  ZHENG_GUAN = 'zhengguan', // 正官格
  QI_SHA = 'qisha', // 七杀格
  ZHENG_CAI = 'zhengcai', // 正财格
  PIAN_CAI = 'piancai', // 偏财格
  ZHENG_YIN = 'zhengyin', // 正印格
  PIAN_YIN = 'pianyin', // 偏印格
  SHI_SHEN = 'shishen', // 食神格
  SHANG_GUAN = 'shangguan', // 伤官格

  // 从格
  CONG_CAI = 'congcai', // 从财格
  CONG_GUAN = 'congguan', // 从官格
  CONG_ER = 'conger', // 从儿格
  CONG_SHI = 'congshi', // 从势格

  // 化格
  HUA_TU = 'huatu', // 化土格
  HUA_JIN = 'huajin', // 化金格
  HUA_SHUI = 'huashui', // 化水格
  HUA_MU = 'huamu', // 化木格
  HUA_HUO = 'huahuo', // 化火格

  // 专旺格
  QU_ZHI = 'quzhi', // 曲直格
  YAN_SHANG = 'yanshang', // 炎上格
  JIA_SE = 'jiase', // 稼穑格
  CONG_GE = 'congge', // 从革格
  RUN_XIA = 'runxia', // 润下格

  // 特殊格局
  KUI_GANG = 'kuigang', // 魁罡格
  JIN_SHEN = 'jinshen', // 金神格
  RI_GUI = 'rigui', // 日贵格
  LU_MA = 'luma', // 禄马格
  TIAN_YI = 'tianyi', // 天乙格
}
