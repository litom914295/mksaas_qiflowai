/**
 * QiFlow AI - 智能缓存管理系统
 * 
 * 实现多层缓存策略，优化数据访问性能
 */

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  metadata: {
    createdAt: number;
    lastAccessedAt: number;
    accessCount: number;
    size: number;
    ttl?: number;
    tags?: string[];
  };
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  count: number;
  hitRate: number;
}

export interface CacheConfig {
  maxSize: number;           // 最大缓存大小 (bytes)
  maxCount: number;          // 最大缓存项数
  defaultTTL: number;        // 默认过期时间 (ms)
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'Random';
  compressionThreshold: number; // 压缩阈值 (bytes)
  enableStatistics: boolean;
}

/**
 * 缓存层级
 */
export enum CacheLayer {
  Memory = 'memory',      // 内存缓存
  Session = 'session',    // 会话缓存
  Local = 'local',        // 本地存储
  Remote = 'remote'       // 远程缓存
}

/**
 * 基础缓存提供者接口
 */
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  size(): Promise<number>;
}

/**
 * 内存缓存提供者
 */
export class MemoryCacheProvider implements CacheProvider {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    count: 0,
    hitRate: 0
  };
  
  constructor(private config: CacheConfig) {}
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // 检查TTL
    if (entry.metadata.ttl && Date.now() > entry.metadata.createdAt + entry.metadata.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // 更新访问信息
    entry.metadata.lastAccessedAt = Date.now();
    entry.metadata.accessCount++;
    
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.value as T;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const size = this.estimateSize(value);
    
    // 检查是否需要逐出
    if (this.needsEviction(size)) {
      await this.evict(size);
    }
    
    const entry: CacheEntry<T> = {
      key,
      value,
      metadata: {
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
        accessCount: 0,
        size,
        ttl: ttl || this.config.defaultTTL
      }
    };
    
    this.cache.set(key, entry);
    this.stats.size += size;
    this.stats.count = this.cache.size;
  }
  
  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.size -= entry.metadata.size;
      this.cache.delete(key);
      this.stats.count = this.cache.size;
      return true;
    }
    return false;
  }
  
  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      count: 0,
      hitRate: 0
    };
  }
  
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // 检查TTL
    if (entry.metadata.ttl && Date.now() > entry.metadata.createdAt + entry.metadata.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  async size(): Promise<number> {
    return this.stats.size;
  }
  
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  private needsEviction(newSize: number): boolean {
    return (
      this.stats.size + newSize > this.config.maxSize ||
      this.cache.size >= this.config.maxCount
    );
  }
  
  private async evict(requiredSpace: number): Promise<void> {
    const policy = this.config.evictionPolicy;
    let evicted = 0;
    
    switch (policy) {
      case 'LRU':
        evicted = await this.evictLRU(requiredSpace);
        break;
      case 'LFU':
        evicted = await this.evictLFU(requiredSpace);
        break;
      case 'FIFO':
        evicted = await this.evictFIFO(requiredSpace);
        break;
      case 'Random':
        evicted = await this.evictRandom(requiredSpace);
        break;
    }
    
    this.stats.evictions += evicted;
  }
  
  private async evictLRU(requiredSpace: number): Promise<number> {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => a.metadata.lastAccessedAt - b.metadata.lastAccessedAt);
    
    return this.evictEntries(entries, requiredSpace);
  }
  
  private async evictLFU(requiredSpace: number): Promise<number> {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => a.metadata.accessCount - b.metadata.accessCount);
    
    return this.evictEntries(entries, requiredSpace);
  }
  
  private async evictFIFO(requiredSpace: number): Promise<number> {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => a.metadata.createdAt - b.metadata.createdAt);
    
    return this.evictEntries(entries, requiredSpace);
  }
  
  private async evictRandom(requiredSpace: number): Promise<number> {
    const entries = Array.from(this.cache.values())
      .sort(() => Math.random() - 0.5);
    
    return this.evictEntries(entries, requiredSpace);
  }
  
  private evictEntries(entries: CacheEntry[], requiredSpace: number): number {
    let freedSpace = 0;
    let evictedCount = 0;
    
    for (const entry of entries) {
      if (freedSpace >= requiredSpace) break;
      
      this.cache.delete(entry.key);
      freedSpace += entry.metadata.size;
      this.stats.size -= entry.metadata.size;
      evictedCount++;
    }
    
    this.stats.count = this.cache.size;
    return evictedCount;
  }
  
  private estimateSize(value: any): number {
    if (typeof value === 'string') {
      return value.length * 2; // 假设UTF-16编码
    }
    if (typeof value === 'number') {
      return 8;
    }
    if (typeof value === 'boolean') {
      return 4;
    }
    if (value === null || value === undefined) {
      return 0;
    }
    if (typeof value === 'object') {
      // 粗略估计对象大小
      return JSON.stringify(value).length * 2;
    }
    return 0;
  }
  
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * 会话缓存提供者
 */
