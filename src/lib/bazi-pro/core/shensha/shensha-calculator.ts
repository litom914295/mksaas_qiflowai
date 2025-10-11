/**
 * 神煞计算器
 * 负责计算和管理各种神煞（吉神、凶神）
 * 包括天乙贵人、文昌星、桃花星、驿马星等
 */

import { BaziChart, ShenSha, ShenShaType, ShenShaResult } from '../../types/index';

export interface ShenShaAnalysis {
  jiShen: ShenShaResult[];        // 吉神列表
  xiongShen: ShenShaResult[];      // 凶神列表
  summary: {
    totalJiShen: number;          // 吉神数量
    totalXiongShen: number;       // 凶神数量
    majorInfluences: string[];    // 主要影响
    recommendations: string[];    // 化解建议
  };
  details: Map<string, ShenShaResult>;  // 神煞详细信息映射
}

export class ShenShaCalculator {
  
  /**
   * 综合分析所有神煞
   */
  analyzeShenSha(chart: BaziChart): ShenShaAnalysis {
    const jiShen: ShenShaResult[] = [];
    const xiongShen: ShenShaResult[] = [];
    const details = new Map<string, ShenShaResult>();
    
    // 计算各种吉神
    this.calculateJiShen(chart, jiShen, details);
    
    // 计算各种凶神
    this.calculateXiongShen(chart, xiongShen, details);
    
    // 生成综合分析
    const summary = this.generateSummary(jiShen, xiongShen);
    
    return {
      jiShen,
      xiongShen,
      summary,
      details
    };
  }
  
  /**
   * 计算吉神
   */
  private calculateJiShen(
    chart: BaziChart, 
    jiShen: ShenShaResult[],
    details: Map<string, ShenShaResult>
  ): void {
    // 天乙贵人
    const tianYi = this.calculateTianYiGuiRen(chart);
    if (tianYi) {
      jiShen.push(tianYi);
      details.set('tianyi', tianYi);
    }
    
    // 文昌星
    const wenChang = this.calculateWenChang(chart);
    if (wenChang) {
      jiShen.push(wenChang);
      details.set('wenchang', wenChang);
    }
    
    // 天德贵人
    const tianDe = this.calculateTianDe(chart);
    if (tianDe) {
      jiShen.push(tianDe);
      details.set('tiande', tianDe);
    }
    
    // 月德贵人
    const yueDe = this.calculateYueDe(chart);
    if (yueDe) {
      jiShen.push(yueDe);
      details.set('yuede', yueDe);
    }
    
    // 福星贵人
    const fuXing = this.calculateFuXing(chart);
    if (fuXing) {
      jiShen.push(fuXing);
      details.set('fuxing', fuXing);
    }
    
    // 禄神
    const luShen = this.calculateLuShen(chart);
    if (luShen) {
      jiShen.push(luShen);
      details.set('lushen', luShen);
    }
    
    // 天厨贵人
    const tianChu = this.calculateTianChu(chart);
    if (tianChu) {
      jiShen.push(tianChu);
      details.set('tianchu', tianChu);
    }
    
    // 太极贵人
    const taiJi = this.calculateTaiJi(chart);
    if (taiJi) {
      jiShen.push(taiJi);
      details.set('taiji', taiJi);
    }
  }
  
  /**
   * 计算凶神
   */
  private calculateXiongShen(
    chart: BaziChart,
    xiongShen: ShenShaResult[],
    details: Map<string, ShenShaResult>
  ): void {
    // 羊刃
    const yangRen = this.calculateYangRen(chart);
    if (yangRen) {
      xiongShen.push(yangRen);
      details.set('yangren', yangRen);
    }
    
    // 亡神
    const wangShen = this.calculateWangShen(chart);
    if (wangShen) {
      xiongShen.push(wangShen);
      details.set('wangshen', wangShen);
    }
    
    // 劫煞
    const jieSha = this.calculateJieSha(chart);
    if (jieSha) {
      xiongShen.push(jieSha);
      details.set('jiesha', jieSha);
    }
    
    // 灾煞
    const zaiSha = this.calculateZaiSha(chart);
    if (zaiSha) {
      xiongShen.push(zaiSha);
      details.set('zaisha', zaiSha);
    }
    
    // 六厄
    const liuE = this.calculateLiuE(chart);
    if (liuE) {
      xiongShen.push(liuE);
      details.set('liue', liuE);
    }
    
    // 勾绞煞
    const gouJiao = this.calculateGouJiao(chart);
    if (gouJiao) {
      xiongShen.push(gouJiao);
      details.set('goujiao', gouJiao);
    }
    
    // 元辰
    const yuanChen = this.calculateYuanChen(chart);
    if (yuanChen) {
      xiongShen.push(yuanChen);
      details.set('yuanchen', yuanChen);
    }
    
    // 孤辰寡宿
    const guChen = this.calculateGuChenGuaSu(chart);
    if (guChen) {
      xiongShen.push(guChen);
      details.set('guchen', guChen);
    }
  }
  
