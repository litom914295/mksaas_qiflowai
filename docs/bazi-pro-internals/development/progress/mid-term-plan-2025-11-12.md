# 八字项目 - 中期任务详细实施计划

**制定日期**: 2025-11-12  
**计划周期**: 1-2个月  
**项目路径**: `D:\test\mksaas_qiflowai`

---

## 📋 任务总览

### 第1月: 配置外部化与架构优化 (4周)

| 周次 | 任务 | 预计工时 | 优先级 |
|------|------|----------|--------|
| Week 1 | 配置系统设计与实现 | 16h | 🔴 高 |
| Week 2 | 五行权重配置外部化 | 12h | 🔴 高 |
| Week 3 | API文档与使用指南 | 14h | 🟡 中 |
| Week 4 | 批量计算API实现 | 10h | 🟡 中 |

**月度总工时**: 52小时

### 第2月: 测试完善与性能优化 (4周)

| 周次 | 任务 | 预计工时 | 优先级 |
|------|------|----------|--------|
| Week 5 | 权威案例测试库 | 12h | 🔴 高 |
| Week 6 | 集成测试套件 | 10h | 🟡 中 |
| Week 7 | 性能基准测试 | 8h | 🟡 中 |
| Week 8 | 缓存集成与优化 | 10h | 🟡 中 |

**月度总工时**: 40小时

**中期总工时**: 92小时 (~2.3个月全职工作)

---

## 📅 Week 1: 配置系统设计与实现 (16小时)

### 目标
建立灵活的配置系统,支持不同流派和自定义权重

### 任务细分

#### 1.1 设计配置架构 (4小时)

**输出**:
- `src/lib/bazi/config/types.ts` - 配置类型定义
- `src/lib/bazi/config/schema.ts` - 配置JSON Schema验证

**配置结构**:
```typescript
// 配置类型定义
export interface BaziConfig {
  version: string;
  name: string;
  description?: string;
  
  // 五行权重配置
  wuxingWeights: WuxingWeightsConfig;
  
  // 通根系数配置
  rootingCoefficients: RootingCoefficientsConfig;
  
  // 月令系数配置
  monthlyCoefficients: MonthlyCoefficientsConfig;
  
  // 生克系数配置
  interactionCoefficients: InteractionCoefficientsConfig;
  
  // 其他配置
  options?: BaziOptions;
}

export interface WuxingWeightsConfig {
  stemBase: number;           // 天干基础分值 (默认10)
  hiddenStemMultiplier: number; // 地支藏干系数 (默认10)
  revealingBonus: {
    benQi: number;     // 本气透出 (默认8)
    zhongQi: number;   // 中气透出 (默认5)
    yuQi: number;      // 余气透出 (默认3)
  };
}

export interface RootingCoefficientsConfig {
  year: number;   // 年柱得根系数 (默认1.2)
  month: number;  // 月柱得根系数 (默认1.5)
  day: number;    // 日柱得根系数 (默认1.5)
  hour: number;   // 时柱得根系数 (默认1.1)
}

export interface MonthlyCoefficientsConfig {
  wang: number;   // 旺 (默认1.5)
  xiang: number;  // 相 (默认1.2)
  xiu: number;    // 休 (默认1.0)
  qiu: number;    // 囚 (默认0.7)
  si: number;     // 死 (默认0.5)
}

export interface InteractionCoefficientsConfig {
  generation: number;  // 生扶系数 (默认0.15)
  control: number;     // 克制系数 (默认0.15)
}

export interface BaziOptions {
  useTrueSolarTime?: boolean;  // 是否使用真太阳时
  cacheEnabled?: boolean;      // 是否启用缓存
  cacheSize?: number;          // 缓存大小
  cacheTTL?: number;           // 缓存过期时间(ms)
}
```

