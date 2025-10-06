/**
 * AI算法优先护栏实现
 * 确保所有AI回答基于已计算的结构化数据
 */

import { hasValidBaziData, type BaziOutput } from '@/app/api/bazi/schema';
import { hasValidFengshuiData, type FengshuiOutput } from '@/app/api/fengshui/schema';

export type QuestionType = 'bazi' | 'fengshui' | 'general' | 'unknown';

export interface ValidationResult {
  canAnswer: boolean;
  reason?: string;
  action?: 'REDIRECT_TO_ANALYSIS' | 'REFRESH_ANALYSIS' | 'PROVIDE_INFO';
  message?: string;
  hasData?: boolean;
  dataType?: 'bazi' | 'fengshui' | 'both';
}

export interface AnalysisContext {
  sessionId: string;
  userId?: string;
  baziData?: BaziOutput | null;
  fengshuiData?: FengshuiOutput | null;
  timestamp?: string;
}

/**
 * 算法优先守护类
 */
export class AlgorithmFirstGuard {
  /**
   * 识别问题类型
   */
  static identifyQuestionType(question: string): QuestionType {
    const q = question.toLowerCase();
    
    // 八字相关关键词
    const baziKeywords = [
      '八字', '命理', '四柱', '天干', '地支', '五行', '十神',
      '用神', '喜忌', '大运', '流年', '运势', '命运', '性格',
      '事业', '财运', '婚姻', '健康', '命盘', '日主'
    ];
    
    // 风水相关关键词
    const fengshuiKeywords = [
      '风水', '玄空', '飞星', '九宫', '方位', '朝向', '坐向',
      '山向', '财位', '文昌', '煞气', '吉凶', '布局', '装修',
      '摆设', '化解', '罗盘', '宅运'
    ];
    
    // 通用问题关键词（不需要数据）
    const generalKeywords = [
      '什么是', '如何', '怎么', '为什么', '介绍', '解释',
      '定义', '原理', '历史', '文化', '传统', '理论'
    ];
    
    // 检查是否为通用问题
    if (generalKeywords.some(keyword => q.includes(keyword))) {
      // 进一步检查是否询问具体的个人信息
      if (!q.includes('我的') && !q.includes('我') && !q.includes('您的')) {
        return 'general';
      }
    }
    
    // 检查八字相关
    if (baziKeywords.some(keyword => q.includes(keyword))) {
      return 'bazi';
    }
    
    // 检查风水相关
    if (fengshuiKeywords.some(keyword => q.includes(keyword))) {
      return 'fengshui';
    }
    
    return 'unknown';
  }
  
  /**
   * 验证上下文是否有效
   */
  async validateContext(
    question: string,
    context: AnalysisContext
  ): Promise<ValidationResult> {
    const questionType = AlgorithmFirstGuard.identifyQuestionType(question);
    
    // 通用问题不需要数据
    if (questionType === 'general') {
      return { canAnswer: true };
    }
    
    // 检查八字数据
    if (questionType === 'bazi') {
      if (!context.baziData || !hasValidBaziData(context.baziData)) {
        return {
          canAnswer: false,
          reason: 'NO_BAZI_DATA',
          action: 'REDIRECT_TO_ANALYSIS',
          message: '我需要先了解您的八字信息才能回答这个问题。请先进行八字分析。',
          hasData: false,
        };
      }
      
      // 检查数据时效性（可选）
      if (this.isDataExpired(context.baziData)) {
        return {
          canAnswer: false,
          reason: 'DATA_EXPIRED',
          action: 'REFRESH_ANALYSIS',
          message: '您的八字数据已过期，请重新计算。',
          hasData: true,
        };
      }
      
      return {
        canAnswer: true,
        hasData: true,
        dataType: 'bazi'
      };
    }
    
    // 检查风水数据
    if (questionType === 'fengshui') {
      if (!context.fengshuiData || !hasValidFengshuiData(context.fengshuiData)) {
        return {
          canAnswer: false,
          reason: 'NO_FENGSHUI_DATA',
          action: 'REDIRECT_TO_ANALYSIS',
          message: '我需要先了解您的房屋信息才能进行风水分析。请先提供风水相关信息。',
          hasData: false,
        };
      }
      
      if (this.isDataExpired(context.fengshuiData)) {
        return {
          canAnswer: false,
          reason: 'DATA_EXPIRED',
          action: 'REFRESH_ANALYSIS',
          message: '您的风水数据已过期，请重新计算。',
          hasData: true,
        };
      }
      
      return {
        canAnswer: true,
        hasData: true,
        dataType: 'fengshui'
      };
    }
    
    // 未知类型问题，检查是否有任何数据
    const hasBazi = context.baziData && hasValidBaziData(context.baziData);
    const hasFengshui = context.fengshuiData && hasValidFengshuiData(context.fengshuiData);
    
    if (!hasBazi && !hasFengshui) {
      return {
        canAnswer: false,
        reason: 'NO_DATA',
        action: 'PROVIDE_INFO',
        message: '请先进行八字分析或风水分析，我才能为您提供个性化的建议。',
        hasData: false,
      };
    }
    
    return {
      canAnswer: true,
      hasData: true,
      dataType: hasBazi && hasFengshui ? 'both' : hasBazi ? 'bazi' : 'fengshui'
    };
  }
  
  /**
   * 检查数据是否过期
   */
  private isDataExpired(data: { timestamp?: string }): boolean {
    if (!data.timestamp) return false;
    
    const dataTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // 数据超过30天视为过期
    return (now - dataTime) > (30 * oneDay);
  }
  
