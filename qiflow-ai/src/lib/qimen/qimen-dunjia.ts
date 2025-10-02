/**
 * QiFlow AI - 奇门遁甲分析模块
 * 
 * 实现奇门遁甲的排盘、分析和预测功能
 */

/**
 * 九宫定义
 */
export enum Palace {
  坎一宫 = 1,  // 北方，水
  坤二宫 = 2,  // 西南，土
  震三宫 = 3,  // 东方，木
  巽四宫 = 4,  // 东南，木
  中五宫 = 5,  // 中央，土
  乾六宫 = 6,  // 西北，金
  兑七宫 = 7,  // 西方，金
  艮八宫 = 8,  // 东北，土
  离九宫 = 9   // 南方，火
}

/**
 * 八门定义
 */
export enum Gate {
  休门 = '休门',  // 吉门，主休息、和合
  生门 = '生门',  // 吉门，主生财、生机
  伤门 = '伤门',  // 凶门，主受伤、损失
  杜门 = '杜门',  // 中平，主闭塞、隐藏
  景门 = '景门',  // 吉门，主文书、消息
  死门 = '死门',  // 凶门，主死亡、凶险
  惊门 = '惊门',  // 凶门，主惊恐、官非
  开门 = '开门'   // 吉门，主开始、通达
}

/**
 * 九星定义
 */
export enum Star {
  天蓬星 = '天蓬星',  // 凶星，主贼盗
  天任星 = '天任星',  // 吉星，主任用
  天冲星 = '天冲星',  // 吉星，主冲动
  天辅星 = '天辅星',  // 吉星，主辅助
  天英星 = '天英星',  // 中平，主文昌
  天芮星 = '天芮星',  // 凶星，主疾病
  天柱星 = '天柱星',  // 凶星，主口舌
  天心星 = '天心星'   // 吉星，主医药
}

/**
 * 八神定义
 */
export enum God {
  值符 = '值符',    // 主神，大吉
  螣蛇 = '螣蛇',    // 主虚惊、怪异
  太阴 = '太阴',    // 主隐私、阴谋
  六合 = '六合',    // 主和合、婚姻
  白虎 = '白虎',    // 主凶伤、血光
  玄武 = '玄武',    // 主盗贼、暗昧
  九地 = '九地',    // 主阴暗、坟墓
  九天 = '九天'     // 主高远、贵人
}

/**
 * 奇门遁甲盘面
 */
export interface QimenChart {
  year: number;
  month: number;
  day: number;
  hour: number;
  
  // 局数信息
  bureau: {
    type: '阳遁' | '阴遁';
    number: number;  // 1-9局
    element: string;  // 局的五行
  };
  
  // 九宫信息
  palaces: Map<Palace, PalaceInfo>;
  
  // 时辰信息
  timeInfo: {
    符头: string;
    值使: Gate;
    值符: Star;
    空亡: string[];
  };
  
  // 分析结果
  analysis: {
    overall: string;
    suggestions: string[];
    warnings: string[];
  };
}

/**
 * 宫位信息
 */
export interface PalaceInfo {
  palace: Palace;
  gate: Gate;
  star: Star;
  god: God;
  stem: string;      // 天干
  element: string;    // 五行
  
  // 吉凶判断
  fortune: {
    level: '大吉' | '吉' | '平' | '凶' | '大凶';
    score: number;  // -100 到 100
    description: string;
  };
}

/**
 * 奇门遁甲计算器
 */
export class QimenCalculator {
  private readonly 地支 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  private readonly 天干 = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  
  // 八门原始位置
  private readonly gatePositions: Map<Palace, Gate> = new Map([
    [Palace.坎一宫, Gate.休门],
    [Palace.坤二宫, Gate.死门],
    [Palace.震三宫, Gate.伤门],
    [Palace.巽四宫, Gate.杜门],
    [Palace.中五宫, Gate.死门],  // 中宫寄坤二宫
    [Palace.乾六宫, Gate.开门],
    [Palace.兑七宫, Gate.惊门],
    [Palace.艮八宫, Gate.生门],
    [Palace.离九宫, Gate.景门]
  ]);
  