**验证Schema**:
```typescript
// JSON Schema for validation
export const BaziConfigSchema = {
  type: 'object',
  required: ['version', 'name', 'wuxingWeights', 'rootingCoefficients'],
  properties: {
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    name: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    wuxingWeights: {
      type: 'object',
      required: ['stemBase', 'hiddenStemMultiplier', 'revealingBonus'],
      properties: {
        stemBase: { type: 'number', minimum: 1, maximum: 50 },
        hiddenStemMultiplier: { type: 'number', minimum: 1, maximum: 50 },
        revealingBonus: {
          type: 'object',
          required: ['benQi', 'zhongQi', 'yuQi'],
          properties: {
            benQi: { type: 'number', minimum: 0, maximum: 20 },
            zhongQi: { type: 'number', minimum: 0, maximum: 20 },
            yuQi: { type: 'number', minimum: 0, maximum: 20 },
          },
        },
      },
    },
    rootingCoefficients: {
      type: 'object',
      required: ['year', 'month', 'day', 'hour'],
      properties: {
        year: { type: 'number', minimum: 0.5, maximum: 2.0 },
        month: { type: 'number', minimum: 0.5, maximum: 2.0 },
        day: { type: 'number', minimum: 0.5, maximum: 2.0 },
        hour: { type: 'number', minimum: 0.5, maximum: 2.0 },
      },
    },
    monthlyCoefficients: {
      type: 'object',
      required: ['wang', 'xiang', 'xiu', 'qiu', 'si'],
      properties: {
        wang: { type: 'number', minimum: 1.0, maximum: 2.0 },
        xiang: { type: 'number', minimum: 0.8, maximum: 1.5 },
        xiu: { type: 'number', minimum: 0.8, maximum: 1.2 },
        qiu: { type: 'number', minimum: 0.3, maximum: 1.0 },
        si: { type: 'number', minimum: 0.3, maximum: 1.0 },
      },
    },
    interactionCoefficients: {
      type: 'object',
      required: ['generation', 'control'],
      properties: {
        generation: { type: 'number', minimum: 0.0, maximum: 0.5 },
        control: { type: 'number', minimum: 0.0, maximum: 0.5 },
      },
    },
  },
};
```

---

#### 1.2 实现配置管理器 (6小时)

**输出**:
- `src/lib/bazi/config/manager.ts` - 配置管理器
- `src/lib/bazi/config/presets/` - 预置配置目录

**功能**:
```typescript
export class BaziConfigManager {
  private config: BaziConfig;
  private validator: Ajv;

  constructor(config?: BaziConfig) {
    this.validator = new Ajv();
    this.config = config || this.loadDefault();
    this.validate(this.config);
  }

  /**
   * 加载配置
   */
  loadConfig(config: BaziConfig | string): void {
    if (typeof config === 'string') {
      // 从JSON字符串或文件路径加载
      config = this.parseConfig(config);
    }
    
    this.validate(config);
    this.config = config;
  }

  /**
   * 加载预置配置
   */
  loadPreset(name: 'ziping' | 'modern' | 'traditional'): void {
    const preset = this.getPreset(name);
    this.loadConfig(preset);
  }

  /**
   * 获取配置
   */
  getConfig(): Readonly<BaziConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * 更新配置
   */
  updateConfig(partial: Partial<BaziConfig>): void {
    const newConfig = { ...this.config, ...partial };
    this.validate(newConfig);
    this.config = newConfig;
  }

  /**
   * 验证配置
   */
  private validate(config: BaziConfig): void {
    const valid = this.validator.validate(BaziConfigSchema, config);
    if (!valid) {
      throw new ConfigError(
        'Invalid configuration',
        this.validator.errors
      );
    }
  }

  /**
   * 导出配置
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = this.loadDefault();
  }
}
```

---

#### 1.3 创建预置配置 (3小时)

**输出**:
- `src/lib/bazi/config/presets/ziping.json` - 子平派配置
- `src/lib/bazi/config/presets/modern.json` - 现代派配置
- `src/lib/bazi/config/presets/traditional.json` - 传统派配置

**子平派配置** (ziping.json):
```json
{
  "version": "1.0.0",
  "name": "ziping",
  "description": "子平派权重配置 - 强调月令和日主",
  "wuxingWeights": {
    "stemBase": 10,
    "hiddenStemMultiplier": 10,
    "revealingBonus": {
      "benQi": 8,
      "zhongQi": 5,
      "yuQi": 3
    }
  },
  "rootingCoefficients": {
    "year": 1.2,
    "month": 1.5,
    "day": 1.5,
    "hour": 1.1
  },
  "monthlyCoefficients": {
    "wang": 1.5,
    "xiang": 1.2,
    "xiu": 1.0,
    "qiu": 0.7,
    "si": 0.5
  },
  "interactionCoefficients": {
    "generation": 0.15,
    "control": 0.15
  },
  "options": {
    "useTrueSolarTime": true,
    "cacheEnabled": true,
    "cacheSize": 1000,
    "cacheTTL": 3600000
  }
}
```

