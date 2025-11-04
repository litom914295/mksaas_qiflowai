/**
 * AI Guardrails
 * AI 安全防护机制
 */

export interface GuardrailResult {
  passed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
}

/**
 * 问题类型
 */
export type QuestionType = 'bazi' | 'fengshui' | 'general' | 'other';

/**
 * 分析上下文
 */
export interface AnalysisContext {
  baziData?: any;
  fengshuiData?: any;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

/**
 * 敏感话题过滤器
 */
export class SensitiveTopicFilter {
  private static sensitiveTopics = [
    '政治', '暴力', '色情', '赌博', '违法', '犯罪',
    '恐怖', '邪教', '毒品', '自杀', '仇恨言论'
  ];

  static isSensitive(text: string): boolean {
    return this.sensitiveTopics.some(topic => text.includes(topic));
  }

  static getSensitiveReason(text: string): string | null {
    const found = this.sensitiveTopics.find(topic => text.includes(topic));
    return found ? `内容包含敏感话题: ${found}` : null;
  }

  static getSensitiveWarning(): string {
    return '抱歉，您的问题涉及敏感话题，我们无法回答。请咨询其他与命理、风水相关的问题。';
  }
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  canAnswer: boolean;
  hasData?: boolean;
  action?: 'REDIRECT_TO_ANALYSIS' | 'REFRESH_ANALYSIS' | 'PROVIDE_INFO';
  confidence?: number;
  availableData?: {
    bazi?: any;
    fengshui?: any;
  };
}

/**
 * 算法优先守护
 */
export class AlgorithmFirstGuard {
  /**
   * 检查是否有可用的分析数据
   */
  static hasValidData(context?: AnalysisContext): boolean {
    if (!context) return false;
    return !!(context.baziData || context.fengshuiData);
  }

  /**
   * 确定问题类型
   */
  static determineQuestionType(message: string, context?: AnalysisContext): QuestionType {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('八字') || lowerMessage.includes('命理')) {
      return 'bazi';
    }
    if (lowerMessage.includes('风水') || lowerMessage.includes('玄空')) {
      return 'fengshui';
    }
    
    // 根据上下文数据判断
    if (context?.baziData) return 'bazi';
    if (context?.fengshuiData) return 'fengshui';
    
    return 'general';
  }

  /**
   * 验证是否允许基于算法回答
   */
  static canAnswerWithAlgorithm(questionType: QuestionType, context?: AnalysisContext): boolean {
    if (questionType === 'general') return true;
    if (questionType === 'bazi') return !!context?.baziData;
    if (questionType === 'fengshui') return !!context?.fengshuiData;
    return false;
  }

  /**
   * 识别问题类型（route-with-limit.ts 使用）
   */
  static identifyQuestionType(message: string): QuestionType {
    return this.determineQuestionType(message);
  }

  /**
   * 验证上下文
   */
  async validateContext(message: string, context: AnalysisContext): Promise<ValidationResult> {
    const questionType = AlgorithmFirstGuard.determineQuestionType(message, context);
    const hasData = AlgorithmFirstGuard.hasValidData(context);
    const canAnswer = AlgorithmFirstGuard.canAnswerWithAlgorithm(questionType, context);

    if (!canAnswer && questionType !== 'general') {
      return {
        canAnswer: false,
        hasData,
        action: 'REDIRECT_TO_ANALYSIS',
        confidence: 0.5,
      };
    }

    return {
      canAnswer: true,
      hasData,
      confidence: hasData ? 0.9 : 0.7,
      availableData: {
        bazi: context.baziData,
        fengshui: context.fengshuiData,
      },
    };
  }

  /**
   * 生成引导消息
   */
  static generateGuidanceMessage(validation: ValidationResult): string {
    if (validation.action === 'REDIRECT_TO_ANALYSIS') {
      return '为了给您提供准确的分析，请先完成相关的命理或风水测算。';
    }
    return '请提供更多信息以获得更准确的答案。';
  }

  /**
   * 构建上下文提示词
   */
  static buildContextPrompt(availableData: any, questionType: QuestionType): string {
    if (!availableData) return '';

    if (questionType === 'bazi' && availableData.bazi) {
      return `基于以下八字数据进行分析：${JSON.stringify(availableData.bazi)}`;
    }

    if (questionType === 'fengshui' && availableData.fengshui) {
      return `基于以下风水数据进行分析：${JSON.stringify(availableData.fengshui)}`;
    }

    return '';
  }
}

