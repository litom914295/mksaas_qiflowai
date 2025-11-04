# 玄空飞星 API 完整文档

版本: v1.0.0  
更新日期: 2025-10-04

## 目录

1. [概述](#概述)
2. [核心功能](#核心功能)
3. [快速开始](#快速开始)
4. [API 参考](#api-参考)
5. [高级功能](#高级功能)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

---

## 概述

玄空飞星风水分析系统是一个专业、完整的风水分析引擎,集成了传统玄空飞星理论与现代AI技术,提供从基础分析到高级预测的全方位服务。

### 主要特性

- ✅ **基础飞星分析** - 精确的九宫飞星计算和格局判断
- ✅ **流年动态分析** - 年月日时飞星的叠加和运势预测
- ✅ **个性化分析** - 结合用户八字的定制化风水建议
- ✅ **智能推荐系统** - AI驱动的空间布局和调整建议
- ✅ **替卦分析** - 正替和旁替的自动识别和优化
- ✅ **零正理论** - 精确的零神正神位置和环境布局
- ✅ **城门诀** - 催旺财丁运的秘法分析
- ✅ **综合分析引擎** - 一站式完整分析服务

---

## 核心功能

### 1. 基础飞星分析

```typescript
import { generateFlyingStar } from '@/lib/qiflow/xuankong';

const result = generateFlyingStar({
  observedAt: new Date('2024-06-01'),
  facing: { degrees: 135 }, // 坐向角度
  config: {
    applyTiGua: false,
    applyFanGua: false,
    evaluationProfile: 'standard'
  }
});

console.log(result.period); // 当前运: 9
console.log(result.geju); // 格局分析
console.log(result.evaluation); // 各宫位评价
```

### 2. 综合分析引擎

```typescript
import { comprehensiveAnalysis } from '@/lib/qiflow/xuankong/comprehensive-engine';

const analysis = await comprehensiveAnalysis({
  observedAt: new Date(),
  facing: { degrees: 180 },
  
  // 启用所有高级功能
  includeLiunian: true,
  includePersonalization: true,
  includeTiguaAnalysis: true,
  includeLingzheng: true,
  includeChengmenjue: true,
  includeTimeSelection: true,
  
  // 用户个性化信息
  userProfile: {
    birthYear: 1985,
    birthMonth: 3,
    birthDay: 15,
    gender: 'male',
    occupation: '软件工程师',
    livingHabits: {
      workFromHome: true,
      frequentTraveling: false,
      hasChildren: true,
      elderlyLiving: false,
      petsOwner: false
    },
    familyStatus: 'married',
    financialGoals: 'growth'
  },
  
  // 环境信息
  environmentInfo: {
    waterPositions: [1, 4], // 坎宫和巽宫有水
    mountainPositions: [6, 8] // 乾宫和艮宫有山
  },
  
  // 时间相关
  targetYear: 2025,
  targetMonth: 3,
  eventType: 'business'
});

// 获取综合评分和建议
console.log(analysis.overallAssessment);
// {
//   score: 78,
//   rating: 'good',
//   strengths: ['形成旺山旺水等有利格局', ...],
//   weaknesses: ['有2项紧急问题需要处理'],
//   topPriorities: ['立即处理紧急风水问题', ...],
//   longTermPlan: ['持续关注流年变化，适时调整', ...]
// }
```

### 3. 流年分析

```typescript
import { analyzeLiunianOverlay } from '@/lib/qiflow/xuankong/liunian-analysis';

const liunianResult = analyzeLiunianOverlay(
  basePlate,
  2025, // 目标年份
  3,    // 目标月份(可选)
  {
    includeMonthly: true,
    focusOnHealth: true,
    focusOnWealth: true
  }
);

console.log(liunianResult.yearlyTrends);
// {
//   overallLuck: 'excellent',
//   healthTrend: 'stable',
//   wealthTrend: 'growing',
//   careerTrend: 'advancing',
//   keyMonths: [...]
// }
```

### 4. 个性化分析

```typescript
import { personalizedFlyingStarAnalysis } from '@/lib/qiflow/xuankong/personalized-analysis';

const personalResult = personalizedFlyingStarAnalysis(
  basePlate,
  userProfile,
  zuo,
  xiang,
  period
);

// 房间功能推荐
console.log(personalResult.roomRecommendations);

// 事业增强建议
console.log(personalResult.careerEnhancement);

// 健康养生建议
console.log(personalResult.healthAndWellness);
```

### 5. 智能推荐系统

```typescript
import { 
  generateSmartRecommendations,
  getUrgentRecommendations,
  getTodayRecommendations 
} from '@/lib/qiflow/xuankong/smart-recommendations';

const recommendations = generateSmartRecommendations(
  basePlate,
  period,
  wenchangwei,
  caiwei
);

// 获取紧急建议
const urgent = getUrgentRecommendations(recommendations);

// 获取今日建议
const today = getTodayRecommendations(recommendations);

// 按类别筛选
const healthRecs = recommendations.filter(r => r.category === 'health');
const wealthRecs = recommendations.filter(r => r.category === 'wealth');
```

### 6. 替卦分析

```typescript
import { intelligentTiguaJudgment } from '@/lib/qiflow/xuankong/enhanced-tigua';

const tiguaResult = intelligentTiguaJudgment(
  zuo,
  xiang,
  period,
  mountainStar,
  facingStar,
  {
    considerPersonalBazi: true,
    userBirthYear: 1985,
    buildingType: 'residential',
    prioritizeStability: true
  }
);

if (tiguaResult.recommendedRule) {
  console.log('推荐替卦:', tiguaResult.recommendedRule.description);
  console.log('理由:', tiguaResult.personalizedRecommendation.reasoning);
}
```

### 7. 零正理论

```typescript
import { analyzeLingzheng } from '@/lib/qiflow/xuankong/lingzheng';

const lingzhengResult = analyzeLingzheng(
  basePlate,
  period,
  zuo,
  xiang,
  {
    waterPositions: [1, 4],
    mountainPositions: [6, 8]
  }
);

// 水的布局建议
console.log(lingzhengResult.waterPlacement);

// 山的布局建议
console.log(lingzhengResult.mountainPlacement);

// 是否零正颠倒
if (lingzhengResult.isZeroPositiveReversed) {
  console.log('警告: 存在零正颠倒现象');
}
```

### 8. 城门诀

```typescript
import { analyzeChengmenjue } from '@/lib/qiflow/xuankong/chengmenjue';

const chengmenResult = analyzeChengmenjue(
  basePlate,
  period,
  zuo,
  xiang
);

if (chengmenResult.hasChengmen) {
  console.log('城门位置:', chengmenResult.chengmenPositions);
  console.log('催旺方法:', chengmenResult.activationMethods);
  console.log('禁忌事项:', chengmenResult.taboos);
}
```

---

## API 参考

### 类型定义

#### FlyingStar
```typescript
type FlyingStar = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
```

#### Mountain (二十四山)
```typescript
type Mountain = 
  | '子' | '癸' | '丑' | '艮' | '寅' | '甲' 
  | '卯' | '乙' | '辰' | '巽' | '巳' | '丙' 
  | '午' | '丁' | '未' | '坤' | '申' | '庚' 
  | '酉' | '辛' | '戌' | '乾' | '亥' | '壬';
```

#### Yun (三元九运)
```typescript
type Yun = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
```

#### PalaceIndex (宫位索引)
```typescript
type PalaceIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
```

#### Plate (飞星盘)
```typescript
interface PlateCell {
  palace: PalaceIndex;
  mountainStar: FlyingStar;
  facingStar: FlyingStar;
  periodStar?: FlyingStar;
}

type Plate = PlateCell[];
```

#### UserProfile (用户档案)
```typescript
interface UserProfile {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  gender: 'male' | 'female';
  occupation: string;
  livingHabits: {
    workFromHome: boolean;
    frequentTraveling: boolean;
    hasChildren: boolean;
    elderlyLiving: boolean;
    petsOwner: boolean;
  };
  healthConcerns?: string[];
  careerGoals?: string[];
  familyStatus: 'single' | 'married' | 'divorced' | 'widowed';
  financialGoals?: 'stability' | 'growth' | 'investment' | 'retirement';
}
```

### 主要函数

#### generateFlyingStar
```typescript
function generateFlyingStar(
  input: GenerateFlyingStarInput
): GenerateFlyingStarOutput
```

**参数:**
- `observedAt: Date` - 观测时间
- `facing: { degrees: number }` - 朝向角度
- `location?: { lat: number; lon: number }` - 地理位置(可选)
- `config?: Partial<FlyingStarConfig>` - 配置选项

**返回:**
- `period: Yun` - 当前运
- `plates: StackedPlates` - 飞星盘(期、年、月、日)
- `evaluation: Record<PalaceIndex, Evaluation>` - 各宫位评价
- `meta: { rulesApplied: string[]; ambiguous: boolean }` - 元数据
- `geju?: GejuAnalysis` - 格局分析
- `wenchangwei?: string` - 文昌位
- `caiwei?: string` - 财位

#### comprehensiveAnalysis
```typescript
async function comprehensiveAnalysis(
  options: ComprehensiveAnalysisOptions
): Promise<ComprehensiveAnalysisResult>
```

**参数:** 见 `ComprehensiveAnalysisOptions` 接口

**返回:** 见 `ComprehensiveAnalysisResult` 接口

#### analyzeLiunianOverlay
```typescript
function analyzeLiunianOverlay(
  basePlate: Plate,
  year: number,
  month?: number,
  options?: LiunianOptions
): LiunianOverlayResult
```

#### personalizedFlyingStarAnalysis
```typescript
function personalizedFlyingStarAnalysis(
  plate: Plate,
  userProfile: UserProfile,
  zuo: Mountain,
  xiang: Mountain,
  period: Yun
): PersonalizedAnalysisResult
```

---

## 高级功能

### 1. 流年择吉

```typescript
import { analyzeTimeSelection } from '@/lib/qiflow/xuankong/liunian-analysis';

const timeResult = analyzeTimeSelection(
  basePlate,
  2025,
  'business', // 事件类型: moving | renovation | business | marriage | investment
  {
    preferredMonths: [3, 6, 9], // 偏好月份
    avoidMonths: [7], // 避免月份
    urgency: 'medium'
  }
);

console.log('推荐时期:', timeResult.recommendedPeriods);
console.log('避免时期:', timeResult.avoidPeriods);
```

### 2. 大运交替分析

```typescript
import { analyzeDayunTransition } from '@/lib/qiflow/xuankong/liunian-analysis';

const transitionResult = analyzeDayunTransition(
  2025,
  basePlate,
  zuo,
  xiang
);

console.log('当前运:', transitionResult.currentPeriod);
console.log('下一运:', transitionResult.nextPeriod);
console.log('过渡年份:', transitionResult.transitionYear);
console.log('影响程度:', transitionResult.impactLevel);
```

### 3. 星曜力量计算

```typescript
import { calculateStarPower } from '@/lib/qiflow/xuankong/enhanced-aixing';

const power = calculateStarPower(
  8, // 八白星
  9, // 九运
  1, // 坎宫
  '子', // 子山
  false, // 是否兼向
  0 // 兼向度数
);

console.log('基础力量:', power.basePower);
console.log('时间力量:', power.timePower);
console.log('空间力量:', power.spacePower);
console.log('综合力量:', power.totalPower);
console.log('当前状态:', power.status); // 旺|生|退|煞|死
```

### 4. 格局专项分析

```typescript
import { analyzeGeju } from '@/lib/qiflow/xuankong/geju';

const gejuResult = analyzeGeju(
  mergedPlate,
  zuo,
  xiang,
  period,
  isJian
);

console.log('格局类型:', gejuResult.types);
console.log('是否有利:', gejuResult.isFavorable);
console.log('详细描述:', gejuResult.descriptions);
```

---

## 最佳实践

### 1. 错误处理

```typescript
try {
  const result = generateFlyingStar({
    observedAt: new Date(),
    facing: { degrees: 135 }
  });
  
  // 检查是否有模糊性警告
  if (result.meta.ambiguous) {
    console.warn('警告: 结果存在模糊性，建议核实输入数据');
  }
  
} catch (error) {
  console.error('飞星计算失败:', error);
  // 处理错误...
}
```

### 2. 性能优化

```typescript
// 缓存基础分析结果
const cacheKey = `${observedAt.getTime()}_${facing.degrees}`;
let cachedResult = cache.get(cacheKey);

if (!cachedResult) {
  cachedResult = generateFlyingStar({ observedAt, facing });
  cache.set(cacheKey, cachedResult, { ttl: 3600 }); // 缓存1小时
}

// 异步处理大量计算
const analysis = await comprehensiveAnalysis({
  observedAt,
  facing,
  includeLiunian: true,
  includePersonalization: true
  // 其他选项...
});
```

### 3. 数据验证

```typescript
import { z } from 'zod';

const userProfileSchema = z.object({
  birthYear: z.number().min(1900).max(2100),
  birthMonth: z.number().min(1).max(12),
  birthDay: z.number().min(1).max(31),
  gender: z.enum(['male', 'female']),
  // 其他字段...
});

// 验证用户输入
const validatedProfile = userProfileSchema.parse(userInput);

const analysis = await comprehensiveAnalysis({
  observedAt: new Date(),
  facing: { degrees: 180 },
  userProfile: validatedProfile
});
```

### 4. 渐进式分析

```typescript
// 第一步: 基础分析
const basicResult = generateFlyingStar({
  observedAt: new Date(),
  facing: { degrees: 135 }
});

// 第二步: 根据基础结果决定是否进行深度分析
if (basicResult.geju?.isFavorable === false) {
  // 格局不利,进行替卦分析
  const tiguaResult = intelligentTiguaJudgment(
    zuo, xiang, period,
    mountainStar, facingStar
  );
}

// 第三步: 如果用户提供了个人信息,进行个性化分析
if (userProfile) {
  const personalResult = personalizedFlyingStarAnalysis(
    basePlate, userProfile, zuo, xiang, period
  );
}
```

---

## 常见问题

### Q1: 如何确定准确的坐向角度?

A: 使用指南针或手机罗盘应用,在房屋中心位置测量朝向。注意:
- 避免金属物体干扰
- 多次测量取平均值
- 考虑磁偏角修正(如需要)

### Q2: 什么时候应该使用替卦?

A: 以下情况建议考虑替卦:
- 五运期间的子午卯酉正向
- 出现伏吟或反吟格局
- 山向星组合严重不利
- 系统推荐替卦且置信度高

### Q3: 流年分析的准确性如何?

A: 流年分析基于传统玄空飞星理论,准确性取决于:
- 基础飞星盘的准确性
- 用户提供的环境信息完整性
- 个人命理信息的准确性

建议每年立春后重新进行分析。

### Q4: 如何处理多个相互冲突的建议?

A: 优先级排序:
1. 紧急安全问题(如五黄二黑位置)
2. 零正理论的基本原则
3. 格局优化建议
4. 个性化调整建议

### Q5: 分析结果的有效期是多久?

A: 不同层级的有效期:
- 基础飞星盘: 20年(一个元运)
- 流年分析: 1年
- 流月分析: 1个月
- 流日分析: 1天

建议至少每年更新一次完整分析。

### Q6: 如何解读综合评分?

A: 评分范围和等级:
- 80-100分: excellent - 格局优秀,无需大调整
- 60-79分: good - 格局良好,可作适当优化
- 40-59分: fair - 格局平平,建议调整
- 0-39分: poor - 格局不利,需要较大调整

---

## 示例代码集

### 完整分析流程

```typescript
import { 
  comprehensiveAnalysis,
  type ComprehensiveAnalysisOptions 
} from '@/lib/qiflow/xuankong/comprehensive-engine';

async function performFullAnalysis() {
  const options: ComprehensiveAnalysisOptions = {
    // 基础信息
    observedAt: new Date(),
    facing: { degrees: 180 },
    location: { lat: 39.9042, lon: 116.4074 }, // 北京
    
    // 启用所有高级功能
    includeLiunian: true,
    includePersonalization: true,
    includeTiguaAnalysis: true,
    includeLingzheng: true,
    includeChengmenjue: true,
    includeTimeSelection: true,
    
    // 用户信息
    userProfile: {
      birthYear: 1985,
      birthMonth: 3,
      birthDay: 15,
      gender: 'male',
      occupation: '企业管理',
      livingHabits: {
        workFromHome: false,
        frequentTraveling: true,
        hasChildren: true,
        elderlyLiving: true,
        petsOwner: false
      },
      healthConcerns: ['心脏', '血压'],
      careerGoals: ['晋升', '创业'],
      familyStatus: 'married',
      financialGoals: 'growth'
    },
    
    // 环境信息
    environmentInfo: {
      waterPositions: [1, 4],
      mountainPositions: [6, 8],
      description: '北面有湖,西北有山'
    },
    
    // 时间相关
    targetYear: 2025,
    targetMonth: 3,
    eventType: 'business',
    
    // 配置
    config: {
      applyTiGua: false,
      evaluationProfile: 'standard',
      prioritizeStability: false
    }
  };
  
  // 执行分析
  const result = await comprehensiveAnalysis(options);
  
  // 输出结果
  console.log('=== 综合评估 ===');
  console.log(`综合评分: ${result.overallAssessment.score}`);
  console.log(`评级: ${result.overallAssessment.rating}`);
  console.log('\n优势:');
  result.overallAssessment.strengths.forEach(s => console.log(`- ${s}`));
  console.log('\n劣势:');
  result.overallAssessment.weaknesses.forEach(w => console.log(`- ${w}`));
  console.log('\n优先事项:');
  result.overallAssessment.topPriorities.forEach(p => console.log(`- ${p}`));
  
  console.log('\n=== 紧急建议 ===');
  result.smartRecommendations.urgent.forEach(rec => {
    console.log(`[${rec.type}] ${rec.title}`);
    console.log(`  ${rec.description}`);
    console.log(`  行动: ${rec.actions.join(', ')}`);
  });
  
  console.log('\n=== 流年趋势 ===');
  if (result.liunianAnalysis) {
    console.log(`整体运势: ${result.liunianAnalysis.yearlyTrends.overallLuck}`);
    console.log(`财运趋势: ${result.liunianAnalysis.yearlyTrends.wealthTrend}`);
    console.log(`事业趋势: ${result.liunianAnalysis.yearlyTrends.careerTrend}`);
  }
  
  console.log('\n=== 个性化建议 ===');
  if (result.personalizedAnalysis) {
    console.log('最佳工作区域:', 
      result.personalizedAnalysis.careerEnhancement.bestWorkArea);
    console.log('最佳休息区域:', 
      result.personalizedAnalysis.healthAndWellness.restArea);
  }
  
  console.log(`\n分析耗时: ${result.metadata.computationTime}ms`);
  console.log(`分析深度: ${result.metadata.analysisDepth}`);
  
  return result;
}

// 执行分析
performFullAnalysis().then(result => {
  // 可以将结果保存到数据库或返回给前端
  console.log('分析完成!');
}).catch(error => {
  console.error('分析失败:', error);
});
```

---

## 版本历史

### v1.0.0 (2025-10-04)
- ✅ 初始发布
- ✅ 完整的基础飞星分析功能
- ✅ 流年动态分析
- ✅ 个性化分析系统
- ✅ 智能推荐引擎
- ✅ 替卦分析
- ✅ 零正理论
- ✅ 城门诀
- ✅ 综合分析引擎

---

## 技术支持

如有问题或建议,请联系技术支持团队或提交 Issue。

**注意事项:**
- 本系统分析结果仅供参考,不构成专业建议
- 重要决策建议咨询专业风水师
- 定期更新分析数据以保持准确性

---

*文档由 QiFlow AI 团队维护*
