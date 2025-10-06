/**
 * QiFlow 算法优先·八字风水大师处理器
 *
 * 专门处理八字分析请求的处理器，严格遵循算法优先原则
 */

import {
  computeBaziSmart,
  type EnhancedBaziResult,
  type EnhancedBirthData,
} from '@/lib/bazi';
import {
  detectAnalysisRequest,
  extractAnalysisParams,
} from './analysis-detection';

export interface BaziMasterConfig {
  language: 'zh-CN' | 'zh-TW' | 'en';
  responseStyle: 'professional' | 'conversational' | 'educational';
  includeMetadata: boolean;
  enableValidation: boolean;
}

export interface BaziAnalysisContext {
  sessionId: string;
  userId: string;
  userInput: string;
  extractedParams?: any;
  previousAnalysis?: EnhancedBaziResult;
  config?: Partial<BaziMasterConfig>;
}

export interface BaziMasterResponse {
  success: boolean;
  content: string;
  analysisId?: string;
  metadata?: {
    algorithmVersion: string;
    calendarUsed: string;
    timezoneUsed: string;
    uncertainties: string[];
  };
  error?: string;
  needsClarification?: {
    missing: string[];
    suggestions: string[];
  };
}

/**
 * QiFlow 算法优先·八字风水大师
 */
export class BaziMasterProcessor {
  private config: BaziMasterConfig;

  constructor(config: Partial<BaziMasterConfig> = {}) {
    this.config = {
      language: 'zh-CN',
      responseStyle: 'professional',
      includeMetadata: true,
      enableValidation: true,
      ...config,
    };
  }

