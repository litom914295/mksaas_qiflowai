# 5分钟快速入门

> 通过3个实际示例快速上手BaZi-Pro八字分析系统

## 📦 前置要求

- Node.js 18+
- TypeScript 5+
- Next.js 15+ (项目环境)

## 🚀 示例1：基础五行分析

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';
import type { FourPillars } from '@/lib/bazi-pro/core/calculator/four-pillars';

// 准备四柱数据（已通过四柱计算器得到）
const fourPillars: FourPillars = {
  year: { gan: '庚', zhi: '午' },   // 年柱
  month: { gan: '壬', zhi: '午' },  // 月柱  
  day: { gan: '丁', zhi: '酉' },    // 日柱
  hour: { gan: '甲', zhi: '辰' }    // 时柱
};

// 创建分析器
const analyzer = new WuxingStrengthAnalyzer();

// 计算五行力量
const wuxingStrength = analyzer.calculateWuxingStrength(fourPillars);

console.log('五行力量分布：');
console.log(`木: ${wuxingStrength.wood.toFixed(1)}分`);
console.log(`火: ${wuxingStrength.fire.toFixed(1)}分`);
console.log(`土: ${wuxingStrength.earth.toFixed(1)}分`);
console.log(`金: ${wuxingStrength.metal.toFixed(1)}分`);
console.log(`水: ${wuxingStrength.water.toFixed(1)}分`);

// 输出示例：
// 五行力量分布：
// 木: 15.2分
// 火: 28.7分
// 土: 12.3分
// 金: 22.1分
// 水: 21.7分
```

## ⚙️ 示例2：使用自定义配置

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

// 加载预设配置（子平派 - 重月令）
BaziConfigManager.getInstance().loadPreset('ziping');

// 或加载现代派配置（平衡派）
// BaziConfigManager.getInstance().loadPreset('modern');

// 创建分析器（自动使用当前配置）
const analyzer = new WuxingStrengthAnalyzer();

// 进行分析
const result = analyzer.calculateWuxingStrength(fourPillars);

console.log('使用子平派配置的分析结果：', result);
```

## 📊 示例3：完整分析流程

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';
import type { FourPillars } from '@/lib/bazi-pro/core/calculator/four-pillars';

// 1. 准备数据
const fourPillars: FourPillars = {
  year: { gan: '癸', zhi: '巳' },
  month: { gan: '甲', zhi: '子' },
  day: { gan: '丁', zhi: '酉' },
  hour: { gan: '甲', zhi: '辰' }
};

// 2. 创建分析器
const analyzer = new WuxingStrengthAnalyzer();

// 3. 计算五行力量
const wuxingStrength = analyzer.calculateWuxingStrength(fourPillars);

// 4. 分析日主强弱
const dayMasterStrength = analyzer.analyzeDayMasterStrength(fourPillars);

console.log('日主分析：');
console.log(`日主天干: ${fourPillars.day.gan}`);
console.log(`日主五行: ${dayMasterStrength.element}`);
console.log(`强弱状态: ${dayMasterStrength.strength}`);
console.log(`综合得分: ${dayMasterStrength.score}分`);
console.log('影响因素:', dayMasterStrength.factors);

// 输出示例：
// 日主分析：
// 日主天干: 丁
// 日主五行: 火
// 强弱状态: weak
// 综合得分: 35分
// 影响因素: ['月令不得势', '通根于巳火', '得甲木生扶']

// 5. 查看详细分解
console.log('\n力量来源分解：');
console.log('天干贡献:', wuxingStrength.details.stems);
console.log('地支藏干:', wuxingStrength.details.hiddenStems);
console.log('月令影响:', wuxingStrength.details.monthlyEffect);
console.log('通根加成:', wuxingStrength.details.rooting);
console.log('透干加成:', wuxingStrength.details.revealing);
console.log('生克影响:', wuxingStrength.details.interactions);
```

## 🎯 核心概念速览

### FourPillars（四柱）
八字的基础数据结构，包含年月日时四柱：
```typescript
interface FourPillars {
  year: { gan: string; zhi: string };   // 年柱
  month: { gan: string; zhi: string };  // 月柱
  day: { gan: string; zhi: string };    // 日柱
  hour: { gan: string; zhi: string };   // 时柱
}
```

### WuxingStrength（五行力量）
五行（木火土金水）的量化分值：
```typescript
interface WuxingStrength {
  wood: number;   // 木
  fire: number;   // 火
  earth: number;  // 土
  metal: number;  // 金
  water: number;  // 水
  details: { ... };  // 详细分解
}
```

### DayMasterStrength（日主强弱）
日主的综合强弱分析：
```typescript
interface DayMasterStrength {
  strength: 'strong' | 'weak' | 'balanced';  // 强弱状态
  score: number;                              // 0-100分
  factors: string[];                          // 影响因素
  element: string;                            // 日主五行
}
```

## 🔧 配置系统快速切换

BaZi-Pro提供3种预设配置：

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 1. 子平派（重月令，系数1.6）
manager.loadPreset('ziping');

// 2. 现代派（平衡派，系数1.5）  
manager.loadPreset('modern');

// 3. 传统派（保守派，系数1.4）
manager.loadPreset('traditional');
```

不同配置会影响五行力量的计算结果，详见[配置系统指南](../guides/configuration.md)。

## 🐛 错误处理

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

try {
  const analyzer = new WuxingStrengthAnalyzer();
  const result = analyzer.calculateWuxingStrength(fourPillars);
  
  // 处理结果
  console.log(result);
  
} catch (error) {
  if (error instanceof Error) {
    console.error('分析失败:', error.message);
  }
}
```

## 📝 常见问题

### Q: 如何获取 FourPillars 数据？
A: FourPillars数据通常由四柱计算器生成，传入生辰八字信息即可。详见[四柱计算指南](../guides/four-pillars.md)。

### Q: 不同配置差异有多大？
A: 三种预设配置的月令系数分别为1.6/1.5/1.4，对最终得分可能有10-20%的影响。建议根据流派选择。

### Q: 分数范围是多少？
A: 五行力量分数归一化到100分制，单个五行通常在0-40分之间。总和≈100分（可能略有浮动）。

### Q: 如何提升性能？
A: 系统内置LRU缓存，相同四柱的重复计算会命中缓存。详见[性能优化指南](../guides/performance.md)。

## 🎉 下一步

恭喜！您已经掌握了BaZi-Pro的基础用法。继续学习：

- 📖 [配置系统详解](../guides/configuration.md) - 深入了解配置选项
- 🔧 [API完整参考](../api/analyzer.md) - 查看所有可用API
- 💡 [最佳实践](../best-practices/configuration.md) - 生产环境使用建议
- 🚨 [常见问题](../troubleshooting/faq.md) - 问题排查指南

## 💬 获取帮助

- 📧 邮件: support@qiflow.ai
- 💬 问题: [GitHub Issues](https://github.com/litom914295/qiflowai/issues)
- 📖 文档: [完整文档](../README.md)

---

**最后更新**: 2025-11-13  
**文档版本**: 1.0.0
