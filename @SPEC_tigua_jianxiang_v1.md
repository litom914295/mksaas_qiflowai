# 玄空飞星：替卦与兼向技术规格 v1.0

**文档版本**: 1.0  
**编写日期**: 2025-11-12  
**目标**: 完成替卦（替星）与兼向逻辑的正确性与可配置化  
**状态**: ✅ 已实现（简单替卦）

**实现进度**：
- ✅ 简单替卦（对宫星法）- 已完成
- ✅ 伏吟自动检测 - 已完成
- ✅ 配置开关 `applyTiGua` - 已完成
- ✅ 单元测试（28个用例）- 已完成
- ✅ JSDoc 文档 - 已完成
- ✅ 使用指南 - 已完成
- ⏳ 兼向影响飞星 - 待实现（P2优先级）
- ⏳ 旁替规则 - 待实现（增强替卦中）

**相关文档**：
- 实现总结：[@IMPL_tigua_jianxiang_summary_v1.md](./IMPL_tigua_jianxiang_summary_v1.md)
- 测试报告：[@TEST_tigua_simple_summary.md](./TEST_tigua_simple_summary.md)
- 使用指南：[@GUIDE_tigua_usage_v1.md](./GUIDE_tigua_usage_v1.md)

---

## 一、概述

### 1.1 背景

玄空飞星排盘中，**替卦**（替星）与**兼向**是两个影响飞星起始点和排盘结果的关键因素：

- **兼向（Jianxiang）**: 当坐向角度在山与山的交界处时（3度范围内），需要考虑两个相邻山的影响
- **替卦（Tigua）**: 某些特殊坐向组合下，需要调整飞星的起始星曜，以应对特殊格局（如伏吟、反吟）

### 1.2 当前问题

**兼向实现**：
- ✅ 已在 `location.ts` 中实现角度判断
- ✅ 可正确识别 `isJian`、`jianzuo`、`jianxiang`
- ⚠️ 但在 `luoshu.ts` 的 `generateShanpan` 和 `generateXiangpan` 中未充分利用

**替卦实现**：
- ❌ `luoshu.ts:156` 和 `luoshu.ts:206` 仅有占位代码
- ❌ 无替卦规则表
- ❌ 无测试覆盖

### 1.3 设计目标

1. **完整性**：实现替卦全部规则（正替、旁替）
2. **正确性**：通过标准案例验证
3. **可配置**：通过 `config.applyTiGua` 控制是否启用
4. **可测试**：提供完整测试用例
5. **文档化**：清晰的算法说明与使用指南

---

## 二、兼向（Jianxiang）技术规格

### 2.1 定义

**兼向**：罗盘定向时，坐山或向山的角度落在相邻两山的交界区域（通常为左右各3度，共6度），需要同时考虑两个山的影响。

### 2.2 兼向判断规则

每个山占15度，中心9度为"正向"，两侧各3度为"兼向"。

**示例**：子山午向（0°中线）
- **正向范围**: 355.5° - 4.5°（9度）
- **兼癸丁范围**: 355.5° - 360° / 0° - 4.5°（左兼）
- **兼壬丙范围**: 0° - 4.5°（右兼）

### 2.3 现有实现评估

**location.ts 实现**（第 260-336 行）：

```typescript
export function analyzeLocation(
  degrees: number,
  toleranceDeg = 0.5
): LocationResult {
  // ✅ 正确识别主山
  const zuo = range.mountain;
  const xiang = MOUNTAIN_PAIRS[zuo];
  
  // ✅ 正确判断是否兼向
  if (normalized >= range.centerLeft) {
    jianzuo = getAdjacentMountain(zuo, 'left');
    jianxiang = MOUNTAIN_PAIRS[jianzuo];
    isJian = true;
  }
  
  // ✅ 返回完整信息
  return { zuo, xiang, jianzuo, jianxiang, isJian, ambiguous };
}
```

**结论**: ✅ `location.ts` 实现完整，无需修改。

### 2.4 兼向对飞星排盘的影响

**关键问题**：当 `isJian = true` 时，应该如何影响山盘/向盘的飞星起始点？

#### 方案 A：不影响飞星起始点（当前实现）

