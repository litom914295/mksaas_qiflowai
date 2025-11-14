# WuxingStrengthAnalyzer API 参考

> 五行力量分析器 - 精确量化五行旺衰的核心API

## 📦 导入

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';
import type { WuxingStrength, DayMasterStrength } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';
```

## 🏗️ 构造函数

### `constructor(config?: BaziConfig)`

创建五行力量分析器实例。

**参数**:
- `config` (`BaziConfig`, 可选) - 八字配置对象，如果未提供则使用当前全局配置

**示例**:
```typescript
// 使用默认配置
const analyzer = new WuxingStrengthAnalyzer();

// 使用自定义配置
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';
const customConfig = BaziConfigManager.getInstance().getCurrentConfig();
const analyzer = new WuxingStrengthAnalyzer(customConfig);
```

## 📊 公共方法

### `calculateWuxingStrength(fourPillars: FourPillars): WuxingStrength`

计算四柱的五行综合力量分布。

**参数**:
- `fourPillars` (`FourPillars`) - 四柱数据对象

**返回值**: `WuxingStrength` - 五行力量分布对象

**算法步骤**:
1. 计算天干基础分值（每个天干10分）
2. 计算地支藏干分值
3. 应用月令旺相休囚死系数
4. 计算通根加成
5. 计算透干加成
6. 计算生克制化影响
7. 归一化到100分制（可选）

**示例**:
```typescript
const analyzer = new WuxingStrengthAnalyzer();

const fourPillars: FourPillars = {
  year: { gan: '庚', zhi: '午' },
  month: { gan: '壬', zhi: '午' },
  day: { gan: '丁', zhi: '酉' },
  hour: { gan: '甲', zhi: '辰' },
  dayMaster: '丁',
  monthOrder: '午'
};

const strength = analyzer.calculateWuxingStrength(fourPillars);

console.log(strength);
// {
//   wood: 15.2,
//   fire: 28.7,
//   earth: 12.3,
//   metal: 22.1,
//   water: 21.7,
//   details: {
//     stems: { 木: 10, 火: 10, 土: 0, 金: 10, 水: 10 },
//     hiddenStems: { 木: 5.5, 火: 8.2, 土: 6.1, 金: 3.8, 水: 4.2 },
//     monthlyEffect: { 木: 2.1, 火: 8.5, 土: 1.8, 金: -2.3, 水: 3.2 },
//     rooting: { 木: 3.6, 火: 6.0, 土: 2.4, 金: 4.6, 水: 2.3 },
//     revealing: { 木: 8, 火: 5, 土: 0, 金: 3, 水: 0 },
//     interactions: { 木: -1.0, 火: 2.0, 土: 2.0, 金: 6.0, 水: 2.0 }
//   }
// }
```

**详细分解说明**:
- `stems`: 天干直接贡献的分数
- `hiddenStems`: 地支藏干贡献的分数
- `monthlyEffect`: 月令旺相休囚死的影响（正值为加成，负值为削弱）
- `rooting`: 天干通根于地支的加成
- `revealing`: 地支藏干透出天干的加成
- `interactions`: 五行生克制化的影响

### `calculateDayMasterStrength(fourPillars: FourPillars, wuxingStrength: WuxingStrength): DayMasterStrength`

分析日主（日干）的强弱状态。

**参数**:
- `fourPillars` (`FourPillars`) - 四柱数据对象
- `wuxingStrength` (`WuxingStrength`) - 五行力量分布（由`calculateWuxingStrength`返回）

**返回值**: `DayMasterStrength` - 日主强弱分析结果

**判定标准**:
- **强**: 日主及生扶力量占比 > 55%
- **平衡**: 占比 45%-55%
- **弱**: 占比 < 45%

**示例**:
```typescript
const analyzer = new WuxingStrengthAnalyzer();
const fourPillars: FourPillars = {
  year: { gan: '癸', zhi: '巳' },
  month: { gan: '甲', zhi: '子' },
  day: { gan: '丁', zhi: '酉' },
  hour: { gan: '甲', zhi: '辰' },
  dayMaster: '丁',
  monthOrder: '子'
};

const wuxingStrength = analyzer.calculateWuxingStrength(fourPillars);
const dayMasterStrength = analyzer.calculateDayMasterStrength(
  fourPillars,
  wuxingStrength
);

console.log(dayMasterStrength);
// {
//   strength: 'weak',
//   score: 35,
//   factors: ['日主有根', '印星生助'],
//   element: '火'
// }
```

**影响因素说明**:
- `日主有根`: 日干在地支有通根
- `比劫帮身`: 同类五行力量 > 20分
- `印星生助`: 生我的五行力量 > 15分

## 📋 类型定义

### `WuxingStrength`

五行力量分布对象。

```typescript
interface WuxingStrength {
  // 五行总分（归一化后总和≈100）
  wood: number;   // 木
  fire: number;   // 火
  earth: number;  // 土
  metal: number;  // 金
  water: number;  // 水

