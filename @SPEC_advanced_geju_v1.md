# 玄空飞星高级格局技术规范 v1.0

## 文档信息

- **创建时间**: 2025-01-XX
- **项目**: mksaas_qiflowai 玄空飞星系统优化
- **阶段**: Week 3 - 高级格局完成
- **目标**: 实现七星打劫、完善零正颠倒、完善城门诀

---

## 1. 当前实现状态评估

### 1.1 已实现模块

#### 1.1.1 零正理论 (lingzheng.ts - 508行)

**实现状态**: ✅ **已完整实现**

**功能清单**:
- ✅ 三元九运零正神对照表 (`LINGZHENG_PERIOD_TABLE`)
- ✅ 零正神位置识别 (`analyzeLingzhengPositions`)
- ✅ 零正颠倒检查 (`checkZeroPositiveReversed`)
- ✅ 环境布局建议 (`generateLingzhengRecommendations`)
- ✅ 时运变化分析 (`analyzeLingzhengTimeChange`)
- ✅ 完整的零正分析 (`analyzeLingzheng`)
- ✅ 实用原则导出 (`LINGZHENG_PRINCIPLES`)

**代码质量**:
- 类型定义完整 (`LingzhengAnalysis`, `LingzhengPeriodInfo`)
- 函数结构清晰，职责分离良好
- 支持环境信息输入（水位、山位）
- 提供完整的建议和警告系统

**需要完善的部分**:
1. ⚠️ **测试覆盖不足** - 需要创建完整的单元测试
2. 📝 **文档不足** - 函数缺少JSDoc注释
3. 🔍 **边缘案例** - 需要验证特殊运（如五运）的处理

---

#### 1.1.2 城门诀 (chengmenjue.ts - 624行)

**实现状态**: ✅ **基本完整实现，需要增强**

**功能清单**:
- ✅ 城门诀规则表 (`CHENGMEN_RULES`)
- ✅ 城门位置识别 (`identifyChengmenPositions`)
- ✅ 特殊组合检查 (`checkSpecialChengmenCombinations`)
  - ✅ 三般卦城门 (`checkSanbanChengmen`)
  - ⚠️ 七星打劫城门 (`checkQixingDajieChengmen`) - **简化实现**
  - ✅ 合十城门 (`checkHeshiChengmen`)
- ✅ 催旺方法生成 (`generateChengmenActivationMethods`)
- ✅ 禁忌事项生成 (`generateChengmenTaboos`)
- ✅ 完整的城门诀分析 (`analyzeChengmenjue`)
- ✅ 时效性分析 (`analyzeChengmenTimeline`)
- ✅ 实用原则导出 (`CHENGMEN_PRINCIPLES`)

**七星打劫城门的简化实现 (367-384行)**:
```typescript
function checkQixingDajieChengmen(plate: Plate, period: Yun): PalaceIndex[] {
  const qixingPositions: PalaceIndex[] = []
  
  // 七星打劫的特殊条件
  for (const cell of plate) {
    // 简化的七星打劫判断：山向星与运星形成特殊组合
    if (cell.mountainStar && cell.facingStar) {
      const sum = Number(cell.mountainStar) + Number(cell.facingStar)
      if (
        sum === 10 &&
        (cell.mountainStar === period || cell.facingStar === period)
      ) {
        qixingPositions.push(cell.palace)
      }
    }
  }
  
  return qixingPositions
}
```

**问题**: 
- ❌ 判断过于简化，缺乏七星打劫的核心规则
- ❌ 没有考虑三元龙的配置
- ❌ 没有验证父母三般卦条件
- ❌ 没有检查劫财、劫丁的具体条件

**需要完善的部分**:
1. 🔴 **七星打劫城门需要重写** - 需要符合正统七星打劫理论
2. ⚠️ **测试覆盖不足** - 需要创建完整的单元测试
3. 📝 **文档不足** - 函数缺少JSDoc注释

---

#### 1.1.3 格局检测 (geju.ts - 425行)

**实现状态**: ⚠️ **基础实现完成，缺少七星打劫**

**功能清单**:
- ✅ 旺山旺水 (`checkWangshanWangshui`)
- ✅ 上山下水 (`checkShangshanXiashui`)
- ✅ 双星会向/会坐 (`checkShuangxingHuixiang/Huizuo`)
- ✅ 全局合十 (`checkQuanjuHeshi`)
- ✅ 对宫合十 (`checkDuigongHeshi`)
- ✅ 连珠三般 (`checkLianzhuSanban`)
- ✅ 父母三般 (`checkFumuSanban`)
- ✅ 伏吟反吟检测 (`checkFuyin`, `checkFanyin`)
- ✅ 综合格局分析 (`analyzeGeju`)
- ❌ **七星打劫格局检测** - 完全缺失