export class SessionCacheProvider implements CacheProvider {
  constructor(private prefix: string = 'qiflow_') {}
  
  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }
    
    const item = window.sessionStorage.getItem(this.prefix + key);
    if (!item) return null;
    
    try {
      const data = JSON.parse(item);
      
      // 检查过期时间
      if (data.expiry && Date.now() > data.expiry) {
        await this.delete(key);
        return null;
      }
      
      return data.value;
    } catch {
      return null;
    }
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    const data = {
      value,
      expiry: ttl ? Date.now() + ttl : null
    };
    
    try {
      window.sessionStorage.setItem(this.prefix + key, JSON.stringify(data));
    } catch (e) {
      console.error('SessionStorage写入失败:', e);
    }
  }
  
  async delete(key: string): Promise<boolean> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return false;
    }
    
    const exists = window.sessionStorage.getItem(this.prefix + key) !== null;
    window.sessionStorage.removeItem(this.prefix + key);
    return exists;
  }
  
  async clear(): Promise<void> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    const keys = Object.keys(window.sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        window.sessionStorage.removeItem(key);
      }
    });
  }
  
  async has(key: string): Promise<boolean> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return false;
    }
    
    return window.sessionStorage.getItem(this.prefix + key) !== null;
  }
  
  async size(): Promise<number> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return 0;
    }
    
    let size = 0;
    const keys = Object.keys(window.sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const item = window.sessionStorage.getItem(key);
        if (item) {
          size += item.length * 2; // UTF-16编码
        }
      }
    });
    
    return size;
  }
}

/**
 * 多层缓存管理器
 */