  // 九星原始位置
  private readonly starPositions: Map<Palace, Star> = new Map([
    [Palace.坎一宫, Star.天蓬星],
    [Palace.坤二宫, Star.天芮星],
    [Palace.震三宫, Star.天冲星],
    [Palace.巽四宫, Star.天辅星],
    [Palace.中五宫, Star.天芮星],  // 中宫寄坤二宫
    [Palace.乾六宫, Star.天心星],
    [Palace.兑七宫, Star.天柱星],
    [Palace.艮八宫, Star.天任星],
    [Palace.离九宫, Star.天英星]
  ]);
  
  // 八神顺序
  private readonly godOrder = [
    God.值符, God.螣蛇, God.太阴, God.六合,
    God.白虎, God.玄武, God.九地, God.九天
  ];
  
  /**
   * 起局
   */
  calculateChart(date: Date): QimenChart {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    
    // 确定阴阳遁和局数
    const bureau = this.determineBureau(date);
    
    // 计算九宫状态
    const palaces = this.calculatePalaces(bureau, date);
    
    // 计算时辰信息
    const timeInfo = this.calculateTimeInfo(date, bureau);
    
    // 综合分析
    const analysis = this.analyzeChart(palaces, timeInfo);
    
    return {
      year,
      month,
      day,
      hour,
      bureau,
      palaces,
      timeInfo,
      analysis
    };
  }
  
  /**
   * 确定局数
   */
  private determineBureau(date: Date): QimenChart['bureau'] {
    // 根据节气确定阴阳遁
    const solarTerm = this.getSolarTerm(date);
    const isYang = this.isYangDun(solarTerm);
    
    // 根据日干支确定局数
    const dayGanZhi = this.getDayGanZhi(date);
    const bureauNumber = this.calculateBureauNumber(dayGanZhi, isYang);
    
    // 确定局的五行
    const element = this.getBureauElement(bureauNumber);
    
    return {
      type: isYang ? '阳遁' : '阴遁',
      number: bureauNumber,
      element
    };
  }
  
  /**
   * 计算九宫状态
   */
  private calculatePalaces(
    bureau: QimenChart['bureau'],
    date: Date
  ): Map<Palace, PalaceInfo> {
    const palaces = new Map<Palace, PalaceInfo>();
    
    // 计算值符和值使
    const { 值符宫, 值使宫 } = this.calculate值符值使(date, bureau);
    
    // 遍历九宫
    for (let i = 1; i <= 9; i++) {
      const palace = i as Palace;
      
      // 计算该宫的八门
      const gate = this.calculateGateForPalace(palace, bureau, 值使宫);
      
      // 计算该宫的九星
      const star = this.calculateStarForPalace(palace, bureau, 值符宫);
      
      // 计算该宫的八神
      const god = this.calculateGodForPalace(palace, date);
      
      // 计算该宫的天干
      const stem = this.calculateStemForPalace(palace, bureau);
      
      // 获取宫位五行
      const element = this.getPalaceElement(palace);
      
      // 判断吉凶
      const fortune = this.judgeFortune(palace, gate, star, god, stem);
      
      palaces.set(palace, {
        palace,
        gate,
        star,
        god,
        stem,
        element,
        fortune
      });
    }
    
    return palaces;
  }
  
  /**
   * 计算时辰信息
   */
  private calculateTimeInfo(
    date: Date,
    bureau: QimenChart['bureau']
  ): QimenChart['timeInfo'] {
    const hour = date.getHours();
    const 时支 = this.地支[Math.floor((hour + 1) / 2) % 12];
    
    // 计算符头（时干）
    const 符头 = this.calculate时干(date);
    
    // 根据局数和时辰确定值使门和值符星
    const { 值使, 值符 } = this.calculate值使值符(bureau, 时支);
    
    // 计算空亡
    const 空亡 = this.calculate空亡(date);
    
    return {
      符头,
      值使,
      值符,
      空亡
    };
  }
  