**GejuType定义中包含的格局**:
```typescript
export type GejuType =
  | '旺山旺水'
  | '上山下水'
  | '双星会坐'
  | '双星会向'
  | '全局合十'
  | '对宫合十'
  | '连珠三般'
  | '父母三般'
  | '离宫打劫'
  | '坎宫打劫'
  | '山星伏吟'
  | '向星伏吟'
  | '单宫伏吟'
  | '单宫反吟'
  | '替卦反伏吟'
  | '七星打劫'      // ⚠️ 定义存在但未实现
  | '三般卦'
  | '零正颠倒'
  | '城门诀';
```

**需要完善的部分**:
1. 🔴 **新增七星打劫格局检测函数** - `checkQixingDajie`
2. 🔴 **在analyzeGeju中集成七星打劫检测**
3. ⚠️ **测试覆盖不足**

---

### 1.2 缺失模块

#### 1.2.1 七星打劫独立模块 (qixing-dajie.ts)

**实现状态**: 🔴 **完全缺失**

**需要实现的内容**:

1. **类型定义**
   ```typescript
   // 七星打劫类型
   export type QixingDajieType = 'jie_cai' | 'jie_ding' | 'full'
   
   // 七星打劫分析结果
   export interface QixingDajieAnalysis {
     isQixingDajie: boolean
     dajieType: QixingDajieType | null
     dajiePositions: PalaceIndex[]
     sanbanGuaValidation: {
       isValid: boolean
       group: number[] // 1,4,7 或 2,5,8 或 3,6,9
     }
     effectiveness: 'peak' | 'high' | 'medium' | 'low'
     description: string
     activationRequirements: string[]
     taboos: string[]
     score: number
   }
   ```

2. **核心函数**
   - `checkQixingDajie(plate, period, zuo, xiang)` - 七星打劫格局检测
   - `identifyDajiePositions(plate, period)` - 识别打劫位置
   - `validateSanbanGua(plate, period)` - 验证三般卦条件
   - `analyzeDajieEffectiveness(plate, period, positions)` - 分析打劫有效性
   - `generateDajieRecommendations(analysis)` - 生成打劫催旺建议

3. **七星打劫理论核心**

**传统七星打劫定义**:
> 七星打劫是玄空飞星中的一种特殊催旺格局，主要通过在特定宫位"打劫"旺气来催旺财运或丁运。

**成格条件** (需全部满足):
1. **三元龙配置**: 坐山与向山必须属于同一卦（父母三般卦）
2. **三般卦关系**: 运星、山星、向星之间形成1-4-7、2-5-8或3-6-9的三般卦关系
3. **生旺星到位**: 当运星或生旺星飞临特定宫位
4. **水龙配合**: 需要在打劫位有真实的水或动态元素配合

**七星打劫的类型**:
1. **劫财** (`jie_cai`): 向星飞到特定位置，配合水法催旺财运
2. **劫丁** (`jie_ding`): 山星飞到特定位置，配合山法催旺人丁
3. **全劫** (`full`): 同时满足劫财和劫丁条件

**打劫位置判断**:
```
三般卦组:
- 1-4-7组: 坎宫(1)、巽宫(4)、兑宫(7)
- 2-5-8组: 坤宫(2)、中宫(5)、艮宫(8)
- 3-6-9组: 震宫(3)、乾宫(6)、离宫(9)

打劫路径示例 (八运):
- 八运属2-5-8组
- 若山向星形成2-5-8配置，可在此组宫位打劫
- 具体打劫位需要结合飞星到位情况
```

**与城门诀的关系**:
- 七星打劫是城门诀的高级形式
- 七星打劫格局的城门威力更强
- 需要更严格的配置条件

---

## 2. Week 3 实施计划

### 2.1 任务分解

#### 任务1: 创建七星打劫独立模块 (优先级P0)

**文件**: `src/lib/qiflow/xuankong/qixing-dajie.ts`

**预计工作量**: 4-6小时

**实现步骤**:
1. 创建类型定义
2. 实现三般卦验证函数
3. 实现打劫位置识别函数
4. 实现七星打劫主检测函数
5. 实现有效性评分函数
6. 实现建议生成函数
7. 添加JSDoc注释

**验收标准**:
- ✅ 所有函数有完整的类型定义
- ✅ 所有函数有JSDoc注释
- ✅ 通过三般卦组的验证测试
- ✅ 通过打劫位置识别测试
- ✅ 通过典型案例的完整检测测试

---

#### 任务2: 完善城门诀中的七星打劫城门 (优先级P0)

**文件**: `src/lib/qiflow/xuankong/chengmenjue.ts`

**预计工作量**: 2-3小时

**实现步骤**:
1. 重写 `checkQixingDajieChengmen` 函数
2. 集成 `qixing-dajie.ts` 模块
3. 更新规则表，添加七星打劫城门规则
4. 更新 `analyzeChengmenjue` 函数