```typescript
// 当前代码（luoshu.ts:156）
if (isJian) {
  shanStar = shanStar; // 保持原样
}
```

**优点**：
- 简单
- 符合部分流派观点（兼向仅作风水评价参考，不改变飞星）

**缺点**：
- 未体现兼向的实际影响
- 无法处理兼向导致的特殊格局

#### 方案 B：调整飞星起始点（推荐）

```typescript
if (isJian && location.jianzuo) {
  // 计算兼向比例（简化：按3度线性）
  const jianRatio = calculateJianRatio(degrees, zuo, jianzuo);
  
  // 如果兼向比例 > 50%，使用兼山的飞星作为起始点
  if (jianRatio > 0.5) {
    const jianPalace = getPalaceByMountain(jianzuo);
    const jianCell = tianpan.find(c => c.palace === jianPalace);
    shanStar = jianCell?.periodStar || shanStar;
  }
}
```

**优点**：
- 真实反映兼向的物理影响
- 可通过配置 `config.applyJianxiang` 控制

**缺点**：
- 增加复杂度
- 需要更多测试验证

#### 方案 C：混合方案（折中）

```typescript
if (isJian && config.applyJianxiang) {
  // 只在特殊格局（如伏吟、反吟）时才调整
  const originalPattern = detectPattern(shanStar, ...);
  if (isUnfavorablePattern(originalPattern)) {
    // 尝试使用兼山的飞星
    const jianStar = getJianStar(jianzuo);
    const jianPattern = detectPattern(jianStar, ...);
    if (isBetterPattern(jianPattern, originalPattern)) {
      shanStar = jianStar;
    }
  }
}
```

**优点**：
- 兼顾准确性与实用性
- 只在有明确改善时才调整

**缺点**：
- 需要定义"不利格局"和"更好格局"的规则

### 2.5 推荐实现方案

**采用方案 B（可配置调整）**，理由：
1. 真实反映兼向的物理影响
2. 通过配置保持向后兼容
3. 便于未来优化

**实现步骤**：
1. 新增 `config.applyJianxiang: boolean`（默认 `false`）
2. 新增 `calculateJianRatio(degrees, mainMountain, jianMountain): number`
3. 修改 `generateShanpan` 和 `generateXiangpan`
4. 添加测试用例

---

## 三、替卦（Tigua）技术规格

### 3.1 定义

**替卦**（替星）是玄空飞星中针对特殊坐向格局的调整机制。当某些坐向组合会导致**伏吟**或**反吟**等不利格局时，通过"替卦"调整飞星起始点，以化解不利影响。

### 3.2 伏吟与反吟

#### 伏吟（Fuyin）

**定义**：运盘（天盘）的飞星与山盘/向盘的飞星完全一致。

**示例**：八运（8入中宫），坐坤向艮
- 天盘：8入中宫
- 坤宫（2宫）天盘飞星为 2
- 山盘从坤宫起飞，起始星为 2
- 结果：山盘与天盘完全一致 → **伏吟**

**风水寓意**：
- 停滞、重复、无突破
- 不利于发展

#### 反吟（Fanyin）

**定义**：运盘（天盘）的飞星与山盘/向盘的飞星呈对宫关系（1-9, 2-8, 3-7, 4-6对应）。

**示例**：八运，坐艮向坤
- 天盘：8入中宫
- 艮宫（8宫）天盘飞星为 8
- 山盘从艮宫起飞，起始星为 8
- 但艮属阴卦，逆飞，导致各宫飞星与天盘对宫相冲 → **反吟**

**风水寓意**：
- 冲突、变动、不稳定
- 需要化解

### 3.3 替卦规则表

替卦规则因流派而异，以下采用**港台主流替卦表**（沈氏玄空为基础）：

#### 正替表（正神替）

当山盘或向盘会造成伏吟时，使用**对宫星**替代：

