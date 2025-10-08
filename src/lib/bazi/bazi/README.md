# QiFlow AI - 八字计算系统

## 📚 概述

QiFlow AI 的八字计算系统集成了传统算法和现代增强算法，提供高精度、专业级的八字命理分析服务。

## 🏗️ 架构设计

### 核心组件

```
八字计算系统
├── 📁 index.ts          # 主入口文件
├── 📁 enhanced-calculator.ts  # 增强型计算引擎
├── 📁 adapter.ts        # 计算适配器
├── 📁 luck-pillars.ts   # 大运分析
├── 📁 timezone.ts       # 时区处理
├── 📁 cache.ts          # 缓存系统
└── 📁 __tests__/        # 测试文件
```

### 计算模式

1. **legacy** - 传统算法（向后兼容）
2. **enhanced** - 增强算法（推荐）
3. **hybrid** - 混合模式（智能选择）

## 🚀 快速开始

### 基本使用

```typescript
import { computeBaziSmart, createBaziCalculator } from '@/lib/bazi';

// 智能计算（使用增强型算法）
const result = await computeBaziSmart({
  datetime: '1990-05-10T12:30:00',
  gender: 'male',
  timezone: 'Asia/Shanghai',
  isTimeKnown: true,
});

// 创建计算器实例
const calculator = createBaziCalculator({
  datetime: '1990-05-10T12:30:00',
  gender: 'male',
  timezone: 'Asia/Shanghai',
  isTimeKnown: true,
});

// 获取完整分析
const analysis = await calculator.getCompleteAnalysis();
```

### 增强功能使用

```typescript
// 创建增强型计算器
const calculator = createBaziCalculator({
  datetime: '1990-05-10T12:30:00',
  gender: 'male',
  timezone: 'Asia/Shanghai',
  isTimeKnown: true,
  preferredLocale: 'zh-CN',
});

// 大运分析
const luckPillars = await calculator.getLuckPillarsAnalysis();
const currentLuck = await calculator.getCurrentLuckPillar();

// 每日运势
const today = new Date();
const dailyFortune = await calculator.getDailyAnalysis(today, 'personalized');
```

## 📖 详细文档

### 数据格式

#### 出生数据 (BirthData)

```typescript
interface BirthData {
  datetime: string; // ISO格式日期时间
  gender: 'male' | 'female';
  timezone?: string; // IANA时区标识符
  isTimeKnown?: boolean; // 是否知道确切时间
  preferredLocale?: string; // 偏好语言
}
```

#### 分析结果 (BaziResult)

```typescript
interface EnhancedBaziResult {
  pillars: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData | null;
  };
  fiveElements: FiveElementsResult;
  dayMaster: DayMasterAnalysis;
  lifeGua: number;
  favorableElements: string[];
  unfavorableElements: string[];

  // 增强功能
  luckPillars?: LuckPillarResult[];
  dailyAnalysis?: DailyAnalysisResult;
  tenGodsAnalysis?: TenGodsAnalysisResult;
  interactions?: BaziInteraction[];
  dayMasterStrength?: DayMasterStrengthResult;
  favorableElements?: FavorableElementsResult;
}
```

### 高级功能

#### 大运分析

```typescript
import { analyzeLuckPillars } from '@/lib/bazi/luck-pillars';

// 分析所有大运
const allLuckPillars = await analyzeLuckPillars(birthData);

// 当前大运
const currentLuck = await calculator.getCurrentLuckPillar();
```

#### 每日运势

```typescript
import { analyzeDailyFortune } from '@/lib/bazi/luck-pillars';

// 今日运势分析
const todayFortune = await analyzeDailyFortune(birthData, new Date());
```

#### 时区处理

```typescript
import {
  createTimezoneAwareDate,
  getRecommendedTimezone,
} from '@/lib/bazi/timezone';

// 创建时区感知日期
const tzDate = createTimezoneAwareDate('1990-05-10T12:30:00', 'Asia/Shanghai');

// 获取推荐时区
const recommendedTz = getRecommendedTimezone({
  latitude: 39.9042,
  longitude: 116.4074,
});
```

#### 缓存管理

```typescript
import { baziCache, performanceMonitor } from '@/lib/bazi/cache';

// 缓存操作
baziCache.set(birthData, result, 30 * 60 * 1000); // 30分钟TTL
const cached = baziCache.get(birthData);

// 性能监控
performanceMonitor.start('calculation');
const result = await computeBaziSmart(birthData);
performanceMonitor.end('calculation');

// 获取性能报告
const report = performanceMonitor.report();
```

## ⚙️ 配置选项

### 系统配置