**修改内容**:
```typescript
// 旧实现 (简化版，需要替换)
function checkQixingDajieChengmen(plate: Plate, period: Yun): PalaceIndex[]

// 新实现 (完整版)
function checkQixingDajieChengmen(
  plate: Plate, 
  period: Yun,
  zuo: Mountain,
  xiang: Mountain
): {
  positions: PalaceIndex[]
  dajieType: QixingDajieType
  effectiveness: 'peak' | 'high' | 'medium' | 'low'
  description: string
}
```

**验收标准**:
- ✅ 函数正确调用七星打劫模块
- ✅ 返回完整的打劫城门分析
- ✅ 集成到城门诀分析主流程

---

#### 任务3: 在geju.ts中添加七星打劫格局检测 (优先级P0)

**文件**: `src/lib/qiflow/xuankong/geju.ts`

**预计工作量**: 2小时

**实现步骤**:
1. 创建 `checkQixingDajie` 函数
2. 在 `analyzeGeju` 中集成七星打劫检测
3. 更新格局描述和吉凶判断

**新增代码**:
```typescript
// 检查七星打劫格局
export function checkQixingDajie(
  plate: Plate,
  zuo: Mountain,
  xiang: Mountain,
  period: Yun
): { isMatch: boolean; description: string } {
  // 调用qixing-dajie.ts的检测函数
  const analysis = checkQixingDajiePattern(plate, period, zuo, xiang)
  
  if (analysis.isQixingDajie) {
    return {
      isMatch: true,
      description: `七星打劫格局（${analysis.dajieType === 'jie_cai' ? '劫财' : analysis.dajieType === 'jie_ding' ? '劫丁' : '全劫'}）`
    }
  }
  
  return { isMatch: false, description: '非七星打劫格局' }
}
```

**验收标准**:
- ✅ 函数正确检测七星打劫格局
- ✅ 集成到综合格局分析
- ✅ 格局类型正确添加到结果中

---

#### 任务4: 完善零正理论测试和文档 (优先级P1)

**文件**: 
- `src/lib/qiflow/xuankong/__tests__/lingzheng.test.ts` (新建)
- `@GUIDE_lingzheng_usage_v1.md` (新建)

**预计工作量**: 3-4小时

**测试用例设计**:
1. 零正神位置识别测试（每运3个案例）
2. 零正颠倒检测测试（正常、轻度、严重颠倒）
3. 环境布局建议生成测试
4. 时运变化分析测试
5. 边缘案例测试（五运特殊处理）

**文档内容**:
1. 零正理论基本原理
2. 函数使用示例
3. 常见问题和解决方案
4. 布局建议指南

**验收标准**:
- ✅ 测试覆盖率≥90%
- ✅ 所有测试通过
- ✅ 文档完整清晰

---

#### 任务5: 完善城门诀测试和文档 (优先级P1)

**文件**: 
- `src/lib/qiflow/xuankong/__tests__/chengmenjue.test.ts` (新建)
- `@GUIDE_chengmenjue_usage_v1.md` (新建)

**预计工作量**: 3-4小时

**测试用例设计**:
1. 城门位置识别测试（八运、九运各5个案例）
2. 特殊组合检测测试（三般卦、合十、七星打劫）
3. 催旺方法生成测试
4. 禁忌事项生成测试
5. 时效性分析测试

**文档内容**:
1. 城门诀基本原理
2. 函数使用示例
3. 催旺方法详解
4. 实战案例分析

**验收标准**:
- ✅ 测试覆盖率≥90%
- ✅ 所有测试通过
- ✅ 文档完整清晰

---

#### 任务6: 七星打劫完整测试和文档 (优先级P0)

**文件**: 
- `src/lib/qiflow/xuankong/__tests__/qixing-dajie.test.ts` (新建)
- `@GUIDE_qixing_dajie_usage_v1.md` (新建)

**预计工作量**: 4-5小时

**测试用例设计**:
1. 三般卦验证测试（每组5个案例）
2. 打劫位置识别测试
3. 劫财/劫丁/全劫类型判断测试
4. 有效性评分测试
5. 建议生成测试
6. 与城门诀集成测试

**文档内容**:
1. 七星打劫理论详解
2. 成格条件说明
3. 函数使用示例
4. 典型案例分析
5. 常见误区和注意事项

**验收标准**:
- ✅ 测试覆盖率≥95%
- ✅ 所有测试通过
- ✅ 文档完整清晰，包含理论说明

---

#### 任务7: 创建Week 3完成总结文档 (优先级P2)

**文件**: `@WEEK3_COMPLETION_SUMMARY.md`

**预计工作量**: 1-2小时

**内容结构**:
1. Week 3目标回顾
2. 实施过程记录
3. 完成的功能清单
4. 测试覆盖情况
5. 文档产出列表
6. 代码变更统计
7. 遗留问题和改进建议
8. Week 4规划预览

