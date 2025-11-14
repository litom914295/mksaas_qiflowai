# FAQ 常见问题解答

> BaZi-Pro使用过程中的常见问题和解决方案

## 📚 基础问题

### Q1: 如何开始使用BaZi-Pro？

**A**: 最快的入门方式：

```typescript
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

const analyzer = new WuxingStrengthAnalyzer();
const result = analyzer.calculateWuxingStrength(fourPillars);
console.log(result);
```

详见：[5分钟快速入门](../getting-started/quick-start.md)

### Q2: FourPillars数据从哪里获取？

**A**: FourPillars通常由四柱计算器生成。格式如下：

```typescript
interface FourPillars {
  year: { gan: string; zhi: string };   // 年柱
  month: { gan: string; zhi: string };  // 月柱
  day: { gan: string; zhi: string };    // 日柱
  hour: { gan: string; zhi: string };   // 时柱
  dayMaster: string;                    // 日干
  monthOrder?: string;                  // 月令（可选）
}
```

如果您有完整的生辰八字计算器，应该能够提供这个数据结构。

### Q3: 三种预设配置有什么区别？

**A**: 主要区别在月令系数：

| 配置 | 月令系数 | 特点 | 适用场景 |
|-----|---------|------|---------|
| **Ziping** | 1.6 | 重月令，传统派 | 传统命理研究 |
| **Modern** | 1.5 | 平衡派 | 综合分析应用 |
| **Traditional** | 1.4 | 保守派 | 谨慎稳健分析 |

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

// 选择合适的预设
await BaziConfigManager.getInstance().loadPreset('modern');
```

详见：[配置选择最佳实践](../best-practices/configuration.md)

## ⚙️ 配置问题

### Q4: 如何切换不同的配置？

**A**: 使用BaziConfigManager切换：

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 异步加载预设
await manager.loadPreset('ziping');    // 子平派
await manager.loadPreset('modern');    // 现代派
await manager.loadPreset('traditional'); // 传统派
```

**注意**：切换配置后，需要创建新的分析器实例：

```typescript
await manager.loadPreset('ziping');
const analyzer = new WuxingStrengthAnalyzer(); // 使用新配置
```

### Q5: 配置切换后为什么结果没变化？

**A**: 常见原因：

1. **忘记创建新分析器**：旧的分析器实例仍使用旧配置
```typescript
// ❌ 错误
const analyzer = new WuxingStrengthAnalyzer();
await manager.loadPreset('ziping');
const result = analyzer.calculateWuxingStrength(fp); // 仍用旧配置

// ✅ 正确
await manager.loadPreset('ziping');
const analyzer = new WuxingStrengthAnalyzer(); // 创建新实例
const result = analyzer.calculateWuxingStrength(fp);
```

2. **缓存命中**：如果使用了缓存，相同输入会返回缓存结果
```typescript
// 清除缓存后重新计算
// (目前没有公开的缓存清除API)
```

### Q6: 如何自定义配置参数？

**A**: 使用`updateConfig`方法：

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 只更新特定参数
manager.updateConfig({
  monthlyCoefficients: {
    spring: { wood: 1.7, fire: 1.3, earth: 1.0, metal: 0.7, water: 1.0 },
    // ... 其他季节
  }
});
```

或导入完整的自定义配置：

```typescript
const customConfig = {
  version: '1.0.0',
  name: 'My Custom Config',
  // ... 完整配置
};

manager.setConfig(customConfig);
```

## 🧮 计算问题

### Q7: 五行分数总和为什么不是100？

**A**: 几种可能：

1. **配置中关闭了归一化**：
```typescript
const config = manager.getCurrentConfig();
console.log(config.options.normalizeToHundred); // 检查是否为false

// 启用归一化
manager.updateConfig({
  options: {
    ...config.options,
    normalizeToHundred: true
  }
});
```

2. **浮点数精度问题**：总和可能是99.98或100.02
```typescript
const total = result.wood + result.fire + result.earth + 
              result.metal + result.water;
console.log(total); // 可能是99.98或100.02

// 这是正常的浮点数误差，影响很小
```

### Q8: 日主强弱判断的标准是什么？

**A**: 判断标准：

- **强 (strong)**: 日主及生扶力量占比 > 55%
- **平衡 (balanced)**: 占比 45%-55%
- **弱 (weak)**: 占比 < 45%

```typescript
const dayMasterStrength = analyzer.calculateDayMasterStrength(
  fourPillars,
  wuxingStrength
);

