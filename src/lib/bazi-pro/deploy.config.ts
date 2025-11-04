/**
 * 八字模块部署配置
 * 用于生产环境的配置和优化
 */

export interface DeployConfig {
  // API配置
  api: {
    baseUrl: string;
    timeout: number;
    retryCount: number;
    retryDelay: number;
  };

  // 缓存配置
  cache: {
    enabled: boolean;
    ttl: number; // 秒
    maxSize: number;
    strategy: 'memory' | 'redis' | 'hybrid';
  };

  // 性能配置
  performance: {
    enableMonitoring: boolean;
    enableProfiling: boolean;
    slowQueryThreshold: number; // 毫秒
    maxConcurrentRequests: number;
  };

  // 安全配置
  security: {
    enableRateLimit: boolean;
    rateLimitWindow: number; // 秒
    rateLimitMax: number;
    enableEncryption: boolean;
    enableAuditLog: boolean;
  };

  // 积分配置
  credits: {
    basicAnalysis: number;
    deepAnalysis: number;
    fortuneTelling: number;
    pdfExport: number;
    enableFreeTrials: boolean;
    freeTrialsCount: number;
  };

  // 功能开关
  features: {
    enableAIInterpretation: boolean;
    enableFortuneCycle: boolean;
    enableCompatibilityAnalysis: boolean;
    enablePDFExport: boolean;
    enableHistoryTracking: boolean;
    enableSocialSharing: boolean;
  };

  // 监控配置
  monitoring: {
    enableErrorTracking: boolean;
    enablePerformanceTracking: boolean;
    enableUserBehaviorTracking: boolean;
    sentryDsn?: string;
    gaTrackingId?: string;
  };

  // 限制配置
  limits: {
    maxRequestsPerUser: number;
    maxHistoryItems: number;
    maxExportsPerDay: number;
    maxAnalysisPerDay: number;
  };
}

// 开发环境配置
export const developmentConfig: DeployConfig = {
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
  },

  cache: {
    enabled: true,
    ttl: 3600,
    maxSize: 1000,
    strategy: 'memory',
  },

  performance: {
    enableMonitoring: true,
    enableProfiling: true,
    slowQueryThreshold: 100,
    maxConcurrentRequests: 10,
  },

  security: {
    enableRateLimit: false,
    rateLimitWindow: 60,
    rateLimitMax: 100,
    enableEncryption: false,
    enableAuditLog: false,
  },

  credits: {
    basicAnalysis: 5,
    deepAnalysis: 30,
    fortuneTelling: 20,
    pdfExport: 5,
    enableFreeTrials: true,
    freeTrialsCount: 3,
  },

  features: {
    enableAIInterpretation: true,
    enableFortuneCycle: true,
    enableCompatibilityAnalysis: true,
    enablePDFExport: true,
    enableHistoryTracking: true,
    enableSocialSharing: true,
  },

  monitoring: {
    enableErrorTracking: false,
    enablePerformanceTracking: true,
    enableUserBehaviorTracking: false,
  },

  limits: {
    maxRequestsPerUser: 1000,
    maxHistoryItems: 100,
    maxExportsPerDay: 50,
    maxAnalysisPerDay: 100,
  },
};

// 测试环境配置
export const stagingConfig: DeployConfig = {
  ...developmentConfig,
  api: {
    ...developmentConfig.api,
    baseUrl: 'https://staging.qiflowai.com',
  },

  security: {
    ...developmentConfig.security,
    enableRateLimit: true,
    rateLimitWindow: 60,
    rateLimitMax: 200,
    enableAuditLog: true,
  },

  monitoring: {
    ...developmentConfig.monitoring,
    enableErrorTracking: true,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN_STAGING,
  },
};

