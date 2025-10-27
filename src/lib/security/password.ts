/**
 * 密码强度验证规则
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventSequentialChars: boolean;
  preventRepeatingChars: boolean;
}

/**
 * 默认密码要求
 */
export const defaultPasswordRequirements: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventSequentialChars: true,
  preventRepeatingChars: true,
};

/**
 * 常见弱密码列表（部分）
 */
const commonPasswords = [
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  '1234567890',
  'password1',
  'password!',
  'admin123',
];

/**
 * 密码强度级别
 */
export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  FAIR = 2,
  GOOD = 3,
  STRONG = 4,
  VERY_STRONG = 5,
}

/**
 * 密码验证结果
 */
export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  score: number;
  errors: string[];
  suggestions: string[];
}

/**
 * 检查密码是否包含连续字符
 */
function hasSequentialChars(password: string, maxSequence = 3): boolean {
  for (let i = 0; i < password.length - maxSequence + 1; i++) {
    let isSequential = true;
    for (let j = 1; j < maxSequence; j++) {
      const charCode = password.charCodeAt(i + j);
      const prevCharCode = password.charCodeAt(i + j - 1);
      if (charCode !== prevCharCode + 1 && charCode !== prevCharCode - 1) {
        isSequential = false;
        break;
      }
    }
    if (isSequential) return true;
  }
  return false;
}

/**
 * 检查密码是否包含重复字符
 */
function hasRepeatingChars(password: string, maxRepeat = 3): boolean {
  for (let i = 0; i < password.length - maxRepeat + 1; i++) {
    const char = password[i];
    let count = 1;
    for (let j = i + 1; j < password.length && j < i + maxRepeat; j++) {
      if (password[j] === char) {
        count++;
        if (count >= maxRepeat) return true;
      } else {
        break;
      }
    }
  }
  return false;
}

/**
 * 计算密码熵（比特）
 */
function calculateEntropy(password: string): number {
  const charsets = {
    lowercase: 26,
    uppercase: 26,
    numbers: 10,
    special: 32,
  };

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += charsets.lowercase;
  if (/[A-Z]/.test(password)) poolSize += charsets.uppercase;
  if (/[0-9]/.test(password)) poolSize += charsets.numbers;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += charsets.special;

  const entropy = password.length * Math.log2(poolSize);
  return entropy;
}

/**
 * 验证密码强度
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = defaultPasswordRequirements
): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // 基本长度检查
  if (password.length < requirements.minLength) {
    errors.push(`密码至少需要 ${requirements.minLength} 个字符`);
  } else {
    score += 20;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;
  }

  // 字符类型检查
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  } else if (requirements.requireUppercase) {
    score += 10;
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  } else if (requirements.requireLowercase) {
    score += 10;
  }

  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  } else if (requirements.requireNumbers) {
    score += 10;
  }

  if (requirements.requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符');
  } else if (requirements.requireSpecialChars) {
    score += 10;
  }

  // 常见密码检查
  if (requirements.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (commonPasswords.some((common) => lowerPassword.includes(common))) {
      errors.push('密码包含常见的弱密码模式');
      score -= 20;
    } else {
      score += 10;
    }
  }

  // 连续字符检查
  if (requirements.preventSequentialChars && hasSequentialChars(password)) {
    errors.push('密码不应包含连续字符（如 abc, 123）');
    score -= 10;
  } else if (requirements.preventSequentialChars) {
    score += 5;
  }

  // 重复字符检查
  if (requirements.preventRepeatingChars && hasRepeatingChars(password)) {
    errors.push('密码不应包含过多重复字符');
    score -= 10;
  } else if (requirements.preventRepeatingChars) {
    score += 5;
  }

  // 计算熵值并调整分数
  const entropy = calculateEntropy(password);
  if (entropy < 30) {
    suggestions.push('密码太简单，请增加复杂度');
    score -= 10;
  } else if (entropy < 50) {
    suggestions.push('建议使用更复杂的密码组合');
  } else if (entropy >= 60) {
    score += 10;
  }

  // 计算最终强度级别
  let strength: PasswordStrength;
  if (score < 30) {
    strength = PasswordStrength.VERY_WEAK;
  } else if (score < 50) {
    strength = PasswordStrength.WEAK;
  } else if (score < 65) {
    strength = PasswordStrength.FAIR;
  } else if (score < 80) {
    strength = PasswordStrength.GOOD;
  } else if (score < 90) {
    strength = PasswordStrength.STRONG;
  } else {
    strength = PasswordStrength.VERY_STRONG;
  }

  // 提供改进建议
  if (errors.length === 0 && strength < PasswordStrength.STRONG) {
    if (!password.match(/[A-Z].*[A-Z]/)) {
      suggestions.push('使用多个大写字母增强安全性');
    }
    if (!password.match(/[0-9].*[0-9]/)) {
      suggestions.push('使用多个数字增强安全性');
    }
    if (!password.match(/[^a-zA-Z0-9].*[^a-zA-Z0-9]/)) {
      suggestions.push('使用多个特殊字符增强安全性');
    }
    if (password.length < 16) {
      suggestions.push('建议使用至少 16 个字符的密码');
    }
  }

  return {
    isValid: errors.length === 0,
    strength,
    score: Math.max(0, Math.min(100, score)),
    errors,
    suggestions,
  };
}

/**
 * 生成安全的随机密码
 */
export function generateSecurePassword(length = 16): string {
  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  let password = '';
  const allChars = Object.values(charset).join('');

  // 确保包含每种字符类型至少一个
  password +=
    charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
  password +=
    charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
  password +=
    charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
  password +=
    charset.special[Math.floor(Math.random() * charset.special.length)];

  // 填充剩余字符
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 打乱密码字符顺序
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * 检查密码是否被泄露（使用 Have I Been Pwned API）
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    // 使用 SHA-1 哈希密码
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // 使用 k-匿名性：只发送哈希的前5个字符
    const prefix = hashHex.substring(0, 5).toUpperCase();
    const suffix = hashHex.substring(5).toUpperCase();

    // 查询 HIBP API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'User-Agent': 'QiFlowAI-Security-Check',
        },
      }
    );

    if (response.ok) {
      const text = await response.text();
      const hashes = text.split('\n');

      // 检查后缀是否在返回的列表中
      for (const hash of hashes) {
        const [hashSuffix] = hash.split(':');
        if (hashSuffix === suffix) {
          return true; // 密码已被泄露
        }
      }
    }

    return false; // 密码未被泄露
  } catch (error) {
    console.error('Failed to check password breach:', error);
    return false; // 发生错误时假设密码是安全的
  }
}
