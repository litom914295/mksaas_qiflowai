# 玄空飞星替卦功能使用指南 v1.0

**文档版本**: 1.0  
**适用版本**: >= v6.1  
**最后更新**: 2025-11-12

---

## 一、概述

本项目提供两种替卦实现，适用于不同场景：

| 实现 | 位置 | 触发方式 | 适用场景 |
|------|------|---------|---------|
| **简单替卦** | `luoshu.ts` | 自动伏吟检测 | 日常排盘、API 调用 |
| **增强替卦** | `enhanced-tigua.ts` | 预定义规则表 | 深度分析、专家系统 |

---

## 二、简单替卦（Simple Tigua）

### 2.1 什么是简单替卦？

简单替卦是一种**自动化的替卦机制**，基于伏吟检测：

- **伏吟定义**：天盘（运盘）的飞星与该宫位的本宫星相同
- **替卦方法**：使用对宫星替换原星（1↔9, 2↔8, 3↔7, 4↔6, 5↔5）
- **触发时机**：在 `generateShanpan` 和 `generateXiangpan` 生成山盘/向盘时

### 2.2 为什么需要简单替卦？

**风水理论依据**：
- 伏吟格局在风水上主停滞、重复、无突破
- 通过替卦可以化解不利影响
- 替卦后的格局更有利于发展

**技术依据**：
- 作为核心算法层的默认保护机制
- 自动避免伏吟，无需人工判断
- 计算开销极小（< 0.1ms）

### 2.3 如何使用简单替卦？

#### 方式 1：通过配置启用（推荐）

```typescript
import { generateFlyingStar } from '@/lib/qiflow/xuankong';

const result = generateFlyingStar({
  observedAt: new Date('2024-01-01'),
  facing: { degrees: 45 }, // 艮山坤向
  config: {
    applyTiGua: true, // 启用简单替卦
  },
});

// 检查是否应用了替卦
console.log(result.meta.rulesApplied); // ['TiGua'] （如果触发）
```

#### 方式 2：直接调用函数

```typescript
import { generateTianpan, generateShanpan } from '@/lib/qiflow/xuankong';

const tianpan = generateTianpan(8); // 八运
const shanpan = generateShanpan(
  tianpan,
  '艮',    // 坐山
  false,   // 不兼向
  true     // 启用替卦
);

// 查看山盘结果
console.log(shanpan);
```

### 2.4 替卦效果示例

#### 示例 1：八运艮山坤向

**不启用替卦**：
```typescript
const tianpan = generateTianpan(8);
const shanpan = generateShanpan(tianpan, '艮', false, false);

// 艮宫（8宫）山星为 8
// 触发伏吟，但未替卦
```

**启用替卦**：
```typescript
const shanpan = generateShanpan(tianpan, '艮', false, true);

// 艮宫（8宫）山星为 2
// 伏吟触发，8 替换为对宫星 2
```

**替卦前后对比**：

| 宫位 | 不启用替卦 | 启用替卦 | 说明 |
|------|-----------|---------|------|
| 艮宫(8) | 山星 8 | 山星 2 | 8→2（对宫星） |
| 其他宫 | 按8顺飞/逆飞 | 按2顺飞/逆飞 | 整体排盘改变 |

#### 示例 2：九运午山子向

**不启用替卦**：
```typescript
const tianpan = generateTianpan(9);
const xiangpan = generateXiangpan(tianpan, '午', false, false);

// 午向离宫（9宫）向星为 9
// 触发伏吟，但未替卦
```

**启用替卦**：
```typescript
const xiangpan = generateXiangpan(tianpan, '午', false, true);

// 午向离宫（9宫）向星为 1
// 伏吟触发，9 替换为对宫星 1
```

### 2.5 对宫星映射表

| 原星 | 对宫星 | 八卦关系 | 说明 |
|------|-------|---------|------|
| 1 | 9 | 坎 ↔ 离 | 水火对立 |
| 2 | 8 | 坤 ↔ 艮 | 西南 ↔ 东北 |
| 3 | 7 | 震 ↔ 兑 | 东 ↔ 西 |
| 4 | 6 | 巽 ↔ 乾 | 东南 ↔ 西北 |
| 5 | 5 | 中宫 | 无对宫（特殊） |

### 2.6 注意事项

