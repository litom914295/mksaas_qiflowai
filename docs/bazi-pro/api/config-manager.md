# BaziConfigManager API 参考

> 配置管理器 - 管理八字分析系统的配置加载、验证、切换和持久化

## 📦 导入

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';
import type { BaziConfig, PresetConfigName } from '@/lib/bazi-pro/config/types';

// 或使用便捷函数
import { getCurrentConfig, loadPreset, validateConfig } from '@/lib/bazi-pro/config';
```

## 🏗️ 获取实例

BaziConfigManager使用**单例模式**，确保全局只有一个配置管理器实例。

```typescript
const manager = BaziConfigManager.getInstance();
```

## 📊 公共方法

### `getCurrentConfig(): BaziConfig`

获取当前激活的配置对象（深拷贝）。

**返回值**: `BaziConfig` - 当前配置对象的副本

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();
const config = manager.getCurrentConfig();

console.log(config.name);              // "Modern (Default)"
console.log(config.school);            // "modern"
console.log(config.wuxingWeights);     // { stemBase: 10, ... }
```

### `setConfig(config: BaziConfig): void`

设置新的配置对象。配置会经过Zod验证，验证失败会抛出错误。

**参数**:
- `config` (`BaziConfig`) - 要设置的配置对象

**抛出**:
- `Error` - 配置验证失败时

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

const customConfig: BaziConfig = {
  version: '1.0.0',
  name: 'Custom Config',
  description: '自定义配置',
  school: 'custom',
  wuxingWeights: {
    stemBase: 12,
    branchMainQi: 9,
    branchMiddleQi: 6,
    branchResidualQi: 3
  },
  // ... 其他必需字段
};

try {
  manager.setConfig(customConfig);
  console.log('配置设置成功');
} catch (error) {
  console.error('配置设置失败:', error.message);
}
```

### `updateConfig(updates: Partial<BaziConfig>): void`

更新当前配置的部分字段。

**参数**:
- `updates` (`Partial<BaziConfig>`) - 要更新的配置字段

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

// 只更新月令系数
manager.updateConfig({
  monthlyCoefficients: {
    spring: { wood: 1.6, fire: 1.2, earth: 1.0, metal: 0.8, water: 1.0 },
    // ... 其他季节
  }
});
```

### `loadPreset(preset: PresetConfigName): Promise<void>`

加载预设配置。支持3种预设：`ziping`、`modern`、`traditional`。

**参数**:
- `preset` (`PresetConfigName`) - 预设配置名称
  - `'ziping'` - 子平派（重月令，系数1.6）
  - `'modern'` - 现代派（平衡，系数1.5）
  - `'traditional'` - 传统派（保守，系数1.4）

**返回值**: `Promise<void>`

**抛出**:
- `Error` - 预设不存在或加载失败时

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

// 异步加载预设配置
try {
  await manager.loadPreset('ziping');
  console.log('子平派配置已加载');
  
  await manager.loadPreset('modern');
  console.log('现代派配置已加载');
  
} catch (error) {
  console.error('预设加载失败:', error.message);
}
```

### `validateConfig(config: unknown): ConfigValidationResult`

验证配置对象是否符合规范。

**参数**:
- `config` (`unknown`) - 待验证的配置对象

**返回值**: `ConfigValidationResult`
```typescript
{
  success: boolean;
  config?: BaziConfig;     // 验证成功时包含
  errors?: Array<{         // 验证失败时包含
    path: string;
    message: string;
  }>;
}
```

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

const maybeConfig = {
  name: 'Test Config',
  version: '1.0.0',
  // ... 可能不完整的配置
};

const result = manager.validateConfig(maybeConfig);

if (result.success) {
  console.log('配置有效', result.config);
} else {
  console.error('配置无效:');
  result.errors?.forEach(err => {
    console.error(`  ${err.path}: ${err.message}`);
  });
}
```

### `loadFromJSON(json: string): void`

从JSON字符串加载配置。

**参数**:
- `json` (`string`) - JSON格式的配置字符串

**抛出**:
- `Error` - JSON解析失败或配置无效时

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

const jsonConfig = `{
  "version": "1.0.0",
  "name": "Imported Config",
  "description": "从JSON导入的配置",
  ...
}`;

