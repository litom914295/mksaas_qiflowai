# 八字命理模块改造 - 产品需求文档 (PRD)
版本：v2.0.0
日期：2025-01-11
状态：待实施

## 一、项目概述

### 1.1 背景
当前八字命理系统存在致命缺陷，核心算法完全错误，无法提供准确的命理分析。需要彻底重构以达到专业级水准。

### 1.2 目标
- **核心目标**：打造业界最精准的八字命理分析系统
- **用户价值**：提供准确到令专业命理师认可的分析结果
- **商业价值**：成为市场上最可信赖的在线命理服务平台

### 1.3 成功标准
1. 八字计算准确率达到 99.9%
2. 专业命理师测评满意度 > 95%
3. 用户复购率提升 300%
4. 分析深度覆盖传统命理学 90% 以上知识点

## 二、核心需求

### 2.1 算法准确性需求

#### 2.1.1 四柱八字计算
**必须实现：**
- [ ] 精确的干支纪年算法（考虑立春节气）
- [ ] 准确的月柱计算（基于24节气）
- [ ] 日柱60甲子循环（使用蔡勒公式）
- [ ] 时柱计算（含真太阳时校正）
- [ ] 农历/阳历自动转换
- [ ] 闰月处理逻辑

**技术要求：**
```javascript
// 核心算法示例
class ProfessionalBaziCalculator {
  // 精确到秒的节气时间表
  private solarTerms: Map<string, Date>;
  
  // 真太阳时差表
  private equationOfTime: Map<number, number>;
  
  // 地理经度时差修正
  private longitudeCorrection(longitude: number): number;
  
  // 夏令时自动检测
  private daylightSavingTime(date: Date, timezone: string): boolean;
}
```

#### 2.1.2 五行力量精算
**量化评分体系：**
- 天干五行基础分值
- 地支藏干分值（本气、中气、余气）
- 月令权重系数（旺相休囚死）
- 通根力量计算
- 透干加成系数
- 合化影响（天干五合、地支六合、三合、三会）

#### 2.1.3 用神智能判定
**多维度分析：**
1. **扶抑用神**：日主强弱精确评分（0-100分）
2. **调候用神**：季节寒暖燥湿平衡
3. **通关用神**：解决五行战克
4. **病药用神**：针对命局病处开方
5. **专旺用神**：从格判定与用神选择

#### 2.1.4 格局精准判定
**必须覆盖：**
- 正格（正官格、七杀格、正财格、偏财格、正印格、偏印格、食神格、伤官格）
- 变格（从强格、从弱格、化气格、两神成象格）
- 特殊格局（魁罡格、金神格、羊刃格、建禄格等30+种）
- 格局成败条件判定
- 格局高低评分

### 2.2 专业功能需求

#### 2.2.1 大运系统
```typescript
interface DayunSystem {
  // 起运计算
  calculateStartAge(gender: Gender, yearStem: Stem): number;
  
  // 大运排列（顺行/逆行）
  arrangeDayun(isForward: boolean): Dayun[];
  
  // 大运评分
  evaluateDayun(dayun: Dayun, bazi: Bazi): DayunScore;
  
  // 转运点预测
  predictTurningPoints(): TurningPoint[];
}
```

#### 2.2.2 流年分析
- 流年太岁作用力分析
- 流年与四柱作用关系
- 流年与大运组合判定
- 月运、日运精细化分析

#### 2.2.3 神煞系统
**必须包含100+神煞：**
- 吉神：天乙贵人、太极贵人、天德贵人、月德贵人、文昌、学堂、词馆等
- 凶煞：羊刃、七杀、枭神、劫煞、亡神、空亡、孤辰、寡宿等
- 桃花系统：桃花、红艳、天喜、红鸾
- 特殊神煞：驿马、华盖、将星、金舆

#### 2.2.4 十神系统
```typescript
interface TenGodSystem {
  // 十神定位
  positioning: {
    年柱十神: TenGod;
    月柱十神: TenGod;
    日柱十神: TenGod;
    时柱十神: TenGod;
  };
  
  // 十神组合
  combinations: TenGodCombination[];
  
  // 十神力量
  strength: Map<TenGod, number>;
  
  // 性格分析
  personality: PersonalityProfile;
  
  // 六亲分析
  sixRelatives: RelativesAnalysis;
}
```

