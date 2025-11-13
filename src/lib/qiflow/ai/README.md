# 人宅合一AI分析模块

## 📋 概述

本模块是整个八字风水报告系统的**核心差异化功能**，实现了用户八字命理与住宅风水的深度综合分析。

**核心价值**：
- 🎯 发现"超级吉位"（喜用神五行 ∩ 飞星吉星）
- ⚠️ 识别"风险区域"（忌神五行 ∩ 飞星凶星）
- 💡 生成可执行的布局建议（AI驱动）

**成本控制**：每次分析 < $0.30

---

## 🚀 快速开始

### 基本用法

```typescript
import { generateSynthesisAnalysis } from '@/lib/qiflow/ai/synthesis-prompt';
import type { EnhancedBaziResult } from '@/lib/bazi/adapter';
import type { FengshuiData } from '@/lib/qiflow/ai/synthesis-prompt';

// 准备八字数据
const baziData: EnhancedBaziResult = {
  // ... 从 computeBaziSmart() 获取
};

// 准备风水数据
const fengshuiData: FengshuiData = {
  mountain: '子', // 坐山
  facing: '午',   // 朝向
  period: 9,      // 运数
  flyingStars: [
    { palace: 1, mountainStar: 9, facingStar: 5, periodStar: 1 },
    // ... 其他宫位
  ],
};

// 生成分析
const result = await generateSynthesisAnalysis({
  baziData,
  fengshuiData,
  config: {
    year: 2025,
    language: 'zh-CN',
  },
});

// 使用结果
console.log(`发现 ${result.superLuckySpots.length} 个超级吉位`);
console.log(`识别 ${result.riskZones.length} 个风险区域`);
console.log(`生成 ${result.layoutAdvice.length} 条布局建议`);
console.log(`分析成本: $${result.metadata.estimatedCost.toFixed(4)}`);
```

### 集成到精华报告

```typescript
import { generateEssentialReport } from '@/lib/qiflow/reports/essential-report';

const report = await generateEssentialReport({
  birthInfo: {
    year: 1990,
    month: 3,
    day: 15,
    hour: 14,
    // ...
  },
  
  // 添加风水数据以启用人宅合一分析
  fengshuiData: {
    mountain: '子',
    facing: '午',
    buildYear: 2015,
  },
});

// 报告中会包含 synthesis 字段
if (report.synthesis) {
  console.log('人宅合一分析已生成！');
}
```

---

## 🧪 测试

### 运行所有测试

```bash
# 使用 vitest
pnpm test src/lib/qiflow/ai/__tests__/synthesis-prompt.test.ts

# 或使用 npm
npm test src/lib/qiflow/ai/__tests__/synthesis-prompt.test.ts
```

### 测试覆盖范围

测试文件包含 **8 个测试组**，**16+ 个测试用例**：

1. ✅ **完整分析流程测试** - 验证端到端生成
2. ✅ **超级吉位发现测试** - 验证算法准确性
3. ✅ **风险区域识别测试** - 验证冲突检测
4. ✅ **布局建议生成测试** - 验证AI输出质量
5. ✅ **成本控制测试** - 验证 < $0.30 目标
6. ✅ **质量评分测试** - 验证评分在 60-100 范围
7. ✅ **降级容错测试** - 验证数据缺失时的处理
8. ✅ **输出格式测试** - 验证摘要和结构化输出

### 测试数据

测试使用真实的九运子山午向飞星盘：

```typescript
// 日主为木，强旺，喜火金泄耗，忌水木生扶
const mockBaziData = {
  dayMaster: { element: '木', strength: 'strong' },
  yongshen: {
    primary: '火',
    secondary: '金',
    avoid: ['水', '木'],
  },
};

// 九运子山午向飞星盘
const mockFengshuiData = {
  period: 9,
  flyingStars: [
    { palace: 5, facingStar: 9 }, // 中宫九紫火星（吉星）
    { palace: 8, facingStar: 8 }, // 东北八白财星（吉星）
    { palace: 1, facingStar: 5 }, // 北方五黄凶星
    // ...
  ],
};
```

**预期结果**：
- 应识别出宫位 5（中宫）为超级吉位（九紫火星 + 喜用神火）
- 应识别出宫位 1（北方）为风险区域（五黄凶星）

---

## 📊 输出数据结构

### SynthesisOutput

```typescript
interface SynthesisOutput {
  // 超级吉位（1-3个）
  superLuckySpots: LuckySpot[];
  
  // 风险区域（0-2个）
  riskZones: RiskZone[];
  
  // 布局建议（3-5条）
  layoutAdvice: LayoutAdvice[];
  
  // 分析摘要
  summary: string;
  
  // 元数据
  metadata: {
    generatedAt: Date;
    estimatedCost: number;  // 实际成本（美元）
    qualityScore: number;   // 质量分 0-100
  };
}
```

