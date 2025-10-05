/**
 * 敏感内容检测模块
 */

/**
 * 检测敏感词汇
 */
export function assertNoSensitive(texts: string[]): void {
  // 简化的敏感词检测
  const sensitiveWords = ['政治', '敏感', '违法', '暴力', '色情'];

  for (const text of texts) {
    for (const word of sensitiveWords) {
      if (text.includes(word)) {
        throw new Error(`检测到敏感词汇: ${word}`);
      }
    }
  }
}

/**
 * 检查文本是否包含敏感内容
 */
export function hasSensitiveContent(text: string): boolean {
  const sensitiveWords = ['政治', '敏感', '违法', '暴力', '色情'];
  return sensitiveWords.some((word) => text.includes(word));
}