  /**
   * 生成引导消息
   */
  static generateGuidanceMessage(validation: ValidationResult): string {
    if (validation.canAnswer) {
      return '';
    }
    
    const baseMessage = validation.message || '请先完成相关分析。';
    
    switch (validation.action) {
      case 'REDIRECT_TO_ANALYSIS': {
        const { ensureLocalePrefix } = require('@/i18n/url');
        const baziLink = ensureLocalePrefix('/analysis/bazi', 'zh-CN');
        const fsLink = ensureLocalePrefix('/analysis/xuankong', 'zh-CN');
        return `😊 ${baseMessage}

**请提供以下信息：**
${validation.reason === 'NO_BAZI_DATA' ? 
`- 📅 出生日期（公历）
- ⏰ 出生时间（精确到小时）  
- 📍 出生地点（城市即可）
- 👤 性别

[立即开始八字分析](${baziLink})` :
`- 🧭 房屋朝向（罗盘度数）
- 📅 建造或入住年份
- 📍 所在城市
- 📐 户型图（可选）

[开始风水分析](${fsLink})`}`;
      }
        
      case 'REFRESH_ANALYSIS': {
        const { ensureLocalePrefix } = require('@/i18n/url');
        const path = `/analysis/${validation.dataType === 'bazi' ? 'bazi' : 'xuankong'}`;
        return `⚠️ ${baseMessage}

您的分析数据已经过期，可能影响准确性。

[重新分析](${ensureLocalePrefix(path, 'zh-CN')})`;
      }
        
      case 'PROVIDE_INFO': {
        const { ensureLocalePrefix } = require('@/i18n/url');
        const baziLink = ensureLocalePrefix('/analysis/bazi', 'zh-CN');
        const fsLink = ensureLocalePrefix('/analysis/xuankong', 'zh-CN');
        return `😊 ${baseMessage}

您可以选择：
- [八字命理分析](${baziLink}) - 了解个人运势
- [风水罗盘分析](${fsLink}) - 优化居住环境`;
      }
        
      default:
        return baseMessage;
    }
  }
  
  /**
   * 构建AI提示词上下文
   */
  static buildAIContext(
    question: string,
    context: AnalysisContext,
    validation: ValidationResult
  ): string {
    if (!validation.canAnswer) {
      return '';
    }
    
    let contextPrompt = `你是一位专业的易学顾问。请基于以下数据回答用户问题：\n\n`;
    
    if (context.baziData && validation.dataType?.includes('bazi')) {
      contextPrompt += `## 八字数据\n`;
      contextPrompt += `- 四柱: ${JSON.stringify(context.baziData.fourPillars)}\n`;
      contextPrompt += `- 五行: ${JSON.stringify(context.baziData.elements)}\n`;
      contextPrompt += `- 十神: ${JSON.stringify(context.baziData.tenGods)}\n`;
      
      if (context.baziData.yongShen) {
        contextPrompt += `- 用神: ${context.baziData.yongShen.primary}\n`;
      }
      
      contextPrompt += `- 数据版本: ${context.baziData.version}\n`;
      contextPrompt += `- 计算时间: ${context.baziData.timestamp}\n\n`;
    }
    
    if (context.fengshuiData && validation.dataType?.includes('fengshui')) {
      contextPrompt += `## 风水数据\n`;
      contextPrompt += `- 坐向: ${context.fengshuiData.facing}/${context.fengshuiData.mountain}\n`;
      contextPrompt += `- 元运: ${context.fengshuiData.period}运\n`;
      contextPrompt += `- 飞星盘: ${JSON.stringify(context.fengshuiData.flyingStars)}\n`;
      
      if (context.fengshuiData.specialPositions) {
        contextPrompt += `- 特殊方位: ${JSON.stringify(context.fengshuiData.specialPositions)}\n`;
      }
      
      contextPrompt += `- 数据版本: ${context.fengshuiData.version}\n`;
      contextPrompt += `- 计算时间: ${context.fengshuiData.timestamp}\n\n`;
    }
    
    contextPrompt += `## 回答要求\n`;
    contextPrompt += `1. 必须基于上述数据进行分析，不得超出数据范围推测\n`;
    contextPrompt += `2. 使用通俗易懂的语言解释专业术语\n`;
    contextPrompt += `3. 提供实用可行的建议\n`;
    contextPrompt += `4. 在回答末尾加入免责声明\n\n`;
    
    contextPrompt += `用户问题: ${question}`;
    
    return contextPrompt;
  }
}

/**
 * 敏感话题过滤器
 */
export class SensitiveTopicFilter {
  private static sensitiveKeywords = [
    '生死', '死亡', '疾病', '病症', '癌症', '绝症',
    '赌博', '彩票', '股票代码', '具体投资',
    '犯罪', '违法', '诈骗',
    '政治', '宗教纷争',
    '自杀', '自残'
  ];
  
  static isSensitive(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.sensitiveKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
  }
  
  static getSensitiveWarning(): string {
    return `⚠️ 您的问题涉及敏感内容，我无法回答。

我可以为您提供：
- 八字命理分析和性格解读
- 风水布局和环境优化建议
- 运势趋势和发展方向指导
- 文化知识和理论解释

请避免询问关于疾病诊断、投资建议、赌博预测等内容。`;
  }
}

/**
 * 审计日志记录
 */
export interface AuditLog {
  timestamp: string;
  userId?: string;
  sessionId: string;
  questionType: QuestionType;
  hasValidData: boolean;
  dataVersion?: string;
  dataHash?: string;
  responseType: 'ANALYSIS' | 'GUIDANCE' | 'SENSITIVE_FILTER' | 'ERROR';
  confidenceLevel?: number;
  error?: string;
}

export class AuditLogger {
  static async log(entry: AuditLog): Promise<void> {
    // 实际项目中应该发送到日志服务
    console.log('[AUDIT]', JSON.stringify(entry));
    
    // 可以发送到后端API记录
    try {
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send audit log:', error);
    }
  }
}