try {
  manager.loadFromJSON(jsonConfig);
  console.log('配置导入成功');
} catch (error) {
  console.error('配置导入失败:', error.message);
}
```

### `exportToJSON(pretty = true): string`

导出当前配置为JSON字符串。

**参数**:
- `pretty` (`boolean`, 默认`true`) - 是否格式化JSON（2空格缩进）

**返回值**: `string` - JSON格式的配置字符串

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

// 格式化导出（便于阅读）
const prettyJson = manager.exportToJSON(true);
console.log(prettyJson);

// 紧凑导出（节省空间）
const compactJson = manager.exportToJSON(false);

// 保存到文件
import fs from 'fs';
fs.writeFileSync('config-backup.json', prettyJson);
```

### `resetToDefault(): void`

重置为默认配置（Modern派）。

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

// 恢复默认配置
manager.resetToDefault();
console.log('已重置为默认配置');
```

### `subscribe(listener: (config: BaziConfig) => void): () => void`

订阅配置变更事件。

**参数**:
- `listener` (`(config: BaziConfig) => void`) - 配置变更回调函数

**返回值**: `() => void` - 取消订阅函数

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

// 订阅配置变更
const unsubscribe = manager.subscribe((newConfig) => {
  console.log('配置已更新:', newConfig.name);
  console.log('月令系数:', newConfig.monthlyCoefficients);
});

// 配置变更会触发回调
await manager.loadPreset('ziping');  // 触发: "配置已更新: 子平派"
await manager.loadPreset('modern');  // 触发: "配置已更新: 现代派"

// 取消订阅
unsubscribe();
```

### `getConfigSummary(): object`

获取配置摘要信息。

**返回值**:
```typescript
{
  name: string;
  school?: string;
  version: string;
  lastUpdated: string;
}
```

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();
const summary = manager.getConfigSummary();

console.log(summary);
// {
//   name: "Modern (Default)",
//   school: "modern",
//   version: "1.0.0",
//   lastUpdated: "2025-11-13T10:30:00.000Z"
// }
```

### `compareConfigs(config1: BaziConfig, config2: BaziConfig): object`

对比两个配置的差异。

**参数**:
- `config1` (`BaziConfig`) - 第一个配置
- `config2` (`BaziConfig`) - 第二个配置

**返回值**:
```typescript
{
  identical: boolean;
  differences: string[];  // 不同的字段路径
}
```

**示例**:
```typescript
const manager = BaziConfigManager.getInstance();

// 加载两个不同的配置
await manager.loadPreset('ziping');
const config1 = manager.getCurrentConfig();

await manager.loadPreset('modern');
const config2 = manager.getCurrentConfig();

// 对比差异
const comparison = manager.compareConfigs(config1, config2);

console.log('配置相同:', comparison.identical);  // false
console.log('差异字段:', comparison.differences);
// ['monthlyCoefficients', 'interactionCoefficients']
```

## 🎯 使用场景

### 场景1：预设配置切换

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

const manager = BaziConfigManager.getInstance();

// 1. 加载子平派配置
await manager.loadPreset('ziping');
const analyzer1 = new WuxingStrengthAnalyzer();
const result1 = analyzer1.calculateWuxingStrength(fourPillars);
console.log('子平派结果:', result1);

// 2. 切换到现代派配置
await manager.loadPreset('modern');
const analyzer2 = new WuxingStrengthAnalyzer();
const result2 = analyzer2.calculateWuxingStrength(fourPillars);
console.log('现代派结果:', result2);
```

### 场景2：自定义配置

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 获取当前配置
const currentConfig = manager.getCurrentConfig();

// 微调月令系数
manager.updateConfig({
  monthlyCoefficients: {
    ...currentConfig.monthlyCoefficients,
    spring: {
      wood: 1.7,  // 强化春季木的力量
      fire: 1.3,
      earth: 1.0,
      metal: 0.7,
      water: 1.0
    }
  }
});

