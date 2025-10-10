# 个性化风水引擎 v6.0

## 项目概述

个性化风水引擎是一套深度整合**八字命理**与**玄空风水**的智能分析系统，旨在为用户提供高度个性化的风水分析和实用建议。

与市面上普通的风水应用不同，本系统的核心优势在于：

1. **深度个性化**：根据用户八字命理定制分析和建议
2. **专业算法**：基于正统玄空飞星理论，精确计算
3. **实用导向**：提供可落地的行动计划和购物清单
4. **时间动态**：考虑流年流月，动态调整建议

---

## 核心模块

### 1. 个性化风水引擎 (PersonalizedFengshuiEngine)

**文件**：`personalized-engine.ts`

**职责**：
- 作为系统主入口，协调各个子模块
- 定义核心数据类型和接口
- 整合所有分析结果，生成完整报告

**主要接口**：
```typescript
export class PersonalizedFengshuiEngine {
  static async analyze(
    input: PersonalizedFengshuiInput
  ): Promise<PersonalizedFengshuiOutput>
}
```

**输入参数**：
- `bazi`: 八字信息（日元、喜用神、忌神、身强身弱等）
- `house`: 房屋信息（朝向、元运、楼层、房间布局等）
- `time`: 时间信息（当前年月、择吉日期等）
- `family`: 家庭成员八字（可选）

**输出结果**：
- `overallScore`: 总体评分（0-100，分数越高越好）
- `scoreBreakdown`: 五维度评分明细
- `urgentIssues`: 紧急问题清单（按严重程度排序）
- `keyPositions`: 关键位置分析（财位、文昌位、桃花位等）
- `roomAdvice`: 房间建议
- `monthlyForecast`: 未来12个月运势预测
- `actionPlan`: 分优先级的行动计划
- `shoppingList`: 详细购物清单

---

### 2. 玄空飞星计算器 (XuankongCalculator)

**文件**：`xuankong-calculator.ts`

**职责**：
- 实现玄空风水的核心算法
- 计算九宫飞星排盘
- 识别特殊格局（旺山旺向、上山下水等）
- 评估飞星组合吉凶

**核心算法**：
- **九宫飞星排盘**：基于洛书轨迹，按阳顺阴逆规则飞布
- **特殊格局识别**：
  - 旺山旺向（最佳格局）
  - 双星到向（财旺人旺）
  - 双星到山（人旺财不旺）
  - 上山下水（人财两败，大凶）
  - 三般卦、伏吟等

**主要方法**：
```typescript
// 计算完整飞星盘
static calculateFlyingStars(facing: number, period: number): FlyingStarChart

// 度数转宫位
static degreesToPalace(degrees: number): DirectionInfo

// 评估飞星组合吉凶
static evaluateStarCombination(
  mountainStar: number,
  facingStar: number,
  period: number
): { score: number; level: string; description: string }
```

---

### 3. 智能评分计算器 (ScoreCalculator)

**文件**：`score-calculator.ts`

**职责**：
- 五维度加权评分（格局30% + 八字匹配25% + 流年20% + 房间功能15% + 化解10%）
- 结合用户八字进行个性化评分
- 考虑时间因素的动态评分

**评分维度**：

| 维度 | 权重 | 考虑因素 |
|------|------|---------|
| 格局评分 | 30% | 特殊格局、向首坐首星曜、凶煞格局 |
| 八字匹配度 | 25% | 喜用神匹配、忌神冲突、家人综合匹配 |
| 流年吉凶 | 20% | 流年五黄、太岁方位、与宅主八字关系 |
| 房间功能 | 15% | 各房间位置合理性、主卧厨房厕所评估 |
| 化解措施 | 10% | 现有化解效果、凶位是否已化解 |

**评分等级**：
- `excellent` (优秀): ≥ 85分
- `good` (良好): ≥ 70分
- `fair` (一般): ≥ 55分
- `poor` (较差): ≥ 40分
- `critical` (危险): < 40分

