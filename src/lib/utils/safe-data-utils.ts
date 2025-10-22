/**
 * Safe Data Utilities
 * 安全数据处理工具
 */

/**
 * 安全地解析 JSON
 */
export function safeParseJSON<T = any>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 安全地获取嵌套属性
 */
export function safeGet<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null) {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}

/**
 * 安全地转换为数字
 */
export function safeNumber(value: any, defaultValue = 0): number {
  const num = Number(value);
  return Number.isNaN(num) ? defaultValue : num;
}

/**
 * 安全地转换为字符串
 */
export function safeString(value: any, defaultValue = ''): string {
  if (value == null) {
    return defaultValue;
  }
  return String(value);
}

/**
 * 安全地转换为布尔值
 */
export function safeBoolean(value: any, defaultValue = false): boolean {
  if (value == null) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }

  return Boolean(value);
}

/**
 * 安全地转换为数组
 */
export function safeArray<T = any>(value: any, defaultValue: T[] = []): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return defaultValue;
}

/**
 * 确保值是数组（别名）
 */
export function ensureArray<T = any>(value: any, defaultValue: T[] = []): T[] {
  return safeArray(value, defaultValue);
}

/**
 * 清理对象中的 undefined 值
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone((obj as any)[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 限制对象的键
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result: any = {};

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * 排除对象的键
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result: any = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}