  /**
   * 综合分析
   */
  private analyzeChart(
    palaces: Map<Palace, PalaceInfo>,
    timeInfo: QimenChart['timeInfo']
  ): QimenChart['analysis'] {
    let totalScore = 0;
    const suggestions: string[] = [];
    const warnings: string[] = [];
    
    // 分析各宫吉凶
    palaces.forEach((info, palace) => {
      totalScore += info.fortune.score;
      
      // 找出大吉宫位
      if (info.fortune.level === '大吉') {
        suggestions.push(`${this.getPalaceName(palace)}大吉，宜${this.getGateSuggestion(info.gate)}`);
      }
      
      // 找出大凶宫位
      if (info.fortune.level === '大凶') {
        warnings.push(`${this.getPalaceName(palace)}大凶，忌${this.getGateWarning(info.gate)}`);
      }
    });
    
    // 分析值使门
    const 值使建议 = this.analyze值使(timeInfo.值使);
    if (值使建议) suggestions.push(值使建议);
    
    // 分析空亡
    if (timeInfo.空亡.length > 0) {
      warnings.push(`空亡在${timeInfo.空亡.join('、')}，此方位不宜行动`);
    }
    
    // 综合判断
    const avgScore = totalScore / palaces.size;
    let overall = '';
    
    if (avgScore >= 60) {
      overall = '大吉之局，诸事顺遂，宜积极进取';
    } else if (avgScore >= 30) {
      overall = '吉局，运势良好，可稳步推进';
    } else if (avgScore >= 0) {
      overall = '平局，吉凶参半，需谨慎行事';
    } else if (avgScore >= -30) {
      overall = '小凶之局，多有阻碍，宜静待时机';
    } else {
      overall = '大凶之局，诸事不宜，应韬光养晦';
    }
    
    return {
      overall,
      suggestions,
      warnings
    };
  }
  
  /**
   * 辅助方法：获取节气
   */
  private getSolarTerm(date: Date): string {
    // 简化实现，实际应根据精确的节气算法
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const solarTerms = [
      { month: 1, day: 6, term: '小寒' },
      { month: 1, day: 20, term: '大寒' },
      { month: 2, day: 4, term: '立春' },
      { month: 2, day: 19, term: '雨水' },
      { month: 3, day: 6, term: '惊蛰' },
      { month: 3, day: 21, term: '春分' },
      { month: 4, day: 5, term: '清明' },
      { month: 4, day: 20, term: '谷雨' },
      { month: 5, day: 6, term: '立夏' },
      { month: 5, day: 21, term: '小满' },
      { month: 6, day: 6, term: '芒种' },
      { month: 6, day: 21, term: '夏至' },
      { month: 7, day: 7, term: '小暑' },
      { month: 7, day: 23, term: '大暑' },
      { month: 8, day: 8, term: '立秋' },
      { month: 8, day: 23, term: '处暑' },
      { month: 9, day: 8, term: '白露' },
      { month: 9, day: 23, term: '秋分' },
      { month: 10, day: 8, term: '寒露' },
      { month: 10, day: 24, term: '霜降' },
      { month: 11, day: 8, term: '立冬' },
      { month: 11, day: 22, term: '小雪' },
      { month: 12, day: 7, term: '大雪' },
      { month: 12, day: 22, term: '冬至' }
    ];
    
    // 找到最近的节气
    for (let i = solarTerms.length - 1; i >= 0; i--) {
      const term = solarTerms[i];
      if (month > term.month || (month === term.month && day >= term.day)) {
        return term.term;
      }
    }
    
    return '冬至';  // 默认
  }
  
  /**
   * 判断是否阳遁
   */
  private isYangDun(solarTerm: string): boolean {
    const yangTerms = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满'];
    return yangTerms.includes(solarTerm);
  }
  