---

### 4. 智能预警系统 (WarningSystem)

**文件**：`warning-system.ts`

**职责**：
- 识别紧急风水问题
- 按严重程度分级
- 生成详细的影响说明和后果预警
- 提供针对性化解建议

**检测类型**：

| 检测类型 | 严重程度 | 示例 |
|----------|---------|------|
| 格局问题 | Critical/High | 上山下水、空亡线、伏吟 |
| 凶星问题 | High/Medium | 五黄煞、二黑病符 |
| 流年问题 | Medium | 流年五黄、三煞、太岁 |
| 房间问题 | Critical/High | 厕所在中宫/向首、厨房在五黄 |
| 八字冲突 | Medium | 朝向与忌神冲突 |

**问题严重程度**：
- `critical`: 严重问题，立即处理
- `high`: 高优先级，尽快处理
- `medium`: 中等优先级，近期处理
- `low`: 低优先级，有空处理
- `info`: 提示信息

---

## 使用示例

### 基本使用

```typescript
import {
  PersonalizedFengshuiEngine,
  PersonalizedFengshuiInput,
} from './personalized-engine';

// 1. 准备输入数据
const input: PersonalizedFengshuiInput = {
  bazi: {
    dayMaster: 'water',
    favorableElements: ['metal', 'water'],
    unfavorableElements: ['earth', 'wood'],
    season: 'winter',
    strength: 6,
  },
  house: {
    facing: 180, // 正南
    period: 9, // 九运
    buildYear: 2024,
    layout: [
      // ... 房间布局
    ],
  },
  time: {
    currentYear: 2025,
    currentMonth: 1,
  },
};

// 2. 调用引擎
const result = await PersonalizedFengshuiEngine.analyze(input);

// 3. 使用结果
console.log(`总体评分：${result.overallScore}`);
console.log(`紧急问题：${result.urgentIssues.length}个`);
console.log(`行动计划：${result.actionPlan.length}项`);
```

### 查看紧急问题

```typescript
// 按严重程度排序的紧急问题
result.urgentIssues.forEach((issue) => {
  console.log(`[${issue.severity}] ${issue.title}`);
  console.log(`位置：${issue.location}`);
  console.log(`影响：${issue.impact.join('、')}`);
  console.log(`建议：根据行动计划进行化解`);
});
```

### 查看行动计划