export class CacheManager {
  private layers: Map<CacheLayer, CacheProvider> = new Map();
  private config: CacheConfig;
  private keyVersions: Map<string, number> = new Map();
  private invalidationCallbacks: Map<string, Set<() => void>> = new Map();
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxCount: 1000,
      defaultTTL: 5 * 60 * 1000, // 5分钟
      evictionPolicy: 'LRU',
      compressionThreshold: 1024, // 1KB
      enableStatistics: true,
      ...config
    };
    
    // 默认设置内存和会话缓存层
    this.layers.set(CacheLayer.Memory, new MemoryCacheProvider(this.config));
    this.layers.set(CacheLayer.Session, new SessionCacheProvider());
  }
  
  /**
   * 获取缓存值，按层级顺序查找
   */
  async get<T>(
    key: string,
    options: {
      layers?: CacheLayer[];
      fallback?: () => Promise<T>;
      ttl?: number;
    } = {}
  ): Promise<T | null> {
    const layers = options.layers || [CacheLayer.Memory, CacheLayer.Session];
    
    // 按顺序查找缓存层
    for (const layer of layers) {
      const provider = this.layers.get(layer);
      if (!provider) continue;
      
      const value = await provider.get<T>(key);
      if (value !== null) {
        // 将值提升到更高层缓存
        await this.promote(key, value, layer, options.ttl);
        return value;
      }
    }
    
    // 如果所有层都没有，使用回退函数
    if (options.fallback) {
      const value = await options.fallback();
      await this.set(key, value, { ttl: options.ttl });
      return value;
    }
    
    return null;
  }
  
  /**
   * 设置缓存值到指定层
   */
  async set<T>(
    key: string,
    value: T,
    options: {
      layers?: CacheLayer[];
      ttl?: number;
      tags?: string[];
    } = {}
  ): Promise<void> {
    const layers = options.layers || [CacheLayer.Memory];
    
    // 增加版本号以实现缓存失效
    this.keyVersions.set(key, (this.keyVersions.get(key) || 0) + 1);
    
    // 写入指定的缓存层
    for (const layer of layers) {
      const provider = this.layers.get(layer);
      if (!provider) continue;
      
      await provider.set(key, value, options.ttl);
    }
    
    // 触发失效回调
    this.triggerInvalidation(key);
  }
  
  /**
   * 删除缓存值
   */
  async delete(key: string, layers?: CacheLayer[]): Promise<boolean> {
    const targetLayers = layers || Array.from(this.layers.keys());
    let deleted = false;
    
    for (const layer of targetLayers) {
      const provider = this.layers.get(layer);
      if (!provider) continue;
      
      const result = await provider.delete(key);
      deleted = deleted || result;
    }
    
    // 触发失效回调
    if (deleted) {
      this.triggerInvalidation(key);
    }
    
    return deleted;
  }
  
  /**
   * 清空缓存
   */
  async clear(layers?: CacheLayer[]): Promise<void> {
    const targetLayers = layers || Array.from(this.layers.keys());
    
    for (const layer of targetLayers) {
      const provider = this.layers.get(layer);
      if (!provider) continue;
      
      await provider.clear();
    }
    
    this.keyVersions.clear();
    this.invalidationCallbacks.clear();
  }
  
  /**
   * 批量获取缓存
   */
  async mget<T>(
    keys: string[],
    options: {
      layers?: CacheLayer[];
      fallback?: (missingKeys: string[]) => Promise<Record<string, T>>;
    } = {}
  ): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    const missingKeys: string[] = [];
    
    // 并行获取所有键
    await Promise.all(
      keys.map(async key => {
        const value = await this.get<T>(key, { layers: options.layers });
        if (value !== null) {
          result[key] = value;
        } else {
          missingKeys.push(key);
          result[key] = null;
        }
      })
    );
    
    // 处理缺失的键
    if (missingKeys.length > 0 && options.fallback) {
      const fallbackValues = await options.fallback(missingKeys);
      
      // 缓存回退值
      await Promise.all(
        Object.entries(fallbackValues).map(([key, value]) =>
          this.set(key, value)
        )
      );
      
      // 更新结果
      Object.assign(result, fallbackValues);
    }
    
    return result;
  }
  
  /**
   * 批量设置缓存
   */
  async mset<T>(
    entries: Record<string, T>,
    options: {
      layers?: CacheLayer[];
      ttl?: number;
    } = {}
  ): Promise<void> {
    await Promise.all(
      Object.entries(entries).map(([key, value]) =>
        this.set(key, value, options)
      )
    );
  }
  
  /**
   * 使用标签使缓存失效
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    // 这里需要实现标签索引
    // 简化实现：遍历所有缓存项
    const memoryProvider = this.layers.get(CacheLayer.Memory) as MemoryCacheProvider;
    if (!memoryProvider) return;
    
    // 实际项目中应该维护标签索引以提高性能
    console.log('按标签失效缓存:', tags);
  }
  
  /**
   * 注册缓存失效回调
   */
  onInvalidate(key: string, callback: () => void): () => void {
    if (!this.invalidationCallbacks.has(key)) {
      this.invalidationCallbacks.set(key, new Set());
    }
    
    const callbacks = this.invalidationCallbacks.get(key)!;
    callbacks.add(callback);
    
    // 返回取消注册函数
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.invalidationCallbacks.delete(key);
      }
    };
  }
  
  /**
   * 获取缓存统计信息
   */
  async getStats(layer?: CacheLayer): Promise<CacheStats | null> {
    if (layer) {
      const provider = this.layers.get(layer);
      if (provider && provider instanceof MemoryCacheProvider) {
        return provider.getStats();
      }
      return null;
    }
    
    // 获取所有层的统计信息
    const memoryProvider = this.layers.get(CacheLayer.Memory) as MemoryCacheProvider;
    if (memoryProvider) {
      return memoryProvider.getStats();
    }
    
    return null;
  }
  
  /**
   * 将值提升到更高层缓存
   */
  private async promote<T>(
    key: string,
    value: T,
    currentLayer: CacheLayer,
    ttl?: number
  ): Promise<void> {
    // 定义层级优先级
    const layerPriority = [
      CacheLayer.Memory,
      CacheLayer.Session,
      CacheLayer.Local,
      CacheLayer.Remote
    ];
    
    const currentIndex = layerPriority.indexOf(currentLayer);
    
    // 提升到所有更高优先级的层
    for (let i = 0; i < currentIndex; i++) {
      const higherLayer = layerPriority[i];
      const provider = this.layers.get(higherLayer);
      
      if (provider) {
        await provider.set(key, value, ttl);
      }
    }
  }
  
  /**
   * 触发缓存失效回调
   */
  private triggerInvalidation(key: string): void {
    const callbacks = this.invalidationCallbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('缓存失效回调执行失败:', error);
        }
      });
    }
  }
  
  /**
   * 计算缓存键
   */
  static computeKey(prefix: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: any, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }
  
  /**
   * 装饰器：为方法添加缓存
   */
  static cached(options: {
    ttl?: number;
    key?: string | ((target: any, propertyKey: string, ...args: any[]) => string);
    layers?: CacheLayer[];
  } = {}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const cacheManager = new CacheManager();
      
      descriptor.value = async function (...args: any[]) {
        // 生成缓存键
        let cacheKey: string;
        if (typeof options.key === 'function') {
          cacheKey = options.key(target, propertyKey, ...args);
        } else if (options.key) {
          cacheKey = options.key;
        } else {
          cacheKey = CacheManager.computeKey(
            `${target.constructor.name}.${propertyKey}`,
            args
          );
        }
        
        // 尝试从缓存获取
        const cached = await cacheManager.get(cacheKey, {
          layers: options.layers
        });
        
        if (cached !== null) {
          return cached;
        }
        
        // 执行原方法
        const result = await originalMethod.apply(this, args);
        
        // 缓存结果
        await cacheManager.set(cacheKey, result, {
          ttl: options.ttl,
          layers: options.layers
        });
        
        return result;
      };
      
      return descriptor;
    };
  }
}