  /**
   * 计算局数
   */
  private calculateBureauNumber(dayGanZhi: string, isYang: boolean): number {
    // 简化计算，实际应根据六十甲子和符头
    const ganIndex = this.天干.indexOf(dayGanZhi[0]);
    const zhiIndex = this.地支.indexOf(dayGanZhi[1]);
    
    let bureau = ((ganIndex + zhiIndex) % 9) + 1;
    
    // 阴遁逆排
    if (!isYang) {
      bureau = 10 - bureau;
      if (bureau <= 0) bureau += 9;
    }
    
    return bureau;
  }
  
  /**
   * 获取日干支
   */
  private getDayGanZhi(date: Date): string {
    // 简化实现
    const baseDate = new Date(2024, 0, 1);  // 甲辰年甲子日
    const daysDiff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const ganIndex = daysDiff % 10;
    const zhiIndex = daysDiff % 12;
    
    return this.天干[ganIndex] + this.地支[zhiIndex];
  }
  
  /**
   * 获取局的五行
   */
  private getBureauElement(bureauNumber: number): string {
    const elements = ['水', '土', '木', '木', '土', '金', '金', '土', '火'];
    return elements[bureauNumber - 1];
  }
  
  /**
   * 计算值符值使宫位
   */
  private calculate值符值使(date: Date, bureau: QimenChart['bureau']): { 值符宫: Palace; 值使宫: Palace } {
    const hour = date.getHours();
    const 时支Index = Math.floor((hour + 1) / 2) % 12;
    
    // 根据局数和时支确定值符值使
    let 值符宫 = ((bureau.number + 时支Index) % 9) || 9;
    let 值使宫 = 值符宫;
    
    // 阴遁逆行
    if (bureau.type === '阴遁') {
      值符宫 = 10 - 值符宫;
      if (值符宫 <= 0) 值符宫 += 9;
      值使宫 = 值符宫;
    }
    
    return {
      值符宫: 值符宫 as Palace,
      值使宫: 值使宫 as Palace
    };
  }
  
  /**
   * 计算宫位的八门
   */
  private calculateGateForPalace(
    palace: Palace,
    bureau: QimenChart['bureau'],
    值使宫: Palace
  ): Gate {
    // 获取原始门位
    let gate = this.gatePositions.get(palace)!;
    
    // 根据值使门转动
    const rotation = (值使宫 - Palace.坎一宫 + 9) % 9;
    const gates = Array.from(this.gatePositions.values());
    const index = gates.indexOf(gate);
    const newIndex = (index + rotation) % gates.length;
    
    return gates[newIndex];
  }
  
  /**
   * 计算宫位的九星
   */
  private calculateStarForPalace(
    palace: Palace,
    bureau: QimenChart['bureau'],
    值符宫: Palace
  ): Star {
    // 获取原始星位
    let star = this.starPositions.get(palace)!;
    
    // 根据值符星转动
    const rotation = (值符宫 - Palace.坎一宫 + 9) % 9;
    const stars = Array.from(this.starPositions.values());
    const index = stars.indexOf(star);
    const newIndex = (index + rotation) % stars.length;
    
    return stars[newIndex];
  }
  
  /**
   * 计算宫位的八神
   */
  private calculateGodForPalace(palace: Palace, date: Date): God {
    const hour = date.getHours();
    const godIndex = (palace + Math.floor(hour / 3)) % 8;
    return this.godOrder[godIndex];
  }
  
  /**
   * 计算宫位的天干
   */
  private calculateStemForPalace(palace: Palace, bureau: QimenChart['bureau']): string {
    // 根据局数确定天干
    const stemIndex = (palace + bureau.number - 1) % 10;
    return this.天干[stemIndex];
  }
  
  /**
   * 获取宫位五行
   */
  private getPalaceElement(palace: Palace): string {
    const elements: Record<Palace, string> = {
      [Palace.坎一宫]: '水',
      [Palace.坤二宫]: '土',
      [Palace.震三宫]: '木',
      [Palace.巽四宫]: '木',
      [Palace.中五宫]: '土',
      [Palace.乾六宫]: '金',
      [Palace.兑七宫]: '金',
      [Palace.艮八宫]: '土',
      [Palace.离九宫]: '火'
    };
    return elements[palace];
  }
  
