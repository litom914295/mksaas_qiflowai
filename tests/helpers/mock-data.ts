import { randomUUID } from 'crypto';

/**
 * Mock 用户数据
 */
export const mockUsers = {
  regular: {
    id: 'test-user-regular',
    email: 'regular@test.com',
    name: 'Regular User',
    role: 'user',
    credits: 100,
  },
  admin: {
    id: 'test-user-admin',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
    credits: 1000,
  },
  lowCredit: {
    id: 'test-user-low',
    email: 'lowcredit@test.com',
    name: 'Low Credit User',
    role: 'user',
    credits: 5,
  },
  noCredit: {
    id: 'test-user-zero',
    email: 'nocredit@test.com',
    name: 'No Credit User',
    role: 'user',
    credits: 0,
  },
};

/**
 * Mock 积分消耗配置
 */
export const mockCreditPricing = {
  aiChat: 5,
  deepInterpretation: 30,
  bazi: 10,
  xuankong: 20,
  pdfExport: 5,
  guestAnalysis: 3,
};

/**
 * Mock 积分交易类型
 */
export const mockTransactionTypes = {
  REGISTRATION: 'registration',
  PURCHASE: 'purchase',
  REFERRAL: 'referral',
  CONSUME: 'consume',
  ADMIN_GRANT: 'admin_grant',
  EXPIRATION: 'expiration',
};

/**
 * 生成 Mock 积分交易记录
 */
export function generateMockTransaction(overrides = {}) {
  return {
    id: randomUUID(),
    userId: 'test-user-id',
    type: 'consume',
    amount: -10,
    description: 'Test consumption',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * SQL 注入测试 Payload
 */
export const sqlInjectionPayloads = [
  "'; DROP TABLE users; --",
  "1' OR '1'='1",
  "admin'--",
  "' UNION SELECT * FROM users--",
  "' OR 1=1--",
  "'; DELETE FROM user_credit WHERE '1'='1",
  "1' AND 1=0 UNION ALL SELECT 'admin', '81dc9bdb52d04dc20036dbd8313ed055'",
  "' OR 'x'='x",
];

/**
 * XSS 攻击测试 Payload
 */
export const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)">',
  '<svg onload=alert(1)>',
  '<body onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
];

/**
 * Mock 八字分析请求数据
 */
export const mockBaziRequest = {
  valid: {
    name: '张三',
    birthDate: '1990-01-01',
    birthTime: '08:00',
    gender: 'male',
    timezone: '+08:00',
  },
  invalid: {
    name: '',
    birthDate: 'invalid-date',
    birthTime: '25:00',
    gender: 'unknown',
  },
  withXSS: {
    name: '<script>alert("XSS")</script>',
    birthDate: '1990-01-01',
    birthTime: '08:00',
    gender: 'male',
  },
};

/**
 * Mock 玄空分析请求数据
 */
export const mockXuankongRequest = {
  valid: {
    address: '上海市静安区XX路',
    facing: '180',
    buildYear: '2020',
  },
  invalid: {
    address: '',
    facing: '400', // 超出范围
    buildYear: 'invalid',
  },
};

/**
 * Mock Stripe 支付数据
 */
export const mockStripePayment = {
  session: {
    id: 'cs_test_123456',
    payment_status: 'paid',
    amount_total: 1990,
    currency: 'cny',
    customer: 'cus_test_123',
  },
  webhook: {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123456',
        payment_status: 'paid',
        metadata: {
          userId: 'test-user-id',
          credits: '100',
        },
      },
    },
  },
};

/**
 * Mock 环境变量
 */
export const mockEnv = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NEXTAUTH_SECRET: 'test-secret',
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
};
