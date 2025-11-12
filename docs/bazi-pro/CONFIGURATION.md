# 八字配置系统使用指南

## 概述

八字配置系统提供灵活的权重配置,支持不同流派算法。本指南介绍如何使用配置系统。

## 快速开始

### 使用默认配置

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

// 使用默认现代派配置
const analyzer = new WuxingStrengthAnalyzer();
const result = analyzer.calculateWuxingStrength(fourPillars);
```

### 使用预置配置

```typescript
import { baziConfigManager } from '@/lib/bazi-pro/config';
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

// 加载子平派配置
await baziConfigManager.loadPreset('ziping');
const analyzer = new WuxingStrengthAnalyzer(
  baziConfigManager.getCurrentConfig()
);
```

## 预置配置

### 三种预置流派

#### 1. 子平派 (Ziping)

**特点**: 强调月令提纲,通根力量最强

```typescript
await baziConfigManager.loadPreset('ziping');
```

**配置特征**:
- 月令系数: 1.6 (最强)
- 生扶系数: 0.20
- 月柱通根: 1.6

**适用场景**: 传统子平八字分析

#### 2. 现代派 (Modern) - 默认

**特点**: 综合平衡,折中各家之长

```typescript
await baziConfigManager.loadPreset('modern');
```

**配置特征**:
- 月令系数: 1.5
- 生扶系数: 0.15
- 月柱通根: 1.5

**适用场景**: 现代八字分析,推荐使用

#### 3. 传统派 (Traditional)

**特点**: 保守传统,强调天干地支基础分值

```typescript
await baziConfigManager.loadPreset('traditional');
```

**配置特征**:
- 天干基础: 12分 (最高)
- 地支主气: 10分
- 月令系数: 1.4

**适用场景**: 古法八字分析

### 流派对比表

| 配置项 | 子平派 | 现代派 | 传统派 |
|--------|--------|--------|--------|
| 天干基础分值 | 10 | 10 | 12 |
| 地支主气分值 | 8 | 8 | 10 |
| 月令系数(春木) | 1.6 | 1.5 | 1.4 |
| 生扶系数 | 0.20 | 0.15 | 0.12 |
| 月柱通根系数 | 1.6 | 1.5 | 1.4 |

## 配置结构

### 完整配置接口

```typescript
interface BaziConfig {
  version: string;
  name: string;
  description?: string;
  school?: 'ziping' | 'modern' | 'traditional' | 'custom';
  
  wuxingWeights: {
    stemBase: number;        // 天干基础分值 (0-20)
    branchMainQi: number;    // 地支主气分值 (0-20)
    branchMiddleQi: number;  // 地支中气分值 (0-20)
    branchResidualQi: number;// 地支余气分值 (0-20)
  };
  
  rootingCoefficients: {
    year: number;   // 年柱通根系数 (1.0-2.0)
    month: number;  // 月柱通根系数 (1.0-2.0)
    day: number;    // 日柱通根系数 (1.0-2.0)
    hour: number;   // 时柱通根系数 (1.0-2.0)
  };
  
  monthlyCoefficients: {
    spring: { wood: number; fire: number; earth: number; metal: number; water: number };
    summer: { wood: number; fire: number; earth: number; metal: number; water: number };
    autumn: { wood: number; fire: number; earth: number; metal: number; water: number };
    winter: { wood: number; fire: number; earth: number; metal: number; water: number };
  };
  
  interactionCoefficients: {
    generation: number; // 生扶加成 (0-0.5)
    control: number;    // 克制惩罚 (0-0.5)
    drainage: number;   // 泄气减损 (0-0.5)
    controlled: number; // 被克减损 (0-0.5)
  };
  
  options?: {
    enableCache: boolean;
    cacheSize: number;
    enableTrueSolarTime: boolean;
    normalizeToHundred: boolean;
    precision: number;
  };
}
```

## 自定义配置

### 创建自定义配置

```typescript
import { getCurrentConfig, type BaziConfig } from '@/lib/bazi-pro/config';

const customConfig: BaziConfig = {
  ...getCurrentConfig(),
  version: '1.0.0',
  name: 'My Custom Config',
  school: 'custom',
  
  // 提高天干权重
  wuxingWeights: {
    stemBase: 15,
    branchMainQi: 8,
    branchMiddleQi: 5,
    branchResidualQi: 2,
  },
  
  // 增强通根影响
  rootingCoefficients: {
    year: 1.3,
    month: 1.7,
    day: 1.7,
    hour: 1.2,
  },
};

const analyzer = new WuxingStrengthAnalyzer(customConfig);
```

### 修改特定参数

```typescript
import { baziConfigManager } from '@/lib/bazi-pro/config';

// 获取当前配置
const config = baziConfigManager.getCurrentConfig();

// 修改生扶系数
baziConfigManager.updateConfig({
  interactionCoefficients: {
    ...config.interactionCoefficients,
    generation: 0.25, // 提高到25%
  },
});
```

### 配置导入导出

```typescript
import { baziConfigManager } from '@/lib/bazi-pro/config';

