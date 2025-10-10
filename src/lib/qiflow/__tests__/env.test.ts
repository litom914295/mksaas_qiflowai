import assert from 'node:assert';
import {
  env,
  getDefaultAIProvider,
  hasAIService,
  isDevelopment,
} from '@/lib/env';

// 基础环境变量验证
assert.ok(
  env.NODE_ENV === 'development' ||
    env.NODE_ENV === 'production' ||
    env.NODE_ENV === 'test'
);

// 必需配置验证
assert.ok(env.DATABASE_URL, '数据库URL必须配置');
assert.ok(env.BETTER_AUTH_SECRET, '认证密钥必须配置');

// AI提供商是可选的
const provider = getDefaultAIProvider();
if (provider) {
  console.log('[env.test] AI提供商:', provider);
} else {
  console.log('[env.test] 未配置AI提供商');
}

console.log('[env.test] ✅ 环境变量验证通过');