  /**
   * 判断吉凶
   */
  private judgeFortune(
    palace: Palace,
    gate: Gate,
    star: Star,
    god: God,
    stem: string
  ): PalaceInfo['fortune'] {
    let score = 0;
    let factors: string[] = [];
    
    // 判断门的吉凶
    const gateScore = this.getGateScore(gate);
    score += gateScore;
    factors.push(`${gate}(${gateScore > 0 ? '+' : ''}${gateScore})`);
    
    // 判断星的吉凶
    const starScore = this.getStarScore(star);
    score += starScore;
    factors.push(`${star}(${starScore > 0 ? '+' : ''}${starScore})`);
    
    // 判断神的吉凶
    const godScore = this.getGodScore(god);
    score += godScore;
    factors.push(`${god}(${godScore > 0 ? '+' : ''}${godScore})`);
    
    // 判断生克关系
    const elementScore = this.judgeElementRelation(palace, gate, star);
    score += elementScore;
    if (elementScore !== 0) {
      factors.push(`五行(${elementScore > 0 ? '+' : ''}${elementScore})`);
    }
    
    // 确定等级
    let level: PalaceInfo['fortune']['level'];
    if (score >= 60) {
      level = '大吉';
    } else if (score >= 30) {
      level = '吉';
    } else if (score >= -30) {
      level = '平';
    } else if (score >= -60) {
      level = '凶';
    } else {
      level = '大凶';
    }
    
    const description = factors.join('，');
    
    return {
      level,
      score,
      description
    };
  }
  
  /**
   * 获取门的吉凶分数
   */
  private getGateScore(gate: Gate): number {
    const scores: Record<Gate, number> = {
      [Gate.开门]: 30,
      [Gate.休门]: 25,
      [Gate.生门]: 25,
      [Gate.景门]: 20,
      [Gate.杜门]: 0,
      [Gate.伤门]: -20,
      [Gate.惊门]: -25,
      [Gate.死门]: -30
    };
    return scores[gate];
  }
  
  /**
   * 获取星的吉凶分数
   */
  private getStarScore(star: Star): number {
    const scores: Record<Star, number> = {
      [Star.天心星]: 25,
      [Star.天任星]: 20,
      [Star.天辅星]: 20,
      [Star.天冲星]: 15,
      [Star.天英星]: 0,
      [Star.天柱星]: -15,
      [Star.天芮星]: -20,
      [Star.天蓬星]: -25
    };
    return scores[star];
  }
  
  /**
   * 获取神的吉凶分数
   */
  private getGodScore(god: God): number {
    const scores: Record<God, number> = {
      [God.值符]: 30,
      [God.九天]: 20,
      [God.六合]: 15,
      [God.太阴]: 5,
      [God.九地]: -5,
      [God.玄武]: -15,
      [God.螣蛇]: -20,
      [God.白虎]: -25
    };
    return scores[god];
  }
  
  /**
   * 判断五行生克关系
   */
  private judgeElementRelation(palace: Palace, gate: Gate, star: Star): number {
    // 简化实现，实际应详细分析五行生克
    const palaceElement = this.getPalaceElement(palace);
    
    // 这里简单判断
    if (palaceElement === '土' && gate === Gate.生门) {
      return 10;  // 土得生门，吉
    }
    if (palaceElement === '金' && gate === Gate.开门) {
      return 10;  // 金得开门，吉
    }
    if (palaceElement === '水' && gate === Gate.休门) {
      return 10;  // 水得休门，吉
    }
    
    return 0;
  }
  
  /**
   * 计算时干
   */
  private calculate时干(date: Date): string {
    const dayGanZhi = this.getDayGanZhi(date);
    const dayGan = dayGanZhi[0];
    const dayGanIndex = this.天干.indexOf(dayGan);
    
    const hour = date.getHours();
    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    
    // 根据日干起时干
    const 时干Index = (dayGanIndex * 2 + hourIndex) % 10;
    return this.天干[时干Index];
  }
  