**现代派配置** (modern.json):
```json
{
  "version": "1.0.0",
  "name": "modern",
  "description": "现代派权重配置 - 平衡各柱位影响",
  "wuxingWeights": {
    "stemBase": 10,
    "hiddenStemMultiplier": 10,
    "revealingBonus": {
      "benQi": 10,
      "zhongQi": 6,
      "yuQi": 3
    }
  },
  "rootingCoefficients": {
    "year": 1.3,
    "month": 1.4,
    "day": 1.4,
    "hour": 1.2
  },
  "monthlyCoefficients": {
    "wang": 1.4,
    "xiang": 1.2,
    "xiu": 1.0,
    "qiu": 0.8,
    "si": 0.6
  },
  "interactionCoefficients": {
    "generation": 0.18,
    "control": 0.15
  },
  "options": {
    "useTrueSolarTime": true,
    "cacheEnabled": true,
    "cacheSize": 500,
    "cacheTTL": 1800000
  }
}
```

---

#### 1.4 配置系统测试 (3小时)

**输出**:
- `src/lib/bazi/config/__tests__/manager.test.ts`
- `src/lib/bazi/config/__tests__/validation.test.ts`

**测试覆盖**:
- 配置加载和验证
- 预置配置测试
- 配置更新和重置
- 错误处理
- 配置导出

**预计测试用例**: 25个

---

## 📅 Week 2: 五行权重配置外部化 (12小时)

### 目标
将硬编码的权重配置改为可配置,支持运行时调整

### 任务细分

#### 2.1 重构 WuxingStrengthAnalyzer (6小时)

**修改文件**: `src/lib/bazi-pro/core/analyzer/wuxing-strength.ts`

**改动**:
```typescript
export class WuxingStrengthAnalyzer {
  private config: BaziConfig;
  private configManager: BaziConfigManager;

  constructor(config?: BaziConfig) {
    this.configManager = new BaziConfigManager(config);
    this.config = this.configManager.getConfig();
  }

  /**
   * 更新配置
   */
  updateConfig(config: BaziConfig | string): void {
    this.configManager.loadConfig(config);
    this.config = this.configManager.getConfig();
  }

  /**
   * 使用预置配置
   */
  usePreset(name: 'ziping' | 'modern' | 'traditional'): void {
    this.configManager.loadPreset(name);
    this.config = this.configManager.getConfig();
  }

  /**
   * 计算天干力量 (使用配置)
   */
  private calculateStemStrength(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const stemBase = this.config.wuxingWeights.stemBase;
    
    const stems = [
      fourPillars.year.gan,
      fourPillars.month.gan,
      fourPillars.day.gan,
      fourPillars.hour.gan,
    ];

    for (const stem of stems) {
      const element = this.STEM_ELEMENTS[stem];
      if (element) {
        const elementKey = this.getElementKey(element);
        strength[elementKey] += stemBase;
        strength.details.stems[element] += stemBase;
      }
    }
  }

  /**
   * 计算通根加成 (使用配置)
   */
  private calculateRootingBonus(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const coefficients = this.config.rootingCoefficients;
    
    // ... 使用 coefficients.year, coefficients.month 等
  }

  /**
   * 计算生克影响 (使用配置)
   */
  private calculateInteractions(
    fourPillars: FourPillars,
    strength: WuxingStrengthMutable
  ): void {
    const generation = this.config.interactionCoefficients.generation;
    const control = this.config.interactionCoefficients.control;
    
    // ... 使用配置的系数
  }
}
```

---

#### 2.2 集成缓存到配置 (3小时)

**新文件**: `src/lib/bazi-pro/services/bazi-service.ts`