```typescript
import { configureBaziSystem } from '@/lib/bazi';

// 配置计算系统
configureBaziSystem({
  mode: 'enhanced', // 计算模式
  enableCache: true, // 启用缓存
  enableMetrics: true, // 启用性能监控
});
```

### 适配器配置

```typescript
import { getBaziAdapter } from '@/lib/bazi';

const adapter = getBaziAdapter();
adapter.updateConfig({
  mode: 'enhanced',
  enableMetrics: true,
});
```

## 🔍 健康检查

```typescript
import { checkBaziSystemHealth } from '@/lib/bazi';

const health = await checkBaziSystemHealth();
console.log('系统状态:', health.status);
console.log('性能指标:', health.metrics);
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test src/lib/bazi/__tests__/

# 运行特定测试
npm test src/lib/bazi/__tests__/enhanced-calculator.test.ts

# 运行集成测试
npm run test:integration
```

### 性能基准测试

```typescript
import { performanceMonitor } from '@/lib/bazi/cache';

// 开始性能监控
performanceMonitor.start('benchmark');

// 执行大量计算
for (let i = 0; i < 1000; i++) {
  await computeBaziSmart(testData);
}

performanceMonitor.end('benchmark');

// 生成报告
const report = performanceMonitor.report();
console.log('性能报告:', report);
```

## 🚨 错误处理

### 常见错误

1. **时区错误**

   ```typescript
   try {
     const result = await computeBaziSmart(birthData);
   } catch (error) {
     if (error.message.includes('timezone')) {
       console.log('请检查时区设置');
     }
   }
   ```

2. **日期格式错误**

   ```typescript
   try {
     const calculator = createBaziCalculator(birthData);
   } catch (error) {
     if (error.message.includes('Invalid date')) {
       console.log('请检查日期格式');
     }
   }
   ```

3. **缓存错误**
   ```typescript
   try {
     baziCache.set(birthData, result);
   } catch (error) {
     console.log('缓存失败，使用内存缓存');
   }
   ```

## 📊 性能优化

### 缓存策略

- **LRU缓存**: 自动清理最少使用的条目
- **TTL过期**: 支持时间过期机制
- **大小限制**: 防止内存溢出

### 性能监控

- **操作计时**: 记录每个操作的耗时
- **统计信息**: 提供平均值、最小值、最大值
- **报告生成**: 生成详细的性能报告

## 🔧 维护指南

### 更新依赖

```bash
# 更新八字计算库
npm update @aharris02/bazi-calculator-by-alvamind

# 更新时区处理库
npm update date-fns-tz
```

### 清理缓存

```typescript
import { baziCache } from '@/lib/bazi/cache';

// 清理所有缓存
baziCache.clear();

// 清理特定缓存
globalBaziCache.clearBirthDataCache(birthData);
```

### 监控系统

```typescript
// 定期检查系统健康
setInterval(
  async () => {
    const health = await checkBaziSystemHealth();
    if (health.status !== 'healthy') {
      console.warn('八字计算系统异常:', health);
    }
  },
  5 * 60 * 1000
); // 每5分钟检查一次
```

## 📈 扩展指南

### 添加新功能

1. 在 `enhanced-calculator.ts` 中实现核心逻辑
2. 在 `adapter.ts` 中添加适配逻辑
3. 在 `luck-pillars.ts` 中添加高级分析
4. 添加相应的测试用例
5. 更新文档

### 自定义缓存策略

```typescript
import { LRUCache } from '@/lib/bazi/cache';

// 创建自定义缓存
const customCache = new LRUCache(200 * 1024 * 1024, 5000); // 200MB, 5000条目
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 添加测试用例
4. 确保所有测试通过
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 🆘 故障排除

### 常见问题

1. **计算结果不准确**
   - 检查时区设置是否正确
   - 验证出生时间格式
   - 确认日期范围（1900-2100）

2. **性能问题**
   - 检查缓存配置
   - 查看性能监控报告
   - 考虑增加内存限制

3. **时区错误**
   - 使用 IANA 时区标识符
   - 检查时区库版本
   - 验证日期字符串格式

### 获取帮助

- 📧 邮箱: support@qiflow.ai
- 📖 文档: [完整文档](./docs/)
- 🐛 问题: [GitHub Issues](https://github.com/your-repo/issues)

---

## 🎯 最佳实践

1. **使用增强模式**: 系统默认使用增强模式，提供最佳性能
2. **启用缓存**: 提高重复计算的性能
3. **监控性能**: 定期检查性能指标和健康状态
4. **错误处理**: 始终使用 try-catch 包装计算调用
5. **时区一致性**: 在整个应用中使用相同的时区处理方式

通过这个增强的八字计算系统，您可以获得专业级的命理分析能力，同时享受现代化的开发体验和优秀的性能表现。