```typescript
// 按优先级排序的行动计划
result.actionPlan.forEach((item) => {
  console.log(`优先级 ${item.priority}: ${item.title}`);
  console.log(`难度：${item.difficulty}`);
  console.log(`预计成本：¥${item.estimatedCost.min}-${item.estimatedCost.max}`);
  console.log(`步骤：`);
  item.steps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step}`);
  });
});
```

---

## 数据类型说明

### 五行元素 (Element)

```typescript
type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
```

**属性映射**：
- `wood` (木): 方位东/东南，颜色绿/青
- `fire` (火): 方位南，颜色红/紫
- `earth` (土): 方位中/西南/东北，颜色黄/棕
- `metal` (金): 方位西/西北，颜色白/金
- `water` (水): 方位北，颜色黑/蓝

### 八字信息 (BaziInfo)

```typescript
interface BaziInfo {
  dayMaster: Element; // 日元五行
  favorableElements: Element[]; // 喜用神
  unfavorableElements: Element[]; // 忌神
  season: 'spring' | 'summer' | 'autumn' | 'winter'; // 出生季节
  strength: number; // 身强身弱（1-10，5为中和）
}
```

### 房屋信息 (HouseInfo)

```typescript
interface HouseInfo {
  facing: number; // 朝向（度数，0-360）
  mountain?: number; // 坐向（可选，默认为facing+180）
  period: number; // 元运（1-9）
  buildYear: number; // 建造年份
  floor?: number; // 楼层
  layout?: RoomLayout[]; // 房间布局
  address?: string; // 地址
}
```

### 房间布局 (RoomLayout)

```typescript
interface RoomLayout {
  id: string;
  type: 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'study' | 'dining' | 'entrance';
  name: string;
  position: number; // 九宫格位置（1-9）
  area?: number; // 面积（平方米）
  isPrimary?: boolean; // 是否为主要房间（如主卧）
}
```

---

## 技术规范

### 代码风格

- ✅ **TypeScript**：全面使用 TypeScript，严格类型检查
- ✅ **命名导出**：统一使用命名导出，避免默认导出
- ✅ **函数式编程**：优先使用纯函数和函数式编程模式
- ✅ **清晰命名**：类名用 PascalCase，变量/函数用 camelCase

### 性能优化

- ⚡ **异步计算**：所有耗时计算使用 async/await
- ⚡ **按需加载**：大型数据表和配置文件按需加载
- ⚡ **缓存机制**：飞星盘计算结果可缓存复用

### 错误处理

- 🛡️ **输入验证**：所有输入数据进行验证
- 🛡️ **异常捕获**：关键计算步骤捕获异常并记录日志
- 🛡️ **降级处理**：部分模块失败不影响整体运行

---

## 后续扩展方向

### 1. 关键位置分析模块 (key-positions.ts)

**待实现功能**：
- 财位计算（明财位、暗财位、流年财位）
- 文昌位计算（本命文昌、流年文昌）
- 桃花位、贵人位、健康位等
- 结合八字的个性化关键位置

### 2. 月运预测模块 (monthly-forecast.ts)

**待实现功能**：
- 未来12个月的吉凶方位预测
- 关键事项提醒
- 月度建议
- 重要日期择吉

### 3. 行动计划生成模块 (action-plan.ts)

**待实现功能**：
- 根据紧急问题自动生成行动计划
- 按优先级、难度、成本排序
- 详细步骤拆解
- 预期效果评估

### 4. 购物清单生成模块 (shopping-list.ts)

**待实现功能**：
- 根据化解需求生成购物清单
- 详细规格要求
- 价格区间估算
- 购买链接推荐

### 5. 3D可视化模块 (visualization.ts)

**待实现功能**：
- 九宫飞星盘3D可视化
- 房间布局3D展示
- 关键位置高亮标注
- 化解物品摆放位置示意

---

## 测试说明

### 运行测试

```bash
# 方式1：直接运行测试脚本
ts-node src/lib/qiflow/fengshui/test-engine.ts

# 方式2：在项目中导入并运行
import { runTests } from './test-engine';
await runTests();
```

### 测试覆盖

- ✅ 基本功能测试
- ✅ 特殊格局识别测试
- ✅ 紧急问题检测测试
- ⏳ 边界条件测试（待完善）
- ⏳ 性能压力测试（待完善）

---

## 版本历史

### v6.0.0 (2025-01-XX)

**重大更新**：
- 🚀 全新架构：模块化设计，易于扩展
- 🎯 个性化引擎：深度整合八字命理
- 📊 智能评分：五维度加权评分系统
- ⚠️ 预警系统：实时识别紧急风水问题
- 🧮 玄空飞星：专业算法，精确计算

**核心文件**：
- `personalized-engine.ts` - 主引擎
- `xuankong-calculator.ts` - 飞星计算
- `score-calculator.ts` - 评分系统
- `warning-system.ts` - 预警系统

---

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 遵循 TypeScript 最佳实践
- 添加详细的注释和文档
- 编写单元测试
- 保持代码简洁易读

---

## 许可证

© 2025 玄空风水大师团队. All rights reserved.

---

## 联系方式

- 项目负责人：[您的名字]
- 技术支持：[support@example.com]
- 文档地址：[https://docs.example.com]

---

**祝您使用愉快，趋吉避凶，万事顺遂！** 🎉