  /**
   * 处理八字分析请求
   * 严格遵循算法优先原则
   */
  async processAnalysisRequest(
    context: BaziAnalysisContext
  ): Promise<BaziMasterResponse> {
    console.log(
      '[八字大师] 开始处理分析请求:',
      context.userInput.substring(0, 50)
    );

    try {
      // 步骤1: 识别与收集
      const analysisDetection = await detectAnalysisRequest(context.userInput);
      if (!analysisDetection.isAnalysisRequest) {
        return this.createNonAnalysisResponse(context.userInput);
      }

      // 步骤2: 提取和标准化参数
      const extractedParams = await extractAnalysisParams(context.userInput);

      // 步骤3: 验证必要信息
      const validationResult = this.validateRequiredInfo(extractedParams);
      if (!validationResult.isComplete) {
        return this.createClarificationResponse(
          validationResult.missing,
          context.userInput
        );
      }

      // 步骤4: 算法调用与结果校验
      const baziResult = await this.callBaziAlgorithm(extractedParams);
      if (!baziResult.success) {
        return this.createErrorResponse(
          baziResult.error || '算法计算失败',
          context
        );
      }

      // 步骤5: 呈现与专业解读
      const professionalAnalysis = await this.generateProfessionalAnalysis(
        baziResult.data!,
        extractedParams,
        context
      );

      return {
        success: true,
        content: professionalAnalysis.content,
        analysisId: `bazi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          algorithmVersion: 'v1.0',
          calendarUsed: 'gregorian',
          timezoneUsed: 'Asia/Shanghai',
          uncertainties: professionalAnalysis.uncertainties,
        },
      };
    } catch (error) {
      console.error('[八字大师] 处理请求时发生错误:', error);
      return this.createErrorResponse('系统处理异常，请稍后重试', context);
    }
  }

  /**
   * 验证必要信息是否完整
   */
  private validateRequiredInfo(params: any): {
    isComplete: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    if (!params.birthDateTime) {
      missing.push('出生日期时间');
    }
    if (!params.gender) {
      missing.push('性别（用于推算大运方向）');
    }
    if (!params.location && !params.timezone) {
      missing.push('出生地或时区信息');
    }

    return {
      isComplete: missing.length === 0,
      missing,
    };
  }

  /**
   * 调用八字算法引擎
   */
  private async callBaziAlgorithm(params: any): Promise<{
    success: boolean;
    data?: EnhancedBaziResult;
    error?: string;
  }> {
    try {
      console.log('[八字大师] 调用算法引擎 computeBaziSmart');

      const birthData: EnhancedBirthData = {
        datetime: params.birthDateTime.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
        gender: params.gender,
        timezone: params.timezone || 'Asia/Shanghai',
        isTimeKnown: true,
        preferredLocale: 'zh-CN',
      };

      const result = await computeBaziSmart(birthData);

      // 基本一致性校验
      if (!result || !result.pillars) {
        throw new Error('算法返回结果不完整');
      }

      console.log('[八字大师] 算法计算成功，四柱:', {
        year: `${result.pillars.year?.stem}${result.pillars.year?.branch}`,
        month: `${result.pillars.month?.stem}${result.pillars.month?.branch}`,
        day: `${result.pillars.day?.stem}${result.pillars.day?.branch}`,
        hour: `${result.pillars.hour?.stem}${result.pillars.hour?.branch}`,
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('[八字大师] 算法调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '算法计算异常',
      };
    }
  }

  /**
   * 生成专业分析
   */
  private async generateProfessionalAnalysis(
    baziResult: EnhancedBaziResult,
    params: any,
    context: BaziAnalysisContext
  ): Promise<{ content: string; uncertainties: string[] }> {
    const uncertainties: string[] = [];
    const sections: string[] = [];

    // 输入确认
    sections.push(
      this.generateInputConfirmation(params, baziResult, uncertainties)
    );

    // 四柱结果
    sections.push(this.generatePillarResults(baziResult));

    // 关键结论
    sections.push(this.generateKeyConclusions(baziResult));

    // 详细解读
    sections.push(this.generateDetailedAnalysis(baziResult, context));

    // 运势展望
    if (baziResult.luckPillars) {
      sections.push(this.generateLuckForecast(baziResult));
    }

    // 建议与注意
    sections.push(this.generateRecommendations(baziResult, context));

    // 复核提示
    sections.push(this.generateVerificationReminder(uncertainties));

    return {
      content: sections.join('\n\n'),
      uncertainties,
    };
  }

  /**
   * 生成输入确认部分
   */
  private generateInputConfirmation(
    params: any,
    result: EnhancedBaziResult,
    uncertainties: string[]
  ): string {
    const sections = ['## 📋 输入确认'];

    sections.push(`**性别**: ${params.gender === 'male' ? '男' : '女'}`);
    sections.push(
      `**出生时间**: ${params.birthDateTime.toLocaleString('zh-CN')}`
    );
    sections.push(
      `**历法**: ${params.calendarType === 'lunar' ? '农历' : '公历'}`
    );
    sections.push(`**时区**: ${params.timezone || 'Asia/Shanghai'}`);
    sections.push(`**出生地**: ${params.location || '未指定（使用默认时区）'}`);

    if (this.config.includeMetadata) {
      sections.push(`**分析ID**: bazi_${Date.now()}`);
      sections.push(`**算法版本**: v1.0`);
    }

    // 添加不确定性标注
    if (!params.location) {
      uncertainties.push('出生地未指定，使用默认时区计算');
    }
    if (params.birthDateTime.getMinutes() === 0) {
      uncertainties.push('具体分钟未提供，可能影响时柱准确性');
    }

    return sections.join('\n');
  }

  /**
   * 生成四柱结果部分
   */
  private generatePillarResults(result: EnhancedBaziResult): string {
    const sections = ['## 🏛️ 四柱结果'];

    if (result.pillars) {
      sections.push(
        `**年柱**: ${result.pillars.year?.stem}${result.pillars.year?.branch} (${this.getStemBranchInfo(result.pillars.year)})`
      );
      sections.push(
        `**月柱**: ${result.pillars.month?.stem}${result.pillars.month?.branch} (${this.getStemBranchInfo(result.pillars.month)})`
      );
      sections.push(
        `**日柱**: ${result.pillars.day?.stem}${result.pillars.day?.branch} (${this.getStemBranchInfo(result.pillars.day)})`
      );
      sections.push(
        `**时柱**: ${result.pillars.hour?.stem}${result.pillars.hour?.branch} (${this.getStemBranchInfo(result.pillars.hour)})`
      );
    }

    if (result.pillars?.day) {
      sections.push(`**日主**: ${result.pillars.day.stem} (日干)`);
    }

    return sections.join('\n');
  }

  /**
   * 获取干支信息
   */
  private getStemBranchInfo(pillar: any): string {
    if (!pillar) return '未知';

    const info: string[] = [];
    if (pillar.nayin) info.push(pillar.nayin);
    if (pillar.hiddenStems) info.push(`藏干: ${pillar.hiddenStems.join(',')}`);

    return info.join(', ') || '五行信息';
  }

  /**
   * 生成关键结论部分
   */
  private generateKeyConclusions(result: EnhancedBaziResult): string {
    const sections = ['## 🎯 关键结论'];

    if (result.elements) {
      const elements = result.elements;
      sections.push(
        `**五行分布**: 木${elements['木'] || 0} 火${elements['火'] || 0} 土${elements['土'] || 0} 金${elements['金'] || 0} 水${elements['水'] || 0}`
      );

      // 分析五行强弱
      const maxElement = Object.entries(elements).reduce((a, b) =>
        (elements[a[0] as keyof typeof elements] || 0) >
        (elements[b[0] as keyof typeof elements] || 0)
          ? a
          : b
      );
      const minElement = Object.entries(elements).reduce((a, b) =>
        (elements[a[0] as keyof typeof elements] || 0) <
        (elements[b[0] as keyof typeof elements] || 0)
          ? a
          : b
      );

      sections.push(`**五行特点**: ${maxElement[0]}偏旺，${minElement[0]}偏弱`);
    }

    if (result.pillars?.day) {
      sections.push(
        `**日主特质**: ${result.pillars.day.stem}日主，${this.getDayMasterCharacteristics(result.pillars.day)}`
      );
    }

    return sections.join('\n');
  }

  /**
   * 获取五行中文名称
   */
  private getElementName(element: string): string {
    const elementMap: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    return elementMap[element] || element;
  }

  /**
   * 获取日主特征描述
   */
  private getDayMasterCharacteristics(dayMaster: any): string {
    // 这里可以根据日主的天干特性给出基本描述
    const characteristics: Record<string, string> = {
      甲: '性格直爽，有领导才能',
      乙: '性格温和，适应性强',
      丙: '性格热情，富有创造力',
      丁: '性格细腻，注重细节',
      戊: '性格稳重，责任心强',
      己: '性格谦和，善于协调',
      庚: '性格坚毅，执行力强',
      辛: '性格精致，追求完美',
      壬: '性格灵活，善于变通',
      癸: '性格内敛，思维深刻',
    };

    return characteristics[dayMaster.stem] || '个性鲜明';
  }

  /**
   * 生成详细解读部分
   */
  private generateDetailedAnalysis(
    result: EnhancedBaziResult,
    context: BaziAnalysisContext
  ): string {
    const sections = ['## 📖 详细解读'];

    // 十神分析
    if (result.tenGodsAnalysis) {
      sections.push('### 十神分布');
      sections.push(this.analyzeTenGods(result.tenGodsAnalysis));
    }

    // 用神分析
    if (result.yongshen) {
      sections.push('### 用神喜忌');
      sections.push(this.analyzeUsefulGod(result.yongshen));
    }

    // 日主强弱分析
    if (result.dayMasterStrength) {
      sections.push('### 日主强弱');
      sections.push(this.analyzeDayMasterStrength(result.dayMasterStrength));
    }

    return sections.join('\n\n');
  }

  /**
   * 分析十神
   */
  private analyzeTenGods(tenGods: any): string {
    // 基于十神分布给出分析
    return '根据十神分布，可以看出命主的性格特点和人生倾向...';
  }

  /**
   * 分析格局
   */
  private analyzePattern(pattern: any): string {
    // 基于格局给出分析
    return '从格局来看，命主具有特定的人生模式和发展方向...';
  }

  /**
   * 分析用神
   */
  private analyzeUsefulGod(usefulGod: any): string {
    // 基于用神给出分析
    const favorable = usefulGod.favorable || [];
    const unfavorable = usefulGod.unfavorable || [];

    let analysis = '用神为命局的关键，影响着命主的运势走向。\n\n';

    if (favorable.length > 0) {
      analysis += `**喜用神**: ${favorable.join('、')}
`;
      analysis +=
        '这些五行对您有利，在生活中可以多接触相关的颜色、方位、职业等。\n\n';
    }

    if (unfavorable.length > 0) {
      analysis += `**忌神**: ${unfavorable.join('、')}
`;
      analysis += '这些五行对您不利，在重要决策时需要谨慎考虑。';
    }

    return analysis;
  }

  /**
   * 分析日主强弱
   */
  private analyzeDayMasterStrength(dayMasterStrength: any): string {
    const strength = dayMasterStrength.strength || 'balanced';
    const score = dayMasterStrength.score || 50;
    const factors = dayMasterStrength.factors || [];

    let analysis = `日主强弱程度：${strength === 'strong' ? '偏强' : strength === 'weak' ? '偏弱' : '中和'} (${score}分)

`;

    if (factors.length > 0) {
      analysis += '**影响因素**:\n';
      factors.forEach((factor: string) => {
        analysis += `- ${factor}
`;
      });
    }

    return analysis;
  }

  /**
   * 生成运势展望部分
   */
  private generateLuckForecast(result: EnhancedBaziResult): string {
    const sections = ['## 🔮 运势展望'];

    if (result.luckPillars && result.luckPillars.length > 0) {
      const currentLuck = result.luckPillars[0];
      sections.push(
        `**当前大运**: ${currentLuck.heavenlyStem}${currentLuck.earthlyBranch} (${currentLuck.startAge}-${currentLuck.endAge}岁)`
      );
      sections.push(`**运势特点**: ${this.analyzeLuckPeriod(currentLuck)}`);

      if (result.luckPillars.length > 1) {
        const nextLuck = result.luckPillars[1];
        sections.push(
          `**下步大运**: ${nextLuck.heavenlyStem}${nextLuck.earthlyBranch} (${nextLuck.startAge}-${nextLuck.endAge}岁)`
        );
      }
    }

    sections.push(
      '**注意**: 运势分析仅供参考，具体情况需结合实际环境和个人努力。'
    );

    return sections.join('\n');
  }

  /**
   * 分析运势周期
   */
  private analyzeLuckPeriod(luck: any): string {
    // 基于大运干支分析运势特点
    return '此运势周期有其特定的发展机遇和挑战...';
  }

  /**
   * 生成建议与注意部分
   */
  private generateRecommendations(
    result: EnhancedBaziResult,
    context: BaziAnalysisContext
  ): string {
    const sections = ['## 💡 建议与注意'];

    // 基于用户关注点生成建议
    const focus = this.extractUserFocus(context.userInput);

    if (focus.includes('事业') || focus.includes('工作')) {
      sections.push('### 事业发展');
      sections.push(this.generateCareerAdvice(result));
    }

    if (focus.includes('财运') || focus.includes('财富')) {
      sections.push('### 财运建议');
      sections.push(this.generateWealthAdvice(result));
    }

    if (focus.includes('感情') || focus.includes('婚姻')) {
      sections.push('### 感情婚姻');
      sections.push(this.generateRelationshipAdvice(result));
    }

    if (focus.includes('健康')) {
      sections.push('### 健康养生');
      sections.push(this.generateHealthAdvice(result));
    }

    // 通用建议
    sections.push('### 通用建议');
    sections.push(this.generateGeneralAdvice(result));

    return sections.join('\n\n');
  }

  /**
   * 提取用户关注点
   */
  private extractUserFocus(userInput: string): string[] {
    const focus: string[] = [];
    const keywords = {
      事业: ['事业', '工作', '职业', '升职', '跳槽'],
      财运: ['财运', '财富', '赚钱', '投资', '理财'],
      感情: ['感情', '婚姻', '恋爱', '桃花', '配偶'],
      健康: ['健康', '身体', '疾病', '养生'],
    };

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => userInput.includes(word))) {
        focus.push(category);
      }
    }

    return focus;
  }

  /**
   * 生成事业建议
   */
  private generateCareerAdvice(result: EnhancedBaziResult): string {
    return '根据八字特点，在事业发展方面建议...';
  }

  /**
   * 生成财运建议
   */
  private generateWealthAdvice(result: EnhancedBaziResult): string {
    return '从财运角度来看，建议...';
  }

  /**
   * 生成感情建议
   */
  private generateRelationshipAdvice(result: EnhancedBaziResult): string {
    return '在感情方面，建议...';
  }

  /**
   * 生成健康建议
   */
  private generateHealthAdvice(result: EnhancedBaziResult): string {
    return '健康方面需要注意...';
  }

  /**
   * 生成通用建议
   */
  private generateGeneralAdvice(result: EnhancedBaziResult): string {
    return '总体而言，建议保持积极心态，顺应自然规律，在适当的时机做出正确的选择。';
  }

  /**
   * 生成复核提示部分
   */
  private generateVerificationReminder(uncertainties: string[]): string {
    const sections = ['## ⚠️ 复核提示'];

    if (uncertainties.length > 0) {
      sections.push('**请注意以下不确定因素**:');
      uncertainties.forEach(uncertainty => {
        sections.push(`- ${uncertainty}`);
      });
      sections.push('');
    }

    sections.push('**建议复核以下信息**:');
    sections.push('- 出生日期是否为公历或农历');
    sections.push('- 出生地点和时区是否准确');
    sections.push('- 出生时间是否考虑夏令时');
    sections.push('- 如有疑问，可提供更准确信息重新计算');

    return sections.join('\n');
  }

  /**
   * 创建非分析请求的响应
   */
  private createNonAnalysisResponse(userInput: string): BaziMasterResponse {
    return {
      success: true,
      content: `您好！我是QiFlow算法优先·八字风水大师。我专门提供基于权威算法的八字分析服务。

如需进行八字分析，请提供以下信息：
- 出生年月日时（请注明公历或农历）
- 性别
- 出生地点（用于确定时区）

例如："我是1990年5月15日上午10点30分在北京出生的男性，请帮我分析八字"

我将严格遵循算法优先原则，先调用内置的八字计算引擎获取准确的四柱数据，再为您提供专业的解读和建议。`,
    };
  }

  /**
   * 创建澄清请求的响应
   */
  private createClarificationResponse(
    missing: string[],
    userInput: string
  ): BaziMasterResponse {
    const suggestions = [
      '请提供完整的出生年月日时',
      '请说明性别（男/女）',
      '请提供出生地点或时区信息',
    ];

    return {
      success: false,
      needsClarification: {
        missing,
        suggestions,
      },
      content: `为了进行准确的八字分析，我需要以下信息：

**缺少的信息**：
${missing.map(item => `- ${item}`).join('\n')}

**建议格式**：
"我是[性别]，[年]年[月]月[日]日[时]时[分]分在[地点]出生（公历/农历），请帮我分析八字"

例如："我是男性，1990年5月15日上午10点30分在北京出生（公历），请帮我分析八字"

请提供完整信息后，我将调用算法引擎为您计算准确的四柱并提供专业解读。`,
    };
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(
    error: string,
    context: BaziAnalysisContext
  ): BaziMasterResponse {
    return {
      success: false,
      error,
      content: `抱歉，在处理您的八字分析请求时遇到了问题：${error}

**可能的解决方案**：
1. 请检查提供的出生信息是否完整准确
2. 稍后重试，系统可能暂时繁忙
3. 如问题持续，请联系技术支持

我承诺严格遵循算法优先原则，只有在成功调用八字计算引擎后才会提供分析结果，绝不会生成臆测的四柱信息。`,
    };
  }
}

/**
 * 默认的八字大师实例
 */
export const baziMasterProcessor = new BaziMasterProcessor({
  language: 'zh-CN',
  responseStyle: 'professional',
  includeMetadata: true,
  enableValidation: true,
});