// 导出配置
const json = baziConfigManager.exportToJSON();
localStorage.setItem('myBaziConfig', json);

// 导入配置
const savedJson = localStorage.getItem('myBaziConfig');
if (savedJson) {
  baziConfigManager.loadFromJSON(savedJson);
}
```

## 配置验证

### 运行时验证

```typescript
import { validateConfig } from '@/lib/bazi-pro/config';

const myConfig = { /* ... */ };
const validation = validateConfig(myConfig);

if (!validation.success) {
  console.error('配置错误:', validation.errors);
  validation.errors.forEach(err => {
    console.log(`- ${err.path}: ${err.message}`);
  });
}
```

### 配置范围

- **天干/地支分值**: 0-20分
- **通根系数**: 1.0-2.0
- **月令系数**: 0.5-2.0
- **生克系数**: 0-0.5
- **精度**: 0-4位小数
- **缓存大小**: 10-1000

## 高级用法

### 配置监听

```typescript
import { baziConfigManager } from '@/lib/bazi-pro/config';

// 订阅配置变更
const unsubscribe = baziConfigManager.subscribe((newConfig) => {
  console.log('配置已更新:', newConfig.name);
  // 重新计算或更新UI
});

// 取消订阅
unsubscribe();
```

### 配置比较

```typescript
import { baziConfigManager } from '@/lib/bazi-pro/config';

const config1 = baziConfigManager.getCurrentConfig();
await baziConfigManager.loadPreset('ziping');
const config2 = baziConfigManager.getCurrentConfig();

const comparison = baziConfigManager.compareConfigs(config1, config2);
console.log('是否相同:', comparison.identical);
console.log('差异字段:', comparison.differences);
```

### 批量对比分析

```typescript
import { baziConfigManager } from '@/lib/bazi-pro/config';
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

const presets = ['ziping', 'modern', 'traditional'] as const;
const results = {};

for (const preset of presets) {
  await baziConfigManager.loadPreset(preset);
  const analyzer = new WuxingStrengthAnalyzer(
    baziConfigManager.getCurrentConfig()
  );
  results[preset] = analyzer.calculateWuxingStrength(fourPillars);
}

// 对比三种流派结果
console.table(results);
```

## 配置选项详解

### 归一化控制

```typescript
const config: BaziConfig = {
  ...getCurrentConfig(),
  options: {
    normalizeToHundred: false, // 禁用归一化
    // 其他选项...
  },
};
```

禁用归一化后,五行力量总和不会归一化到100分,保留原始计算值。

### 精度控制

```typescript
const config: BaziConfig = {
  ...getCurrentConfig(),
  options: {
    precision: 4, // 4位小数精度
    // 其他选项...
  },
};
```

精度范围: 0-4位小数

### 缓存配置

```typescript
const config: BaziConfig = {
  ...getCurrentConfig(),
  options: {
    enableCache: true,
    cacheSize: 200, // 缓存200个结果
    // 其他选项...
  },
};
```

## 最佳实践

### 1. 选择合适的流派

- **传统研究**: 使用子平派或传统派
- **现代应用**: 使用现代派(默认)
- **特殊需求**: 创建自定义配置

### 2. 配置版本管理

```typescript
const myConfig: BaziConfig = {
  version: '1.0.0',
  name: 'My App Config',
  createdAt: new Date().toISOString(),
  // ...
};
```

### 3. 配置持久化

```typescript
// 保存配置
const config = baziConfigManager.getCurrentConfig();
localStorage.setItem('baziConfig', JSON.stringify(config));

// 加载配置
const saved = localStorage.getItem('baziConfig');
if (saved) {
  baziConfigManager.loadFromJSON(saved);
}
```

### 4. 配置隔离

```typescript
// 每个分析器使用独立配置
const analyzer1 = new WuxingStrengthAnalyzer(config1);
const analyzer2 = new WuxingStrengthAnalyzer(config2);

// 不会互相影响
const result1 = analyzer1.calculateWuxingStrength(fourPillars);
const result2 = analyzer2.calculateWuxingStrength(fourPillars);
```

## 常见问题

### Q: 如何重置为默认配置?

```typescript
baziConfigManager.resetToDefault();
```

### Q: 配置是否影响性能?

配置在构造时确定,计算时直接访问,零性能损失。

### Q: 可以动态切换配置吗?

可以,但需要创建新的分析器实例:

```typescript
// 切换配置
await baziConfigManager.loadPreset('ziping');
const newAnalyzer = new WuxingStrengthAnalyzer(
  baziConfigManager.getCurrentConfig()
);
```

### Q: 如何验证自定义配置?

```typescript
const validation = validateConfig(myConfig);
if (!validation.success) {
  console.error(validation.errors);
}
```

## 参考资料

- [API文档](./API.md)
- [使用示例](./EXAMPLES.md)
- [最佳实践](./BEST_PRACTICES.md)
- [配置类型定义](../../src/lib/bazi-pro/config/types.ts)

---

**更新时间**: 2025-11-12  
**版本**: 1.0.0
