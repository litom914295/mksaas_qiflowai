/**
 * LRU缓存测试
 * 验证缓存功能、LRU策略、过期机制等
 */

import { LRUCache, createCacheKey } from '../lru-cache';

describe('LRU缓存', () => {
  describe('基本功能', () => {
    test('设置和获取值', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    test('获取不存在的key返回undefined', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('has方法正确检测key存在性', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    test('delete方法删除key', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      expect(cache.has('a')).toBe(true);

      cache.delete('a');
      expect(cache.has('a')).toBe(false);
      expect(cache.get('a')).toBeUndefined();
    });

    test('clear方法清空缓存', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.size).toBe(3);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('c')).toBeUndefined();
    });
  });

  describe('LRU策略', () => {
    test('超出maxSize时删除最少使用的条目', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // 此时缓存已满: a, b, c

      cache.set('d', 4); // 'a' 应该被删除

      expect(cache.get('a')).toBeUndefined(); // 最旧的被删除
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    test('访问会更新LRU顺序', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // 访问 'a',使其变为最新
      cache.get('a');

      // 添加新条目,'b' 应该被删除(因为它现在是最旧的)
      cache.set('d', 4);

      expect(cache.get('a')).toBe(1); // 被访问过,保留
      expect(cache.get('b')).toBeUndefined(); // 最旧的被删除
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    test('重新设置已存在的key不会增加size', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.size).toBe(2);

      cache.set('a', 10); // 更新已存在的key

      expect(cache.size).toBe(2);
      expect(cache.get('a')).toBe(10);
    });
  });

  describe('过期机制 (TTL)', () => {
    test('过期的条目应该被自动删除', (done) => {
      const cache = new LRUCache<string, number>({
        maxSize: 10,
        ttl: 50, // 50ms 过期
      });

      cache.set('a', 1);

      expect(cache.get('a')).toBe(1);

      // 等待过期
      setTimeout(() => {
        expect(cache.get('a')).toBeUndefined();
        done();
      }, 60);
    });

    test('refreshOnAccess=true时访问会刷新过期时间', (done) => {
      const cache = new LRUCache<string, number>({
        maxSize: 10,
        ttl: 100, // 100ms 过期
        refreshOnAccess: true,
      });

      cache.set('a', 1);

      // 在80ms时访问,刷新过期时间
      setTimeout(() => {
        expect(cache.get('a')).toBe(1);
      }, 80);

      // 在150ms时应该还在(因为在80ms时被刷新)
      setTimeout(() => {
        expect(cache.get('a')).toBe(1);
        done();
      }, 150);
    });

    test('refreshOnAccess=false时访问不会刷新过期时间', (done) => {
      const cache = new LRUCache<string, number>({
        maxSize: 10,
        ttl: 100, // 100ms 过期
        refreshOnAccess: false,
      });

      cache.set('a', 1);

      // 在80ms时访问
      setTimeout(() => {
        expect(cache.get('a')).toBe(1);
      }, 80);

      // 在120ms时应该已过期(从初始设置时间算起)
      setTimeout(() => {
        expect(cache.get('a')).toBeUndefined();
        done();
      }, 120);
    });

    test('ttl=0表示永不过期', (done) => {
      const cache = new LRUCache<string, number>({
        maxSize: 10,
        ttl: 0, // 永不过期
      });

      cache.set('a', 1);

      setTimeout(() => {
        expect(cache.get('a')).toBe(1);
        done();
      }, 100);
    });

    test('cleanup方法清理过期条目', (done) => {
      const cache = new LRUCache<string, number>({
        maxSize: 10,
        ttl: 50,
      });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.size).toBe(3);

      setTimeout(() => {
        const removed = cache.cleanup();

        expect(removed).toBe(3);
        expect(cache.size).toBe(0);
        done();
      }, 60);
    });
  });

  describe('统计信息', () => {
    test('正确跟踪缓存命中和未命中', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      cache.set('b', 2);

      cache.get('a'); // 命中
      cache.get('b'); // 命中
      cache.get('c'); // 未命中
      cache.get('d'); // 未命中

      const stats = cache.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe('50.00%');
    });

    test('resetStats重置统计信息', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      cache.get('a'); // 命中
      cache.get('b'); // 未命中

      let stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);

      cache.resetStats();

      stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe('0.00%');
    });

    test('getStats显示当前size和maxSize', () => {
      const cache = new LRUCache<string, number>({ maxSize: 5 });

      cache.set('a', 1);
      cache.set('b', 2);

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(5);
    });
  });

  describe('复杂数据类型', () => {
    test('缓存对象值', () => {
      interface User {
        id: number;
        name: string;
      }

      const cache = new LRUCache<string, User>({ maxSize: 3 });

      cache.set('user1', { id: 1, name: 'Alice' });
      cache.set('user2', { id: 2, name: 'Bob' });

      expect(cache.get('user1')).toEqual({ id: 1, name: 'Alice' });
      expect(cache.get('user2')).toEqual({ id: 2, name: 'Bob' });
    });

    test('缓存数组值', () => {
      const cache = new LRUCache<string, number[]>({ maxSize: 3 });

      cache.set('nums1', [1, 2, 3]);
      cache.set('nums2', [4, 5, 6]);

      expect(cache.get('nums1')).toEqual([1, 2, 3]);
      expect(cache.get('nums2')).toEqual([4, 5, 6]);
    });

    test('使用数字作为key', () => {
      const cache = new LRUCache<number, string>({ maxSize: 3 });

      cache.set(1, 'one');
      cache.set(2, 'two');
      cache.set(3, 'three');

      expect(cache.get(1)).toBe('one');
      expect(cache.get(2)).toBe('two');
      expect(cache.get(3)).toBe('three');
    });
  });

  describe('边界条件', () => {
    test('maxSize=1时只保留最新条目', () => {
      const cache = new LRUCache<string, number>({ maxSize: 1 });

      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);

      cache.set('b', 2);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
    });

    test('空缓存的size为0', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      expect(cache.size).toBe(0);
    });

    test('keys()迭代器', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3 });

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      const keys = Array.from(cache.keys());

      expect(keys).toEqual(['a', 'b', 'c']);
    });

    test('values()迭代器过滤过期值', (done) => {
      const cache = new LRUCache<string, number>({
        maxSize: 3,
        ttl: 50,
      });

      cache.set('a', 1);
      cache.set('b', 2);

      setTimeout(() => {
        const values = Array.from(cache.values());

        expect(values).toEqual([]);
        done();
      }, 60);
    });
  });

  describe('createCacheKey辅助函数', () => {
    test('从多个参数创建key', () => {
      const key1 = createCacheKey(2024, 1, 1, 12, 0);
      const key2 = createCacheKey(2024, 1, 1, 12, 0);
      const key3 = createCacheKey(2024, 1, 1, 12, 1);

      expect(key1).toBe(key2); // 相同参数生成相同key
      expect(key1).not.toBe(key3); // 不同参数生成不同key
    });

    test('处理对象参数', () => {
      const key1 = createCacheKey({ year: 2024, month: 1 });
      const key2 = createCacheKey({ year: 2024, month: 1 });

      expect(key1).toBe(key2);
    });

    test('处理数组参数', () => {
      const key1 = createCacheKey([1, 2, 3], 'test');
      const key2 = createCacheKey([1, 2, 3], 'test');

      expect(key1).toBe(key2);
    });
  });

  describe('性能测试', () => {
    test('大量写入性能', () => {
      const cache = new LRUCache<number, number>({ maxSize: 1000 });
      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        cache.set(i, i * 2);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 10000次写入应在100ms内完成
      expect(duration).toBeLessThan(100);
      expect(cache.size).toBe(1000); // 只保留最新的1000条
    });

    test('大量读取性能', () => {
      const cache = new LRUCache<number, number>({ maxSize: 1000 });

      // 预填充
      for (let i = 0; i < 1000; i++) {
        cache.set(i, i * 2);
      }

      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        cache.get(i % 1000);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 10000次读取应在50ms内完成
      expect(duration).toBeLessThan(50);
    });

    test('混合操作性能', () => {
      const cache = new LRUCache<number, number>({ maxSize: 500 });
      const startTime = Date.now();

      for (let i = 0; i < 5000; i++) {
        if (i % 2 === 0) {
          cache.set(i, i * 2);
        } else {
          cache.get(i / 2);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 5000次混合操作应在100ms内完成
      expect(duration).toBeLessThan(100);
    });
  });

  describe('并发访问', () => {
    test('多次并发get操作', async () => {
      const cache = new LRUCache<string, number>({ maxSize: 10 });

      cache.set('a', 1);

      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(cache.get('a')));
      }

      const results = await Promise.all(promises);

      // 所有结果应该一致
      expect(results.every((r) => r === 1)).toBe(true);
    });
  });

  describe('实际使用场景', () => {
    test('四柱计算缓存场景', () => {
      const cache = new LRUCache<string, any>({
        maxSize: 100,
        ttl: 1000 * 60 * 60, // 1小时
      });

      // 模拟四柱计算
      const calculateFourPillars = (date: string, time: string) => {
        const key = createCacheKey(date, time);

        let result = cache.get(key);
        if (result) {
          return result;
        }

        // 模拟计算
        result = { date, time, result: 'calculated' };
        cache.set(key, result);

        return result;
      };

      // 第一次计算
      const result1 = calculateFourPillars('2024-01-01', '12:00');
      const stats1 = cache.getStats();
      expect(stats1.misses).toBe(1);

      // 第二次相同参数应命中缓存
      const result2 = calculateFourPillars('2024-01-01', '12:00');
      const stats2 = cache.getStats();
      expect(stats2.hits).toBe(1);

      expect(result1).toBe(result2); // 同一个对象引用
    });
  });
});