  /**
   * 计算值使值符
   */
  private calculate值使值符(
    bureau: QimenChart['bureau'],
    时支: string
  ): { 值使: Gate; 值符: Star } {
    const zhiIndex = this.地支.indexOf(时支);
    
    // 根据局数和时支确定
    const gateIndex = (bureau.number + zhiIndex) % 8;
    const starIndex = (bureau.number + zhiIndex) % 9;
    
    const gates = [Gate.休门, Gate.死门, Gate.伤门, Gate.杜门, Gate.开门, Gate.惊门, Gate.生门, Gate.景门];
    const stars = Array.from(this.starPositions.values());
    
    return {
      值使: gates[gateIndex],
      值符: stars[starIndex]
    };
  }
  
  /**
   * 计算空亡
   */
  private calculate空亡(date: Date): string[] {
    const dayGanZhi = this.getDayGanZhi(date);
    const ganIndex = this.天干.indexOf(dayGanZhi[0]);
    const zhiIndex = this.地支.indexOf(dayGanZhi[1]);
    
    // 计算旬空
    const 旬首 = (zhiIndex - ganIndex + 12) % 12;
    const 空亡1 = this.地支[(旬首 + 10) % 12];
    const 空亡2 = this.地支[(旬首 + 11) % 12];
    
    return [空亡1, 空亡2];
  }
  
  /**
   * 获取宫位名称
   */
  private getPalaceName(palace: Palace): string {
    const names: Record<Palace, string> = {
      [Palace.坎一宫]: '坎一宫(北)',
      [Palace.坤二宫]: '坤二宫(西南)',
      [Palace.震三宫]: '震三宫(东)',
      [Palace.巽四宫]: '巽四宫(东南)',
      [Palace.中五宫]: '中五宫(中)',
      [Palace.乾六宫]: '乾六宫(西北)',
      [Palace.兑七宫]: '兑七宫(西)',
      [Palace.艮八宫]: '艮八宫(东北)',
      [Palace.离九宫]: '离九宫(南)'
    };
    return names[palace];
  }
  
  /**
   * 获取门的建议
   */
  private getGateSuggestion(gate: Gate): string {
    const suggestions: Record<Gate, string> = {
      [Gate.开门]: '开创事业、求职、开张',
      [Gate.休门]: '休息养生、和解、婚姻',
      [Gate.生门]: '求财、投资、置业',
      [Gate.景门]: '文书、考试、传播',
      [Gate.杜门]: '隐藏、保密、躲避',
      [Gate.伤门]: '竞争、诉讼、索债',
      [Gate.惊门]: '出行、迁移、变动',
      [Gate.死门]: '祭祀、吊唁、终结'
    };
    return suggestions[gate];
  }
  
  /**
   * 获取门的警告
   */
  private getGateWarning(gate: Gate): string {
    const warnings: Record<Gate, string> = {
      [Gate.开门]: '守成、闭关',
      [Gate.休门]: '进取、冒险',
      [Gate.生门]: '消费、损耗',
      [Gate.景门]: '隐私、秘密',
      [Gate.杜门]: '公开、暴露',
      [Gate.伤门]: '和谈、合作',
      [Gate.惊门]: '安定、守旧',
      [Gate.死门]: '新生、开始'
    };
    return warnings[gate];
  }
  
  /**
   * 分析值使
   */
  private analyze值使(值使: Gate): string {
    const analysis: Record<Gate, string> = {
      [Gate.开门]: '值使临开门，利于开创新事业',
      [Gate.休门]: '值使临休门，宜休养生息',
      [Gate.生门]: '值使临生门，财运亨通',
      [Gate.景门]: '值使临景门，文昌得力',
      [Gate.杜门]: '值使临杜门，宜韬光养晦',
      [Gate.伤门]: '值使临伤门，防小人暗害',
      [Gate.惊门]: '值使临惊门，防官非口舌',
      [Gate.死门]: '值使临死门，诸事不宜'
    };
    return analysis[值使];
  }
}

/**
 * 创建奇门遁甲实例
 */
export function createQimenDunjia(): QimenCalculator {
  return new QimenCalculator();
}