---

### 2.2 时间规划

**总预计工作量**: 19-27小时

**建议排期**:
- Day 1-2: 任务1 (七星打劫模块) + 任务2 (城门诀完善)
- Day 3: 任务3 (格局检测集成) + 任务6前半部分 (七星打劫测试)
- Day 4: 任务6后半部分 (七星打劫文档) + 任务4 (零正测试文档)
- Day 5: 任务5 (城门诀测试文档) + 任务7 (完成总结)

---

## 3. 技术细节和算法

### 3.1 七星打劫完整判断算法

```typescript
/**
 * 七星打劫格局完整判断算法
 * 
 * @param plate - 飞星盘
 * @param period - 当前元运
 * @param zuo - 坐山
 * @param xiang - 向山
 * @returns 七星打劫分析结果
 */
export function checkQixingDajiePattern(
  plate: Plate,
  period: Yun,
  zuo: Mountain,
  xiang: Mountain
): QixingDajieAnalysis {
  // 步骤1: 验证三般卦条件
  const sanbanValidation = validateSanbanGua(plate, period)
  if (!sanbanValidation.isValid) {
    return {
      isQixingDajie: false,
      dajieType: null,
      dajiePositions: [],
      sanbanGuaValidation: sanbanValidation,
      effectiveness: 'low',
      description: '不满足三般卦条件',
      activationRequirements: [],
      taboos: [],
      score: 0
    }
  }
  
  // 步骤2: 根据当运确定三般卦组
  const sanbanGroup = getSanbanGroupByPeriod(period)
  // 1-4-7组, 2-5-8组, 或 3-6-9组
  
  // 步骤3: 识别打劫位置
  const dajiePositions: PalaceIndex[] = []
  let jiecaiPosition: PalaceIndex | null = null
  let jiedingPosition: PalaceIndex | null = null
  
  for (const palaceIndex of sanbanGroup) {
    const cell = plate.find(c => c.palace === palaceIndex)
    if (!cell) continue
    
    // 检查劫财条件: 向星为当运星或生旺星
    if (cell.facingStar === period || isShengwangStar(cell.facingStar, period)) {
      jiecaiPosition = palaceIndex
      dajiePositions.push(palaceIndex)
    }
    
    // 检查劫丁条件: 山星为当运星或生旺星
    if (cell.mountainStar === period || isShengwangStar(cell.mountainStar, period)) {
      jiedingPosition = palaceIndex
      if (!dajiePositions.includes(palaceIndex)) {
        dajiePositions.push(palaceIndex)
      }
    }
  }
  
  // 步骤4: 判断打劫类型
  let dajieType: QixingDajieType | null = null
  if (jiecaiPosition && jiedingPosition) {
    dajieType = 'full'
  } else if (jiecaiPosition) {
    dajieType = 'jie_cai'
  } else if (jiedingPosition) {
    dajieType = 'jie_ding'
  }
  
  const isQixingDajie = dajiePositions.length > 0
  
  // 步骤5: 评估有效性
  const effectiveness = analyzeDajieEffectiveness(
    plate,
    period,
    dajiePositions,
    sanbanValidation
  )
  
  // 步骤6: 生成描述和建议
  const description = generateDajieDescription(dajieType, effectiveness, dajiePositions)
  const activationRequirements = generateDajieActivationRequirements(dajieType, dajiePositions)
  const taboos = generateDajieTaboos(dajiePositions)
  
  // 步骤7: 计算评分
  const score = calculateDajieScore(effectiveness, sanbanValidation, dajieType)
  
  return {
    isQixingDajie,
    dajieType,
    dajiePositions,
    sanbanGuaValidation: sanbanValidation,
    effectiveness,
    description,
    activationRequirements,
    taboos,
    score
  }
}
```

---

### 3.2 三般卦验证算法

```typescript
/**
 * 验证三般卦条件
 * 
 * 三般卦定义:
 * - 1-4-7组 (父母三般卦)
 * - 2-5-8组 (父母三般卦)
 * - 3-6-9组 (父母三般卦)
 * 
 * @param plate - 飞星盘
 * @param period - 当前元运
 * @returns 三般卦验证结果
 */
export function validateSanbanGua(
  plate: Plate,
  period: Yun
): {
  isValid: boolean
  group: number[]
  matchCount: number
  details: string[]
} {
  const sanbanGroups = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9]
  ]
  
  // 确定当运所属的三般卦组
  let targetGroup: number[] = []
  for (const group of sanbanGroups) {
    if (group.includes(period)) {
      targetGroup = group
      break
    }
  }
  
  // 统计三般卦组中的星在盘中的出现情况
  let matchCount = 0
  const details: string[] = []
  
  for (const cell of plate) {
    const stars = [cell.periodStar, cell.mountainStar, cell.facingStar].filter(Boolean) as FlyingStar[]
    
    for (const star of stars) {
      if (targetGroup.includes(star)) {
        matchCount++
        const bagua = PALACE_TO_BAGUA[cell.palace]
        details.push(`${bagua}宫含三般卦星${star}`)
      }
    }
  }
  
  // 三般卦有效条件: 至少有6个位置（三分之二的九宫格）包含三般卦组的星
  const isValid = matchCount >= 6
  
  return {
    isValid,
    group: targetGroup,
    matchCount,
    details
  }
}
```