console.log(dayMasterStrength);
// {
//   strength: 'weak',    // 强弱状态
//   score: 35,           // 具体得分
//   factors: ['...'],    // 影响因素
//   element: '火'        // 日主五行
// }
```

### Q9: 如何理解详细分解 (details) 数据？

**A**: details包含6个维度的分解：

```typescript
result.details = {
  stems: { ... },         // 天干直接贡献
  hiddenStems: { ... },   // 地支藏干贡献
  monthlyEffect: { ... }, // 月令旺相休囚死影响
  rooting: { ... },       // 通根加成
  revealing: { ... },     // 透干加成
  interactions: { ... }   // 生克制化影响
};
```

**示例**：
```typescript
// 天干贡献：每个天干10分
// 四柱有2个木干 → stems.木 = 20

// 月令影响：正值为加成，负值为削弱
// 春季木旺 → monthlyEffect.木 = +8.5
// 春季金囚 → monthlyEffect.金 = -2.3

// 生克影响：生扶为正，克制为负
// 木生火 → interactions.火 = +2.0
// 金克木 → interactions.木 = -1.5
```

## 🐛 错误处理

### Q10: 遇到 "Invalid configuration" 错误怎么办？

**A**: 这说明配置格式不正确。使用`validateConfig`检查：

```typescript
const validation = manager.validateConfig(yourConfig);

if (!validation.success) {
  console.error('配置错误:');
  validation.errors?.forEach(err => {
    console.error(`${err.path}: ${err.message}`);
  });
  
  // 回退到默认配置
  manager.resetToDefault();
}
```

常见错误：
- 缺少必需字段 (version, name, wuxingWeights等)
- 数值超出合理范围
- 类型错误 (字符串写成数字等)

### Q11: 配置导入失败怎么办？

**A**: 分步排查：

```typescript
try {
  manager.loadFromJSON(jsonString);
} catch (error) {
  // 1. 检查JSON格式
  try {
    JSON.parse(jsonString);
  } catch (e) {
    console.error('JSON格式错误:', e.message);
    return;
  }
  
  // 2. 检查配置内容
  const data = JSON.parse(jsonString);
  const validation = manager.validateConfig(data);
  if (!validation.success) {
    console.error('配置内容错误:', validation.errors);
    return;
  }
}
```

### Q12: 分析器计算返回undefined怎么办？

**A**: 检查输入数据：

```typescript
try {
  const analyzer = new WuxingStrengthAnalyzer();
  
  // 验证输入
  if (!fourPillars || !fourPillars.year || !fourPillars.day) {
    throw new Error('FourPillars数据不完整');
  }
  
  const result = analyzer.calculateWuxingStrength(fourPillars);
  
  if (!result) {
    throw new Error('计算结果为空');
  }
  
  // 验证结果
  if (typeof result.wood !== 'number') {
    throw new Error('计算结果格式异常');
  }
  
} catch (error) {
  console.error('分析失败:', error.message);
}
```

## 🚀 性能问题

### Q13: 计算速度慢怎么优化？

**A**: 几种优化方法：

1. **启用缓存**（默认已启用）：
```typescript
manager.updateConfig({
  options: {
    enableCache: true,
    cacheSize: 100  // 或更大
  }
});
```

2. **批量计算**：
```typescript
// ✅ 推荐：批量处理
const results = fourPillarsList.map(fp => 
  analyzer.calculateWuxingStrength(fp)
);

// ❌ 避免：逐个处理
for (const fp of fourPillarsList) {
  const result = await someAsyncProcess(fp);
}
```

3. **减少配置切换**：
```typescript
// ✅ 推荐：分批处理
await manager.loadPreset('ziping');
const zipingResults = list1.map(analyze);

await manager.loadPreset('modern');
const modernResults = list2.map(analyze);

// ❌ 避免：频繁切换
for (const fp of list) {
  await manager.loadPreset('ziping');
  const r1 = analyze(fp);
  await manager.loadPreset('modern');
  const r2 = analyze(fp);
}
```

### Q14: 缓存占用太多内存怎么办？

**A**: 调整缓存大小：

```typescript
// 查看当前配置
const config = manager.getCurrentConfig();
console.log('当前缓存大小:', config.options.cacheSize);

// 减小缓存
manager.updateConfig({
  options: {
    ...config.options,
    cacheSize: 50  // 从100减到50
  }
});

// 或完全禁用（不推荐，会显著降低性能）
manager.updateConfig({
  options: {
    ...config.options,
    enableCache: false
  }
});
```

**内存占用参考**：
- cacheSize: 50 → ~2MB
- cacheSize: 100 → ~5MB  
- cacheSize: 500 → ~20MB

## 🎯 使用技巧

### Q15: 如何对比不同配置的分析结果？

**A**: 并行分析：

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

async function compareConfigs(fourPillars) {
  const manager = BaziConfigManager.getInstance();
  const presets = ['ziping', 'modern', 'traditional'] as const;
  
  const results = [];
  
  for (const preset of presets) {
    await manager.loadPreset(preset);
    const analyzer = new WuxingStrengthAnalyzer();
    const result = analyzer.calculateWuxingStrength(fourPillars);
    results.push({ preset, result });
  }
  
  return results;
}

const comparison = await compareConfigs(fourPillars);
console.table(comparison.map(({ preset, result }) => ({
  配置: preset,
  木: result.wood,
  火: result.fire,
  土: result.earth,
  金: result.metal,
  水: result.water
})));
```

