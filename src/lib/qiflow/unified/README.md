# 🌟 统一风水分析系统

## 📋 概述

统一风水分析系统（Unified Fengshui System）整合了两套成熟的风水分析系统：

1. **xuankong系统** - 专业的玄空飞星算法引擎
2. **fengshui系统** - 智能评分和预警系统

通过智能桥接层，两套系统完美协作，提供**最专业、最实用、最智能**的风水分析服务。

---

## 🎯 核心优势

### ✅ 保留了原系统的所有优势

| 系统 | 核心功能 | 状态 |
|------|---------|------|
| **xuankong** | 玄空飞星排盘 | ✅ 完整保留 |
| **xuankong** | 格局分析（旺山旺水、上山下水等）| ✅ 完整保留 |
| **xuankong** | 替卦分析 | ✅ 完整保留 |
| **xuankong** | 零正理论 | ✅ 完整保留 |
| **xuankong** | 城门诀 | ✅ 完整保留 |
| **xuankong** | 个性化分析 | ✅ 完整保留 |
| **xuankong** | 流年分析 | ✅ 完整保留 |
| **xuankong** | 智能推荐 | ✅ 完整保留 |

### ✨ 新增的增强功能

| 功能 | 来源 | 说明 |
|------|------|------|
| **智能评分系统** | fengshui | 五维度加权评分（格局30% + 八字25% + 流年20% + 房间15% + 化解10%）|
| **智能预警系统** | fengshui | 五级严重程度（critical/high/medium/low/info）|
| **详细问题分析** | fengshui | 每个问题包含影响、后果、建议 |
| **统一类型系统** | unified | TypeScript严格模式，更好的类型安全 |

---

## 🚀 快速开始

### 基础使用

```typescript
import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';
import type { UnifiedAnalysisInput } from '@/lib/qiflow/unified';

// 1. 准备输入数据
const input: UnifiedAnalysisInput = {
  bazi: {
    birthYear: 1990,
    birthMonth: 8,
    birthDay: 15,
    birthHour: 14,
    gender: 'male',
    // 八字分析信息（可选）
    dayMaster: 'water',
    favorableElements: ['metal', 'water'],
    unfavorableElements: ['earth', 'fire'],
  },
  house: {
    facing: 180, // 正南（度数）
    buildYear: 2020,
    floor: 15,
    layout: [
      {
        id: 'room-1',
        type: 'bedroom',
        name: '主卧',
        palace: 8, // 艮宫（东北）
        isPrimary: true,
      },
      // ... 更多房间
    ],
  },
  time: {
    currentYear: 2025,
    currentMonth: 1,
  },
  options: {
    depth: 'comprehensive', // 分析深度
    includeScoring: true, // 启用评分
    includeWarnings: true, // 启用预警
    includeLiunian: true, // 启用流年分析
  },
};

// 2. 调用分析
const result = await UnifiedFengshuiEngine.analyze(input);

// 3. 使用结果
console.log(`综合评分：${result.assessment.overallScore}/100`);
console.log(`评级：${result.assessment.rating}`);
console.log(`紧急问题：${result.warnings?.urgentCount}个`);
```

### 快速分析（仅基础功能）

```typescript
// 适合快速评估，不需要全部高级功能
const result = await UnifiedFengshuiEngine.quickAnalyze(input);
```

### 专家分析（全功能）

```typescript
// 包含所有高级功能：替卦、零正、城门诀等
const result = await UnifiedFengshuiEngine.expertAnalyze(input);
```

---

## 📚 API 文档

### UnifiedFengshuiEngine

#### analyze(input)

完整分析入口

**参数**：
- `input: UnifiedAnalysisInput` - 统一分析输入

**返回**：
- `Promise<UnifiedAnalysisOutput>` - 统一分析输出

**包含内容**：
- `xuankong` - 玄空飞星分析结果
- `scoring` - 智能评分结果（如果启用）
- `warnings` - 智能预警结果（如果启用）
- `personalized` - 个性化分析
- `actionPlan` - 行动计划
- `assessment` - 综合评估

#### quickAnalyze(input)

快速分析（仅基础功能）

- 不包含：流年、个性化、替卦、零正、城门诀
- 包含：基础飞星、评分、预警

#### expertAnalyze(input)

专家分析（全功能）

- 包含所有功能
- 最详细的分析结果

---

## 🔧 高级配置

### 分析选项

```typescript
interface UnifiedAnalysisOptions {
  depth?: 'basic' | 'standard' | 'comprehensive' | 'expert';
  
  // 功能开关
  includeLiunian?: boolean; // 流年分析
  includePersonalization?: boolean; // 个性化分析
  includeTigua?: boolean; // 替卦分析
  includeLingzheng?: boolean; // 零正理论
  includeChengmenjue?: boolean; // 城门诀
  includeScoring?: boolean; // 智能评分
  includeWarnings?: boolean; // 智能预警
  
  // 分析配置
  config?: {
    applyTiGua?: boolean;
    applyFanGua?: boolean;
    evaluationProfile?: 'standard' | 'conservative' | 'aggressive';
  };
}
```

### 环境信息（用于零正分析）

```typescript
house: {
  // ... 其他信息
  environment: {
    waterPositions: [1, 4], // 见水的宫位
    mountainPositions: [6, 8], // 见山的宫位
    description: '北面有湖，西北有山',
  },
}
```

---

## 📊 输出数据结构

### 综合评估

```typescript
assessment: {
  overallScore: 75, // 综合评分 0-100
  rating: 'good', // 评级
  strengths: ['格局吉利', '整体风水良好'],
  weaknesses: ['存在1个严重问题'],
  topPriorities: ['优先处理紧急预警问题'],
  longTermPlan: ['改善房间功能（当前65分）'],
}
```

