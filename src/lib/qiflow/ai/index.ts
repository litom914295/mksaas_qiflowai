// QiFlow AI 模块主入口

// 导出系统提示词相关功能
export {
  getSystemPrompt,
  SystemPrompt,
  AI_FENGSHUI_QUICK_PROMPT,
} from './system-prompt';
export type { SystemPromptConfig } from './system-prompt';

// 导出输入解析功能
export {
  extractBirthInfo,
  extractHouseInfo,
  InputParser,
  detectFengshuiIntent,
} from './input-parser';
export type { ParsedInput } from './input-parser';

// 导出八字计算功能（带缓存）
export async function computeBaziWithCache(birthInfo: any): Promise<any> {
  // 这是一个占位实现，实际应该调用真正的八字计算模块
  const mod: any = await import('../bazi/calculator');
  return mod.calculateBazi(birthInfo);
}

// 检查是否有房屋朝向信息
export function hasDirectionInfo(text: string): boolean {
  const directionKeywords = [
    '朝向',
    '坐向',
    '朝南',
    '朝北',
    '朝东',
    '朝西',
    '坐北朝南',
    '坐南朝北',
    '坐东朝西',
    '坐西朝东',
    '东南',
    '西南',
    '东北',
    '西北',
    '度',
    '°',
  ];

  return directionKeywords.some((keyword) => text.includes(keyword));
}

// 守卫相关的占位导出（如果需要的话）
export const guardAgainstMaliciousInput = (input: string): string => {
  // 简单的输入清理
  return input.replace(/[<>]/g, '');
};

export const validateInput = (input: any): boolean => {
  // 简单的输入验证
  return input && typeof input === 'string' && input.length > 0;
};
