/**
 * 户型叠加持久化功能配置
 *
 * 支持灰度发布、配额控制、性能调优
 *
 * @version 5.1.1
 */

/**
 * 云存储策略类型
 */
export type CloudUploadStrategy = 'allow' | 'deny' | 'auto';

/**
 * 户型叠加功能配置接口
 */
export interface FloorplanConfig {
  /** 总开关 - 是否启用户型叠加持久化功能 */
  enabled: boolean;

  /** 云存储配置 */
  cloudUpload: {
    /** 是否启用云存储 */
    enabled: boolean;
    /** 免费用户策略 */
    freeTierStrategy: CloudUploadStrategy;
    /** 最大图片大小（MB） */
    maxImageSizeMB: number;
    /** 最大图片尺寸（像素） */
    maxImageDimension: number;
  };

  /** 配额限制 */
  quota: {
    /** 每用户最大方案数 */
    maxPlansPerUser: number;
    /** localStorage 警告阈值（百分比） */
    localStorageWarningThreshold: number;
    /** 自动清理天数 */
    autoCleanDays: number;
  };

  /** 性能配置 */
  performance: {
    /** 防抖延迟（毫秒） */
    debounceMs: number;
    /** 自动保存间隔（毫秒，0 表示禁用） */
    autoSaveInterval: number;
    /** 压缩质量（0-1） */
    compressionQuality: number;
  };

  /** 功能开关 */
  features: {
    /** 是否启用匿名用户迁移 */
    enableAnonymousMigration: boolean;
    /** 是否启用方案管理器 */
    enablePlanManager: boolean;
    /** 是否启用离线模式 */
    enableOfflineMode: boolean;
  };
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: FloorplanConfig = {
  enabled: true,

  cloudUpload: {
    enabled: true,
    freeTierStrategy: 'allow',
    maxImageSizeMB: 10,
    maxImageDimension: 4096,
  },

  quota: {
    maxPlansPerUser: 10,
    localStorageWarningThreshold: 80,
    autoCleanDays: 90,
  },

  performance: {
    debounceMs: 300,
    autoSaveInterval: 10000,
    compressionQuality: 0.85,
  },

  features: {
    enableAnonymousMigration: true,
    enablePlanManager: true,
    enableOfflineMode: true,
  },
};

/**
 * 从环境变量读取配置
 */
function loadConfigFromEnv(): Partial<FloorplanConfig> {
  if (typeof window === 'undefined') {
    // 服务端环境
    return {};
  }

  return {
    enabled: process.env.NEXT_PUBLIC_FLOORPLAN_ENABLED !== 'false',

    cloudUpload: {
      enabled: process.env.NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED !== 'false',
      freeTierStrategy:
        (process.env.NEXT_PUBLIC_CLOUD_FREE_TIER as CloudUploadStrategy) ||
        'allow',
      maxImageSizeMB: Number.parseInt(
        process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB || '10'
      ),
      maxImageDimension: Number.parseInt(
        process.env.NEXT_PUBLIC_MAX_IMAGE_DIMENSION || '4096'
      ),
    },

    quota: {
      maxPlansPerUser: Number.parseInt(
        process.env.NEXT_PUBLIC_MAX_PLANS_PER_USER || '10'
      ),
      localStorageWarningThreshold: Number.parseInt(
        process.env.NEXT_PUBLIC_STORAGE_WARNING_THRESHOLD || '80'
      ),
      autoCleanDays: Number.parseInt(
        process.env.NEXT_PUBLIC_AUTO_CLEAN_DAYS || '90'
      ),
    },

    performance: {
      debounceMs: Number.parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_MS || '300'),
      autoSaveInterval: Number.parseInt(
        process.env.NEXT_PUBLIC_AUTO_SAVE_INTERVAL || '10000'
      ),
      compressionQuality: Number.parseFloat(
        process.env.NEXT_PUBLIC_COMPRESSION_QUALITY || '0.85'
      ),
    },

    features: {
      enableAnonymousMigration:
        process.env.NEXT_PUBLIC_ENABLE_ANONYMOUS_MIGRATION !== 'false',
      enablePlanManager:
        process.env.NEXT_PUBLIC_ENABLE_PLAN_MANAGER !== 'false',
      enableOfflineMode:
        process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE !== 'false',
    },
  };
}