### 智能评分

```typescript
scoring: {
  overall: 72,
  level: 'good',
  dimensions: [
    {
      name: '格局评分',
      score: 75,
      weight: 0.3,
      reasons: ['格局为双星到向，财运亨通'],
      suggestions: ['可在向首设置水景催财'],
    },
    // ... 更多维度
  ],
  summary: '风水格局良好，综合评分72分...',
}
```

### 智能预警

```typescript
warnings: {
  warnings: [
    {
      id: 'warning-1',
      severity: 'high',
      urgency: 4,
      title: '厨房在五黄位',
      description: '厨房是火旺之地...',
      location: '厨房',
      impact: ['健康受损：消化系统疾病'],
      consequences: ['家人健康每况愈下'],
      recommendations: ['在厨房挂铜葫芦'],
    },
  ],
  urgentCount: 2,
  criticalCount: 1,
  summary: '发现5个问题，其中1个严重问题，2个紧急问题',
}
```

---

## 🔄 数据转换

### 适配器工具

系统提供了一系列适配器工具，用于在不同格式之间转换：

```typescript
import {
  degreesToMountain,
  mountainToDegrees,
  calculatePeriod,
  getPalaceName,
} from '@/lib/qiflow/unified';

// 度数转二十四山
const mountain = degreesToMountain(180); // '午'

// 二十四山转度数
const degrees = mountainToDegrees('午'); // 180

// 根据年份计算元运
const period = calculatePeriod(2024); // 9

// 获取宫位名称
const name = getPalaceName(1); // '坎宫'
```

---

## 🏗️ 架构说明

### 系统架构

```
unified/
├── types.ts         # 统一类型定义
├── adapters.ts      # 数据转换适配器
├── engine.ts        # 统一分析引擎（核心）
├── index.ts         # 入口文件
└── README.md        # 本文档

xuankong/            # 原系统（底层算法）
├── flying-star.ts   # 飞星计算
├── comprehensive-engine.ts  # 综合引擎
├── geju.ts          # 格局分析
└── ...              # 其他模块

fengshui/            # 新增功能
├── score-calculator.ts      # 评分系统
├── warning-system.ts        # 预警系统
└── ...              # 其他模块
```

### 工作流程

```
1. 用户输入
   ↓
2. unified/engine.ts 统一引擎
   ├→ 调用 xuankong 系统（飞星计算、格局分析）
   ├→ 调用 fengshui 系统（评分、预警）
   └→ 整合结果
   ↓
3. 输出统一结果
```

---

## 💡 最佳实践

### 1. 完整输入信息

```typescript
// ✅ 好的做法：提供完整信息
const input: UnifiedAnalysisInput = {
  bazi: {
    birthYear: 1990,
    birthMonth: 8,
    birthDay: 15,
    birthHour: 14,
    gender: 'male',
    dayMaster: 'water',
    favorableElements: ['metal', 'water'],
    unfavorableElements: ['earth', 'fire'],
  },
  house: {
    facing: 180,
    buildYear: 2020,
    floor: 15,
    layout: [/* 详细布局 */],
    location: { lat: 39.9, lon: 116.4, address: '北京市' },
  },
  time: {
    currentYear: 2025,
    currentMonth: 1,
  },
};

// ❌ 差的做法：信息不完整
const badInput: UnifiedAnalysisInput = {
  bazi: {
    birthYear: 1990,
    birthMonth: 8,
    birthDay: 15,
    gender: 'male',
    // 缺少八字分析信息
  },
  house: {
    facing: 180,
    buildYear: 2020,
    // 缺少房间布局
  },
  time: {
    currentYear: 2025,
    currentMonth: 1,
  },
};
```

### 2. 根据需求选择分析深度

```typescript
// 快速预览
const quick = await UnifiedFengshuiEngine.quickAnalyze(input);

// 标准分析
const standard = await UnifiedFengshuiEngine.analyze(input);

// 专家级详细分析
const expert = await UnifiedFengshuiEngine.expertAnalyze(input);
```

### 3. 处理可选结果

```typescript
const result = await UnifiedFengshuiEngine.analyze(input);

// 评分可能为 undefined（如果未启用）
if (result.scoring) {
  console.log(`评分：${result.scoring.overall}`);
}

// 预警可能为 undefined（如果未启用）
if (result.warnings) {
  console.log(`预警：${result.warnings.urgentCount}个紧急`);
}
```

---

## 🐛 常见问题

### Q: 与原系统的兼容性？

A: **完全兼容**。统一系统是在原系统基础上的增强，原有的所有功能都保留。

### Q: 性能影响？

A: 新增的评分和预警模块增加约**200-300ms**的计算时间，但带来的价值远大于这点性能损耗。

### Q: 如何只使用原系统功能？

A: 设置 `includeScoring: false` 和 `includeWarnings: false` 即可。

### Q: 数据格式兼容性？

A: 统一系统提供了适配器，可以自动转换数据格式。您无需担心兼容性问题。

---

## 📝 更新日志

### v1.0.0 (2025-01-15)

**初始版本**：
- ✅ 创建统一类型系统
- ✅ 建立数据适配器
- ✅ 实现统一分析引擎
- ✅ 整合评分系统
- ✅ 整合预警系统
- ✅ 提供快速分析和专家分析接口

---

## 🤝 贡献

欢迎贡献代码和建议！

---

## 📞 支持

如有问题，请联系：
- Email: support@qiflowai.com
- 文档：查看各子系统的 README

---

**让传统智慧与现代科技完美结合！** 🎉