### 2.3 用户体验需求

#### 2.3.1 智能解读系统
**三层解读架构：**
1. **入门版**：0基础用户，纯白话解释
2. **进阶版**：有一定了解，专业术语+解释
3. **专业版**：命理师级别，纯专业分析

#### 2.3.2 可视化系统
- 五行力量雷达图
- 大运起伏曲线图
- 流年吉凶热力图
- 十神分布饼图
- 命盘全息图

#### 2.3.3 个性化建议
```typescript
interface PersonalizedAdvice {
  // 事业发展
  career: {
    适合行业: Industry[];
    发展方向: Direction[];
    关键时机: KeyMoment[];
    贵人方位: Direction[];
  };
  
  // 财运指导
  wealth: {
    求财方式: WealthMethod[];
    投资建议: InvestmentAdvice[];
    财运高峰期: Period[];
    破财预警: RiskAlert[];
  };
  
  // 感情婚姻
  relationship: {
    理想伴侣特征: PartnerProfile;
    最佳结婚年份: number[];
    感情危机期: Period[];
    增进感情方法: Method[];
  };
  
  // 健康养生
  health: {
    易患疾病: Disease[];
    养生重点: HealthFocus[];
    最佳调理时期: Period[];
    五行食疗: FoodTherapy[];
  };
}
```

## 三、技术架构设计

### 3.1 核心算法层
```typescript
// 算法核心模块结构
src/lib/bazi-pro/
├── core/
│   ├── calendar/          # 历法转换
│   │   ├── solar.ts       # 阳历系统
│   │   ├── lunar.ts       # 农历系统
│   │   ├── ganzhi.ts      # 干支纪年
│   │   └── solarterms.ts  # 24节气
│   ├── calculator/        # 核心计算
│   │   ├── fourpillars.ts # 四柱计算
│   │   ├── hidden-stems.ts # 地支藏干
│   │   ├── daymaster.ts   # 日主定位
│   │   └── truetime.ts    # 真太阳时
│   └── analyzer/          # 分析引擎
│       ├── wuxing.ts      # 五行分析
│       ├── yongshen.ts    # 用神分析
│       ├── pattern.ts     # 格局判定
│       └── tengods.ts     # 十神系统
├── advanced/
│   ├── dayun.ts          # 大运系统
│   ├── liunian.ts        # 流年分析
│   ├── shensha.ts        # 神煞系统
│   ├── nayin.ts          # 纳音五行
│   └── interactions.ts   # 生克制化、刑冲合害
├── interpretation/
│   ├── personality.ts    # 性格分析
│   ├── career.ts         # 事业分析
│   ├── wealth.ts         # 财运分析
│   ├── relationship.ts   # 感情分析
│   └── health.ts         # 健康分析
└── utils/
    ├── validator.ts      # 数据验证
    ├── formatter.ts      # 格式化
    └── cache.ts          # 缓存策略
```

### 3.2 数据层设计
```sql
-- 核心数据表设计
CREATE TABLE bazi_analysis (
  id UUID PRIMARY KEY,
  user_id UUID,
  
  -- 出生信息
  birth_datetime TIMESTAMP WITH TIME ZONE,
  birth_longitude DECIMAL(10, 6),
  birth_latitude DECIMAL(10, 6),
  gender VARCHAR(10),
  calendar_type VARCHAR(10),
  
  -- 四柱数据
  year_stem VARCHAR(2),
  year_branch VARCHAR(2),
  month_stem VARCHAR(2),
  month_branch VARCHAR(2),
  day_stem VARCHAR(2),
  day_branch VARCHAR(2),
  hour_stem VARCHAR(2),
  hour_branch VARCHAR(2),
  
  -- 分析结果（JSONB）
  wuxing_analysis JSONB,
  yongshen_analysis JSONB,
  pattern_analysis JSONB,
  dayun_analysis JSONB,
  shensha_analysis JSONB,
  
  -- 评分系统
  accuracy_score DECIMAL(5, 2),
  complexity_level VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 命理知识库
CREATE TABLE bazi_knowledge (
  id UUID PRIMARY KEY,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  key VARCHAR(100),
  value JSONB,
  source TEXT,
  confidence_level DECIMAL(3, 2),
  verified_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 API设计
```typescript
// API端点设计
interface BaziAPI {
  // 核心计算
  POST /api/bazi/calculate
  Request: {
    birthDate: string;
    birthTime: string;
    longitude: number;
    latitude: number;
    gender: 'male' | 'female';
    calendarType: 'solar' | 'lunar';
  }
  Response: {
    fourPillars: FourPillars;
    wuxing: WuxingAnalysis;
    yongshen: YongshenResult;
    pattern: PatternAnalysis;
  }
  
