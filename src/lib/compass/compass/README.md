# 奇流智能罗盘系统

## 概述

奇流智能罗盘系统是一个集成了传统风水罗盘和现代数字罗盘功能的智能导航系统。基于React + TypeScript + Konva.js技术栈，提供高性能的罗盘渲染和智能分析功能。

## 功能特性

### 🧭 数字罗盘
- 高精度方向测量
- 传感器数据融合
- 实时校准功能
- 磁偏角修正

### 🏮 风水罗盘
- 完整的传统风水罗盘功能
- 八卦、二十四山、透地六十龙
- 多种主题和自定义配置
- 天心十字显示

### 🤖 AI智能分析
- 基于传统风水理论的智能分析
- 方位吉凶判断
- 个性化风水建议
- 实时分析结果

### 📱 现代化界面
- 响应式设计
- 多主题支持
- 流畅的动画效果
- 直观的用户交互

## 技术架构

```
src/lib/compass/
├── feng-shui-types.ts      # 类型定义
├── feng-shui-data.ts       # 罗盘数据配置
├── feng-shui-engine.ts     # 核心引擎
├── feng-shui-renderer.ts   # Konva.js渲染器
├── ai-analysis.ts          # AI分析服务
├── compass-integration.ts  # 集成服务
├── declination.ts          # 磁偏角计算
├── sensor-fusion.ts        # 传感器融合
├── ekf.ts                  # 扩展卡尔曼滤波
└── true-north.ts           # 真北计算

src/components/compass/
├── feng-shui-compass.tsx   # 风水罗盘组件
├── compass-ui.tsx          # 数字罗盘UI
├── compass-calibration.tsx # 校准组件
├── compass-measurement.tsx # 测量组件
└── index.ts               # 统一导出
```

## 快速开始

### 1. 基础使用

```tsx
import { FengShuiCompass } from '@/components/compass';

function App() {
  return (
    <FengShuiCompass
      width={600}
      height={600}
      theme="classic"
      showTianxinCross={true}
      enableSensor={true}
      enableAI={true}
    />
  );
}
```

### 2. 事件处理

```tsx
import { FengShuiCompass } from '@/components/compass';
import type { CompassEvent, AIAnalysisResult } from '@/lib/compass/feng-shui-types';

function App() {
  const handleCompassEvent = (event: CompassEvent) => {
    console.log('罗盘事件:', event);
  };

  const handleDirectionChange = (direction: number, accuracy: number) => {
    console.log('方向变化:', direction, '精度:', accuracy);
  };

  const handleAnalysisResult = (result: AIAnalysisResult) => {
    console.log('AI分析结果:', result);
  };

  return (
    <FengShuiCompass
      width={600}
      height={600}
      onEvent={handleCompassEvent}
      onDirectionChange={handleDirectionChange}
      onAnalysisResult={handleAnalysisResult}
    />
  );
}
```

### 3. 自定义数据

```tsx
import { FengShuiCompass } from '@/components/compass';
import type { LayerData } from '@/lib/compass/feng-shui-types';

const customData: LayerData[] = [
  {
    name: "自定义层",
    startAngle: 0,
    fontSize: 24,
    textColor: "white",
    vertical: false,
    togetherStyle: "empty",
    data: ["东", "南", "西", "北"],
  }
];

function App() {
  return (
    <FengShuiCompass
      width={600}
      height={600}
      customData={customData}
    />
  );
}
```

## API 参考

### FengShuiCompass 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| width | number | - | 罗盘宽度 |
| height | number | - | 罗盘高度 |
| theme | 'classic' \| 'modern' \| 'traditional' | 'classic' | 主题 |
| showTianxinCross | boolean | true | 显示天心十字 |
| showScale | boolean | true | 显示刻度 |
| enableSensor | boolean | false | 启用传感器 |
| enableAI | boolean | false | 启用AI分析 |
| customData | LayerData[] | - | 自定义罗盘数据 |
| onEvent | (event: CompassEvent) => void | - | 事件回调 |
| onDirectionChange | (direction: number, accuracy: number) => void | - | 方向变化回调 |
| onAnalysisResult | (result: AIAnalysisResult) => void | - | AI分析结果回调 |

### 主要类型

```typescript
// 罗盘事件
interface CompassEvent {
  type: CompassEventType;
  timestamp: number;
  data?: any;
}

// AI分析结果
interface AIAnalysisResult {
  direction: number;
  mountain: string;
  bagua: string;
  confidence: number;
  analysis: string;
  suggestions: string[];
  timestamp: number;
}

// 层数据
interface LayerData {
  name: string | string[];
  startAngle: number;
  fontSize?: number;
  textColor: string | string[];
  vertical?: boolean;
  togetherStyle?: 'empty' | 'equally' | 'son';
  data: string[] | string[][];
}
```

## 演示页面

访问 `/compass-demo` 查看完整的功能演示，包括：
- 实时罗盘显示
- 传感器数据集成
- AI分析功能
- 多主题切换
- 事件日志

## 开发指南

### 添加新的罗盘层

1. 在 `feng-shui-data.ts` 中添加层数据
2. 更新类型定义（如需要）
3. 测试渲染效果

### 扩展AI分析

1. 在 `ai-analysis.ts` 中添加新的分析逻辑
2. 更新 `AIAnalysisResult` 类型
3. 在组件中处理新的分析结果

### 自定义主题

1. 在 `feng-shui-types.ts` 中的 `COMPASS_THEMES` 添加新主题
2. 定义颜色和样式配置
3. 在渲染器中应用主题

## 注意事项

1. **传感器权限**: 在iOS设备上需要用户授权才能访问设备方向传感器
2. **性能优化**: 大型罗盘数据可能影响渲染性能，建议合理配置层数和数据量
3. **浏览器兼容性**: 部分传感器功能需要HTTPS环境才能正常工作
4. **AI分析**: 当前为模拟实现，实际项目中应集成真实的AI服务

## 更新日志

### v1.0.0 (2024-01-17)
- ✅ 完成FengShuiCompass项目完整移植
- ✅ Vue.js到React + TypeScript转换
- ✅ 集成Konva.js高性能渲染
- ✅ 添加传感器数据支持
- ✅ 实现AI智能分析功能
- ✅ 创建完整的演示页面
- ✅ 提供统一的组件导出接口