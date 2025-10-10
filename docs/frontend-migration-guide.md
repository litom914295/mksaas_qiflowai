# 前端系统迁移指南

本指南将帮助您将现有前端应用从旧的 xuankong 和 fengshui 系统迁移到新的 **unified** 统一系统。

## 目录
1. [迁移概述](#迁移概述)
2. [核心变化](#核心变化)
3. [迁移步骤](#迁移步骤)
4. [代码示例](#代码示例)
5. [常见问题](#常见问题)
6. [向后兼容性](#向后兼容性)

---

## 迁移概述

### 为什么要迁移？

unified 系统提供以下优势：
- ✅ **统一接口**：一个 API 调用即可获得完整分析
- ✅ **性能优化**：内置缓存系统，提升响应速度
- ✅ **智能评分**：新增智能评分和预警系统
- ✅ **更好的类型安全**：完整的 TypeScript 类型定义
- ✅ **易于测试**：清晰的输入输出格式

### 迁移策略

我们支持**渐进式迁移**：
1. 先迁移新功能和页面
2. 保持旧系统运行，确保向后兼容
3. 逐步替换旧代码
4. 最终完全切换到 unified 系统

---

## 核心变化

### 1. API 调用变化

**旧系统 (xuankong)**
```typescript
import { comprehensiveAnalysis } from '@/lib/qiflow/xuankong/comprehensive-engine';

const result = await comprehensiveAnalysis({
  observedAt: new Date(),
  facing: { degrees: 180 },
  userProfile: { ... },
  includeLiunian: true,
  // ... 更多选项
});
```

**新系统 (unified)**
```typescript
import { UnifiedFengshuiEngine, adaptToFrontend } from '@/lib/qiflow/unified';

const engine = new UnifiedFengshuiEngine();
const unifiedResult = await engine.analyze({
  bazi: { ... },
  house: { ... },
  time: { ... },
  options: { ... },
});

// 适配为前端格式
const frontendResult = adaptToFrontend(unifiedResult);
```

### 2. 类型定义变化

**旧类型**
```typescript
import type { 
  ComprehensiveAnalysisResult,
  ComprehensiveAnalysisOptions 
} from '@/lib/qiflow/xuankong/comprehensive-engine';
```

**新类型**
```typescript
import type {
  UnifiedAnalysisInput,
  UnifiedAnalysisOutput,
} from '@/lib/qiflow/unified';
```

### 3. 前端组件兼容性

使用 `adaptToFrontend()` 适配器确保与现有 UI 组件兼容：

```typescript
import { adaptToFrontend } from '@/lib/qiflow/unified';

// unified 输出
const unifiedResult = await engine.analyze(input);

// 适配为 ComprehensiveAnalysisPanel 期望的格式
const frontendResult = adaptToFrontend(unifiedResult);

// 传递给现有组件
<ComprehensiveAnalysisPanel analysisResult={frontendResult} />
```

---

## 迁移步骤

### 步骤 1: 安装依赖（如果需要）

```bash
# 确保所有必要的依赖已安装
npm install
```

### 步骤 2: 更新 API 路由

#### 旧的 API 路由 (app/api/analysis/route.ts)

```typescript
import { comprehensiveAnalysis } from '@/lib/qiflow/xuankong/comprehensive-engine';

export async function POST(request: Request) {
  const data = await request.json();
  
  const result = await comprehensiveAnalysis({
    observedAt: new Date(data.observedAt),
    facing: { degrees: data.facing },
    // ... 更多参数
  });
  
  return Response.json(result);
}
```

#### 新的 API 路由

```typescript
import { 
  UnifiedFengshuiEngine, 
  adaptToFrontend 
} from '@/lib/qiflow/unified';
import type { UnifiedAnalysisInput } from '@/lib/qiflow/unified';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 构建 unified 输入
    const input: UnifiedAnalysisInput = {
      bazi: {
        birthYear: data.birthYear,
        birthMonth: data.birthMonth,
        birthDay: data.birthDay,
        birthHour: data.birthHour,
        gender: data.gender,
      },
      house: {
        facing: data.facing,
        buildYear: data.buildYear,
        location: data.location,
        layout: data.rooms,
      },
      time: {
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
      },
      options: {
        depth: 'comprehensive',
        includeLiunian: true,
        includePersonalization: true,
        includeScoring: true,
        includeWarnings: true,
      },
    };
    
    // 执行分析
    const engine = new UnifiedFengshuiEngine();
    const unifiedResult = await engine.analyze(input);
    
    // 适配为前端格式
    const frontendResult = adaptToFrontend(unifiedResult);
    
    return Response.json({
      success: true,
      data: frontendResult,
      metadata: {
        analyzedAt: unifiedResult.metadata.analyzedAt,
        version: unifiedResult.metadata.version,
        computationTime: unifiedResult.metadata.computationTime,
      },
    });
  } catch (error) {
    console.error('Analysis failed:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '分析失败' 
      },
      { status: 500 }
    );
  }
}
```

### 步骤 3: 更新 React 组件

#### 旧的组件代码

```typescript
'use client';

import { useState } from 'react';
import { ComprehensiveAnalysisPanel } from '@/components/qiflow/xuankong/comprehensive-analysis-panel';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';

export default function AnalysisPage() {
  const [result, setResult] = useState<ComprehensiveAnalysisResult | null>(null);
  
  async function handleAnalyze() {
    const response = await fetch('/api/analysis', {
      method: 'POST',
      body: JSON.stringify({ /* 参数 */ }),
    });
    
    const data = await response.json();
    setResult(data);
  }
  
  return (
    <div>
      <button onClick={handleAnalyze}>开始分析</button>
      <ComprehensiveAnalysisPanel analysisResult={result} />
    </div>
  );
}
```

#### 新的组件代码（几乎不需要修改！）

```typescript
'use client';

import { useState } from 'react';
import { ComprehensiveAnalysisPanel } from '@/components/qiflow/xuankong/comprehensive-analysis-panel';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';

export default function AnalysisPage() {
  const [result, setResult] = useState<ComprehensiveAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  async function handleAnalyze(formData: any) {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthYear: formData.birthYear,
          birthMonth: formData.birthMonth,
          birthDay: formData.birthDay,
          birthHour: formData.birthHour,
          gender: formData.gender,
          facing: formData.facing,
          buildYear: formData.buildYear,
          location: formData.location,
          rooms: formData.rooms,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 已经通过 adaptToFrontend 适配，可以直接使用
        setResult(data.data);
      } else {
        console.error('Analysis failed:', data.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div>
      <button onClick={() => handleAnalyze(/* 表单数据 */)}>
        开始分析
      </button>
      <ComprehensiveAnalysisPanel 
        analysisResult={result} 
        isLoading={isLoading}
      />
    </div>
  );
}
```

### 步骤 4: 使用 Server Component（推荐）

```typescript
// app/analysis/[id]/page.tsx
import { UnifiedFengshuiEngine, adaptToFrontend } from '@/lib/qiflow/unified';
import { ComprehensiveAnalysisPanel } from '@/components/qiflow/xuankong/comprehensive-analysis-panel';

export default async function AnalysisPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // 从数据库获取数据
  const analysisData = await db.analysis.findUnique({
    where: { id: params.id },
  });
  
  if (!analysisData) {
    return <div>分析不存在</div>;
  }
  
  // 构建输入
  const input = {
    bazi: analysisData.bazi,
    house: analysisData.house,
    time: {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
    },
    options: {
      depth: 'comprehensive',
      includeLiunian: true,
      includePersonalization: true,
      includeScoring: true,
      includeWarnings: true,
    },
  };
  
  // 执行分析（服务器端，带缓存）
  const engine = new UnifiedFengshuiEngine();
  const unifiedResult = await engine.analyze(input);
  const frontendResult = adaptToFrontend(unifiedResult);
  
  // 直接渲染
  return <ComprehensiveAnalysisPanel analysisResult={frontendResult} />;
}
```

---

## 代码示例

### 示例 1: 基础迁移

```typescript
// ❌ 旧代码
import { generateFlyingStar } from '@/lib/qiflow/xuankong';

const result = generateFlyingStar({
  observedAt: new Date(),
  facing: { degrees: 180 },
});

// ✅ 新代码
import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';

const engine = new UnifiedFengshuiEngine();
const result = await engine.analyze({
  house: { facing: 180, buildYear: 2010 },
  time: { currentYear: 2024, currentMonth: 12 },
  bazi: { /* ... */ },
});
```

### 示例 2: 个性化分析迁移

```typescript
// ❌ 旧代码
import { personalizedFlyingStarAnalysis } from '@/lib/qiflow/xuankong/personalized-analysis';

const personalizedResult = personalizedFlyingStarAnalysis(
  plate,
  userProfile,
  layout
);

// ✅ 新代码
import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';

const engine = new UnifiedFengshuiEngine();
const result = await engine.analyze({
  bazi: userProfile,
  house: { facing: 180, buildYear: 2010, layout },
  time: { currentYear: 2024, currentMonth: 12 },
  options: {
    includePersonalization: true,
  },
});

// 个性化结果在 result.personalized 中
```

### 示例 3: 流年分析迁移

```typescript
// ❌ 旧代码
import { analyzeLiunianOverlay } from '@/lib/qiflow/xuankong/liunian-analysis';

const liunianResult = analyzeLiunianOverlay(
  plate,
  targetYear,
  targetMonth,
  options
);

// ✅ 新代码
import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';

const engine = new UnifiedFengshuiEngine();
const result = await engine.analyze({
  bazi: { /* ... */ },
  house: { /* ... */ },
  time: { 
    currentYear: targetYear, 
    currentMonth: targetMonth 
  },
  options: {
    includeLiunian: true,
  },
});

// 流年结果在 result.monthlyForecast 中
```

---

## 常见问题

### Q1: 我需要修改所有前端组件吗？

**答**：不需要！使用 `adaptToFrontend()` 适配器，现有组件（如 `ComprehensiveAnalysisPanel`）无需修改即可使用。

### Q2: 旧系统的数据能否直接迁移？

**答**：可以。unified 系统提供适配器函数来转换旧格式：

```typescript
import { toXuankongUserProfile, toFengshuiHouseInfo } from '@/lib/qiflow/unified';

const oldData = { /* 旧格式 */ };
const newBazi = toXuankongUserProfile(oldData);
const newHouse = toFengshuiHouseInfo(oldData);
```

### Q3: 性能会有提升吗？

**答**：是的！unified 系统内置缓存，相同输入的分析会自动复用缓存结果：

```typescript
const engine = new UnifiedFengshuiEngine();

// 第一次调用 - 完整计算
const result1 = await engine.analyze(input); // ~200ms

// 第二次调用 - 使用缓存
const result2 = await engine.analyze(input); // ~5ms
```

### Q4: 如何调试迁移问题？

**答**：启用调试日志：

```typescript
const engine = new UnifiedFengshuiEngine();

// 打印输入
console.log('Input:', JSON.stringify(input, null, 2));

// 执行分析
const result = await engine.analyze(input);

// 打印输出
console.log('Output:', JSON.stringify(result, null, 2));

// 打印适配后的结果
const adapted = adaptToFrontend(result);
console.log('Adapted:', JSON.stringify(adapted, null, 2));
```

### Q5: 可以同时使用新旧系统吗？

**答**：可以！渐进式迁移：

```typescript
// 功能开关
const USE_UNIFIED_SYSTEM = process.env.NEXT_PUBLIC_USE_UNIFIED === 'true';

async function analyze(input: any) {
  if (USE_UNIFIED_SYSTEM) {
    // 使用新系统
    const engine = new UnifiedFengshuiEngine();
    const result = await engine.analyze(input);
    return adaptToFrontend(result);
  } else {
    // 使用旧系统
    return await comprehensiveAnalysis(input);
  }
}
```

---

## 向后兼容性

### 保持旧 API 端点

如果需要保持旧 API 的兼容性：

```typescript
// app/api/legacy-analysis/route.ts
import { comprehensiveAnalysis } from '@/lib/qiflow/xuankong/comprehensive-engine';

export async function POST(request: Request) {
  // 保持旧逻辑不变
  const data = await request.json();
  const result = await comprehensiveAnalysis(data);
  return Response.json(result);
}
```

### 适配器双向转换

```typescript
import { adaptToFrontend } from '@/lib/qiflow/unified';

// 新系统 → 旧格式
const legacyFormat = adaptToFrontend(unifiedResult);

// 旧格式 → 新系统（如果需要）
// const unifiedInput = adaptFromLegacy(legacyInput);
```

---

## 迁移检查清单

完成迁移后，请检查以下项目：

- [ ] API 路由已更新
- [ ] 前端组件可以正常渲染分析结果
- [ ] 所有旧功能（流年、个性化、推荐等）都能正常工作
- [ ] 缓存系统正常运行
- [ ] 错误处理和降级策略已实现
- [ ] 类型检查通过（`npm run type-check`）
- [ ] 测试用例通过（`npm test`）
- [ ] 性能优化生效（检查缓存命中率）
- [ ] 用户体验无明显变化
- [ ] 日志和监控正常工作

---

## 获取帮助

如果您在迁移过程中遇到问题：

1. 查看 [迁移测试示例](../src/lib/qiflow/unified/__tests__/migration-test.ts)
2. 查看 [前端集成示例](../src/lib/qiflow/unified/examples/frontend-integration.example.ts)
3. 运行迁移测试：`npm test -- migration-test`
4. 联系开发团队获取支持

---

## 总结

unified 系统的前端迁移非常简单：

1. ✅ 更新 API 调用
2. ✅ 使用 `adaptToFrontend()` 适配输出
3. ✅ 现有 UI 组件无需修改
4. ✅ 享受性能提升和新功能

**迁移时间估计**：小型项目 1-2 小时，大型项目 1-2 天。

祝您迁移顺利！🎉