---

### 3.3 打劫有效性评估算法

```typescript
/**
 * 评估七星打劫的有效性
 * 
 * 评估因素:
 * 1. 三般卦匹配度 (40%)
 * 2. 当运星到位情况 (30%)
 * 3. 生旺星配合情况 (20%)
 * 4. 环境配合程度 (10%)
 * 
 * @param plate - 飞星盘
 * @param period - 当前元运
 * @param positions - 打劫位置列表
 * @param sanbanValidation - 三般卦验证结果
 * @returns 有效性等级
 */
export function analyzeDajieEffectiveness(
  plate: Plate,
  period: Yun,
  positions: PalaceIndex[],
  sanbanValidation: { isValid: boolean; matchCount: number }
): 'peak' | 'high' | 'medium' | 'low' {
  let score = 0
  
  // 因素1: 三般卦匹配度 (0-40分)
  const sanbanScore = (sanbanValidation.matchCount / 9) * 40
  score += sanbanScore
  
  // 因素2: 当运星到位情况 (0-30分)
  let periodStarCount = 0
  for (const pos of positions) {
    const cell = plate.find(c => c.palace === pos)
    if (cell) {
      if (cell.periodStar === period) periodStarCount++
      if (cell.mountainStar === period) periodStarCount++
      if (cell.facingStar === period) periodStarCount++
    }
  }
  const periodScore = (periodStarCount / (positions.length * 3)) * 30
  score += periodScore
  
  // 因素3: 生旺星配合情况 (0-20分)
  let shengwangCount = 0
  for (const pos of positions) {
    const cell = plate.find(c => c.palace === pos)
    if (cell) {
      if (isShengwangStar(cell.mountainStar, period)) shengwangCount++
      if (isShengwangStar(cell.facingStar, period)) shengwangCount++
    }
  }
  const shengwangScore = (shengwangCount / (positions.length * 2)) * 20
  score += shengwangScore
  
  // 因素4: 环境配合程度 (基础给10分，后续可根据实际环境调整)
  score += 10
  
  // 根据总分确定等级
  if (score >= 85) return 'peak'
  if (score >= 70) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

/**
 * 判断是否为生旺星
 * 
 * @param star - 飞星
 * @param period - 当运
 * @returns 是否为生旺星
 */
function isShengwangStar(star: FlyingStar, period: Yun): boolean {
  // 生旺星: 当运星 或 当运星±1 (环形循环)
  if (star === period) return true
  
  const nextStar = (period % 9) + 1 as Yun
  const prevStar = (period === 1 ? 9 : period - 1) as Yun
  
  return star === nextStar || star === prevStar
}
```

---

### 3.4 三般卦组确定

```typescript
/**
 * 根据当运确定三般卦组
 * 
 * @param period - 当运
 * @returns 三般卦组 [1,4,7] | [2,5,8] | [3,6,9]
 */
export function getSanbanGroupByPeriod(period: Yun): PalaceIndex[] {
  const groups: Record<number, PalaceIndex[]> = {
    1: [1, 4, 7], 4: [1, 4, 7], 7: [1, 4, 7],
    2: [2, 5, 8], 5: [2, 5, 8], 8: [2, 5, 8],
    3: [3, 6, 9], 6: [3, 6, 9], 9: [3, 6, 9]
  }
  
  return groups[period] || []
}
```

---

## 4. 测试策略

### 4.1 测试覆盖目标

- **七星打劫模块**: ≥95% (核心功能)
- **零正理论模块**: ≥90%
- **城门诀模块**: ≥90%
- **格局检测模块**: ≥85%

---

### 4.2 测试案例设计原则

1. **典型案例**: 每种格局至少3个典型案例
2. **边缘案例**: 每种格局至少2个边缘案例
3. **负面案例**: 每种格局至少2个不成格的案例
4. **集成测试**: 多种格局同时存在的综合案例

---

### 4.3 七星打劫测试案例设计

#### 测试组1: 三般卦验证 (15个案例)

