import { stableHash } from '@/lib/qiflow/hash';
import { unstable_cache } from 'next/cache';

/**
 * 通用缓存包装器
 * @param fn 需要缓存的异步函数
 * @param namespace 唯一命名空间（用于区分不同业务）
 */
export function withCache<I extends object, O>(
  fn: (input: I) => Promise<O>,
  namespace: string
) {
  return async function cachedFn(input: I, extraTags: string[] = []) {
    const tag = `${namespace}:${stableHash(input)}`;
    const cached = unstable_cache(
      async () => fn(input),
      [namespace, tag, ...extraTags],
      {
        revalidate: false,
      }
    );
    return cached();
  };
}

/**
 * 示例：将昂贵的计算包装为缓存函数
 */
export function exampleExpensiveCached() {
  return withCache(async (input: { value: number }) => {
    // 模拟耗时计算
    await new Promise((r) => setTimeout(r, 50));
    return { doubled: input.value * 2 };
  }, 'expensive-calc');
}