| 运 | 坐山八卦 | 原飞星 | 替卦后飞星 | 说明 |
|----|---------|-------|-----------|------|
| 1运 | 坎（1宫） | 1 | 9 | 1-9对宫 |
| 2运 | 坤（2宫） | 2 | 8 | 2-8对宫 |
| 3运 | 震（3宫） | 3 | 7 | 3-7对宫 |
| 4运 | 巽（4宫） | 4 | 6 | 4-6对宫 |
| 5运 | 中（5宫） | 5 | 5 | 无替（特殊） |
| 6运 | 乾（6宫） | 6 | 4 | 6-4对宫 |
| 7运 | 兑（7宫） | 7 | 3 | 7-3对宫 |
| 8运 | 艮（8宫） | 8 | 2 | 8-2对宫 |
| 9运 | 离（9宫） | 9 | 1 | 9-1对宫 |

**触发条件**：
```typescript
function needsTigua(period: FlyingStar, palace: PalaceIndex): boolean {
  // 当天盘的运星与宫位的本宫星相同时，需要替卦
  const benGongStar = palace as FlyingStar;
  const tianpanStar = getTianpanStar(period, palace);
  return tianpanStar === benGongStar;
}
```

#### 旁替表（零神替 / 城门替）

某些特殊坐向组合需要使用**旁替**而非正替，规则更复杂，常见组合：

| 坐向组合 | 原起始星 | 替卦后飞星 | 说明 |
|---------|---------|-----------|------|
| 一运 子山午向 | 1 | 9 | 城门诀触发 |
| 二运 未山丑向 | 2 | 8 | 零正互换 |
| 三运 卯山酉向 | 3 | 7 | 标准正替 |
| 八运 艮山坤向 | 8 | 2 | 标准正替 |

**注意**：旁替规则因流派差异较大，本规格暂不实现，作为 P2 优先级。

### 3.4 替卦算法实现

#### 核心函数：对宫星转换

```typescript
/**
 * 获取飞星的对宫星（1-9, 2-8, 3-7, 4-6, 5-5）
 */
export function getOppositeS Star(star: FlyingStar): FlyingStar {
  const oppositeMap: Record<FlyingStar, FlyingStar> = {
    1: 9, 2: 8, 3: 7, 4: 6, 5: 5,
    6: 4, 7: 3, 8: 2, 9: 1,
  };
  return oppositeMap[star];
}
```

#### 判断是否需要替卦

```typescript
/**
 * 判断是否需要进行替卦
 * @param period 当前运（1-9）
 * @param palace 坐山或向山所在宫位
 * @param tianpan 天盘（运盘）
 * @returns 是否需要替卦
 */
export function shouldApplyTigua(
  period: FlyingStar,
  palace: PalaceIndex,
  tianpan: Plate
): boolean {
  // 获取该宫位的天盘飞星
  const tianpanCell = tianpan.find(c => c.palace === palace);
  if (!tianpanCell) return false;
  
  const tianpanStar = tianpanCell.periodStar!;
  
  // 判断是否会造成伏吟：天盘星 === 本宫星
  // 本宫星等于宫位数（1宫本宫星为1，2宫为2，以此类推）
  const benGongStar = palace as FlyingStar;
  
  return tianpanStar === benGongStar;
}
```

#### 应用替卦

```typescript
/**
 * 应用替卦规则调整飞星
 * @param originalStar 原始飞星
 * @param period 当前运
 * @param palace 宫位
 * @param tianpan 天盘
 * @param config 配置
 * @returns 调整后的飞星
 */
export function applyTiguaIfNeeded(
  originalStar: FlyingStar,
  period: FlyingStar,
  palace: PalaceIndex,
  tianpan: Plate,
  config: FlyingStarConfig
): FlyingStar {
  // 如果未启用替卦，直接返回原星
  if (!config.applyTiGua) {
    return originalStar;
  }
  
  // 判断是否需要替卦
  if (shouldApplyTigua(period, palace, tianpan)) {
    // 返回对宫星
    return getOppositeStar(originalStar);
  }
  
  return originalStar;
}
```

### 3.5 修改 `generateShanpan` 和 `generateXiangpan`

**修改前**（luoshu.ts:152-156）：
```typescript
// 替卦处理
if (isJian) {
  shanStar = shanStar; // 暂时保持原样
}
```