```typescript
describe('三般卦验证', () => {
  describe('1-4-7组', () => {
    test('一运典型案例 - 满足三般卦', () => {})
    test('四运典型案例 - 满足三般卦', () => {})
    test('七运典型案例 - 满足三般卦', () => {})
    test('边缘案例 - 恰好满足三般卦 (6个匹配)', () => {})
    test('负面案例 - 不满足三般卦 (5个匹配)', () => {})
  })
  
  describe('2-5-8组', () => {
    test('二运典型案例', () => {})
    test('五运典型案例', () => {})
    test('八运典型案例', () => {})
    test('边缘案例', () => {})
    test('负面案例', () => {})
  })
  
  describe('3-6-9组', () => {
    test('三运典型案例', () => {})
    test('六运典型案例', () => {})
    test('九运典型案例', () => {})
    test('边缘案例', () => {})
    test('负面案例', () => {})
  })
})
```

#### 测试组2: 打劫类型判断 (12个案例)

```typescript
describe('打劫类型判断', () => {
  test('劫财格局 - 向星当运', () => {})
  test('劫财格局 - 向星生旺', () => {})
  test('劫丁格局 - 山星当运', () => {})
  test('劫丁格局 - 山星生旺', () => {})
  test('全劫格局 - 同时满足劫财劫丁', () => {})
  test('全劫格局 - 多个宫位打劫', () => {})
  test('边缘案例 - 仅一个位置劫财', () => {})
  test('边缘案例 - 仅一个位置劫丁', () => {})
  test('负面案例 - 有三般卦但无打劫位', () => {})
  test('负面案例 - 星到位但非三般卦组', () => {})
  test('负面案例 - 完全不成格', () => {})
  test('特殊案例 - 五运中宫打劫', () => {})
})
```

#### 测试组3: 有效性评估 (8个案例)

```typescript
describe('打劫有效性评估', () => {
  test('Peak级 - 三般卦完美+当运星全到位', () => {})
  test('High级 - 三般卦良好+大部分当运星到位', () => {})
  test('Medium级 - 三般卦及格+部分当运星到位', () => {})
  test('Low级 - 勉强满足条件', () => {})
  test('边缘案例 - Peak与High临界值', () => {})
  test('边缘案例 - High与Medium临界值', () => {})
  test('边缘案例 - Medium与Low临界值', () => {})
  test('特殊案例 - 生旺星加成影响', () => {})
})
```

#### 测试组4: 建议生成 (6个案例)

```typescript
describe('打劫建议生成', () => {
  test('劫财建议 - 水法配置', () => {})
  test('劫丁建议 - 山法配置', () => {})
  test('全劫建议 - 综合配置', () => {})
  test('禁忌生成 - 劫财位禁忌', () => {})
  test('禁忌生成 - 劫丁位禁忌', () => {})
  test('特殊运建议 - 五运中宫', () => {})
})
```

#### 测试组5: 集成测试 (5个案例)

```typescript
describe('七星打劫集成测试', () => {
  test('与城门诀集成 - 七星打劫城门', () => {})
  test('与格局检测集成 - 综合格局分析', () => {})
  test('完整案例 - 八运子山午向七星打劫', () => {})
  test('完整案例 - 九运卯山酉向七星打劫', () => {})
  test('性能测试 - 1000次打劫检测<100ms', () => {})
})
```

**总计**: 46个测试案例

---

### 4.4 零正理论测试案例设计

#### 测试组1: 零正神识别 (27个案例)

```typescript
describe('零正神位置识别', () => {
  // 每运3个案例 × 9运 = 27个案例
  for (let period = 1; period <= 9; period++) {
    describe(`${period}运零正神`, () => {
      test(`典型案例1 - 零正神清晰`, () => {})
      test(`典型案例2 - 多宫位零神`, () => {})
      test(`边缘案例 - 零正神重叠`, () => {})
    })
  }
})
```

#### 测试组2: 零正颠倒检测 (12个案例)

```typescript
describe('零正颠倒检测', () => {
  test('正常布局 - 零神见水正神见山', () => {})
  test('正常布局 - 零正各守其位', () => {})
  test('轻微颠倒 - 零神见山', () => {})
  test('轻微颠倒 - 正神见水', () => {})
  test('严重颠倒 - 零神全见山', () => {})
  test('严重颠倒 - 正神全见水', () => {})
  test('极严重颠倒 - 零正完全相反', () => {})
  test('边缘案例 - 部分颠倒', () => {})
  test('边缘案例 - 缺乏环境信息', () => {})
  test('特殊案例 - 五运零神为二黑', () => {})
  test('特殊案例 - 五运正神为五黄', () => {})
  test('负面案例 - 无颠倒', () => {})
})
```

#### 测试组3: 布局建议生成 (6个案例)

```typescript
describe('零正布局建议', () => {
  test('水位建议 - 零神位宜水', () => {})
  test('山位建议 - 正神位宜山', () => {})
  test('综合建议 - 零正配合', () => {})
  test('特殊运建议 - 五运化解', () => {})
  test('边缘案例 - 零正位重叠', () => {})
  test('边缘案例 - 缺少明确零正位', () => {})
})
```

