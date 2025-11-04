// AI输入解析器 - 简化版本

export interface ParsedInput {
  intent: 'bazi' | 'fengshui' | 'general' | 'unknown';
  entities: {
    birthDate?: string;
    birthTime?: string;
    gender?: 'male' | 'female';
    location?: string;
    question?: string;
  };
  confidence: number;
}

// 检测风水意图
export function detectFengshuiIntent(message: string): boolean {
  const fengshuiKeywords = [
    '风水',
    '玄空',
    '飞星',
    '九宫',
    '朝向',
    '坐向',
    '山星',
    '水星',
    '财位',
    '文昌',
    '桃花位',
    '煞位',
    '房屋',
    '住宅',
    '办公室',
    '房子',
    '布置',
    '布局',
    '摆放',
    '装修',
    '家居',
    '卧室',
    '客厅',
    '厨房',
  ];
  return fengshuiKeywords.some((k) => message.includes(k));
}

// 检查是否有朝向信息
export function hasDirectionInfo(message: string): boolean {
  const directionKeywords = [
    '北',
    '东北',
    '东',
    '东南',
    '南',
    '西南',
    '西',
    '西北',
    '坐北朝南',
    '坐南朝北',
    '坐东朝西',
    '坐西朝东',
    '度',
    '°',
    '朝向',
    '坐向',
  ];
  return directionKeywords.some((k) => message.includes(k));
}

export class InputParser {
  static parse(input: string): ParsedInput {
    const result: ParsedInput = {
      intent: 'unknown',
      entities: {},
      confidence: 0,
    };

    const lowerInput = input.toLowerCase();

    // 识别意图
    if (
      lowerInput.includes('八字') ||
      lowerInput.includes('命理') ||
      lowerInput.includes('生辰')
    ) {
      result.intent = 'bazi';
      result.confidence += 0.3;
    } else if (
      lowerInput.includes('风水') ||
      lowerInput.includes('方位') ||
      lowerInput.includes('朝向')
    ) {
      result.intent = 'fengshui';
      result.confidence += 0.3;
    } else {
      result.intent = 'general';
      result.confidence += 0.1;
    }

    // 提取日期
    const datePattern = /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日]?/g;
    const dateMatch = datePattern.exec(input);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      result.entities.birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      result.confidence += 0.2;
    }

    // 提取时间
    const timePattern = /(\d{1,2})[时点:：](\d{1,2})?[分]?/g;
    const timeMatch = timePattern.exec(input);
    if (timeMatch) {
      const [, hour, minute = '0'] = timeMatch;
      result.entities.birthTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      result.confidence += 0.2;
    }

    // 识别性别
    if (lowerInput.includes('男') || lowerInput.includes('先生')) {
      result.entities.gender = 'male';
      result.confidence += 0.1;
    } else if (
      lowerInput.includes('女') ||
      lowerInput.includes('女士') ||
      lowerInput.includes('小姐')
    ) {
      result.entities.gender = 'female';
      result.confidence += 0.1;
    }

    // 提取问题
    const questionPatterns = [
      /怎么样|如何|什么意思|好不好|运势|命运/,
      /分析|解析|看看|算算|测测/,
    ];

    for (const pattern of questionPatterns) {
      if (pattern.test(input)) {
        result.entities.question = input;
        result.confidence += 0.1;
        break;
      }
    }

    return result;
  }

  static validate(parsed: ParsedInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (parsed.intent === 'bazi') {
      if (!parsed.entities.birthDate) {
        errors.push('缺少出生日期');
      }
      if (!parsed.entities.birthTime) {
        errors.push('缺少出生时间');
      }
      if (!parsed.entities.gender) {
        errors.push('缺少性别信息');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export function extractBirthInfo(message: string): any {
  const parsed = InputParser.parse(message);
  return {
    birthDate: parsed.entities.birthDate,
    birthTime: parsed.entities.birthTime,
    gender: parsed.entities.gender,
  };
}

export function extractHouseInfo(message: string): any {
  return {
    facing: 0,
    buildYear: new Date().getFullYear(),
  };
}
