/**
 * AI 合规规则模块
 * 用于过滤 AI 输出，确保符合法律法规和平台政策
 */

// 敏感词库 (可扩展)
const SENSITIVE_WORDS = [
  // 政治敏感词
  "习近平", "毛泽东", "邓小平", "江泽民", "胡锦涛",
  "中共", "共产党", "国民党", "台独", "藏独",
  
  // 暴力极端
  "自杀", "杀人", "恐怖", "炸弹", "枪支",
  
  // 色情低俗
  "性交", "做爱", "裸体", "色情", "性虐",
  
  // 赌博诈骗
  "赌博", "六合彩", "诈骗", "传销", "洗钱",
  
  // 迷信邪教
  "法轮功", "邪教", "占卜", "巫术",
  
  // 其他违禁
  "毒品", "大麻", "冰毒", "海洛因",
];

// 年龄限制关键词
const AGE_RESTRICTED_KEYWORDS = [
  "未成年", "儿童", "孩子", "青少年", "学生",
];

/**
 * 检查文本是否包含敏感词
 */
export function containsSensitiveWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SENSITIVE_WORDS.some((word) =>
    lowerText.includes(word.toLowerCase())
  );
}

/**
 * 过滤敏感词 (替换为 ***)
 */
export function filterSensitiveWords(text: string): string {
  let filtered = text;
  
  SENSITIVE_WORDS.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "***");
  });
  
  return filtered;
}

/**
 * 检查是否涉及未成年人内容
 */
export function isAgeRestricted(text: string): boolean {
  const lowerText = text.toLowerCase();
  return AGE_RESTRICTED_KEYWORDS.some((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * 生成免责声明
 */
export function generateDisclaimer(type: "default" | "age" | "strict" = "default"): string {
  const disclaimers = {
    default: `
🔔 **免责声明**

本报告由 AI 根据传统命理学知识生成，仅供参考和娱乐。内容不构成任何专业建议，不应作为重大决策的唯一依据。命运掌握在自己手中，积极努力才是成功的关键。本平台不对报告内容的准确性或由此产生的任何后果承担责任。

使用本服务即表示您已年满 18 周岁，并同意遵守相关法律法规。
    `.trim(),
    
    age: `
🔞 **年龄限制警告**

本内容仅适用于 18 周岁及以上成年人。请确认您已满 18 周岁后继续使用本服务。

未成年人请在监护人陪同下使用，家长应对未成年人的使用行为负责。
    `.trim(),
    
    strict: `
⚠️ **严重警告**

检测到您的查询可能涉及敏感或违规内容。为了您和他人的安全，我们无法为此类查询提供服务。

请遵守法律法规和平台规则，共同维护健康的社区环境。
    `.trim(),
  };
  
  return disclaimers[type];
}

/**
 * AI 输出合规检查
 * @returns { compliant: boolean, filtered: string, disclaimer: string }
 */
export function checkAICompliance(input: {
  userInput: string;
  aiOutput: string;
}): {
  compliant: boolean;
  filtered: string;
  disclaimer: string;
  reasons: string[];
} {
  const reasons: string[] = [];
  let filtered = input.aiOutput;
  let disclaimerType: "default" | "age" | "strict" = "default";
  
  // 检查用户输入
  if (containsSensitiveWords(input.userInput)) {
    reasons.push("用户输入包含敏感词");
    disclaimerType = "strict";
  }
  
  // 检查 AI 输出
  if (containsSensitiveWords(input.aiOutput)) {
    reasons.push("AI 输出包含敏感词");
    filtered = filterSensitiveWords(input.aiOutput);
  }
  
  // 检查年龄限制
  if (isAgeRestricted(input.userInput) || isAgeRestricted(input.aiOutput)) {
    reasons.push("涉及未成年人相关内容");
    if (disclaimerType === "default") {
      disclaimerType = "age";
    }
  }
  
  // 判断是否合规
  const compliant = disclaimerType !== "strict";
  
  return {
    compliant,
    filtered,
    disclaimer: generateDisclaimer(disclaimerType),
    reasons,
  };
}

/**
 * 为 AI 提示词添加合规约束
 */
export function addComplianceConstraints(prompt: string): string {
  const constraints = `
## 重要约束
- 内容必须符合中国法律法规
- 禁止涉及政治敏感、暴力色情、赌博诈骗等违法内容
- 避免提供医疗、法律等专业建议
- 对于争议性话题保持中立客观
- 如涉及未成年人，必须谨慎并提醒家长监护

${prompt}
  `.trim();
  
  return constraints;
}

/**
 * 拒答检测 (某些敏感话题直接拒答)
 */
export function shouldReject(text: string): boolean {
  const rejectKeywords = [
    "政治立场", "政治观点", "政府批评",
    "色情服务", "性交易", "卖淫",
    "暴力伤害", "犯罪计划", "恐怖活动",
    "赌博平台", "诈骗方法", "洗钱技巧",
    "毒品交易", "制毒方法",
  ];
  
  const lowerText = text.toLowerCase();
  return rejectKeywords.some((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * 生成拒答回复
 */
export function generateRejectionMessage(): string {
  return `
非常抱歉，您的查询涉及敏感或违规内容，我们无法为您提供相关服务。

请遵守法律法规和平台规则，感谢您的理解与配合。

如有其他问题，欢迎继续咨询。
  `.trim();
}