#### 测试组4: 时运变化分析 (6个案例)

```typescript
describe('零正时运变化', () => {
  test('八运转九运 - 零正变化分析', () => {})
  test('七运转八运 - 风险评估', () => {})
  test('六运转七运 - 过渡建议', () => {})
  test('边缘案例 - 同组内换运 (1转4)', () => {})
  test('边缘案例 - 跨组换运 (8转9)', () => {})
  test('特殊案例 - 五运转六运', () => {})
})
```

**总计**: 51个测试案例

---

### 4.5 城门诀测试案例设计

#### 测试组1: 城门位置识别 (20个案例)

```typescript
describe('城门位置识别', () => {
  describe('八运城门', () => {
    test('财门 - 向星到乾宫', () => {})
    test('丁门 - 山星到巽宫', () => {})
    test('贵门 - 一八组合兑宫', () => {})
    test('综合案例 - 多个城门并存', () => {})
    test('边缘案例 - 强度临界值', () => {})
  })
  
  describe('九运城门', () => {
    test('财门 - 向星到坎宫', () => {})
    test('丁门 - 山星到震宫', () => {})
    test('综合案例 - 九运多城门', () => {})
    test('边缘案例 - 九运城门强度', () => {})
    test('负面案例 - 不成城门', () => {})
  })
  
  describe('七运城门 (历史)', () => {
    test('财门 - 向星到震宫', () => {})
    test('综合案例', () => {})
  })
  
  describe('其他各运', () => {
    // 一至六运各2个案例
    test('一运案例', () => {})
    test('二运案例', () => {})
    test('三运案例', () => {})
    test('四运案例', () => {})
    test('五运案例', () => {})
    test('六运案例', () => {})
  })
})
```

#### 测试组2: 特殊组合检测 (15个案例)

```typescript
describe('城门特殊组合', () => {
  describe('三般卦城门', () => {
    test('1-4-7组三般卦城门', () => {})
    test('2-5-8组三般卦城门', () => {})
    test('3-6-9组三般卦城门', () => {})
    test('边缘案例 - 部分三般卦', () => {})
    test('负面案例 - 非三般卦', () => {})
  })
  
  describe('七星打劫城门', () => {
    test('八运七星打劫城门', () => {})
    test('九运七星打劫城门', () => {})
    test('边缘案例 - 弱七星打劫', () => {})
    test('负面案例 - 不成七星打劫', () => {})
  })
  
  describe('合十城门', () => {
    test('山向合十城门', () => {})
    test('多宫合十城门', () => {})
    test('边缘案例 - 单宫合十', () => {})
  })
  
  describe('综合案例', () => {
    test('多种特殊组合并存', () => {})
    test('特殊组合冲突', () => {})
    test('负面案例 - 无特殊组合', () => {})
  })
})
```

#### 测试组3: 催旺和禁忌生成 (8个案例)

```typescript
describe('城门催旺和禁忌', () => {
  test('财门催旺方法', () => {})
  test('丁门催旺方法', () => {})
  test('贵门催旺方法', () => {})
  test('禄门催旺方法', () => {})
  test('八卦方位禁忌 - 乾宫', () => {})
  test('八卦方位禁忌 - 坤宫', () => {})
  test('八卦方位禁忌 - 巽宫', () => {})
  test('综合禁忌 - 多宫位', () => {})
})
```

#### 测试组4: 时效性分析 (6个案例)

```typescript
describe('城门时效性', () => {
  test('运前期 - Peak效果', () => {})
  test('运中期 - Good效果', () => {})
  test('运后期 - Declining效果', () => {})
  test('过运 - Ineffective效果', () => {})
  test('边缘案例 - 临界时间点', () => {})
  test('特殊案例 - 五运城门', () => {})
})
```

**总计**: 49个测试案例

---

## 5. 文档产出清单

### 5.1 技术文档

1. **@SPEC_advanced_geju_v1.md** (本文档)
   - 高级格局技术规范
   - 算法详解
   - 实施计划

2. **@IMPL_qixing_dajie_summary_v1.md**
   - 七星打劫实现总结
   - 代码结构说明
   - 关键决策记录

3. **@TEST_advanced_geju_summary.md**
   - 高级格局测试报告
   - 测试覆盖率统计
   - 测试案例汇总

---

### 5.2 用户指南

1. **@GUIDE_qixing_dajie_usage_v1.md**
   - 七星打劫理论详解
   - 函数使用示例
   - 典型案例分析
   - 常见误区和注意事项

2. **@GUIDE_lingzheng_usage_v1.md**
   - 零正理论基本原理
   - 函数使用示例
   - 布局建议指南
   - 常见问题解答

3. **@GUIDE_chengmenjue_usage_v1.md**
   - 城门诀基本原理
   - 函数使用示例
   - 催旺方法详解
   - 实战案例分析

---

### 5.3 总结文档

