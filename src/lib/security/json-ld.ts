/**
 * 安全的 JSON-LD 序列化工具
 *
 * JSON.stringify() 默认不转义 </script> 和 <!--，这会导致 XSS 漏洞。
 *
 * 漏洞示例：
 * ```html
 * <script type="application/ld+json">
 *   {"description":"</script><script>alert(1)</script>"}
 * </script>
 * ```
 * 浏览器会将 </script> 解析为标签闭合，导致后面的恶意脚本被执行。
 *
 * 此函数通过替换危险字符串来防止此类攻击。
 */

/**
 * 安全地序列化数据为 JSON-LD 格式
 *
 * @param data - 要序列化的数据
 * @returns 安全的 JSON 字符串，可用于 <script type="application/ld+json">
 *
 * @example
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: safeJsonLdReplacer(schema) }}
 * />
 * ```
 */
export function safeJsonLdReplacer(data: unknown): string {
  return (
    JSON.stringify(data)
      // 转义 </script> 防止标签闭合（大小写不敏感）
      .replace(/<\/script/gi, '<\\/script')
      // 转义 <script> 防止新标签注入
      .replace(/<script/gi, '<\\script')
      // 转义 <!-- 防止 HTML 注释注入
      .replace(/<!--/g, '<\\!--')
  );
}

/**
 * 验证 JSON-LD 数据是否安全
 *
 * @param data - 要验证的数据
 * @returns 如果数据可以安全序列化为 JSON-LD，返回 true
 */
export function isJsonLdSafe(data: unknown): boolean {
  try {
    const json = JSON.stringify(data);
    // 检查是否包含危险模式
    const dangerousPatterns = [
      /<\/script/i, // 标签闭合
      /<!--/, // HTML 注释
    ];

    // 如果包含危险模式，需要使用 safeJsonLdReplacer
    return !dangerousPatterns.some((pattern) => pattern.test(json));
  } catch {
    return false;
  }
}

/**
 * JSON 转义验证测试用例
 *
 * @internal 仅用于测试
 */
export const _testCases = {
  safe: [
    { name: 'Simple string', data: { content: 'Hello World' } },
    { name: 'Numbers and booleans', data: { count: 123, active: true } },
    { name: 'Nested objects', data: { user: { name: 'Alice', age: 30 } } },
  ],
  unsafe: [
    {
      name: 'Script tag closure',
      data: { desc: '</script><script>alert(1)</script>' },
    },
    { name: 'HTML comment', data: { comment: '<!-- malicious content -->' } },
    {
      name: 'Mixed case script',
      data: { text: '</ScRiPt><script>alert(1)</script>' },
    },
  ],
};
