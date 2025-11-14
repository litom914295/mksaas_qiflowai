# 配置选择最佳实践

> 如何根据业务需求选择和调整BaZi-Pro配置

## 🎯 选择合适的预设配置

### 三种预设配置对比

| 配置 | 月令系数 | 适用场景 | 优势 | 劣势 |
|-----|---------|---------|------|------|
| **Ziping子平派** | 1.6 | 传统命理研究、权威流派 | 重月令，符合传统理论 | 月令影响过大，可能忽略其他因素 |
| **Modern现代派** | 1.5 | 综合分析、平衡考虑 | 各因素均衡，适应性强 | 可能不够权威，流派特色不明显 |
| **Traditional传统派** | 1.4 | 保守分析、稳健预测 | 削弱月令，综合考量 | 可能低估月令作用 |

### 推荐选择策略

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 1. 传统命理学研究项目
await manager.loadPreset('ziping');
// 特点：重月令，符合《渊海子平》等古籍理论

// 2. 现代综合分析平台
await manager.loadPreset('modern');
// 特点：平衡各因素，适合大众用户

// 3. 保守谨慎的咨询服务
await manager.loadPreset('traditional');
// 特点：削弱月令影响，避免极端判断
```

## ⚙️ 自定义配置调整

### 场景1：增强月令影响力

适用于：强调传统命理理论的项目

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 基于现代派，增强月令
manager.updateConfig({
  rootingCoefficients: {
    year: 1.2,
    month: 1.7,  // 提升到1.7
    day: 1.5,
    hour: 1.1
  }
});
```

### 场景2：平衡化调整

适用于：避免某一因素过于突出

```typescript
// 降低生克系数，减少极端情况
manager.updateConfig({
  interactionCoefficients: {
    generation: 0.12,  // 从15%降到12%
    control: 0.12,
    drainage: 0.08,
    controlled: 0.08
  }
});
```

### 场景3：提高计算精度

适用于：学术研究或精确计算需求

```typescript
manager.updateConfig({
  options: {
    enableCache: true,
    normalizeToHundred: true,
    precision: 4  // 提高到4位小数
  }
});
```

## 📊 配置性能影响

### 缓存配置优化

```typescript
// 高并发场景：增大缓存容量
manager.updateConfig({
  options: {
    enableCache: true,
    cacheSize: 500,  // 默认100，提升到500
    // ...
  }
});

// 内存受限场景：减小缓存或禁用
manager.updateConfig({
  options: {
    enableCache: true,
    cacheSize: 50,  // 减小缓存
    // ...
  }
});

// 极端内存限制：完全禁用缓存
manager.updateConfig({
  options: {
    enableCache: false,
    // ...
  }
});
```

**性能对比**：

| 缓存大小 | 首次计算 | 缓存命中 | 内存占用 | 适用场景 |
|---------|---------|---------|---------|---------|
| 禁用 | 5ms | N/A | ~0MB | 极低内存环境 |
| 50 | 5ms | <1ms | ~2MB | 移动端/内存受限 |
| 100（默认） | 5ms | <1ms | ~5MB | 常规Web应用 |
| 500 | 5ms | <1ms | ~20MB | 高并发服务端 |

## 🔄 配置切换策略

### 动态切换配置

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

const manager = BaziConfigManager.getInstance();

// 用户选择不同流派
async function analyzeWithSchool(fourPillars, school: 'ziping' | 'modern' | 'traditional') {
  // 切换配置
  await manager.loadPreset(school);
  
  // 创建新分析器（使用新配置）
  const analyzer = new WuxingStrengthAnalyzer();
  
  return {
    school,
    result: analyzer.calculateWuxingStrength(fourPillars)
  };
}

// 对比分析
const results = await Promise.all([
  analyzeWithSchool(fourPillars, 'ziping'),
  analyzeWithSchool(fourPillars, 'modern'),
  analyzeWithSchool(fourPillars, 'traditional')
]);
```

### 配置持久化

```typescript
// React/Next.js示例
import { useEffect } from 'react';
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

function useBaziConfig() {
  const manager = BaziConfigManager.getInstance();
  
  useEffect(() => {
    // 启动时加载配置
    const saved = localStorage.getItem('bazi-config-preset');
    if (saved) {
      manager.loadPreset(saved as any).catch(() => {
        manager.resetToDefault();
      });
    }
    
    // 监听配置变更，自动保存
    return manager.subscribe((config) => {
      if (config.school) {
        localStorage.setItem('bazi-config-preset', config.school);
      }
    });
  }, []);
  
  return manager;
}
```

## 🎨 用户界面集成

### 配置选择器组件

```typescript
// React组件示例
import { useState, useEffect } from 'react';
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