/**
 * 审计日志记录器
 */
export class AuditLogger {
  /**
   * 通用日志记录方法
   */
  static async log(params: {
    timestamp: string;
    sessionId: string;
    userId?: string;
    questionType: QuestionType;
    hasValidData: boolean;
    responseType: 'SENSITIVE_FILTER' | 'GUIDANCE' | 'AI_ANSWER';
    confidenceLevel?: number;
  }): Promise<void> {
    console.log('[Audit] Log Entry', params);
    // TODO: 实现持久化审计日志到数据库
  }

  /**
   * 记录聊天请求
   */
  static async logChatRequest(params: {
    sessionId: string;
    userId?: string;
    message: string;
    questionType: QuestionType;
    hasData: boolean;
    ip?: string;
  }): Promise<void> {
    const { sessionId, userId, message, questionType, hasData, ip } = params;
    
    console.log('[Audit] Chat Request', {
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      messageLength: message.length,
      questionType,
      hasData,
      ip,
    });
    
    // TODO: 实现持久化审计日志到数据库
  }

  /**
   * 记录违规行为
   */
  static async logViolation(params: {
    sessionId: string;
    userId?: string;
    violationType: string;
    details: string;
    ip?: string;
  }): Promise<void> {
    const { sessionId, userId, violationType, details, ip } = params;
    
    console.warn('[Audit] Violation Detected', {
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      violationType,
      details,
      ip,
    });
    
    // TODO: 实现持久化违规记录到数据库
  }
}

/**
 * 内容审核
 */
export function moderateContent(content: string): GuardrailResult {
  // 检查敏感词
  const sensitiveWords = ['政治', '暴力', '色情'];

  for (const word of sensitiveWords) {
    if (content.includes(word)) {
      return {
        passed: false,
        reason: '内容包含敏感词',
        severity: 'high',
      };
    }
  }

  // 检查内容长度
  if (content.length > 10000) {
    return {
      passed: false,
      reason: '内容过长',
      severity: 'medium',
    };
  }

  return { passed: true };
}

/**
 * 验证输入参数
 */
export function validateInput(input: any): GuardrailResult {
  if (!input) {
    return {
      passed: false,
      reason: '输入为空',
      severity: 'high',
    };
  }

  // 验证必需字段
  if (input.type === 'bazi') {
    if (!input.birthDate || !input.gender) {
      return {
        passed: false,
        reason: '缺少必需的出生信息',
        severity: 'high',
      };
    }
  }

  return { passed: true };
}

/**
 * 检测滥用行为
 */
export function detectAbuse(
  userId: string,
  requestCount: number,
  timeWindow: number
): GuardrailResult {
  const threshold = 100; // 时间窗口内的最大请求数

  if (requestCount > threshold) {
    return {
      passed: false,
      reason: '请求频率过高',
      severity: 'high',
    };
  }

  return { passed: true };
}

/**
 * 检查输出质量
 */
export function validateOutput(output: string): GuardrailResult {
  // 检查是否为空
  if (!output || output.trim().length === 0) {
    return {
      passed: false,
      reason: '输出为空',
      severity: 'high',
    };
  }

  // 检查是否包含错误标记
  if (output.includes('[ERROR]') || output.includes('[INVALID]')) {
    return {
      passed: false,
      reason: '输出包含错误标记',
      severity: 'medium',
    };
  }

  return { passed: true };
}

/**
 * 综合检查
 */
export async function checkGuardrails(params: {
  input?: any;
  output?: string;
  userId?: string;
  requestCount?: number;
}): Promise<GuardrailResult> {
  const { input, output, userId, requestCount } = params;

  if (input) {
    const inputCheck = validateInput(input);
    if (!inputCheck.passed) {
      return inputCheck;
    }

    if (typeof input === 'string') {
      const contentCheck = moderateContent(input);
      if (!contentCheck.passed) {
        return contentCheck;
      }
    }
  }

  if (output) {
    const outputCheck = validateOutput(output);
    if (!outputCheck.passed) {
      return outputCheck;
    }
  }

  if (userId && requestCount !== undefined) {
    const abuseCheck = detectAbuse(userId, requestCount, 3600);
    if (!abuseCheck.passed) {
      return abuseCheck;
    }
  }

  return { passed: true };
}