**服务层封装**:
```typescript
export class BaziService {
  private analyzer: WuxingStrengthAnalyzer;
  private cache: LRUCache<string, any> | null = null;

  constructor(config?: BaziConfig) {
    this.analyzer = new WuxingStrengthAnalyzer(config);
    
    if (config?.options?.cacheEnabled) {
      this.cache = new LRUCache({
        maxSize: config.options.cacheSize || 1000,
        ttl: config.options.cacheTTL || 3600000,
      });
    }
  }

  /**
   * 计算五行力量 (带缓存)
   */
  calculateWuxingStrength(fourPillars: FourPillars): WuxingStrength {
    if (!this.cache) {
      return this.analyzer.calculateWuxingStrength(fourPillars);
    }

    const key = this.getCacheKey(fourPillars);
    let result = this.cache.get(key);

    if (!result) {
      result = this.analyzer.calculateWuxingStrength(fourPillars);
      this.cache.set(key, result);
    }

    return result;
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cache?.getStats();
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache?.clear();
  }

  private getCacheKey(fourPillars: FourPillars): string {
    return createCacheKey(
      fourPillars.year,
      fourPillars.month,
      fourPillars.day,
      fourPillars.hour
    );
  }
}
```

---

#### 2.3 配置外部化测试 (3小时)

**输出**:
- `src/lib/bazi-pro/core/analyzer/__tests__/config-integration.test.ts`
- `src/lib/bazi-pro/services/__tests__/bazi-service.test.ts`

**测试覆盖**:
- 不同配置下的计算结果
- 预置配置切换
- 缓存集成测试
- 配置更新测试

**预计测试用例**: 15个

---

## 📅 Week 3: API文档与使用指南 (14小时)

### 目标
完善API文档,提供使用示例和最佳实践

### 任务细分

#### 3.1 JSDoc API文档 (6小时)

**覆盖模块**:
- `BaziConfigManager`
- `WuxingStrengthAnalyzer`
- `BaziService`
- 所有公共API

**示例**:
```typescript
/**
 * 八字服务 - 提供八字计算的高级API
 * 
 * @example
 * ```typescript
 * const service = new BaziService({
 *   version: '1.0.0',
 *   name: 'custom',
 *   wuxingWeights: { ... },
 *   rootingCoefficients: { ... }
 * });
 * 
 * const result = service.calculateWuxingStrength(fourPillars);
 * console.log(result.wood, result.fire); // 五行力量
 * ```
 * 
 * @see {@link BaziConfig} 配置接口
 * @see {@link WuxingStrength} 返回类型
 */
export class BaziService {
  // ...
}
```

---

#### 3.2 使用指南文档 (5小时)

**输出**:
- `docs/API.md` - API参考文档
- `docs/CONFIGURATION.md` - 配置指南
- `docs/EXAMPLES.md` - 使用示例
- `docs/BEST_PRACTICES.md` - 最佳实践

**配置指南内容**:
1. 配置系统概述
2. 预置配置说明
3. 自定义配置创建
4. 配置参数详解
5. 流派对比表
6. 迁移指南

---

#### 3.3 示例代码库 (3小时)

**输出**:
- `examples/basic-usage.ts` - 基础使用
- `examples/custom-config.ts` - 自定义配置
- `examples/preset-comparison.ts` - 预置对比
- `examples/with-cache.ts` - 缓存使用
- `examples/batch-calculation.ts` - 批量计算

---

## 📅 Week 4: 批量计算API实现 (10小时)

### 目标
实现高效的批量计算API,优化性能

### 任务细分

#### 4.1 批量计算实现 (5小时)

**新文件**: `src/lib/bazi-pro/services/batch-calculator.ts`