1. **@WEEK3_COMPLETION_SUMMARY.md**
   - Week 3目标回顾
   - 实施过程记录
   - 完成功能清单
   - 测试和文档产出
   - 遗留问题和改进建议

---

## 6. 验收标准

### 6.1 代码质量标准

- ✅ 所有新增函数有完整的TypeScript类型定义
- ✅ 所有公开函数有JSDoc注释
- ✅ 代码符合项目代码风格规范
- ✅ 无TypeScript编译错误
- ✅ 无ESLint警告（允许合理的disable注释）

---

### 6.2 功能完整性标准

- ✅ 七星打劫独立模块完全实现
- ✅ 城门诀中的七星打劫城门检测完善
- ✅ 格局检测中集成七星打劫
- ✅ 零正理论无遗漏功能
- ✅ 城门诀无遗漏功能

---

### 6.3 测试覆盖标准

- ✅ 七星打劫模块测试覆盖率≥95%
- ✅ 零正理论模块测试覆盖率≥90%
- ✅ 城门诀模块测试覆盖率≥90%
- ✅ 所有测试通过
- ✅ 性能测试达标（七星打劫检测<10ms/次）

---

### 6.4 文档完整性标准

- ✅ 技术规范文档完整
- ✅ 实现总结文档完整
- ✅ 用户指南文档完整（3份）
- ✅ 测试报告完整
- ✅ Week 3完成总结完整

---

## 7. 风险和应对

### 7.1 技术风险

**风险1**: 七星打劫理论复杂，可能理解不准确

**应对**:
- 参考多个权威资料源
- 实现多种判断模式，从简单到复杂
- 提供配置选项，允许用户选择判断严格程度

**风险2**: 性能问题，复杂判断可能导致计算缓慢

**应对**:
- 优先实现基础功能，确保正确性
- 后续进行性能优化
- 添加性能测试，监控计算时间

---

### 7.2 时间风险

**风险**: 预计工作量可能不足，实际耗时超出预期

**应对**:
- 优先级排序，确保P0任务完成
- P1、P2任务可以延后到Week 4
- 保持灵活性，根据实际进度调整

---

### 7.3 质量风险

**风险**: 测试不充分，可能存在隐藏bug

**应对**:
- 测试优先，编写测试用例与实现代码并行
- 增加边缘案例和负面案例测试
- 代码审查，确保逻辑正确

---

## 8. Week 4 预览

Week 3完成后，Week 4将专注于:

1. **类型系统强化** (C.5)
   - 完善类型定义
   - 增强类型安全

2. **测试系统增强** (C.6)
   - 扩展测试覆盖
   - 集成测试增强

3. **性能评估和优化** (C.7)
   - 性能基准测试
   - 识别性能瓶颈
   - 优化关键路径

---

## 附录A: 参考资料

### A.1 七星打劫理论参考

1. 玄空飞星风水经典理论
2. 三元九运体系
3. 父母三般卦理论
4. 城门诀与七星打劫关系

### A.2 零正理论参考

1. 零神正神基本概念
2. 三元九运零正神对照
3. 零正颠倒化解方法

### A.3 城门诀理论参考

1. 城门诀起源和发展
2. 城门诀实战应用
3. 城门诀与其他格局的配合

---

## 附录B: 代码文件结构

```
src/lib/qiflow/xuankong/
├── types.ts                    # 类型定义（已有，需扩展）
├── luoshu.ts                   # 洛书核心算法（已有）
├── geju.ts                     # 格局检测（已有，需扩展）
├── lingzheng.ts                # 零正理论（已有，需完善测试文档）
├── chengmenjue.ts              # 城门诀（已有，需完善七星打劫部分）
├── qixing-dajie.ts             # 七星打劫（新增）✨
├── __tests__/
│   ├── qixing-dajie.test.ts    # 七星打劫测试（新增）✨
│   ├── lingzheng.test.ts       # 零正理论测试（新增）✨
│   ├── chengmenjue.test.ts     # 城门诀测试（新增）✨
│   └── ...

文档目录/
├── @SPEC_advanced_geju_v1.md              # 本文档
├── @IMPL_qixing_dajie_summary_v1.md       # 七星打劫实现总结（待创建）
├── @GUIDE_qixing_dajie_usage_v1.md        # 七星打劫用户指南（待创建）
├── @GUIDE_lingzheng_usage_v1.md           # 零正理论用户指南（待创建）
├── @GUIDE_chengmenjue_usage_v1.md         # 城门诀用户指南（待创建）
├── @TEST_advanced_geju_summary.md         # 高级格局测试报告（待创建）
└── @WEEK3_COMPLETION_SUMMARY.md           # Week 3完成总结（待创建）
```

---

## 版本历史

- **v1.0** (2025-01-XX): 初始版本，定义Week 3实施计划和技术规范

---

**文档结束**