**修改后**：
```typescript
// 兼向处理（如果启用）
if (isJian && config.applyJianxiang && location.jianzuo) {
  const jianRatio = calculateJianRatio(degrees, zuo, location.jianzuo);
  if (jianRatio > 0.5) {
    const jianPalace = getPalaceByMountain(location.jianzuo);
    const jianCell = tianpan.find(c => c.palace === jianPalace);
    shanStar = jianCell?.periodStar || shanStar;
  }
}

// 替卦处理（如果启用）
shanStar = applyTiguaIfNeeded(shanStar, period, zuoPalace, tianpan, config);
```

同样的逻辑应用到 `generateXiangpan`（luoshu.ts:203-207）。

---

## 四、测试策略

### 4.1 测试用例分类

#### 兼向测试用例

| 用例ID | 坐向 | 角度 | isJian | jianzuo | 预期山盘起始星 |
|--------|------|------|--------|---------|--------------|
| J01 | 子山午向 | 0° | false | - | 按子山正常飞 |
| J02 | 子山午向 | 356° | true | 癸 | 如启用兼向，考虑癸 |
| J03 | 子山午向 | 4° | true | 壬 | 如启用兼向，考虑壬 |
| J04 | 卯山酉向 | 90° | false | - | 按卯山正常飞 |
| J05 | 卯山酉向 | 87° | true | 甲 | 如启用兼向，考虑甲 |

#### 替卦测试用例

| 用例ID | 运 | 坐向 | 原起始星 | 预期替卦后 | 说明 |
|--------|---|------|---------|-----------|------|
| T01 | 1运 | 子山午向 | 1 | 9 | 坎宫伏吟，正替 |
| T02 | 2运 | 坤山艮向 | 2 | 8 | 坤宫伏吟，正替 |
| T03 | 3运 | 卯山酉向 | 3 | 7 | 震宫伏吟，正替 |
| T04 | 8运 | 艮山坤向 | 8 | 2 | 艮宫伏吟，正替 |
| T05 | 8运 | 子山午向 | 8 | 8 | 非伏吟，不替 |

#### 综合测试用例

| 用例ID | 运 | 坐向 | 角度 | isJian | 替卦 | 预期结果 |
|--------|---|------|------|--------|------|---------|
| C01 | 8运 | 艮山坤向 | 45° | false | 启用 | 替卦生效 |
| C02 | 8运 | 艮山坤向 | 43° | true(兼寅) | 启用 | 兼向+替卦 |
| C03 | 1运 | 子山午向 | 0° | false | 禁用 | 正常排盘 |

### 4.2 测试覆盖目标

- **单元测试**：
  - `getOppositeStar()` - 100%
  - `shouldApplyTigua()` - 100%
  - `applyTiguaIfNeeded()` - 100%
  - `calculateJianRatio()` - 100%

- **集成测试**：
  - `generateShanpan()` 覆盖 替卦 + 兼向 组合
  - `generateXiangpan()` 覆盖 替卦 + 兼向 组合
  - `generateFlyingStar()` 端到端测试

- **回归测试**：
  - 使用 `xuankong_cases.json` 中的测试数据
  - 确保现有测试全部通过

---

## 五、实现计划

### 5.1 里程碑

**阶段 1：核心函数实现**（1天）
- [ ] 实现 `getOppositeStar()`
- [ ] 实现 `shouldApplyTigua()`
- [ ] 实现 `applyTiguaIfNeeded()`
- [ ] 实现 `calculateJianRatio()`
- [ ] 单元测试

**阶段 2：集成到主流程**（1天）
- [ ] 修改 `generateShanpan()` 应用替卦
- [ ] 修改 `generateXiangpan()` 应用替卦
- [ ] 修改配置类型 `FlyingStarConfig` 添加 `applyJianxiang`
- [ ] 集成测试

**阶段 3：验证与文档**（0.5天）
- [ ] 使用标准案例验证
- [ ] 更新 API 文档
- [ ] 更新 CHANGELOG

### 5.2 文件清单

**新增文件**：
- `src/lib/qiflow/xuankong/tigua.ts` - 替卦核心函数
- `src/lib/qiflow/xuankong/jianxiang.ts` - 兼向辅助函数
- `src/lib/qiflow/xuankong/__tests__/tigua.test.ts` - 替卦测试
- `src/lib/qiflow/xuankong/__tests__/jianxiang.test.ts` - 兼向测试

