'use client';

/**
 * 户型图存储服务
 * 处理图片上传到云存储或降级为 Base64
 */

import type {
  CloudStorageConfig,
  CloudUploadStrategy,
} from '@/types/floorplan';
import { DEFAULT_CLOUD_STORAGE_CONFIG } from '@/types/floorplan';
import { v4 as uuidv4 } from 'uuid';
import {
  compressImage,
  imageToBase64,
  isFileSizeExceeded,
  isValidImage,
} from './image-compression';

/**
 * 上传结果类型
 */
export interface UploadResult {
  success: boolean;
  imageData: string; // Base64 或 URL
  imageType: 'base64' | 'url';
  storageKey?: string; // 仅当 imageType = 'url' 时存在
  fallbackReason?: string; // 降级原因
  error?: string; // 错误信息
}

/**
 * 上传户型图到云存储
 * @param file 图片文件
 * @param userId 用户 ID
 * @param config 云存储配置
 * @returns 上传结果
 */
export async function uploadFloorplanImage(
  file: File,
  userId: string,
  config: CloudStorageConfig = DEFAULT_CLOUD_STORAGE_CONFIG
): Promise<UploadResult> {
  // 1. 验证文件
  if (!isValidImage(file)) {
    return {
      success: false,
      imageData: '',
      imageType: 'base64',
      error: '不支持的图片格式，仅支持 JPG、PNG、WebP',
    };
  }

  if (isFileSizeExceeded(file, config.maxImageSize / (1024 * 1024))) {
    return {
      success: false,
      imageData: '',
      imageType: 'base64',
      error: `图片大小超过限制（${config.maxImageSize / (1024 * 1024)}MB）`,
    };
  }

  try {
    // 2. 压缩图片
    console.log('[Floorplan Storage] 开始压缩图片...');
    const compressedBlob = await compressImage(file, {
      maxWidth: config.maxImageDimension,
      maxHeight: config.maxImageDimension,
      quality: 0.85,
      mimeType: 'image/jpeg',
    });

    // 3. 尝试上传到云存储
    if (config.freeTierStrategy !== 'deny') {
      try {
        const uploadResult = await uploadToCloud(compressedBlob, userId);

        if (uploadResult.success) {
          console.log('[Floorplan Storage] 云上传成功:', uploadResult.url);
          return {
            success: true,
            imageData: uploadResult.url!,
            imageType: 'url',
            storageKey: uploadResult.key,
          };
        } else {
          console.warn(
            '[Floorplan Storage] 云上传失败，降级到 Base64:',
            uploadResult.error
          );
        }
      } catch (cloudError) {
        console.error('[Floorplan Storage] 云上传异常:', cloudError);
      }
    }

    // 4. 降级为 Base64
    console.log('[Floorplan Storage] 使用 Base64 存储...');
    const base64 = await imageToBase64(compressedBlob);

    return {
      success: true,
      imageData: base64,
      imageType: 'base64',
      fallbackReason:
        config.freeTierStrategy === 'deny'
          ? '策略禁止云上传'
          : '云上传失败，已降级',
    };
  } catch (error) {
    console.error('[Floorplan Storage] 图片处理失败:', error);
    return {
      success: false,
      imageData: '',
      imageType: 'base64',
      error: error instanceof Error ? error.message : '图片处理失败',
    };
  }
}

/**
 * 上传到云存储（调用现有 API）
 */
async function uploadToCloud(
  blob: Blob,
  userId: string
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  try {
    const filename = `${uuidv4()}.jpg`;
    const path = `floorplans/${userId}`;

    // 创建 FormData（适配现有接口使用 folder 参数）
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('folder', path);

    // 调用上传 API
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `上传失败: ${response.status} ${errorText}`,
      };
    }

    const result = await response.json();

    // 兼容现有接口返回格式 {url, key} 或 {publicUrl, path}
    const url = result.url || result.publicUrl;
    const key = result.key || result.path;

    if (url) {
      return {
        success: true,
        url,
        key,
      };
    } else {
      return {
        success: false,
        error: '上传响应格式错误：缺少 url 字段',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 删除云存储文件
 * @param storageKey 存储 key
 * @returns 是否删除成功
 */
export async function deleteCloudFile(storageKey: string): Promise<boolean> {
  try {
    // 检查是否存在删除 API
    const response = await fetch('/api/storage/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: storageKey }),
    });

    if (response.ok) {
      console.log('[Floorplan Storage] 云文件删除成功:', storageKey);
      return true;
    } else {
      console.warn('[Floorplan Storage] 云文件删除失败:', response.status);
      // 删除失败不应该阻塞主流程
      return false;
    }
  } catch (error) {
    console.error('[Floorplan Storage] 删除云文件异常:', error);
    // 如果 API 不存在或网络错误，仍返回 true（允许继续）
    return true;
  }
}

/**
 * 替换图片（幂等操作）
 * 先上传新图，成功后删除旧图
 * @param file 新图片文件
 * @param userId 用户 ID
 * @param oldStorageKey 旧图片的 storage key
 * @param config 云存储配置
 * @returns 上传结果
 */
export async function replaceFloorplanImage(
  file: File,
  userId: string,
  oldStorageKey: string | undefined,
  config: CloudStorageConfig = DEFAULT_CLOUD_STORAGE_CONFIG
): Promise<UploadResult> {
  // 1. 上传新图
  const uploadResult = await uploadFloorplanImage(file, userId, config);

  // 2. 如果新图上传成功且使用云存储，删除旧图
  if (
    uploadResult.success &&
    uploadResult.imageType === 'url' &&
    oldStorageKey
  ) {
    // 异步删除旧图，不阻塞主流程
    deleteCloudFile(oldStorageKey).catch((error) => {
      console.error('[Floorplan Storage] 删除旧图失败:', error);
    });
  }

  return uploadResult;
}

/**
 * 批量删除云存储文件
 * @param storageKeys 存储 key 数组
 * @returns 删除成功的数量
 */
export async function batchDeleteCloudFiles(
  storageKeys: string[]
): Promise<number> {
  let successCount = 0;

  // 并行删除（限制并发数为 5）
  const batchSize = 5;
  for (let i = 0; i < storageKeys.length; i += batchSize) {
    const batch = storageKeys.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((key) => deleteCloudFile(key)));
    successCount += results.filter((r) => r).length;
  }

  console.log(
    `[Floorplan Storage] 批量删除完成: ${successCount}/${storageKeys.length}`
  );
  return successCount;
}

/**
 * 估算 Base64 图片大小（字节）
 * @param base64 Base64 字符串
 * @returns 字节数
 */
export function estimateBase64Size(base64: string): number {
  // Base64 编码后的大小约为原始数据的 4/3
  // 去除 data URI 前缀
  const base64Data = base64.split(',')[1] || base64;
  return (base64Data.length * 3) / 4;
}

/**
 * 检查是否应该使用云存储
 * @param config 云存储配置
 * @param userPlanType 用户套餐类型
 * @returns 是否使用云存储
 */
export function shouldUseCloudStorage(
  config: CloudStorageConfig,
  userPlanType: 'free' | 'pro' | 'lifetime' = 'free'
): boolean {
  // Pro 和 Lifetime 用户始终使用云存储
  if (userPlanType !== 'free') {
    return true;
  }

  // 免费用户根据策略决定
  switch (config.freeTierStrategy) {
    case 'allow':
      return true;
    case 'deny':
      return false;
    case 'auto':
      // Auto 模式：根据配额动态决定
      // 这里可以添加更复杂的逻辑，比如检查当前上传数量
      return true;
    default:
      return false;
  }
}