1. **默认不启用**：为保持向后兼容，默认 `applyTiGua: false`
2. **自动判断**：无需手动判断是否伏吟，系统自动检测
3. **兼向影响**：兼向（`isJian`）不影响替卦判断
4. **五运中宫**：五运时5宫触发伏吟，但5的对宫仍为5

---

## 三、增强替卦（Enhanced Tigua）

### 3.1 什么是增强替卦？

增强替卦是一种**基于传统规则表的替卦机制**：

- **规则表驱动**：预定义了完整的替卦规则（正替、旁替）
- **流派依据**：基于《沈氏玄空学》等经典文献
- **多维度分析**：提供替卦建议、影响评估、化解方案

### 3.2 增强替卦的优势

**vs. 简单替卦**：

| 特性 | 简单替卦 | 增强替卦 |
|------|---------|---------|
| 实现复杂度 | 低 | 高 |
| 规则准确性 | 对宫星原理 | 传统经典规则 |
| 分析深度 | 基础 | 深度 |
| 使用场景 | 通用排盘 | 专家分析 |
| 性能开销 | < 0.1ms | ~1-5ms |

### 3.3 如何使用增强替卦？

```typescript
import { comprehensiveAnalysis } from '@/lib/qiflow/xuankong';

const result = await comprehensiveAnalysis({
  observedAt: new Date('2024-01-01'),
  facing: { degrees: 45 },
  includeTiguaAnalysis: true, // 启用增强替卦分析
});

// 查看替卦分析结果
console.log(result.tiguaAnalysis);
// {
//   applicableRules: [...],      // 适用的规则
//   recommendedRule: {...},      // 推荐的规则
//   analysis: {...},             // 详细分析
//   personalizedRecommendation: {...} // 个性化建议
// }
```

### 3.4 增强替卦规则示例

#### 五运正替规则

```typescript
{
  id: 'wu_yun_zi_wu',
  zuo: '子',
  xiang: '午',
  applicablePeriods: [5],
  replacementZuo: '壬',
  replacementXiang: '丙',
  category: '正替',
  description: '子山午向五运正替用壬山丙向',
  historicalBasis: '《玄空秘旨》记载：五运子午卯酉四山向，俱要替卦',
}
```

#### 乾巽替卦规则

```typescript
{
  id: 'qian_xun_tigua',
  zuo: '乾',
  xiang: '巽',
  applicablePeriods: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  replacementZuo: '亥',
  replacementXiang: '巳',
  category: '正替',
  description: '乾山巽向替卦用亥山巳向',
  historicalBasis: '《天玉经》云：乾巽坤艮四大卦，乘时乘气是真龙',
}
```

---

## 四、两种替卦的选择建议

### 4.1 使用简单替卦的场景

✅ **推荐使用**：
- 日常排盘API调用
- 批量数据处理
- 移动端应用（性能敏感）
- 不需要详细分析报告

**示例场景**：
```typescript
// 场景：为用户快速生成飞星排盘
app.post('/api/generate-plate', async (req, res) => {
  const result = generateFlyingStar({
    observedAt: req.body.date,
    facing: req.body.facing,
    config: {
      applyTiGua: true, // 简单替卦，快速响应
    },
  });
  
  res.json(result);
});
```

### 4.2 使用增强替卦的场景

✅ **推荐使用**：
- 专业风水分析
- 生成详细报告
- 需要传统规则依据
- 个性化咨询服务

**示例场景**：
```typescript
// 场景：为高级用户生成深度分析报告
app.post('/api/comprehensive-analysis', async (req, res) => {
  const result = await comprehensiveAnalysis({
    observedAt: req.body.date,
    facing: req.body.facing,
    includeTiguaAnalysis: true, // 增强替卦，深度分析
    includePersonalization: true,
    userProfile: req.body.userProfile,
  });
  
  res.json(result);
});
```

### 4.3 混合使用策略

**分层使用**（推荐）：

```typescript
// 1. 基础排盘层：使用简单替卦
const basicResult = generateFlyingStar({
  observedAt,
  facing,
  config: { applyTiGua: true },
});

// 2. 如果用户需要深度分析，再调用增强替卦
if (userNeedsDetailedAnalysis) {
  const enhancedResult = await comprehensiveAnalysis({
    observedAt,
    facing,
    includeTiguaAnalysis: true,
  });
  
  // 合并结果
  return {
    ...basicResult,
    ...enhancedResult,
  };
}
```

---

## 五、常见问题（FAQ）

### Q1: 简单替卦会影响现有代码吗？

