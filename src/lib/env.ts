/**
 * 环境变量验证模块
 * 确保所有必需的环境变量都已正确配置
 * 提供类型安全的环境变量访问
 */

import { z } from 'zod';

/**
 * 定义环境变量Schema
 * 使用Zod进行运行时验证
 * 适配项目实际使用的环境变量
 */
const envSchema = z.object({
  // Node环境
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // 基础配置
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),

  // 数据库配置 (必需)
  DATABASE_URL: z.string().url(),

  // 认证配置 (必需)
  BETTER_AUTH_SECRET: z.string().min(32),

  // AI API密钥（可选，根据项目需要添加）
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  PERPLEXITY_API_KEY: z.string().optional(),

  // 邮件服务（可选）
  RESEND_API_KEY: z.string().optional(),

  // 支付服务（可选）
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // 功能开关
  DISABLE_IMAGE_OPTIMIZATION: z.string().optional(),
  DOCKER_BUILD: z.string().optional(),

  // 分析工具
  ANALYZE: z.string().optional(),
});

/**
 * 验证环境变量的函数
 * 在服务器启动时执行验证
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 环境变量验证失败:');
      console.error(error.flatten().fieldErrors);

      // 在开发环境提供详细错误信息
      if (process.env.NODE_ENV === 'development') {
        throw new Error(
          `环境变量配置错误:\n${JSON.stringify(error.flatten().fieldErrors, null, 2)}`
        );
      }
      // 生产环境不暴露具体错误细节
      throw new Error('环境变量配置错误，请检查服务器配置');
    }
    throw error;
  }
}

/**
 * 导出验证后的环境变量
 * 提供类型安全的访问
 */
export const env = validateEnv();

/**
 * 类型导出，供其他模块使用
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 辅助函数：检查是否在生产环境
 */
export const isProduction = () => env.NODE_ENV === 'production';

/**
 * 辅助函数：检查是否在开发环境
 */
export const isDevelopment = () => env.NODE_ENV === 'development';

/**
 * 辅助函数：获取配置的AI提供商
 */
export const getAvailableAIProviders = () => {
  const providers: string[] = [];

  if (env.ANTHROPIC_API_KEY) providers.push('anthropic');
  if (env.OPENAI_API_KEY) providers.push('openai');
  if (env.GOOGLE_API_KEY) providers.push('google');
  if (env.PERPLEXITY_API_KEY) providers.push('perplexity');

  return providers;
};

/**
 * 辅助函数：获取默认AI提供商
 */
export const getDefaultAIProvider = () => {
  // 优先级顺序：Anthropic > OpenAI > Google > Perplexity
  if (env.ANTHROPIC_API_KEY) return 'anthropic';
  if (env.OPENAI_API_KEY) return 'openai';
  if (env.GOOGLE_API_KEY) return 'google';
  if (env.PERPLEXITY_API_KEY) return 'perplexity';

  return null;
};

/**
 * 辅助函数：检查是否有AI服务可用
 */
export const hasAIService = () => {
  return getAvailableAIProviders().length > 0;
};

/**
 * 辅助函数：检查邮件服务是否可用
 */
export const hasEmailService = () => {
  return !!env.RESEND_API_KEY;
};