  /**
   * 天乙贵人计算
   */
  private calculateTianYiGuiRen(chart: BaziChart): ShenShaResult | null {
    const dayMaster = chart.pillars.day.heavenlyStem;
    const tianYiMap: Record<string, string[]> = {
      '甲': ['丑', '未'],
      '戊': ['丑', '未'],
      '庚': ['丑', '未'],
      '乙': ['子', '申'],
      '己': ['子', '申'],
      '丙': ['亥', '酉'],
      '丁': ['亥', '酉'],
      '壬': ['卯', '巳'],
      '癸': ['卯', '巳'],
      '辛': ['寅', '午']
    };
    
    const tianYiBranches = tianYiMap[dayMaster] || [];
    const branches = [
      chart.pillars.year.earthlyBranch,
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    const found = branches.filter(b => tianYiBranches.includes(b));
    
    if (found.length > 0) {
      return {
        type: ShenShaType.JI_SHEN,
        name: '天乙贵人',
        description: '最吉之神，主贵人相助',
        location: found,
        strength: found.length * 30,
        effects: [
          '遇难呈祥',
          '贵人扶持',
          '化险为夷',
          '增加福气'
        ],
        advice: '多结善缘，贵人运强'
      };
    }
    
    return null;
  }
  
  /**
   * 文昌星计算
   */
  private calculateWenChang(chart: BaziChart): ShenShaResult | null {
    const dayMaster = chart.pillars.day.heavenlyStem;
    const wenChangMap: Record<string, string> = {
      '甲': '巳',
      '乙': '午',
      '丙': '申',
      '戊': '申',
      '丁': '酉',
      '己': '酉',
      '庚': '亥',
      '辛': '子',
      '壬': '寅',
      '癸': '卯'
    };
    
    const wenChangBranch = wenChangMap[dayMaster];
    const branches = [
      chart.pillars.year.earthlyBranch,
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    if (branches.includes(wenChangBranch)) {
      return {
        type: ShenShaType.JI_SHEN,
        name: '文昌星',
        description: '主聪明智慧，利学业',
        location: [wenChangBranch],
        strength: 25,
        effects: [
          '聪明伶俐',
          '学业有成',
          '文采出众',
          '考试顺利'
        ],
        advice: '适合从事文化教育相关工作'
      };
    }
    
    return null;
  }
  
  /**
   * 天德贵人计算
   */
  private calculateTianDe(chart: BaziChart): ShenShaResult | null {
    const monthBranch = chart.pillars.month.earthlyBranch;
    const tianDeMap: Record<string, string> = {
      '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛',
      '午': '亥', '未': '甲', '申': '癸', '酉': '寅',
      '戌': '丙', '亥': '乙', '子': '巳', '丑': '庚'
    };
    
    const tianDeStem = tianDeMap[monthBranch];
    const stems = [
      chart.pillars.year.heavenlyStem,
      chart.pillars.month.heavenlyStem,
      chart.pillars.day.heavenlyStem,
      chart.pillars.hour.heavenlyStem
    ];
    
    if (stems.includes(tianDeStem)) {
      return {
        type: ShenShaType.JI_SHEN,
        name: '天德贵人',
        description: '天之德神，主化凶为吉',
        location: [tianDeStem],
        strength: 28,
        effects: [
          '逢凶化吉',
          '福德深厚',
          '品德高尚',
          '受人敬重'
        ],
        advice: '积德行善，福报更深'
      };
    }
    
    return null;
  }
  
  /**
   * 月德贵人计算
   */
  private calculateYueDe(chart: BaziChart): ShenShaResult | null {
    const monthBranch = chart.pillars.month.earthlyBranch;
    const yueDeMap: Record<string, string> = {
      '寅': '丙', '卯': '甲', '辰': '壬', '巳': '庚',
      '午': '丙', '未': '甲', '申': '壬', '酉': '庚',
      '戌': '丙', '亥': '甲', '子': '壬', '丑': '庚'
    };
    
    const yueDeStem = yueDeMap[monthBranch];
    const stems = [
      chart.pillars.year.heavenlyStem,
      chart.pillars.month.heavenlyStem,
      chart.pillars.day.heavenlyStem,
      chart.pillars.hour.heavenlyStem
    ];
    
    if (stems.includes(yueDeStem)) {
      return {
        type: ShenShaType.JI_SHEN,
        name: '月德贵人',
        description: '月之德神，主福禄',
        location: [yueDeStem],
        strength: 25,
        effects: [
          '福禄双全',
          '平安吉祥',
          '贵人相助',
          '事业顺利'
        ],
        advice: '把握机遇，事业有成'
      };
    }
    
    return null;
  }
  
  /**
   * 福星贵人计算
   */
  private calculateFuXing(chart: BaziChart): ShenShaResult | null {
    const dayMaster = chart.pillars.day.heavenlyStem;
    const fuXingMap: Record<string, string> = {
      '甲': '寅', '乙': '卯', '丙': '巳', '戊': '巳',
      '丁': '午', '己': '午', '庚': '申', '辛': '酉',
      '壬': '亥', '癸': '子'
    };
    
    const fuXingBranch = fuXingMap[dayMaster];
    const branches = [
      chart.pillars.year.earthlyBranch,
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    if (branches.includes(fuXingBranch)) {
      return {
        type: ShenShaType.JI_SHEN,
        name: '福星贵人',
        description: '主福气深厚',
        location: [fuXingBranch],
        strength: 20,
        effects: [
          '福气深厚',
          '衣食无忧',
          '身体健康',
          '家庭和睦'
        ],
        advice: '知足常乐，福泽绵长'
      };
    }
    
    return null;
  }
  
  /**
   * 禄神计算
   */
  private calculateLuShen(chart: BaziChart): ShenShaResult | null {
    const dayMaster = chart.pillars.day.heavenlyStem;
    const luShenMap: Record<string, string> = {
      '甲': '寅', '乙': '卯', '丙': '巳', '戊': '巳',
      '丁': '午', '己': '午', '庚': '申', '辛': '酉',
      '壬': '亥', '癸': '子'
    };
    
    const luShenBranch = luShenMap[dayMaster];
    const branches = [
      chart.pillars.year.earthlyBranch,
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    const count = branches.filter(b => b === luShenBranch).length;
    
    if (count > 0) {
      return {
        type: ShenShaType.JI_SHEN,
        name: '禄神',
        description: '主财禄丰厚',
        location: [luShenBranch],
        strength: count * 22,
        effects: [
          '财源广进',
          '事业有成',
          '衣禄丰足',
          '地位提升'
        ],
        advice: '努力进取，财禄双收'
      };
    }
    
    return null;
  }
  
  /**
   * 天厨贵人计算
   */
  private calculateTianChu(chart: BaziChart): ShenShaResult | null {
    const dayMaster = chart.pillars.day.heavenlyStem;
    const tianChuMap: Record<string, string> = {
      '甲': '巳', '乙': '午', '丙': '巳', '丁': '午',
      '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
      '壬': '亥', '癸': '子'
    };
    
    const tianChuBranch = tianChuMap[dayMaster];
    const branches = [
      chart.pillars.year.earthlyBranch,
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    if (branches.includes(tianChuBranch)) {
      return {
        type: ShenShaType.JI_SHEN,
        name: '天厨贵人',
        description: '主衣食丰足',
        location: [tianChuBranch],
        strength: 18,
        effects: [
          '衣食无忧',
          '口福不浅',
          '生活富足',
          '享受人生'
        ],
        advice: '懂得享受，品味生活'
      };
    }
    
    return null;
  }
  
  /**
   * 太极贵人计算
   */
  private calculateTaiJi(chart: BaziChart): ShenShaResult | null {
    const dayMaster = chart.pillars.day.heavenlyStem;
    const taiJiMap: Record<string, string[]> = {
      '甲': ['子', '午'], '乙': ['子', '午'],
      '丙': ['卯', '酉'], '丁': ['卯', '酉'],
      '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
      '庚': ['寅', '亥'], '辛': ['寅', '亥'],
      '壬': ['申', '巳'], '癸': ['申', '巳']
    };
    
    const taiJiBranches = taiJiMap[dayMaster] || [];
    const branches = [
      chart.pillars.year.earthlyBranch,
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    const found = branches.filter(b => taiJiBranches.includes(b));
    
    if (found.length > 0) {
      return {
        type: ShenShaType.JI_SHEN,
        name: '太极贵人',
        description: '主聪明好学，悟性高',
        location: found,
        strength: found.length * 20,
        effects: [
          '聪明睿智',
          '悟性极高',
          '喜爱哲学',
          '追求真理'
        ],
        advice: '修身养性，追求智慧'
      };
    }
    
    return null;
  }
  
  /**
   * 羊刃计算
   */
  private calculateYangRen(chart: BaziChart): ShenShaResult | null {
    const dayMaster = chart.pillars.day.heavenlyStem;
    const yangRenMap: Record<string, string> = {
      '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳',
      '戊': '午', '己': '巳', '庚': '酉', '辛': '申',
      '壬': '子', '癸': '亥'
    };
    
    const yangRenBranch = yangRenMap[dayMaster];
    const branches = [
      chart.pillars.year.earthlyBranch,
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    const count = branches.filter(b => b === yangRenBranch).length;
    
    if (count > 0) {
      return {
        type: ShenShaType.XIONG_SHEN,
        name: '羊刃',
        description: '主性格刚烈，易有血光',
        location: [yangRenBranch],
        strength: count * 25,
        effects: [
          '性格刚烈',
          '容易冲动',
          '易有血光',
          '婚姻不顺'
        ],
        advice: '修身养性，控制脾气，佩戴护身符'
      };
    }
    
    return null;
  }
  
  /**
   * 亡神计算
   */
  private calculateWangShen(chart: BaziChart): ShenShaResult | null {
    const yearBranch = chart.pillars.year.earthlyBranch;
    const wangShenMap: Record<string, string> = {
      '申': '亥', '子': '亥', '辰': '亥',
      '巳': '申', '酉': '申', '丑': '申',
      '寅': '巳', '午': '巳', '戌': '巳',
      '亥': '寅', '卯': '寅', '未': '寅'
    };
    
    const wangShenBranch = wangShenMap[yearBranch];
    const branches = [
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    if (branches.includes(wangShenBranch)) {
      return {
        type: ShenShaType.XIONG_SHEN,
        name: '亡神',
        description: '主心神不定，多忧虑',
        location: [wangShenBranch],
        strength: 20,
        effects: [
          '心神不定',
          '精神压力',
          '容易焦虑',
          '睡眠不佳'
        ],
        advice: '静心修养，多做冥想，保持心态平和'
      };
    }
    
    return null;
  }
  
  /**
   * 劫煞计算
   */
  private calculateJieSha(chart: BaziChart): ShenShaResult | null {
    const yearBranch = chart.pillars.year.earthlyBranch;
    const jieShaMap: Record<string, string> = {
      '申': '巳', '子': '巳', '辰': '巳',
      '巳': '寅', '酉': '寅', '丑': '寅',
      '寅': '亥', '午': '亥', '戌': '亥',
      '亥': '申', '卯': '申', '未': '申'
    };
    
    const jieShaBranch = jieShaMap[yearBranch];
    const branches = [
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    if (branches.includes(jieShaBranch)) {
      return {
        type: ShenShaType.XIONG_SHEN,
        name: '劫煞',
        description: '主破财劫难',
        location: [jieShaBranch],
        strength: 22,
        effects: [
          '易遭劫难',
          '破财之象',
          '小人陷害',
          '意外损失'
        ],
        advice: '谨慎理财，防范小人，积德化解'
      };
    }
    
    return null;
  }
  
  /**
   * 灾煞计算
   */
  private calculateZaiSha(chart: BaziChart): ShenShaResult | null {
    const yearBranch = chart.pillars.year.earthlyBranch;
    const zaiShaMap: Record<string, string> = {
      '申': '午', '子': '午', '辰': '午',
      '巳': '卯', '酉': '卯', '丑': '卯',
      '寅': '子', '午': '子', '戌': '子',
      '亥': '酉', '卯': '酉', '未': '酉'
    };
    
    const zaiShaBranch = zaiShaMap[yearBranch];
    const branches = [
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    if (branches.includes(zaiShaBranch)) {
      return {
        type: ShenShaType.XIONG_SHEN,
        name: '灾煞',
        description: '主有灾祸意外',
        location: [zaiShaBranch],
        strength: 23,
        effects: [
          '易有灾祸',
          '意外伤害',
          '疾病缠身',
          '诸事不顺'
        ],
        advice: '注意安全，预防意外，多行善事化解'
      };
    }
    
    return null;
  }
  
  /**
   * 六厄计算
   */
  private calculateLiuE(chart: BaziChart): ShenShaResult | null {
    const yearBranch = chart.pillars.year.earthlyBranch;
    const liuEMap: Record<string, string> = {
      '子': '卯', '丑': '寅', '寅': '丑', '卯': '子',
      '辰': '亥', '巳': '戌', '午': '酉', '未': '申',
      '申': '未', '酉': '午', '戌': '巳', '亥': '辰'
    };
    
    const liuEBranch = liuEMap[yearBranch];
    const branches = [
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    if (branches.includes(liuEBranch)) {
      return {
        type: ShenShaType.XIONG_SHEN,
        name: '六厄',
        description: '主困厄阻碍',
        location: [liuEBranch],
        strength: 18,
        effects: [
          '诸事受阻',
          '困难重重',
          '进退两难',
          '运势低迷'
        ],
        advice: '耐心等待，稳步前进，不急不躁'
      };
    }
    
    return null;
  }
  
  /**
   * 勾绞煞计算
   */
  private calculateGouJiao(chart: BaziChart): ShenShaResult | null {
    const yearBranch = chart.pillars.year.earthlyBranch;
    const gouJiaoMap: Record<string, [string, string]> = {
      '子': ['卯', '酉'], '丑': ['辰', '戌'], '寅': ['巳', '亥'],
      '卯': ['午', '子'], '辰': ['未', '丑'], '巳': ['申', '寅'],
      '午': ['酉', '卯'], '未': ['戌', '辰'], '申': ['亥', '巳'],
      '酉': ['子', '午'], '戌': ['丑', '未'], '亥': ['寅', '申']
    };
    
    const [gou, jiao] = gouJiaoMap[yearBranch] || ['', ''];
    const branches = [
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    const hasGou = branches.includes(gou);
    const hasJiao = branches.includes(jiao);
    
    if (hasGou || hasJiao) {
      return {
        type: ShenShaType.XIONG_SHEN,
        name: '勾绞煞',
        description: '主官司是非，纠纷不断',
        location: [hasGou ? gou : '', hasJiao ? jiao : ''].filter(Boolean),
        strength: (hasGou ? 10 : 0) + (hasJiao ? 10 : 0),
        effects: [
          '官司缠身',
          '是非口舌',
          '纠纷不断',
          '人际不和'
        ],
        advice: '谨言慎行，与人为善，避免争执'
      };
    }
    
    return null;
  }
  
  /**
   * 元辰计算
   */
  private calculateYuanChen(chart: BaziChart): ShenShaResult | null {
    const yearBranch = chart.pillars.year.earthlyBranch;
    const gender = chart.gender || 'male';
    
    // 元辰对应关系（男女有别）
    const yuanChenMap: Record<string, Record<string, string>> = {
      'male': {
        '子': '未', '丑': '申', '寅': '酉', '卯': '戌',
        '辰': '亥', '巳': '子', '午': '丑', '未': '寅',
        '申': '卯', '酉': '辰', '戌': '巳', '亥': '午'
      },
      'female': {
        '子': '未', '丑': '午', '寅': '巳', '卯': '辰',
        '辰': '卯', '巳': '寅', '午': '丑', '未': '子',
        '申': '亥', '酉': '戌', '戌': '酉', '亥': '申'
      }
    };
    
    const yuanChenBranch = yuanChenMap[gender]?.[yearBranch];
    const branches = [
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    if (yuanChenBranch && branches.includes(yuanChenBranch)) {
      return {
        type: ShenShaType.XIONG_SHEN,
        name: '元辰',
        description: '主运势坎坷，多有阻碍',
        location: [yuanChenBranch],
        strength: 21,
        effects: [
          '运势坎坷',
          '多有阻碍',
          '计划难成',
          '身心疲惫'
        ],
        advice: '调整心态，坚持不懈，终见曙光'
      };
    }
    
    return null;
  }
  
  /**
   * 孤辰寡宿计算
   */
  private calculateGuChenGuaSu(chart: BaziChart): ShenShaResult | null {
    const yearBranch = chart.pillars.year.earthlyBranch;
    const guChenGuaSuMap: Record<string, [string, string]> = {
      '寅': ['巳', '丑'], '卯': ['巳', '丑'], '辰': ['巳', '丑'],
      '巳': ['申', '辰'], '午': ['申', '辰'], '未': ['申', '辰'],
      '申': ['亥', '未'], '酉': ['亥', '未'], '戌': ['亥', '未'],
      '亥': ['寅', '戌'], '子': ['寅', '戌'], '丑': ['寅', '戌']
    };
    
    const [guChen, guaSu] = guChenGuaSuMap[yearBranch] || ['', ''];
    const branches = [
      chart.pillars.month.earthlyBranch,
      chart.pillars.day.earthlyBranch,
      chart.pillars.hour.earthlyBranch
    ];
    
    const hasGuChen = branches.includes(guChen);
    const hasGuaSu = branches.includes(guaSu);
    
    if (hasGuChen || hasGuaSu) {
      const effects = [];
      const location = [];
      
      if (hasGuChen) {
        effects.push('男命孤独');
        location.push(guChen);
      }
      if (hasGuaSu) {
        effects.push('女命寡居');
        location.push(guaSu);
      }
      
      return {
        type: ShenShaType.XIONG_SHEN,
        name: hasGuChen && hasGuaSu ? '孤辰寡宿' : hasGuChen ? '孤辰' : '寡宿',
        description: '主孤独，婚姻不顺',
        location,
        strength: (hasGuChen ? 12 : 0) + (hasGuaSu ? 12 : 0),
        effects: [
          ...effects,
          '感情不顺',
          '晚婚迹象',
          '六亲缘薄'
        ],
        advice: '主动社交，广结善缘，珍惜感情'
      };
    }
    
    return null;
  }
  
  /**
   * 生成综合分析摘要
   */
  private generateSummary(
    jiShen: ShenShaResult[],
    xiongShen: ShenShaResult[]
  ): {
    totalJiShen: number;
    totalXiongShen: number;
    majorInfluences: string[];
    recommendations: string[];
  } {
    const totalJiShen = jiShen.length;
    const totalXiongShen = xiongShen.length;
    
    // 分析主要影响
    const majorInfluences: string[] = [];
    
    if (totalJiShen > totalXiongShen) {
      majorInfluences.push('吉神众多，福气深厚，运势向好');
    } else if (totalXiongShen > totalJiShen) {
      majorInfluences.push('凶神较多，需要注意化解，多行善事');
    } else {
      majorInfluences.push('吉凶平衡，顺势而为，把握机遇');
    }
    
    // 重点吉神影响
    const importantJiShen = ['天乙贵人', '天德贵人', '月德贵人'];
    jiShen.forEach(js => {
      if (importantJiShen.includes(js.name)) {
        majorInfluences.push(`${js.name}入命，${js.effects[0]}`);
      }
    });
    
    // 重点凶神影响
    const importantXiongShen = ['羊刃', '亡神', '劫煞'];
    xiongShen.forEach(xs => {
      if (importantXiongShen.includes(xs.name)) {
        majorInfluences.push(`${xs.name}入命，需注意${xs.effects[0]}`);
      }
    });
    
    // 生成建议
    const recommendations: string[] = [];
    
    // 综合建议
    if (totalJiShen >= 3) {
      recommendations.push('吉神护佑，宜积极进取，把握良机');
    }
    
    if (totalXiongShen >= 3) {
      recommendations.push('凶神较多，宜谨慎行事，多做善事化解');
    }
    
    // 特定化解建议
    if (xiongShen.some(xs => xs.name === '羊刃')) {
      recommendations.push('有羊刃入命，建议佩戴护身符，修身养性');
    }
    
    if (xiongShen.some(xs => xs.name === '孤辰' || xs.name === '寡宿')) {
      recommendations.push('感情方面需要主动，多参加社交活动');
    }
    
    if (jiShen.some(js => js.name === '文昌星')) {
      recommendations.push('文昌入命，适合学习深造，从事文化教育工作');
    }
    
    if (jiShen.some(js => js.name === '天乙贵人')) {
      recommendations.push('天乙贵人相助，多结善缘，贵人运强');
    }
    
    // 平衡建议
    recommendations.push('保持心态平和，顺应天时，积极向上');
    
    return {
      totalJiShen,
      totalXiongShen,
      majorInfluences,
      recommendations
    };
  }
}