**A**: 不会。简单替卦默认不启用（`applyTiGua: false`），只有显式启用时才生效。

### Q2: 简单替卦和增强替卦可以同时使用吗？

**A**: 是的，但通常不建议。两者设计为互补而非叠加。建议：
- 在 `generateFlyingStar` 中使用简单替卦
- 在 `comprehensiveAnalysis` 中使用增强替卦

### Q3: 五运中宫伏吟怎么处理？

**A**: 五运时，5宫的对宫星仍为5，替卦后效果不明显。建议：
- 简单替卦：自动处理（5→5）
- 增强替卦：使用五运特殊规则（如子午卯酉四山向替卦）

### Q4: 替卦后的排盘结果准确吗？

**A**: 是的。替卦只改变起始星，顺飞/逆飞规则完全遵循玄空飞星理论。

### Q5: 性能影响有多大？

**A**: 极小。简单替卦平均耗时 < 0.1ms，对整体排盘性能影响 < 1%。

### Q6: 如何验证替卦是否生效？

**A**: 检查返回结果的 `meta.rulesApplied` 数组：
```typescript
if (result.meta.rulesApplied.includes('TiGua')) {
  console.log('简单替卦已生效');
}
```

---

## 六、API 参考

### 6.1 配置选项

```typescript
interface FlyingStarConfig {
  toleranceDeg: number;
  applyTiGua: boolean;      // 简单替卦开关
  applyFanGua: boolean;
  evaluationProfile: 'standard' | 'conservative' | 'aggressive';
}
```

### 6.2 函数签名

#### generateShanpan

```typescript
function generateShanpan(
  tianpan: Plate,
  zuo: Mountain,
  isJian?: boolean,
  applyTigua?: boolean
): Plate;
```

#### generateXiangpan

```typescript
function generateXiangpan(
  tianpan: Plate,
  xiang: Mountain,
  isJian?: boolean,
  applyTigua?: boolean
): Plate;
```

#### generateFlyingStar

```typescript
function generateFlyingStar(
  input: GenerateFlyingStarInput
): GenerateFlyingStarOutput;

interface GenerateFlyingStarInput {
  observedAt: Date;
  facing: { degrees: number };
  config?: Partial<FlyingStarConfig>;
}
```

---

## 七、最佳实践

### 7.1 生产环境配置

```typescript
// config/xuankong.ts
export const XUANKONG_CONFIG = {
  // 基础排盘启用简单替卦
  basicPlate: {
    applyTiGua: true,
  },
  
  // 深度分析启用增强替卦
  comprehensiveAnalysis: {
    includeTiguaAnalysis: true,
    applyTiGua: false, // 避免重复
  },
};
```

### 7.2 错误处理

```typescript
try {
  const result = generateFlyingStar({
    observedAt: new Date(userInput.date),
    facing: { degrees: userInput.degrees },
    config: { applyTiGua: true },
  });
  
  return result;
} catch (error) {
  console.error('替卦排盘失败:', error);
  
  // 降级：不启用替卦重试
  return generateFlyingStar({
    observedAt: new Date(userInput.date),
    facing: { degrees: userInput.degrees },
    config: { applyTiGua: false },
  });
}
```

### 7.3 日志记录

```typescript
const result = generateFlyingStar({
  observedAt,
  facing,
  config: { applyTiGua: true },
});

if (result.meta.rulesApplied.includes('TiGua')) {
  logger.info('替卦生效', {
    period: result.period,
    facing: facing.degrees,
    timestamp: Date.now(),
  });
}
```

---

## 八、延伸阅读

### 8.1 相关文档

- [技术规格说明](./SPEC_tigua_jianxiang_v1.md)
- [实现总结](./IMPL_tigua_jianxiang_summary_v1.md)
- [测试报告](./TEST_tigua_simple_summary.md)
- [审计报告](./XUANKONG_AUDIT_REPORT_v1.md)

### 8.2 玄空飞星经典文献

1. **《沈氏玄空学》** - 沈竹礽
   - 替卦理论的奠基之作
2. **《玄空本义》** - 温明远
   - 现代玄空飞星标准教材
3. **《玄空风水精解》** - 钟义明
   - 港台主流替卦表

---

## 九、版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2025-11-12 | 初版发布，包含简单替卦与增强替卦对比 |

---

## 十、反馈与支持

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 邮件反馈
- 技术支持

---

**文档作者**: AI Assistant  
**审核状态**: 待审核  
**维护周期**: 每季度更新