### LuckySpot（超级吉位）

```typescript
interface LuckySpot {
  location: string;  // 如 "客厅正东"
  palace: number;    // 九宫格宫位 1-9
  
  energyAnalysis: {
    baziElement: string;        // 八字喜用神
    fengshuiStar: number;       // 飞星吉星编号
    resonanceType: string;      // 共振类型
    resonanceStrength: number;  // 共振强度 1-10
  };
  
  utilizationAdvice: string[];  // 具体利用建议
  
  expectedEffects: {
    aspects: string[];   // 影响方面 如 ['财运', '事业']
    timeline: string;    // 时间周期 如 '30-60日内'
  };
}
```

### RiskZone（风险区域）

```typescript
interface RiskZone {
  location: string;
  palace: number;
  
  conflictAnalysis: {
    baziTaboo: string;          // 八字忌神
    fengshuiNegativity: string; // 风水凶星
    conflictType: string;       // 冲突类型
    severity: 'low' | 'medium' | 'high';
  };
  
  potentialImpacts: {
    aspects: string[];   // 可能影响的方面
    timeframe: string;   // 重点时间段
  };
  
  resolutionMethods: ResolutionMethod[];  // 化解方案（按优先级排序）
}
```

### LayoutAdvice（布局建议）

```typescript
interface LayoutAdvice {
  id: number;
  title: string;          // 如 "催旺财运布局"
  priority: number;       // 执行优先级
  difficulty: '⭐' | '⭐⭐' | '⭐⭐⭐';
  
  targetArea: {
    location: string;     // 执行区域
    reason: string;       // 选择原因
  };
  
  actions: string[];      // 具体行动步骤
  principle: string;      // 五行原理说明
  
  expectedResults: {
    effects: string[];    // 预期效果
    timeline: string;     // 生效时间
  };
  
  investment: {
    cost: string;         // 投入成本
    timeRequired: string; // 所需时间
  };
}
```

---

## 🔧 核心算法

### 1. 超级吉位发现算法

```
FOR 每个九宫位置:
  提取该位置的向星（facingStar）
  获取向星的五行属性（飞星五行映射表）
  
  IF 向星是吉星（1/8/9）AND 向星五行 ∈ 用户喜用神:
    标记为"超级吉位" ✨
    计算共振强度 = 9
  
  ELSE IF 仅向星是吉星:
    标记为"次优吉位" 🌟
    计算共振强度 = 6

返回前 3 个最强吉位
```

### 2. 风险区域识别算法

```
FOR 每个九宫位置:
  提取该位置的向星（facingStar）
  获取向星的五行属性
  
  IF 向星是凶星（2/5/3/7）AND 向星五行 ∈ 用户忌神:
    标记为"风险区域" ⚠️
    
    IF 向星 == 5（五黄）:
      严重程度 = high
    ELSE IF 向星 == 2（二黑）:
      严重程度 = high
    ELSE:
      严重程度 = medium
    
    生成化解方案（五行泄法 > 减少停留）

返回前 2 个最严重风险区域
```

### 3. 布局建议生成（AI）

```
输入:
  - 用户八字（日主、喜用神、忌神）
  - 住宅风水（坐向、运数、飞星盘）
  - 已发现的超级吉位
  - 已识别的风险区域

AI Prompt 模板:
  """
  你是专业的八字风水综合分析师。
  
  基于以下数据，生成 3-5 条具体可执行的布局建议：
  
  [八字信息]
  - 日主: {{dayMaster}}
  - 喜用神: {{favorableElements}}
  - 忌神: {{tabooElements}}
  
  [风水信息]
  - 坐向: 坐{{mountain}}朝{{facing}}
  - 运数: {{period}}运
  
  [超级吉位]
  {{luckySpots}}
  
  [风险区域]
  {{riskZones}}
  
  要求:
  1. 按优先级排序
  2. 每条建议包含：标题、目标区域、具体行动、五行原理、预期效果
  3. 标注难度等级（⭐/⭐⭐/⭐⭐⭐）
  4. 语气积极、建设性
  
  [合规约束]
  - 禁用: "必定"、"注定"、"灾难"等
  - 使用: "可能"、"建议"、"有机会"等
  """

输出: JSON 格式的 LayoutAdvice[]

降级方案:
  如果 AI 调用失败或不合规，使用模板化建议
```

---

## 💡 最佳实践

### 1. 数据准备