/**
 * 深度合并配置
 */
function mergeConfig(
  base: FloorplanConfig,
  override: Partial<FloorplanConfig>
): FloorplanConfig {
  return {
    ...base,
    ...override,
    cloudUpload: {
      ...base.cloudUpload,
      ...override.cloudUpload,
    },
    quota: {
      ...base.quota,
      ...override.quota,
    },
    performance: {
      ...base.performance,
      ...override.performance,
    },
    features: {
      ...base.features,
      ...override.features,
    },
  };
}

/**
 * 户型叠加功能配置实例
 *
 * 优先级：环境变量 > 默认配置
 *
 * @example
 * ```typescript
 * import { FLOORPLAN_CONFIG } from '@/config/floorplan';
 *
 * if (FLOORPLAN_CONFIG.enabled) {
 *   // 启用户型叠加功能
 * }
 * ```
 */
export const FLOORPLAN_CONFIG: FloorplanConfig = mergeConfig(
  DEFAULT_CONFIG,
  loadConfigFromEnv()
);

/**
 * 验证配置有效性
 */
export function validateConfig(config: FloorplanConfig): string[] {
  const errors: string[] = [];

  if (config.cloudUpload.maxImageSizeMB <= 0) {
    errors.push('maxImageSizeMB must be greater than 0');
  }

  if (config.cloudUpload.maxImageDimension < 512) {
    errors.push('maxImageDimension must be at least 512');
  }

  if (config.quota.maxPlansPerUser <= 0) {
    errors.push('maxPlansPerUser must be greater than 0');
  }

  if (
    config.quota.localStorageWarningThreshold < 0 ||
    config.quota.localStorageWarningThreshold > 100
  ) {
    errors.push('localStorageWarningThreshold must be between 0 and 100');
  }

  if (config.performance.debounceMs < 0) {
    errors.push('debounceMs must be non-negative');
  }

  if (
    config.performance.compressionQuality < 0 ||
    config.performance.compressionQuality > 1
  ) {
    errors.push('compressionQuality must be between 0 and 1');
  }

  return errors;
}

/**
 * 配置热重载（仅开发环境）
 */
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__FLOORPLAN_CONFIG__ = FLOORPLAN_CONFIG;
  console.log('[Floorplan Config] 配置已加载:', FLOORPLAN_CONFIG);

  const errors = validateConfig(FLOORPLAN_CONFIG);
  if (errors.length > 0) {
    console.warn('[Floorplan Config] 配置验证失败:', errors);
  }
}

/**
 * 导出配置辅助函数
 */
export const FloorplanConfigHelpers = {
  /** 是否允许云上传 */
  canUploadToCloud: (
    strategy: CloudUploadStrategy = FLOORPLAN_CONFIG.cloudUpload
      .freeTierStrategy
  ): boolean => {
    if (!FLOORPLAN_CONFIG.cloudUpload.enabled) return false;
    return strategy === 'allow' || strategy === 'auto';
  },

  /** 是否应该显示升级提示 */
  shouldShowUpgrade: (currentPlans: number): boolean => {
    return currentPlans >= FLOORPLAN_CONFIG.quota.maxPlansPerUser;
  },

  /** 是否应该显示配额警告 */
  shouldShowQuotaWarning: (usagePercentage: number): boolean => {
    return (
      usagePercentage >= FLOORPLAN_CONFIG.quota.localStorageWarningThreshold
    );
  },

  /** 获取压缩配置 */
  getCompressionConfig: () => ({
    maxWidth: FLOORPLAN_CONFIG.cloudUpload.maxImageDimension,
    maxHeight: FLOORPLAN_CONFIG.cloudUpload.maxImageDimension,
    quality: FLOORPLAN_CONFIG.performance.compressionQuality,
    mimeType: 'image/jpeg' as const,
  }),

  /** 获取云存储配置 */
  getCloudStorageConfig: () => ({
    freeTierStrategy: FLOORPLAN_CONFIG.cloudUpload.freeTierStrategy,
    maxImageSize: FLOORPLAN_CONFIG.cloudUpload.maxImageSizeMB * 1024 * 1024,
    maxImageDimension: FLOORPLAN_CONFIG.cloudUpload.maxImageDimension,
  }),
};

// 类型已在 @/types/floorplan 中导出，不需要重复导出