```typescript
export class BatchBaziCalculator {
  private service: BaziService;
  private maxConcurrent: number;

  constructor(config?: BaziConfig, maxConcurrent = 10) {
    this.service = new BaziService(config);
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * 批量计算五行力量
   */
  async calculateBatch(
    inputs: FourPillars[],
    options?: BatchOptions
  ): Promise<WuxingStrength[]> {
    const results: WuxingStrength[] = [];
    const chunks = this.chunkArray(inputs, this.maxConcurrent);

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((pillars) =>
          Promise.resolve(this.service.calculateWuxingStrength(pillars))
        )
      );
      results.push(...chunkResults);

      if (options?.onProgress) {
        options.onProgress(results.length, inputs.length);
      }
    }

    return results;
  }

  /**
   * 批量计算(同步版本)
   */
  calculateBatchSync(inputs: FourPillars[]): WuxingStrength[] {
    return inputs.map((pillars) =>
      this.service.calculateWuxingStrength(pillars)
    );
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

---

#### 4.2 性能优化 (3小时)

- 实现并行计算
- 优化内存使用
- 添加进度回调
- 实现取消机制

---

#### 4.3 批量计算测试 (2小时)

**输出**:
- `src/lib/bazi-pro/services/__tests__/batch-calculator.test.ts`

**测试覆盖**:
- 批量计算正确性
- 性能测试
- 进度回调
- 错误处理

**预计测试用例**: 10个

---

## 📅 Week 5-8: 测试与性能优化

### Week 5: 权威案例测试库 (12小时)
- 收集权威案例 (历史名人、典籍案例)
- 创建测试数据集
- 实现验证框架
- 生成测试报告

### Week 6: 集成测试套件 (10小时)
- 端到端测试
- 跨模块集成测试
- 错误场景测试
- 回归测试

### Week 7: 性能基准测试 (8小时)
- 建立性能基准
- 性能监控工具
- 瓶颈识别与优化
- 性能报告生成

### Week 8: 缓存集成与优化 (10小时)
- 智能缓存策略
- 缓存预热
- 缓存失效策略
- 缓存监控

---

## 📊 成功指标

### 代码质量
- [ ] 配置系统100%类型安全
- [ ] API文档覆盖率100%
- [ ] 测试覆盖率保持95%+

### 性能指标
- [ ] 批量计算性能提升50%+
- [ ] 缓存命中率60%+
- [ ] 单次计算<5ms (with cache)

### 文档质量
- [ ] API文档完整性100%
- [ ] 使用示例>=10个
- [ ] 最佳实践文档完整

### 测试质量
- [ ] 权威案例测试>=20个
- [ ] 集成测试>=30个
- [ ] 性能基准测试>=5个

---

## 🎯 里程碑

### M1: 配置系统完成 (Week 2结束)
- ✅ 配置系统实现
- ✅ 预置配置创建
- ✅ 五行权重外部化
- ✅ 基础测试完成

### M2: 文档与API完成 (Week 4结束)
- ✅ API文档100%
- ✅ 使用指南完整
- ✅ 批量计算API
- ✅ 示例代码库

### M3: 测试与优化完成 (Week 8结束)
- ✅ 权威案例测试库
- ✅ 集成测试完整
- ✅ 性能基准建立
- ✅ 缓存系统优化

---

## 📁 交付物清单

### 代码文件 (新增 ~15个)
1. `src/lib/bazi/config/types.ts`
2. `src/lib/bazi/config/schema.ts`
3. `src/lib/bazi/config/manager.ts`
4. `src/lib/bazi/config/presets/*.json` (3个)
5. `src/lib/bazi-pro/services/bazi-service.ts`
6. `src/lib/bazi-pro/services/batch-calculator.ts`
7. 测试文件 (~8个)

### 文档文件 (新增 ~8个)
1. `docs/API.md`
2. `docs/CONFIGURATION.md`
3. `docs/EXAMPLES.md`
4. `docs/BEST_PRACTICES.md`
5. `docs/MIGRATION.md`
6. `examples/*.ts` (5个)

### 测试文件 (新增 ~10个)
- 配置系统测试
- 服务层测试
- 批量计算测试
- 集成测试
- 权威案例测试

---

## 🚀 开始执行

### 第一步: 立即开始
```bash
# 创建配置目录结构
mkdir -p src/lib/bazi/config/presets
mkdir -p src/lib/bazi/config/__tests__
mkdir -p src/lib/bazi-pro/services/__tests__
mkdir -p docs
mkdir -p examples

# 开始 Week 1 Task 1.1: 设计配置架构
# 创建配置类型定义文件
```

### 后续步骤
1. 按周执行任务
2. 每周review进度
3. 及时调整计划
4. 保持文档更新

---

**计划制定完成时间**: 2025-11-12  
**计划状态**: 📋 Ready to Execute  
**预计完成时间**: 2026-01-12 (2个月后)

**下一步**: 开始 Week 1 Task 1.1 - 设计配置架构