/**
 * 创建全局缓存管理器实例
 */
let globalCacheManager: CacheManager | null = null;

export function getCacheManager(config?: Partial<CacheConfig>): CacheManager {
  if (!globalCacheManager) {
    globalCacheManager = new CacheManager(config);
  }
  return globalCacheManager;
}

/**
 * React Hook: 使用缓存
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    layers?: CacheLayer[];
    dependencies?: any[];
  } = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = (typeof window !== 'undefined' && (window as any).React?.useState || (() => [null, () => {}]))<T | null>(null);
  const [loading, setLoading] = (typeof window !== 'undefined' && (window as any).React?.useState || (() => [false, () => {}]))(false);
  const [error, setError] = (typeof window !== 'undefined' && (window as any).React?.useState || (() => [null, () => {}]))<Error | null>(null);
  
  const cacheManager = getCacheManager();
  
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cached = await cacheManager.get<T>(key, {
        layers: options.layers,
        fallback: fetcher,
        ttl: options.ttl
      });
      
      setData(cached);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  const refresh = async () => {
    await cacheManager.delete(key);
    await loadData();
  };
  
  // 使用React的useEffect
  if (typeof window !== 'undefined' && (window as any).React?.useEffect) {
    (window as any).React.useEffect(() => {
      loadData();
      
      // 注册缓存失效回调
      const unsubscribe = cacheManager.onInvalidate(key, () => {
        loadData();
      });
      
      return unsubscribe;
    }, options.dependencies || []);
  }
  
  return { data, loading, error, refresh };
}