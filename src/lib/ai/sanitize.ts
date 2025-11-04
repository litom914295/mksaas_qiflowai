// 增强的数据去敏化：全面保护个人隐私信息
export const sanitizeForAI = (data: unknown): unknown => {
  try {
    if (data && typeof data === 'object') {
      const json = JSON.parse(JSON.stringify(data));
      const scrub = (obj: any, path = ''): void => {
        if (!obj || typeof obj !== 'object') return;

        // 扩展的PII字段列表
        const piiKeys = [
          'name',
          'email',
          'phone',
          'address',
          'exactCoordinates',
          'id',
          'userId',
          'sessionId',
          'ip',
          'ipAddress',
          'latitude',
          'longitude',
          'realName',
          'firstName',
          'lastName',
          'fullName',
          'birthDate',
          'birthday',
          'ssn',
          'passport',
          'license',
          'token',
          'password',
          'secret',
          'key',
          'apiKey',
          'deviceId',
          'fingerprint',
          'userAgent',
          'cookie',
          'personalInfo',
          'contactInfo',
          'location',
          'gps',
        ];

        // 模式匹配的敏感字段
        const sensitivePatterns = [
          /.*_id$/i,
          /.*Id$/i,
          /.*_token$/i,
          /.*Token$/i,
          /.*_key$/i,
          /.*Key$/i,
          /.*_secret$/i,
          /.*Secret$/i,
          /.*password.*/i,
          /.*email.*/i,
          /.*phone.*/i,
          /.*address.*/i,
          /.*location.*/i,
          /.*coordinate.*/i,
        ];

        for (const key of Object.keys(obj)) {
          const lowerKey = key.toLowerCase();
          const value = obj[key];

          // 检查明确的PII字段
          if (piiKeys.some((pii) => lowerKey.includes(pii.toLowerCase()))) {
            delete obj[key];
            continue;
          }

          // 检查模式匹配
          if (sensitivePatterns.some((pattern) => pattern.test(key))) {
            delete obj[key];
            continue;
          }

          // 检查值内容（可能包含敏感信息的字符串）
          if (typeof value === 'string') {
            // 移除可能的邮箱、电话号码、IP地址等
            if (
              /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(
                value
              ) ||
              /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(value) ||
              /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(value) ||
              value.length > 100 // 过长的字符串可能包含敏感信息
            ) {
              obj[key] = '[REDACTED]';
              continue;
            }
          }

          // 递归处理嵌套对象
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item, index) =>
                scrub(item, `${path}.${key}[${index}]`)
              );
            } else {
              scrub(value, `${path}.${key}`);
            }
          }
        }
      };

      scrub(json);
      return json;
    }
    return data;
  } catch (error) {
    console.warn('数据去敏化失败:', error);
    return undefined;
  }
};
