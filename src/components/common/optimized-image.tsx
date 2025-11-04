/**
 * 优化的图片组件
 * 自动懒加载、WebP/AVIF支持、占位符
 */

import { cn } from '@/lib/utils';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  /**
   * 是否显示加载占位符
   */
  showPlaceholder?: boolean;
  /**
   * 占位符颜色
   */
  placeholderColor?: string;
  /**
   * 加载失败时的后备图片
   */
  fallback?: string;
  /**
   * 是否使用blur占位符
   */
  useBlur?: boolean;
}

export function OptimizedImage({
  className,
  showPlaceholder = true,
  placeholderColor = 'bg-muted',
  fallback,
  useBlur = true,
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // 如果加载失败且有后备图片
  if (hasError && fallback) {
    return (
      <img src={fallback} alt={alt} className={className} loading="lazy" />
    );
  }

  // 如果加载失败且没有后备图片，显示占位符
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          placeholderColor,
          className
        )}
      >
        <svg
          className="w-12 h-12 text-muted-foreground/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 加载占位符 */}
      {showPlaceholder && isLoading && (
        <div
          className={cn('absolute inset-0 animate-pulse', placeholderColor)}
        />
      )}

      {/* 优化的图片 */}
      <Image
        {...props}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        placeholder={useBlur ? 'blur' : 'empty'}
        blurDataURL={
          useBlur
            ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            : undefined
        }
      />
    </div>
  );
}

/**
 * 响应式图片组件
 * 根据视口自动选择合适的图片尺寸
 */
interface ResponsiveImageProps extends OptimizedImageProps {
  srcMobile?: string;
  srcTablet?: string;
  srcDesktop?: string;
}

export function ResponsiveImage({
  src,
  srcMobile,
  srcTablet,
  srcDesktop,
  ...props
}: ResponsiveImageProps) {
  // 如果没有提供响应式图片，使用默认图片
  if (!srcMobile && !srcTablet && !srcDesktop) {
    return <OptimizedImage src={src} {...props} />;
  }

  return (
    <>
      {/* 移动端 */}
      <OptimizedImage
        src={srcMobile || src}
        {...props}
        className={cn('block md:hidden', props.className)}
      />

      {/* 平板 */}
      <OptimizedImage
        src={srcTablet || srcDesktop || src}
        {...props}
        className={cn('hidden md:block lg:hidden', props.className)}
      />

      {/* 桌面 */}
      <OptimizedImage
        src={srcDesktop || src}
        {...props}
        className={cn('hidden lg:block', props.className)}
      />
    </>
  );
}
