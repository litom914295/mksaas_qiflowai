import { createOpenAIClient } from './providers/openai';
import { createAnthropicClient } from './providers/anthropic';
import { createGeminiClient } from './providers/gemini';
import { createDeepSeekClient } from './providers/deepseek';
import type {
  AIRequest,
  AIResponse,
  ProviderClient,
  ProviderConfig,
  RoutingPolicy,
  CostBudget,
} from './types';

/**
 * 路由器配置常量
 */
const ROUTER_CONFIG = {
  HEALTH_CHECK_TIMEOUT: 10000, // 健康检查超时 (10秒)
  REQUEST_TIMEOUT: 60000, // 请求超时 (60秒)
  MAX_RETRIES: 3, // 最大重试次数
  RETRY_DELAY_BASE: 1000, // 重试基础延迟 (毫秒)
  CIRCUIT_BREAKER_THRESHOLD: 5, // 熔断阈值
  CIRCUIT_BREAKER_TIMEOUT: 60000, // 熔断恢复时间 (60秒)
} as const;

/**
 * 提供商错误信息接口
 */
interface ProviderError {
  provider: string;
  error: unknown;
  timestamp: number;
  isRetryable: boolean;
}

/**
 * 路由器健康状态接口
 */
interface RouterHealthStatus {
  healthy: boolean;
  providers: Record<string, { healthy: boolean; lastCheck: number; errorCount: number }>;
  totalRequests: number;
  successfulRequests: number;
  errorRate: number;
}

/**
 * 从环境变量获取提供商配置
 * @returns 提供商配置数组
 */
const providerFromEnv = (): ProviderConfig[] => {
  const configs: ProviderConfig[] = [];
  
  // 验证和清理环境变量
  const addProviderConfig = (
    name: string,
    keyEnv: string,
    baseURLEnv?: string
  ) => {
    const apiKey = process.env[keyEnv];
    const baseURL = baseURLEnv ? process.env[baseURLEnv] : undefined;
    
    if (apiKey && apiKey.trim()) {
      try {
        configs.push({ 
          name: name as any, 
          apiKey: apiKey.trim(), 
          baseURL: baseURL?.trim(),
          timeoutMs: ROUTER_CONFIG.REQUEST_TIMEOUT
        });
      } catch (error) {
        console.error(`配置${name}提供商失败:`, error);
      }
    }
  };
  
  addProviderConfig('openai', 'OPENAI_API_KEY', 'OPENAI_BASE_URL');
  addProviderConfig('anthropic', 'ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL');
  addProviderConfig('gemini', 'GEMINI_API_KEY', 'GEMINI_BASE_URL');
  addProviderConfig('deepseek', 'DEEPSEEK_API_KEY', 'DEEPSEEK_BASE_URL');
  
  return configs;
};

/**
 * 构建客户端实例
 * @param configs 提供商配置
 * @returns 客户端数组
 */
const buildClients = (configs: ProviderConfig[]): ProviderClient[] => {
  const clients: ProviderClient[] = [];
  
  for (const config of configs) {
    try {
      let client: ProviderClient;
      
      switch (config.name) {
        case 'openai':
        case 'openai-compatible':
          client = createOpenAIClient(config);
          break;
        case 'anthropic':
          client = createAnthropicClient(config);
          break;
        case 'gemini':
          client = createGeminiClient(config);
          break;
        case 'deepseek':
          client = createDeepSeekClient(config);
          break;
        default:
          console.warn(`不支持的AI提供商: ${config.name}`);
          continue;
      }
      
      clients.push(client);
    } catch (error) {
      console.error(`创建${config.name}客户端失败:`, error);
      // 继续处理其他提供商，不要因为一个失败就停止
    }
  }
  
  return clients;
};

/**
 * 判断错误是否可重试
 * @param error 错误对象
 * @returns 是否可重试
 */
const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // 网络错误、超时错误、服务器错误通常可以重试
    return message.includes('timeout') ||
           message.includes('network') ||
           message.includes('502') ||
           message.includes('503') ||
           message.includes('504') ||
           message.includes('连接') ||
           message.includes('超时');
  }
  return false;
};

/**
 * 计算指数退避延迟
 * @param attempt 重试次数
 * @returns 延迟时间（毫秒）
 */
const calculateBackoffDelay = (attempt: number): number => {
  const delay = ROUTER_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // 添加抖动避免惊群效应
  return Math.min(delay + jitter, 30000); // 最大延迟30秒
};