  // 大运分析
  POST /api/bazi/dayun
  
  // 流年分析
  POST /api/bazi/liunian
  
  // AI解读
  POST /api/bazi/interpret
  
  // 专业报告
  GET /api/bazi/report/:id
}
```

## 四、质量保证体系

### 4.1 测试策略
```typescript
// 测试用例示例
describe('BaziCalculator Accuracy Tests', () => {
  // 标准测试案例库（1000+真实案例）
  const testCases = loadStandardCases();
  
  test('四柱计算准确性', () => {
    testCases.forEach(case => {
      const result = calculator.calculate(case.input);
      expect(result.fourPillars).toEqual(case.expected.fourPillars);
    });
  });
  
  test('节气交接时刻准确性', () => {
    // 精确到分钟的节气时刻验证
  });
  
  test('真太阳时计算准确性', () => {
    // 各地经度时差验证
  });
});
```

### 4.2 专家验证系统
- 邀请5位资深命理师进行算法验证
- 建立100个标准命例对照库
- 每月定期算法准确性审计
- 用户反馈闭环改进机制

## 五、实施计划

### Phase 1：核心算法重构（2周）
- Week 1：四柱算法实现与测试
- Week 2：五行、用神算法实现

### Phase 2：高级功能开发（3周）
- Week 3：大运、流年系统
- Week 4：神煞、十神系统
- Week 5：格局判定系统

### Phase 3：智能解读系统（2周）
- Week 6：解读引擎开发
- Week 7：个性化建议系统

### Phase 4：测试与优化（1周）
- Week 8：全面测试与专家验证

## 六、风险与对策

### 6.1 技术风险
- **风险**：算法复杂度高，开发难度大
- **对策**：引入命理专家顾问，采用敏捷开发

### 6.2 质量风险
- **风险**：准确性无法达到预期
- **对策**：建立严格测试体系，持续迭代优化

### 6.3 用户风险
- **风险**：专业内容用户难以理解
- **对策**：三层解读系统，智能适配用户水平

## 七、成功指标

### 7.1 技术指标
- 四柱计算准确率 > 99.9%
- 算法响应时间 < 100ms
- 系统可用性 > 99.95%

### 7.2 业务指标
- 用户满意度 > 9.5/10
- 专家认可度 > 95%
- 付费转化率提升 > 200%

### 7.3 用户指标
- 日活跃用户增长 > 150%
- 用户平均停留时间 > 15分钟
- 分享率 > 30%

## 八、附录

### 8.1 参考文献
1. 《渊海子平》
2. 《三命通会》
3. 《滴天髓》
4. 《穷通宝鉴》
5. 《子平真诠》

### 8.2 技术栈建议
- 核心算法：TypeScript + Rust（高性能计算）
- 农历库：lunar-typescript / sxtwl（寿星天文历）
- 可视化：D3.js + ECharts
- AI引擎：GPT-4 + 专业命理知识库

### 8.3 专家顾问团队需求
- 传统命理学专家 x 2
- 天文历法专家 x 1
- 数据科学家 x 1
- UX设计专家 x 1

---
文档编号：PRD-BAZI-2025-001
最后更新：2025-01-11
下一步行动：召开技术评审会议，确定实施方案