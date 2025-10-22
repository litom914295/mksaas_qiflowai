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