console.log('已应用自定义月令系数');
```

### 场景3：配置导入导出

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';
import fs from 'fs';

const manager = BaziConfigManager.getInstance();

// 导出当前配置
const exportedConfig = manager.exportToJSON();
fs.writeFileSync('my-config.json', exportedConfig);
console.log('配置已导出到 my-config.json');

// 稍后导入配置
const importedConfig = fs.readFileSync('my-config.json', 'utf-8');
manager.loadFromJSON(importedConfig);
console.log('配置已导入');
```

### 场景4：配置变更监听

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 监听配置变更，更新UI
const unsubscribe = manager.subscribe((config) => {
  updateUI({
    configName: config.name,
    school: config.school,
    monthlyCoefficient: config.monthlyCoefficients.spring.wood
  });
});

// 组件卸载时取消订阅
// cleanup: unsubscribe();
```

## 🔄 配置预设对比

| 特性 | Ziping子平派 | Modern现代派 | Traditional传统派 |
|-----|------------|------------|-----------------|
| **月令系数** | 1.6（重月令） | 1.5（平衡） | 1.4（保守） |
| **通根系数** | 月柱1.6 | 月柱1.5 | 月柱1.4 |
| **生扶系数** | 15% | 15% | 12% |
| **适用场景** | 传统命理学派 | 综合平衡分析 | 保守谨慎分析 |
| **特点** | 强调月令作用 | 各因素均衡 | 削弱月令影响 |

## 💾 配置持久化

### 本地存储示例

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 保存配置到 localStorage
function saveConfig() {
  const config = manager.exportToJSON();
  localStorage.setItem('bazi-config', config);
}

// 从 localStorage 加载配置
function loadConfig() {
  const saved = localStorage.getItem('bazi-config');
  if (saved) {
    try {
      manager.loadFromJSON(saved);
      console.log('配置已从本地存储恢复');
    } catch (error) {
      console.error('配置加载失败，使用默认配置');
      manager.resetToDefault();
    }
  }
}

// 应用启动时加载
loadConfig();

// 配置变更时自动保存
manager.subscribe((config) => {
  saveConfig();
});
```

## 🐛 错误处理

```typescript
import { BaziConfigManager } from '@/lib/bazi-pro/config/manager';

const manager = BaziConfigManager.getInstance();

// 加载预设配置
try {
  await manager.loadPreset('ziping');
} catch (error) {
  console.error('预设加载失败:', error.message);
  manager.resetToDefault();
}

// 设置自定义配置
try {
  manager.setConfig(customConfig);
} catch (error) {
  if (error.message.includes('Invalid configuration')) {
    console.error('配置验证失败，请检查配置格式');
    // 显示具体错误
    const validation = manager.validateConfig(customConfig);
    validation.errors?.forEach(err => {
      console.error(`${err.path}: ${err.message}`);
    });
  }
}

// 导入JSON配置
try {
  manager.loadFromJSON(jsonString);
} catch (error) {
  if (error.message.includes('parse')) {
    console.error('JSON格式错误');
  } else {
    console.error('配置数据无效');
  }
}
```

## 📚 相关文档

- [配置系统指南](../guides/configuration.md) - 详细的配置说明
- [WuxingStrengthAnalyzer API](./analyzer.md) - 分析器API
- [类型定义](./types.md) - 完整的TypeScript类型
- [最佳实践](../best-practices/configuration.md) - 配置选择建议

## 💡 注意事项

1. **单例模式**: 始终通过`getInstance()`获取实例，不要尝试`new BaziConfigManager()`
2. **异步加载**: `loadPreset()`是异步方法，记得使用`await`或`.then()`
3. **配置验证**: 所有配置变更都会经过Zod验证，确保类型安全
4. **深拷贝**: `getCurrentConfig()`返回配置的深拷贝，修改不会影响原配置
5. **订阅清理**: 组件卸载时记得调用取消订阅函数，避免内存泄漏

## 🔧 便捷函数

```typescript
import { getCurrentConfig, loadPreset, validateConfig } from '@/lib/bazi-pro/config';

// 等价于 BaziConfigManager.getInstance().getCurrentConfig()
const config = getCurrentConfig();

// 等价于 BaziConfigManager.getInstance().loadPreset('modern')
await loadPreset('modern');

// 等价于 BaziConfigManager.getInstance().validateConfig(data)
const result = validateConfig(data);
```

---

**最后更新**: 2025-11-13  
**版本**: 1.0.0