// 生产环境配置
export const productionConfig: DeployConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.qiflowai.com',
    timeout: 15000,
    retryCount: 2,
    retryDelay: 500,
  },

  cache: {
    enabled: true,
    ttl: 7200,
    maxSize: 5000,
    strategy: 'hybrid',
  },

  performance: {
    enableMonitoring: true,
    enableProfiling: false,
    slowQueryThreshold: 200,
    maxConcurrentRequests: 50,
  },

  security: {
    enableRateLimit: true,
    rateLimitWindow: 60,
    rateLimitMax: 60,
    enableEncryption: true,
    enableAuditLog: true,
  },

  credits: {
    basicAnalysis: 5,
    deepAnalysis: 30,
    fortuneTelling: 20,
    pdfExport: 5,
    enableFreeTrials: true,
    freeTrialsCount: 1,
  },

  features: {
    enableAIInterpretation: true,
    enableFortuneCycle: true,
    enableCompatibilityAnalysis: true,
    enablePDFExport: true,
    enableHistoryTracking: true,
    enableSocialSharing: true,
  },

  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUserBehaviorTracking: true,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  },

  limits: {
    maxRequestsPerUser: 100,
    maxHistoryItems: 50,
    maxExportsPerDay: 10,
    maxAnalysisPerDay: 20,
  },
};

// 根据环境获取配置
export function getConfig(): DeployConfig {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return productionConfig;
    case 'test':
      return stagingConfig;
    default:
      // development or staging
      return (env as string) === 'staging' ? stagingConfig : developmentConfig;
  }
}

// 配置验证
export function validateConfig(config: DeployConfig): boolean {
  // 验证API配置
  if (!config.api.baseUrl || config.api.timeout <= 0) {
    console.error('Invalid API configuration');
    return false;
  }

  // 验证缓存配置
  if (config.cache.enabled && config.cache.ttl <= 0) {
    console.error('Invalid cache configuration');
    return false;
  }

  // 验证性能配置
  if (config.performance.slowQueryThreshold <= 0) {
    console.error('Invalid performance configuration');
    return false;
  }

  // 验证安全配置
  if (config.security.enableRateLimit && config.security.rateLimitMax <= 0) {
    console.error('Invalid security configuration');
    return false;
  }

  // 验证积分配置
  const creditValues = Object.values(config.credits);
  if (creditValues.some((v) => typeof v === 'number' && v < 0)) {
    console.error('Invalid credits configuration');
    return false;
  }

  return true;
}

// 动态配置更新
export class ConfigManager {
  private static instance: ConfigManager;
  private config: DeployConfig;
  private listeners: Set<(config: DeployConfig) => void> = new Set();

  private constructor() {
    this.config = getConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): DeployConfig {
    return this.config;
  }

  updateConfig(updates: Partial<DeployConfig>): void {
    this.config = { ...this.config, ...updates };
    this.notifyListeners();
  }

  subscribe(listener: (config: DeployConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.config));
  }

  // 从远程获取配置
  async fetchRemoteConfig(): Promise<void> {
    try {
      const response = await fetch('/api/config/bazi');
      if (response.ok) {
        const remoteConfig = await response.json();
        this.updateConfig(remoteConfig);
      }
    } catch (error) {
      console.error('Failed to fetch remote config:', error);
    }
  }
}

// 导出单例
export const configManager = ConfigManager.getInstance();

// 环境检查
export function checkEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查必要的环境变量
  if (
    !process.env.NEXT_PUBLIC_API_URL &&
    process.env.NODE_ENV === 'production'
  ) {
    errors.push('NEXT_PUBLIC_API_URL is not set');
  }

  // 检查可选的环境变量
  if (
    !process.env.NEXT_PUBLIC_SENTRY_DSN &&
    process.env.NODE_ENV === 'production'
  ) {
    warnings.push('NEXT_PUBLIC_SENTRY_DSN is not set, error tracking disabled');
  }

  if (
    !process.env.NEXT_PUBLIC_GA_TRACKING_ID &&
    process.env.NODE_ENV === 'production'
  ) {
    warnings.push('NEXT_PUBLIC_GA_TRACKING_ID is not set, analytics disabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