  // 详细分解
  details: {
    stems: Record<string, number>;         // 天干贡献
    hiddenStems: Record<string, number>;   // 地支藏干贡献
    monthlyEffect: Record<string, number>; // 月令影响
    rooting: Record<string, number>;       // 通根加成
    revealing: Record<string, number>;     // 透干加成
    interactions: Record<string, number>;  // 生克影响
  };
}
```

### `DayMasterStrength`

日主强弱分析结果。

```typescript
interface DayMasterStrength {
  strength: 'strong' | 'weak' | 'balanced';  // 强弱状态
  score: number;                              // 综合得分 (0-100)
  factors: string[];                          // 影响因素列表
  element: string;                            // 日主五行
}
```

## 🎯 使用场景

### 场景1：基础五行分析

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

const analyzer = new WuxingStrengthAnalyzer();
const strength = analyzer.calculateWuxingStrength(fourPillars);

// 查找最旺的五行
const elements = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
const strongest = elements.reduce((max, el) => 
  strength[el] > strength[max] ? el : max
);

console.log(`最旺五行: ${strongest}, 得分: ${strength[strongest]}`);
```

### 场景2：配置对比分析

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 使用子平派配置
await manager.loadPreset('ziping');
const analyzer1 = new WuxingStrengthAnalyzer();
const strength1 = analyzer1.calculateWuxingStrength(fourPillars);

// 使用现代派配置
await manager.loadPreset('modern');
const analyzer2 = new WuxingStrengthAnalyzer();
const strength2 = analyzer2.calculateWuxingStrength(fourPillars);

// 对比结果
console.log('子平派:', strength1);
console.log('现代派:', strength2);
```

### 场景3：日主分析流程

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

const analyzer = new WuxingStrengthAnalyzer();

// 1. 计算五行力量
const wuxingStrength = analyzer.calculateWuxingStrength(fourPillars);

// 2. 分析日主强弱
const dayMasterStrength = analyzer.calculateDayMasterStrength(
  fourPillars,
  wuxingStrength
);

// 3. 根据日主强弱给出建议
if (dayMasterStrength.strength === 'weak') {
  console.log('日主身弱，宜扶抑，忌泄耗');
  console.log('喜用神:', dayMasterStrength.element, '的生我和同类');
} else if (dayMasterStrength.strength === 'strong') {
  console.log('日主身强，宜泄耗，忌生扶');
  console.log('喜用神: 我生和克我的五行');
} else {
  console.log('日主中和，平衡为贵');
}
```

## ⚙️ 配置影响

分析结果受以下配置影响：

### 1. 五行权重 (`wuxingWeights`)
```typescript
{
  stemBase: 10,           // 天干基础分值
  branchMainQi: 8,        // 地支本气分值
  branchMiddleQi: 5,      // 地支中气分值
  branchResidualQi: 2     // 地支余气分值
}
```

### 2. 通根系数 (`rootingCoefficients`)
```typescript
{
  year: 1.2,   // 年柱通根系数
  month: 1.5,  // 月柱通根系数（最重要）
  day: 1.5,    // 日柱通根系数
  hour: 1.1    // 时柱通根系数
}
```

### 3. 月令系数 (`monthlyCoefficients`)
```typescript
{
  spring: { wood: 1.5, fire: 1.2, earth: 1.0, metal: 0.8, water: 1.0 },
  summer: { wood: 1.0, fire: 1.5, earth: 1.2, metal: 0.7, water: 0.8 },
  autumn: { wood: 0.8, fire: 0.9, earth: 1.0, metal: 1.5, water: 1.0 },
  winter: { wood: 1.0, fire: 0.8, earth: 1.0, metal: 1.2, water: 1.5 }
}
```

### 4. 生克系数 (`interactionCoefficients`)
```typescript
{
  generation: 0.15,   // 生扶系数（我生的获得15%加成）
  control: 0.15,      // 克制系数（克我的削弱15%）
  drainage: 0.1,      // 泄耗系数
  controlled: 0.1     // 被克系数
}
```

## 🔍 性能优化

### 缓存使用

分析器会自动使用LRU缓存提升性能：

```typescript
// 第一次计算（耗时~5ms）
const strength1 = analyzer.calculateWuxingStrength(fourPillars);

// 相同四柱的重复计算会命中缓存（耗时<1ms）
const strength2 = analyzer.calculateWuxingStrength(fourPillars);
```

### 批量计算

```typescript
const analyzer = new WuxingStrengthAnalyzer();
const results = fourPillarsList.map(fp => ({
  fourPillars: fp,
  strength: analyzer.calculateWuxingStrength(fp),
  dayMaster: analyzer.calculateDayMasterStrength(fp, /* ... */)
}));
```

## 🐛 错误处理

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

try {
  const analyzer = new WuxingStrengthAnalyzer();
  const strength = analyzer.calculateWuxingStrength(fourPillars);
  
  // 验证结果
  if (!strength || typeof strength.wood !== 'number') {
    throw new Error('Invalid calculation result');
  }
  
} catch (error) {
  if (error instanceof Error) {
    console.error('五行分析失败:', error.message);
  }
}
```

## 📚 相关文档

- [配置系统指南](../guides/configuration.md) - 了解配置对分析结果的影响
- [BaziConfigManager API](./config-manager.md) - 配置管理器API
- [类型定义](./types.md) - 完整的TypeScript类型定义
- [最佳实践](../best-practices/performance.md) - 性能优化建议

## 💡 注意事项

1. **配置一致性**: 同一个分析器实例会使用构造时传入的配置，如需切换配置请创建新实例
2. **归一化**: 默认会归一化到100分制，可通过配置`options.normalizeToHundred: false`关闭
3. **精度**: 默认保留2位小数，可通过配置`options.precision`调整
4. **缓存**: 缓存基于四柱数据的字符串化，确保相同输入使用相同的对象结构

---

**最后更新**: 2025-11-13  
**版本**: 1.0.0