✅ **推荐**：使用完整的八字数据（包含用神系统）

```typescript
const baziData = await computeBaziSmart({
  year: 1990,
  month: 3,
  day: 15,
  hour: 14,
  // ...
});
```

⚠️ **可选**：如果缺少用神数据，系统会自动推断

```typescript
// 系统会根据日主强弱自动推断喜忌神
if (dayMaster.strength === 'strong') {
  // 日主强 → 喜泄耗
}
```

### 2. 成本优化

- ✅ 使用 `deepseek-chat` 模型（性价比最高）
- ✅ 限制 AI token 输出（maxTokens: 1500）
- ✅ 优先使用算法（超级吉位、风险区域识别）
- ✅ 仅布局建议部分使用 AI

**成本分解**：
- 超级吉位发现: $0（纯算法）
- 风险区域识别: $0（纯算法）
- 布局建议生成: ~$0.20（AI）
- **总计**: ~$0.20 < $0.30 ✅

### 3. 错误处理

```typescript
try {
  const result = await generateSynthesisAnalysis(input);
  // 使用结果
} catch (error) {
  console.error('人宅合一分析失败:', error);
  
  // 降级方案：使用基础分析
  // 不要阻断整个报告生成流程
}
```

### 4. 质量验证

```typescript
const result = await generateSynthesisAnalysis(input);

// 检查质量分
if (result.metadata.qualityScore < 70) {
  console.warn('分析质量较低，考虑重新生成');
}

// 检查成本
if (result.metadata.estimatedCost > 0.30) {
  console.warn('成本超标！');
}
```

---

## 🔍 调试与监控

### 日志输出

模块会输出详细的日志：

```
[Synthesis] 开始人宅合一AI分析...
[Synthesis] 分析完成，耗时: 2345ms, 成本: $0.1856, 质量分: 87
```

### 关键指标

监控以下指标以确保质量：

| 指标 | 目标值 | 监控方式 |
|------|--------|----------|
| 成本 | < $0.30 | `result.metadata.estimatedCost` |
| 质量分 | 60-100 | `result.metadata.qualityScore` |
| 响应时间 | < 5秒 | `result.metadata.generatedAt` |
| 超级吉位数 | 1-3个 | `result.superLuckySpots.length` |
| 布局建议数 | 3-5条 | `result.layoutAdvice.length` |

---

## 📚 相关文档

- [报告模板规范](../../../@REPORT_TEMPLATE_QIFLOW_v1.0_FINAL.md)
- [进度跟踪](../../../@BAZI_FENGSHUI_REPORT_PROGRESS.md)
- [精华报告生成器](../reports/essential-report.ts)
- [八字算法](../../bazi/index.ts)
- [飞星算法](../../fengshui/flying-star.ts)

---

## 🤝 贡献指南

如果你想改进此模块，请：

1. 阅读现有代码和测试
2. 确保所有测试通过
3. 添加新的测试用例
4. 保持成本 < $0.30
5. 更新文档

---

## 📝 更新日志

### v1.0.0 (2025-01-13)

- ✅ 初始版本发布
- ✅ 实现超级吉位发现算法
- ✅ 实现风险区域识别算法
- ✅ 实现AI驱动的布局建议生成
- ✅ 成本控制 < $0.30
- ✅ 合规检查集成
- ✅ 完整测试覆盖（16+ 测试用例）
- ✅ 集成到精华报告生成器

---

## ❓ 常见问题

### Q1: 为什么有时候找不到超级吉位？

**A**: 超级吉位需要同时满足两个条件：
1. 该宫位的向星是吉星（1/8/9）
2. 该吉星的五行属性属于用户的喜用神

如果这两个条件无法同时满足，系统会降级寻找"次优吉位"（只满足条件1）。

### Q2: 成本为什么会变化？

**A**: 成本主要来自AI生成布局建议部分。如果AI返回的文本较长，成本会略高。但我们设置了 `maxTokens: 1500` 限制，确保不会超过 $0.30。

### Q3: 如何提高分析质量？

**A**: 提供更完整的数据：
- ✅ 使用真实太阳时修正过的八字
- ✅ 包含完整的用神系统（primary, secondary, avoid）
- ✅ 提供准确的飞星盘数据（9个宫位完整）

### Q4: 降级方案什么时候触发？

**A**: 以下情况会触发降级：
- 缺少用神数据 → 自动推断喜忌神
- 缺少飞星数据 → 使用通用建议
- AI调用失败 → 使用模板化建议
- AI输出不合规 → 使用降级方案

---

**作者**: QiFlow AI Team  
**最后更新**: 2025-01-13
