/**
 * 户型图叠加状态类型定义
 */

/**
 * 图片存储类型
 */
export type ImageStorageType = 'url' | 'base64';

/**
 * 户型图状态
 */
export interface FloorplanState {
  /** 方案唯一标识符 */
  id: string;

  /** 方案名称 */
  name?: string;

  /** 图片数据（云存储 URL 或 Base64） */
  imageData: string;

  /** 图片存储类型 */
  imageType: ImageStorageType;

  /** 云存储文件 key（用于删除） */
  storageKey?: string;

  /** 旋转角度（度数） */
  rotation: number;

  /** 缩放比例 */
  scale: number;

  /** 位置偏移 */
  position: {
    x: number;
    y: number;
  };

  /** 是否显示九宫格叠加层 */
  showOverlay: boolean;

  /** 是否显示标签 */
  showLabels: boolean;

  /** 叠加层透明度（0-1） */
  overlayOpacity: number;

  /** 网格线宽度（像素） */
  gridLineWidth: number;

  /** 关联的玄空分析 ID */
  analysisId?: string;

  /** 创建时间戳 */
  createdAt: number;

  /** 最后更新时间戳 */
  updatedAt: number;
}

/**
 * 户型图状态默认值
 */
export const DEFAULT_FLOORPLAN_STATE: Omit<
  FloorplanState,
  'id' | 'imageData' | 'imageType' | 'createdAt' | 'updatedAt'
> = {
  rotation: 0,
  scale: 1,
  position: { x: 0, y: 0 },
  showOverlay: true,
  showLabels: true,
  overlayOpacity: 0.7,
  gridLineWidth: 2,
};

/**
 * localStorage 键名生成工具
 */
export const FloorplanStorageKeys = {
  /** 生成用户户型图缓存键 */
  user: (userId: string, analysisId: string) =>
    `floorplan_${userId}_${analysisId}`,

  /** 生成匿名户型图缓存键 */
  anonymous: (analysisId: string) => `floorplan_anonymous_${analysisId}`,

  /** 检查是否为户型图缓存键 */
  isFloorplanKey: (key: string) => key.startsWith('floorplan_'),

  /** 检查是否为匿名户型图缓存键 */
  isAnonymousKey: (key: string) => key.startsWith('floorplan_anonymous_'),

  /** 从键名中提取分析 ID */
  extractAnalysisId: (key: string): string | null => {
    const match = key.match(/floorplan_(?:anonymous_)?(.+)$/);
    return match ? match[1] : null;
  },
};

/**
 * 云存储策略
 */
export type CloudUploadStrategy = 'allow' | 'deny' | 'auto';

/**
 * 云存储配置
 */
export interface CloudStorageConfig {
  /** 免费用户上传策略 */
  freeTierStrategy: CloudUploadStrategy;

  /** 免费用户最大方案数（0 = 无限制） */
  freeTierMaxPlans: number;

  /** 单个图片最大大小（字节） */
  maxImageSize: number;

  /** 最大图片尺寸（像素） */
  maxImageDimension: number;
}

/**
 * 默认云存储配置
 */
export const DEFAULT_CLOUD_STORAGE_CONFIG: CloudStorageConfig = {
  freeTierStrategy: 'allow', // 默认允许免费用户使用云存储
  freeTierMaxPlans: 0, // 无限制
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxImageDimension: 4096, // 4K
};

/**
 * 上传结果
 */
export interface UploadResult {
  success: boolean;
  imageData: string;
  imageType: ImageStorageType;
  storageKey?: string;
  error?: string;
  fallbackReason?: string; // 降级原因
}

/**
 * 保存结果
 */
export interface SaveResult {
  success: boolean;
  error?: string;
  timestamp?: number;
}

/**
 * 迁移数据项
 */
export interface MigrationDataItem {
  key: string;
  state: FloorplanState;
  analysisId: string;
}

/**
 * 迁移结果
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: Array<{
    analysisId: string;
    error: string;
  }>;
}