export function ConfigSelector() {
  const [current, setCurrent] = useState('modern');
  const manager = BaziConfigManager.getInstance();
  
  useEffect(() => {
    const unsubscribe = manager.subscribe((config) => {
      setCurrent(config.school || 'modern');
    });
    return unsubscribe;
  }, []);
  
  const handleChange = async (preset: string) => {
    try {
      await manager.loadPreset(preset as any);
      // 重新分析（如果需要）
      triggerReAnalysis();
    } catch (error) {
      console.error('配置加载失败:', error);
    }
  };
  
  return (
    <select value={current} onChange={(e) => handleChange(e.target.value)}>
      <option value="ziping">子平派（重月令）</option>
      <option value="modern">现代派（平衡）</option>
      <option value="traditional">传统派（保守）</option>
    </select>
  );
}
```

## 🔍 配置验证和测试

### 配置验证最佳实践

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 导入外部配置前验证
function loadUserConfig(jsonString: string) {
  try {
    const data = JSON.parse(jsonString);
    
    // 1. 验证格式
    const validation = manager.validateConfig(data);
    if (!validation.success) {
      // 显示友好的错误信息
      const errorMessages = validation.errors
        ?.map(e => `${e.path}: ${e.message}`)
        .join('\n');
      
      throw new Error(`配置格式错误:\n${errorMessages}`);
    }
    
    // 2. 应用配置
    manager.setConfig(validation.config!);
    
    // 3. 运行测试
    verifyConfigWorks();
    
    return { success: true };
  } catch (error) {
    console.error('配置加载失败:', error);
    manager.resetToDefault();
    return { success: false, error };
  }
}

// 验证配置是否正常工作
function verifyConfigWorks() {
  const analyzer = new WuxingStrengthAnalyzer();
  const testFourPillars = {
    year: { gan: '甲', zhi: '子' },
    month: { gan: '乙', zhi: '丑' },
    day: { gan: '丙', zhi: '寅' },
    hour: { gan: '丁', zhi: '卯' },
    dayMaster: '丙',
    monthOrder: '丑'
  };
  
  const result = analyzer.calculateWuxingStrength(testFourPillars);
  
  // 验证结果合理性
  const total = result.wood + result.fire + result.earth + 
                result.metal + result.water;
  
  if (Math.abs(total - 100) > 1) {
    throw new Error('配置验证失败：五行总分异常');
  }
}
```

## 📏 配置参数调优指南

### 月令系数调优

**原理**：月令系数决定当月旺相休囚死的强弱程度

```typescript
// 保守派：月令系数 < 1.4
// 建议：谨慎的命理咨询，避免过度依赖月令

// 平衡派：月令系数 1.4-1.6
// 建议：综合分析，各因素权重相近

// 传统派：月令系数 > 1.6
// 建议：遵循古籍理论，强调月令主导地位
```

**调整示例**：
```typescript
// 场景：用户反馈春季木旺判定过强
manager.updateConfig({
  monthlyCoefficients: {
    spring: {
      wood: 1.4,  // 从1.5降到1.4
      fire: 1.2,
      earth: 1.0,
      metal: 0.8,
      water: 1.0
    },
    // ... 其他季节保持不变
  }
});
```

### 通根系数调优

**原理**：通根系数决定天干在地支的根基强弱

```typescript
// 月柱通根最重要（通常1.4-1.6）
// 日柱次之（1.3-1.5）
// 年柱和时柱较弱（1.1-1.3）

// 场景：强化日主分析的稳定性
manager.updateConfig({
  rootingCoefficients: {
    year: 1.2,
    month: 1.5,
    day: 1.6,   // 提升日柱通根重要性
    hour: 1.2
  }
});
```

## 💡 常见配置错误

### ❌ 错误1：频繁切换配置

```typescript
// ❌ 不推荐：每次计算都切换配置
for (const fp of fourPillarsList) {
  await manager.loadPreset('ziping');
  const result1 = analyze(fp);
  
  await manager.loadPreset('modern');
  const result2 = analyze(fp);
}

// ✅ 推荐：批量处理同一配置
await manager.loadPreset('ziping');
const results1 = fourPillarsList.map(fp => analyze(fp));

await manager.loadPreset('modern');
const results2 = fourPillarsList.map(fp => analyze(fp));
```

### ❌ 错误2：配置参数超出合理范围

```typescript
// ❌ 不推荐：月令系数过高
manager.updateConfig({
  monthlyCoefficients: {
    spring: {
      wood: 3.0,  // 过高！合理范围 0.7-1.8
      // ...
    }
  }
});

// ✅ 推荐：保持在合理范围
manager.updateConfig({
  monthlyCoefficients: {
    spring: {
      wood: 1.6,  // 合理范围内
      // ...
    }
  }
});
```

### ❌ 错误3：忽略配置验证

```typescript
// ❌ 不推荐：直接设置未验证的配置
manager.setConfig(userConfig);  // 可能抛出错误

// ✅ 推荐：先验证再设置
const validation = manager.validateConfig(userConfig);
if (validation.success) {
  manager.setConfig(validation.config!);
} else {
  console.error('配置无效', validation.errors);
  manager.resetToDefault();
}
```

## 📚 相关文档

- [配置系统指南](../guides/configuration.md) - 详细的配置说明
- [BaziConfigManager API](../api/config-manager.md) - 配置管理器API
- [性能优化](./performance.md) - 性能调优建议
- [FAQ](../troubleshooting/faq.md) - 常见问题解答

---

**最后更新**: 2025-11-13  
**版本**: 1.0.0