/**
 * 创建AI路由器
 * @param policy 路由策略
 * @param budget 成本预算
 * @returns 路由器实例
 */
export const createRouter = (policy?: RoutingPolicy, budget?: CostBudget) => {
  const configs = providerFromEnv();
  
  if (configs.length === 0) {
    console.warn('未配置任何AI提供商API密钥，AI功能将不可用');
  }
  
  const clients = buildClients(configs);
  const order = policy?.order ?? (['openai'] as RoutingPolicy['order']);
  
  // 健康状态追踪
  const healthStatus: Record<string, { 
    healthy: boolean; 
    lastCheck: number; 
    errorCount: number;
    circuitBreakerOpen: boolean;
    circuitBreakerOpenTime: number;
  }> = {};
  
  // 请求统计
  let totalRequests = 0;
  let successfulRequests = 0;
  
  // 初始化健康状态
  clients.forEach(client => {
    healthStatus[client.name] = {
      healthy: true,
      lastCheck: 0,
      errorCount: 0,
      circuitBreakerOpen: false,
      circuitBreakerOpenTime: 0,
    };
  });

  /**
   * 选择可用的客户端
   * @returns 客户端数组
   */
  const pickClients = (): ProviderClient[] => {
    const byName = new Map(clients.map(c => [c.name, c] as const));
    const selected = order
      .map(name => byName.get(name))
      .filter((client): client is ProviderClient => {
        if (!client) return false;
        
        const status = healthStatus[client.name];
        if (!status) return true;
        
        // 检查熔断器状态
        if (status.circuitBreakerOpen) {
          const now = Date.now();
          if (now - status.circuitBreakerOpenTime > ROUTER_CONFIG.CIRCUIT_BREAKER_TIMEOUT) {
            // 尝试恢复
            status.circuitBreakerOpen = false;
            status.errorCount = 0;
            console.log(`[AI路由器] ${client.name} 熔断器恢复`);
            return true;
          }
          return false;
        }
        
        return status.healthy;
      });
    
    // 如果没有找到指定的客户端，返回所有可用的健康客户端
    if (selected.length === 0) {
      return clients.filter(client => {
        const status = healthStatus[client.name];
        return !status?.circuitBreakerOpen;
      });
    }
    
    return selected;
  };

  /**
   * 更新提供商健康状态
   * @param providerName 提供商名称
   * @param isHealthy 是否健康
   * @param isError 是否为错误
   */
  const updateHealthStatus = (providerName: string, isHealthy: boolean, isError = false) => {
    const status = healthStatus[providerName];
    if (!status) return;
    
    status.healthy = isHealthy;
    status.lastCheck = Date.now();
    
    if (isError) {
      status.errorCount++;
      // 检查是否需要开启熔断器
      if (status.errorCount >= ROUTER_CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
        status.circuitBreakerOpen = true;
        status.circuitBreakerOpenTime = Date.now();
        console.error(`[AI路由器] ${providerName} 错误过多，开启熔断器`);
      }
    } else {
      // 成功时重置错误计数
      status.errorCount = Math.max(0, status.errorCount - 1);
    }
  };

  /**
   * 执行AI聊天请求
   * @param input 请求参数
   * @returns AI响应
   */
  const chat = async (input: AIRequest): Promise<AIResponse> => {
    totalRequests++;
    
    // 验证输入参数
    if (!input || !input.messages || !Array.isArray(input.messages) || input.messages.length === 0) {
      throw new Error('无效的AI请求参数：缺少消息内容');
    }
    
    const candidates = pickClients();
    
    if (candidates.length === 0) {
      throw new Error('没有可用的AI提供商，所有服务都不可用或处于熔断状态');
    }
    
    const errors: ProviderError[] = [];
    
    for (let i = 0; i < candidates.length; i++) {
      const client = candidates[i];
      let retryCount = 0;
      
      while (retryCount <= ROUTER_CONFIG.MAX_RETRIES) {
        try {
          // 健康检查（带超时）
          const healthCheckPromise = client.isHealthy();
          const timeoutPromise = new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('健康检查超时')), ROUTER_CONFIG.HEALTH_CHECK_TIMEOUT)
          );
          
          const healthy = await Promise.race([healthCheckPromise, timeoutPromise]);
          
          if (!healthy) {
            updateHealthStatus(client.name, false, true);
            const error = new Error(`${client.name} 健康检查失败`);
            errors.push({
              provider: client.name,
              error,
              timestamp: Date.now(),
              isRetryable: true
            });
            
            if (!policy?.allowFallback && i === 0) {
              throw error;
            }
            break; // 跳到下一个提供商
          }
          
          updateHealthStatus(client.name, true);
          
          // 执行AI请求
          const response = await client.chat(input);
          
          // 请求成功
          successfulRequests++;
          updateHealthStatus(client.name, true);
          
          return response;
          
        } catch (error) {
          const errorInfo: ProviderError = {
            provider: client.name,
            error,
            timestamp: Date.now(),
            isRetryable: isRetryableError(error)
          };
          
          errors.push(errorInfo);
          updateHealthStatus(client.name, false, true);
          
          console.error(`[AI路由器] ${client.name} 请求失败 (重试 ${retryCount}/${ROUTER_CONFIG.MAX_RETRIES}):`, error);
          
          // 检查是否应该重试
          if (retryCount < ROUTER_CONFIG.MAX_RETRIES && errorInfo.isRetryable) {
            retryCount++;
            const delay = calculateBackoffDelay(retryCount);
            console.log(`[AI路由器] ${client.name} 将在 ${delay}ms 后重试`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // 如果不允许回退且是第一个提供商，直接抛出错误
          if (!policy?.allowFallback && i === 0) {
            throw error instanceof Error ? error : new Error(`${client.name} 请求失败`);
          }
          
          break; // 跳到下一个提供商
        }
      }
    }
    
    // 所有提供商都失败了
    const errorSummary = errors.map(e => {
      const errorMsg = e.error instanceof Error ? e.error.message : String(e.error);
      return `${e.provider}: ${errorMsg}`;
    }).join('; ');
    
    const finalError = new Error(`所有AI提供商都失败了: ${errorSummary}`);
    
    // 添加错误详情以便调试
    (finalError as any).details = {
      totalProviders: candidates.length,
      errors: errors.map(e => ({
        provider: e.provider,
        message: e.error instanceof Error ? e.error.message : String(e.error),
        timestamp: e.timestamp,
        isRetryable: e.isRetryable
      })),
      healthStatus: { ...healthStatus }
    };
    
    throw finalError;
  };

  /**
   * 获取可用的提供商列表
   * @returns 提供商名称数组
   */
  const getAvailableProviders = (): string[] => {
    return clients.map(c => c.name);
  };

  /**
   * 获取健康状态
   * @returns 健康状态对象
   */
  const getHealthStatus = async (): Promise<RouterHealthStatus> => {
    const providerHealths: Record<string, { healthy: boolean; lastCheck: number; errorCount: number }> = {};
    
    // 并发检查所有提供商的健康状态
    await Promise.allSettled(
      clients.map(async client => {
        try {
          const startTime = Date.now();
          const healthy = await Promise.race([
            client.isHealthy(),
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('超时')), ROUTER_CONFIG.HEALTH_CHECK_TIMEOUT)
            )
          ]);
          
          const status = healthStatus[client.name];
          providerHealths[client.name] = {
            healthy,
            lastCheck: Date.now(),
            errorCount: status?.errorCount || 0
          };
          
          updateHealthStatus(client.name, healthy);
        } catch (error) {
          const status = healthStatus[client.name];
          providerHealths[client.name] = {
            healthy: false,
            lastCheck: Date.now(),
            errorCount: status?.errorCount || 0
          };
          
          updateHealthStatus(client.name, false, true);
        }
      })
    );
    
    const healthyProviders = Object.values(providerHealths).filter(p => p.healthy).length;
    const errorRate = totalRequests > 0 ? (totalRequests - successfulRequests) / totalRequests : 0;
    
    return {
      healthy: healthyProviders > 0,
      providers: providerHealths,
      totalRequests,
      successfulRequests,
      errorRate
    };
  };

  /**
   * 重置统计信息
   */
  const resetStats = (): void => {
    totalRequests = 0;
    successfulRequests = 0;
    
    Object.keys(healthStatus).forEach(provider => {
      healthStatus[provider].errorCount = 0;
      healthStatus[provider].circuitBreakerOpen = false;
    });
  };

  return { 
    chat,
    getAvailableProviders,
    getHealthStatus,
    resetStats
  };
};