### Q16: 如何持久化用户的配置选择？

**A**: 使用localStorage：

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 保存配置选择
function savePreference(preset: string) {
  localStorage.setItem('bazi-config-preset', preset);
}

// 加载配置选择
async function loadPreference() {
  const saved = localStorage.getItem('bazi-config-preset');
  if (saved) {
    try {
      await manager.loadPreset(saved as any);
    } catch (error) {
      console.warn('配置加载失败，使用默认配置');
      manager.resetToDefault();
    }
  }
}

// 应用启动时
await loadPreference();

// 配置变更时自动保存
manager.subscribe((config) => {
  if (config.school) {
    savePreference(config.school);
  }
});
```

### Q17: 如何导出分析报告？

**A**: 格式化输出：

```typescript
function generateReport(fourPillars, wuxingStrength, dayMasterStrength) {
  return {
    // 基础信息
    fourPillars: {
      年柱: `${fourPillars.year.gan}${fourPillars.year.zhi}`,
      月柱: `${fourPillars.month.gan}${fourPillars.month.zhi}`,
      日柱: `${fourPillars.day.gan}${fourPillars.day.zhi}`,
      时柱: `${fourPillars.hour.gan}${fourPillars.hour.zhi}`,
    },
    
    // 五行力量
    wuxingStrength: {
      木: `${wuxingStrength.wood.toFixed(1)}分`,
      火: `${wuxingStrength.fire.toFixed(1)}分`,
      土: `${wuxingStrength.earth.toFixed(1)}分`,
      金: `${wuxingStrength.metal.toFixed(1)}分`,
      水: `${wuxingStrength.water.toFixed(1)}分`,
    },
    
    // 日主分析
    dayMaster: {
      日主: fourPillars.dayMaster,
      五行: dayMasterStrength.element,
      强弱: dayMasterStrength.strength,
      得分: `${dayMasterStrength.score}分`,
      因素: dayMasterStrength.factors,
    },
    
    // 生成时间
    timestamp: new Date().toISOString(),
  };
}

const report = generateReport(fourPillars, wuxingStrength, dayMasterStrength);

// 导出为JSON
const json = JSON.stringify(report, null, 2);

// 或导出为可读文本
const text = `
八字分析报告
=============

四柱：${report.fourPillars.年柱} ${report.fourPillars.月柱} ${report.fourPillars.日柱} ${report.fourPillars.时柱}

五行力量分布：
木：${report.wuxingStrength.木}
火：${report.wuxingStrength.火}
土：${report.wuxingStrength.土}
金：${report.wuxingStrength.金}
水：${report.wuxingStrength.水}

日主分析：
日干：${report.dayMaster.日主}
五行：${report.dayMaster.五行}
强弱：${report.dayMaster.强弱}
得分：${report.dayMaster.得分}
影响因素：${report.dayMaster.因素.join('、')}

生成时间：${new Date(report.timestamp).toLocaleString('zh-CN')}
`;
```

## 📚 更多资源

### Q18: 在哪里可以找到更多文档？

**A**: 完整文档结构：

- [快速入门](../getting-started/quick-start.md) - 5分钟上手
- [配置系统指南](../guides/configuration.md) - 详细配置说明
- [API参考](../api/analyzer.md) - 完整API文档
- [最佳实践](../best-practices/configuration.md) - 使用建议
- [架构设计](../architecture/overview.md) - 系统架构
- [开发文档](../../bazi-pro-internals/README.md) - 内部文档

### Q19: 如何报告Bug或提出建议？

**A**: 通过以下渠道：

- **GitHub Issues**: https://github.com/litom914295/qiflowai/issues
- **邮件**: support@qiflow.ai
- **文档**: 本文档会持续更新常见问题

提交问题时请包含：
1. 问题描述
2. 重现步骤
3. 期望行为
4. 实际行为
5. 环境信息（Next.js版本、Node版本等）

### Q20: 系统支持哪些功能？

**A**: 当前支持的功能（v1.0.0）：

✅ **已支持**：
- 五行力量精确计算
- 日主强弱分析
- 3种预设配置（子平/现代/传统）
- 自定义配置
- LRU缓存优化
- TypeScript类型支持
- Zod配置验证
- 配置导入导出

⏭️ **计划中**（未来版本）：
- 性能监控集成
- 更多预设配置
- 可视化报告生成
- 批量分析优化

---

**最后更新**: 2025-11-13  
**版本**: 1.0.0  
**反馈**: 如有其他问题，请访问 [GitHub Issues](https://github.com/litom914295/qiflowai/issues)