**修改文件**：
- `src/lib/qiflow/xuankong/luoshu.ts` - 应用替卦与兼向
- `src/lib/qiflow/xuankong/types.ts` - 添加 `applyJianxiang` 配置
- `src/lib/qiflow/xuankong/index.ts` - 导出新函数
- `mksaas/datasets/xuankong_cases.json` - 添加测试用例

---

## 六、风险与缓解

### 6.1 风险识别

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|-------|------|---------|
| 替卦规则流派差异 | 高 | 中 | 采用主流规则，文档标注流派 |
| 兼向比例计算不准 | 中 | 低 | 简化为 50% 阈值，可配置 |
| 破坏现有功能 | 低 | 高 | 默认禁用，回归测试 |
| 性能退化 | 低 | 低 | 基准测试验证 |

### 6.2 向后兼容

**默认行为**：
- `applyTiGua: false`（默认不启用替卦）
- `applyJianxiang: false`（默认不启用兼向影响）

**迁移路径**：
- 用户可通过配置逐步启用
- 文档说明启用后的行为变化

---

## 七、参考资料

### 7.1 玄空飞星经典文献

1. **《沈氏玄空学》** - 沈竹礽
   - 替卦理论的奠基之作
   - 正替、旁替的详细规则

2. **《玄空本义》** - 温明远
   - 现代玄空飞星标准教材
   - 替卦应用案例

3. **《玄空风水精解》** - 钟义明
   - 港台主流替卦表
   - 实战案例分析

### 7.2 在线资源

- 维基百科：玄空风水
- 港台玄空学会标准教材
- 实战案例对照表

---

## 八、验收标准

### 8.1 功能验收

- [ ] 替卦正确识别伏吟格局
- [ ] 替卦正确应用对宫星规则
- [ ] 兼向正确计算影响比例
- [ ] 配置项正确控制启用/禁用
- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 回归测试全部通过

### 8.2 文档验收

- [ ] API 文档更新
- [ ] 使用示例完整
- [ ] 规则说明清晰
- [ ] 流派差异标注
- [ ] CHANGELOG 记录

### 8.3 性能验收

- [ ] 替卦计算耗时 < 1ms
- [ ] 兼向计算耗时 < 1ms
- [ ] 对整体排盘性能影响 < 5%

---

## 九、附录

### 9.1 术语表

| 术语 | 拼音 | 英文 | 说明 |
|------|------|------|------|
| 替卦 | Tìguà | Replacement Trigram | 调整飞星起始点的机制 |
| 兼向 | Jiānxiàng | Mixed Direction | 坐向在两山交界处 |
| 伏吟 | Fúyīn | Repetition | 飞星与运星完全相同 |
| 反吟 | Fǎnyīn | Reversal | 飞星与运星呈对宫关系 |
| 对宫星 | Duìgōngxīng | Opposite Star | 1-9, 2-8, 3-7, 4-6 |
| 正替 | Zhèngtì | Primary Replacement | 标准替卦规则 |
| 旁替 | Pángtì | Secondary Replacement | 特殊情况替卦 |

### 9.2 代码示例

#### 使用替卦功能

```typescript
import { generateFlyingStar } from '@/lib/qiflow/xuankong';

const result = generateFlyingStar({
  observedAt: new Date('2024-01-01'),
  facing: { degrees: 45 }, // 艮山坤向
  config: {
    applyTiGua: true, // 启用替卦
    applyJianxiang: false, // 不启用兼向影响
  },
});

console.log(result.meta.rulesApplied); // ['TiGua']
```

#### 使用兼向功能

```typescript
const result = generateFlyingStar({
  observedAt: new Date('2024-01-01'),
  facing: { degrees: 43 }, // 艮山坤向兼寅申
  config: {
    applyTiGua: false,
    applyJianxiang: true, // 启用兼向影响
  },
});

console.log(result.meta.rulesApplied); // ['兼向']
```

---

**文档状态**: 待 Code Review  
**下一步**: 开始阶段 1 实现  
**负责人**: AI Assistant  
**审核人**: 待定
