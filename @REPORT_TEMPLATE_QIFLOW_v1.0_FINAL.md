# QiFlowAI 八字风水报告产品模版 v1.0 (最终实施版)

**文档版本**: 1.0 Final  
**创建日期**: 2025-01-11  
**状态**: ✅ Ready for Implementation  
**对齐文档**: `项目竞争力分析与优化报告_v4.0_最终版.md`  
**实施周期**: P0上线包 (Week 1)

---

## 📋 目录

1. [战略定位与核心目标](#战略定位与核心目标)
2. [产品架构：两级火箭模型](#产品架构两级火箭模型)
3. [免费基础报告规范](#免费基础报告规范)
4. [精华报告规范](#精华报告规范)
5. [技术实现指引](#技术实现指引)
6. [AI质量与合规体系](#ai质量与合规体系)
7. [数据降级与容错策略](#数据降级与容错策略)
8. [转化优化与A/B测试位](#转化优化与ab测试位)
9. [成本控制与监控](#成本控制与监控)
10. [上线检查清单](#上线检查清单)

---

## 🎯 战略定位与核心目标

### 市场定位

**填补市场空白带：$7纯数据服务 与 $298人工咨询 之间**

| 竞品 | 定位 | 价格 | 核心缺陷 |
|------|------|------|----------|
| MyFengShui | 数据服务 | ~$7 | 无AI解读，无行动建议 |
| **QiFlowAI 精华报告** | **自动化专业分析** | **$9.90** | **无** |
| Joey Yap团队 | 人工咨询 | $298+ | 昂贵，需等待1-2周 |

### 核心价值主张 (USP)

> **业界首份融合真太阳时校正、高级用神分析、玄空飞星算法，并由AI智能解读的"人宅结合"专属运势报告**

### 商业目标 (P0阶段)

```yaml
目标1: 付费转化验证
  - 注册用户: 200+
  - 免费→付费转化率: ≥7%
  - 精华报告销售: 15+ (第1个月)

目标2: 成本可控
  - 单份报告AI成本: <$0.50
  - 每日总AI成本: <$50

目标3: 质量稳定
  - 报告生成成功率: >98%
  - 用户满意度: >4.0/5.0
  - 合规问题: 0次
```

---

## 🚀 产品架构：两级火箭模型

### 产品矩阵

```typescript
// 📍 src/config/qiflow-pricing.ts

export const QIFLOW_REPORTS = {
  // 第一级：免费基础报告
  reportBasic: {
    price: 0,
    credits: 0,
    pages: '5-8页',
    features: [
      '✅ 四柱排盘（真太阳时校正）',
      '✅ 五行雷达图',
      '✅ AI日主性格速写（150字）',
      '✅ 住宅九宫格示意',
      '✅ 年度财位/病符位标注',
      '❌ 无深度AI叙事',
      '❌ 无人宅结合分析',
      '❌ 无PDF下载',
    ],
    deliveryFormat: 'online_only',
  },
  
  // 第二级：精华报告（主力变现）
  reportEssential: {
    price: 990,  // USD cents
    credits: 99,
    pages: '15-20页',
    features: [
      '✅ 基础报告全部内容',
      '✅ AI性格全貌叙事（500字）',
      '✅ 事业财富深度洞察',
      '✅ 玄空飞星详解 + 城门诀',
      '✅ 🌟人宅结合AI分析（核心卖点）',
      '✅ 年度行动清单',
      '✅ 专业PDF下载',
    ],
    deliveryFormat: 'online_and_pdf',
  },
  
  // 第三级：旗舰报告（暂不上线，保留扩展位）
  reportPremium: {
    price: 2990,
    credits: 299,
    status: '⏳ Phase 2',
    reason: '先用精华版验证PMF，再根据用户反馈扩展',
  },
} as const;
```

### 转化路径设计

```
用户注册（70积分）
    ↓
完成八字+风水输入
    ↓
【免费基础报告】在线查看（5-8页）
    ↓ 触发点：阅读到第3章（预计用时2分钟）
【精心设计的Paywall】
  - 背景模糊显示后续章节标题
  - 核心卖点突出："人宅结合AI分析"
  - 双轨购买：$9.90 USD (推荐) | 99积分
    ↓
【精华报告】完整交付
  - 在线阅读（含交互）
  - 高质量PDF下载
  - 邮件通知（附下载链接）
```

---

## 📄 免费基础报告规范

### 报告结构（5-8页）

#### 第1页：封面

```markdown
# 【用户姓名】的命理与风水报告

**生成日期**: 2025年1月11日  
**分析基于**:
- 出生信息: 1990年3月15日 10:30 (农历二月十九 巳时)
- 出生地点: 北京 (已进行真太阳时校正)
- 住宅朝向: 坐北朝南

---

**本报告由QiFlowAI智能生成**  
结合传统命理智慧与现代AI技术
```

#### 第2页：您的命理DNA

**2.1 精准四柱命盘**

```
┌─────────────────────────────────┐
│  年柱    月柱    日柱    时柱   │
│  庚午    己卯    甲辰    己巳   │
│  ----    ----    ----    ----   │
│  [藏干详解]                     │
│  已应用真太阳时校正: 10:42     │
└─────────────────────────────────┘
```

**2.2 五行能量雷达图**

```
[交互式雷达图组件]
- 金: 25%
- 木: 35% ⬆
- 水: 10%
- 火: 20%
- 土: 10%

日主: 甲木 (属木)
强弱: 偏强
```

**2.3 AI日主性格速写** ⭐ (AI生成，约150字)

```
📝 调用: generatePersonalitySummary(baziData, maxLength: 150)

示例输出:
"您的日主为甲木，如同参天大树，天性向上、富有开拓精神。命盘中木气较旺，
赋予您积极进取的性格和不服输的韧性。您待人真诚，重视承诺，但有时过于坚持
己见。建议您在追求目标的同时，也要学会灵活变通，这将让您的人生之树枝繁叶
茂、根深蒂固。"
```

#### 第3页：住宅能量初探

**3.1 住宅九宫格示意**

```
┌─────┬─────┬─────┐
│ 东南 │ 南  │ 西南 │
├─────┼─────┼─────┤
│ 东  │ 中  │ 西  │
├─────┼─────┼─────┤
│ 东北 │ 北  │ 西北 │
└─────┴─────┴─────┘

坐向: 坐北朝南
运盘: 九运 (2024-2043)
```

**3.2 2025年度吉凶速览**

```
💰 财位方向: 正东 (八白左辅星)
⚠️ 病符方位: 西北 (二黑巨门星)

💡 提示: 
精华报告将为您详细解读九宫飞星，并结合您的命理给出
专属的风水布局建议。
```

#### 第4页：【全屏Paywall】解锁完整生命蓝图

```typescript
// 📍 组件: components/report/PaywallOverlay.tsx

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
  {/* 背景模糊的章节预览 */}
  <div className="absolute inset-0 filter blur-sm opacity-30">
    <h2>第三章：事业财富的机遇与挑战 (AI深度解读)</h2>
    <h2>第四章：🌟【核心】您与住宅的能量共鸣分析</h2>
    <h2>第五章：2025年度风水布局方案</h2>
    <h2>第六章：行动清单与幸运元素</h2>
  </div>
  
  {/* 转化卡片 */}
  <Card className="max-w-2xl z-10 shadow-2xl">
    <CardHeader>
      <h1 className="text-3xl font-bold text-center">
        🎯 解锁您的完整生命蓝图
      </h1>
      <p className="text-center text-muted-foreground">
        基础分析已完成，但最有价值的内容还在后面...
      </p>
    </CardHeader>
    
    <CardContent className="space-y-6">
      {/* 核心价值展示 */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <h3 className="font-bold mb-2">✨ 精华报告包含:</h3>
        <ul className="space-y-2">
          <li>✅ AI深度性格与事业财富叙事</li>
          <li>✅ 玄空飞星九宫全解 + 城门诀催财</li>
          <li>✅ 🌟 人宅结合AI分析（独家）</li>
          <li>✅ 2025年专属布局方案</li>
          <li>✅ 可执行行动清单</li>
          <li>✅ 专业PDF永久保存</li>
        </ul>
      </div>
      
      {/* 价格锚定 */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground line-through">
          市场价 $29.90
        </p>
        <p className="text-4xl font-bold text-purple-600">
          限时 $9.90
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          或使用 99 积分
        </p>
      </div>
      
      {/* CTA按钮（A/B测试位） */}
      <div className="space-y-2" data-ab-test="paywall-cta">
        <Button size="lg" className="w-full" variant="default">
          💳 立即购买 $9.90 (推荐)
        </Button>
        <Button size="lg" className="w-full" variant="outline">
          💎 使用 99 积分兑换
        </Button>
      </div>
      
      {/* 信任背书 */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>✅ 100%满意保证</span>
        <span>✅ 即时交付</span>
        <span>✅ 安全支付</span>
      </div>
    </CardContent>
  </Card>
</div>
```

---

## 📊 精华报告规范

### 报告结构（15-20页）

#### 第1章：您的命理DNA（深度版）

**1.1 基础内容** (继承自免费版)

**1.2 AI性格全貌叙事** ⭐⭐⭐ (约500字)

```typescript
// 📍 调用: StoryWeaver.weavePersonality(baziData, options)

/**
 * 核心要求:
 * 1. 将日主、十神、五行强弱、格局有机串联
 * 2. 使用"因果叙事"：因为X，所以Y，这为您带来Z
 * 3. 识别并化解矛盾点（如正官与伤官并存）
 * 4. 积极赋能的语言风格
 * 5. 避免绝对化表述
 */

示例输出:
"您的日主为甲木，命盘显示木气强旺，这赋予了您如同春日新芽般的勃勃生机与
向上突破的天性。值得注意的是，您的命局中'食神'星透出且有力，这一组合极
为难得——甲木生火（食神），意味着您天生具有将想法转化为创造力的能力，
特别适合从事需要持续输出与表达的工作。

更深层次来看，您的月柱显示'正官'星坐实，这为您的创造力加上了一道'责任
与规则'的滤镜。这种'食神'与'正官'的并存，在命理上称为'官印相生，食
神制杀'的格局，它塑造了您独特的双重性格：您既有艺术家的灵感与激情，又有
管理者的自律与原则。

但需要提醒的是，这种格局也意味着您内心时常会经历'自由'与'约束'的拉扯。
当您想要天马行空地创作时，内心的'正官'会跳出来提醒您规则与现实；而当您
试图严格遵守规则时，'食神'又会让您感到压抑与不安。

如何平衡？命盘给出了答案：您的用神为'水'。水在这里扮演的是'润滑剂'的
角色——它既能生木（滋养您的日主），又能泄金制火（缓和内部冲突）。因此，
您在生活中应多亲近'水'的能量：多接触流动的思维（阅读、旅行），多与水属
性的人交往（智慧、灵活型人才），这将让您的性格更加圆融，内外兼修。"
```

**1.3 格局与用神深度解析**

```markdown
### 您的命盘格局

**格局类型**: 食神格（带正官）  
**格局强度**: 75% (中上)  
**格局特点**: 创造力与责任感并存，利文教、管理、创意产业

### 用神系统

**核心喜用神**: 水 (滋养日主，通关官印)  
**辅助喜用神**: 金 (生水之源)  
**忌神**: 土 (克水，阻碍能量流动)

### AI洞察

基于您的格局与用神，我们发现：
1. 您在"水"年份（如2022壬寅、2023癸卯）运势更佳
2. 从事与"水"相关的行业（传媒、咨询、流通）更易成功
3. 居住环境宜靠近水源（江河湖海或室内布置流水）
```

#### 第2章：事业与财富蓝图（AI精准洞察）

**2.1 事业发展AI叙事** (约300字)

```typescript
// 📍 调用: StoryWeaver.weaveCareer(baziData, options)

示例输出:
"从十神配置来看，您的'食神生财'结构非常理想。食神代表您的创意输出，
而它生出的'财星'则意味着您的才华能够直接转化为收益。这种人，天生就是
'靠手艺吃饭'的命格。

具体到职业选择，您有两条主赛道：

**赛道一：创意表达类** (食神主导)
教育培训、内容创作、设计策划、市场营销。这些领域能让您的'表达欲'得到
最大满足，同时带来稳定的正财收入。

**赛道二：专业管理类** (正官主导)  
项目管理、运营管理、行政管理。您的'正官'星赋予了您极强的执行力与责任
感，在需要制定规则、推动落地的岗位上，您会如鱼得水。

最理想的状态是：**将两者结合**。例如，担任创意团队的Leader，或成为教育
机构的运营总监。这种'既能创作又能管理'的复合型角色，正是为您的命格量
身定制的。"
```

**2.2 财富模式分析**

```markdown
### 您的财富属性

**正财**: ⭐⭐⭐⭐ (强)
- 特点: 稳定的工资性收入、合同收入
- 来源: 本职工作、长期合作

**偏财**: ⭐⭐ (中)
- 特点: 机会性收入、投资收益
- 建议: 不宜过度投机，以稳健理财为主

### 2025年财运时间轴

- Q1 (1-3月): ⚠️ 平稳期，不宜大额投资
- Q2 (4-6月): ✅ 财运上升，4月有加薪/奖金机会
- Q3 (7-9月): ⚠️ 注意支出，避免冲动消费
- Q4 (10-12月): ✅ 年度财运最佳期，可考虑理财配置
```

#### 第3章：您的住宅能量场（玄空飞星详解）

**3.1 年度飞星全图（交互式）**

```typescript
// 📍 组件: components/report/FlyingStarChart.tsx

/**
 * 交互功能:
 * - 鼠标悬浮: 显示该宫位的山星、向星、运星
 * - 点击宫位: 展开详细吉凶解读
 * - 颜色编码: 绿色(吉) / 黄色(中) / 红色(凶)
 */

示例九宫格:
┌─────────┬─────────┬─────────┐
│ 东南 4-6 │ 南 9-2  │ 西南 2-4│
│ [文昌]  │ [桃花]  │ [病符] │
├─────────┼─────────┼─────────┤
│ 东 3-5  │ 中 5-7  │ 西 7-9  │
│ [是非]  │ [五黄]  │ [破财] │
├─────────┼─────────┼─────────┤
│ 东北 8-1│ 北 1-3  │ 西北 6-8│
│ [吉星]  │ [贵人]  │ [偏财] │
└─────────┴─────────┴─────────┘

向星八白(正东): 当旺财星，本宅主财位 ⭐⭐⭐⭐⭐
```

**3.2 城门诀催财秘法** ⭐

```markdown
### 什么是城门诀？

城门诀是玄空风水中的高级技法，通过特定方位的"纳气"来催旺财运。
不同于常规财位，城门诀的效果往往出其不意、迅速见效。

### 您的住宅城门诀分析

**城门方位**: 正西  
**催财原理**: 您的住宅坐北朝南，九运盘中正西为"七赤破军"到向，
虽七运已退，但在特定布局下仍可激活其"突破性财运"的能量。

**简易激活方法**:
在正西方位放置流动的水景（如小型喷泉）或金属风铃，每月农历初一
更换一次水，可增强偏财运与投资运。

⚠️ 注意: 城门诀属于"锦上添花"而非"雪中送炭"，需结合您的命理
喜用神（水）来布局，第四章将详细说明。
```

#### 第4章：🌟 人宅结合 - 命运与空间的共鸣（核心卖点）

**说明**: 本章是整个报告的灵魂，由AI根据用户的八字与住宅风水进行深度综合分析。

```typescript
// 📍 AI Prompt: src/lib/qiflow/ai/synthesis-prompt.ts

export const SYNTHESIS_PROMPT = `
你是一位融合命理与风水的资深大师，擅长"人宅合一"的综合分析。

【任务】
基于用户的八字数据和住宅风水数据，生成一份逻辑清晰、可执行的"人宅结合"分析报告。

【算法数据输入】
八字信息:
- 日主: {{dayMaster}}
- 喜用神: {{favorableGod}}
- 忌神: {{avoidGod}}
- 五行分布: {{wuxingDistribution}}

住宅风水:
- 坐向: 坐{{mountain}}朝{{facing}}
- 年度飞星九宫: {{flyingStarChart}}
- 城门诀方位: {{chengmenDirection}}

【分析要求】
1. **超级吉位发现** (用户喜用神方位 ∩ 飞星吉位)
   - 明确指出交集方位
   - 解释能量共振原理
   - 给出具体利用建议

2. **风险区域警报** (用户忌神方位 ∩ 飞星凶位)
   - 明确指出冲突方位
   - 解释能量对冲机制
   - 给出化解方案（优先"泄"法）

3. **核心布局建议** (3-5条，按优先级排序)
   - 每条建议必须可立即执行
   - 标注难度等级 (⭐简单 ⭐⭐中等 ⭐⭐⭐复杂)
   - 说明预期效果与时间周期

【输出格式（严格遵守）】

## ✨ 超级吉位发现

**位置**: [具体方位，如"客厅正东"]
**能量分析**: 
您的喜用神为[X]，五行属性为[Y]。而您住宅的[方位]在2025年飞临
[Z星]（五行属[W]），形成了"[五行生克关系]"的完美共振。

这意味着当您在此方位活动时，能够同时获得：
1. 个人命理能量的增强（[X]得到滋养）
2. 空间风水能量的加持（[Z星]的吉利影响）

**具体利用建议**:
- 将[家具/物品]移至此处
- 每日在此停留[时长]以上
- 在此方位进行[活动类型]（如工作、决策、洽谈）

---

## ⚠️ 风险区域警报

**位置**: [具体方位]
**冲突分析**:
您的忌神为[X]，而[方位]在2025年飞临[凶星]，两者叠加形成了
"双重负能量"区域。

**可能影响**:
- [健康/财运/情感]方面可能出现[具体表现]
- 时间段: [月份]最需注意

**化解方案** (优先级排序):
1. ⭐ [方案1]: 通过五行"泄"法化解
   - 具体做法: [详细步骤]
   - 原理: 土生金，金泄土，削弱凶星力量
   
2. ⭐⭐ [方案2]: 减少在此区域停留时间
   - 避免: [哪些活动]
   - 替代: 改至[其他方位]

---

## 💡 核心布局建议（按执行优先级）

### 1. 催旺财运布局 ⭐⭐
**执行区域**: 正东（八白财星 + 您的喜用神方位）
**具体行动**:
在客厅正东角放置一个[颜色]的[物品]，旁边放置6条金鱼的小鱼缸。
鱼缸大小约[尺寸]，水深[深度]，每周换水1次。

**五行原理**: 
水生木（您的日主）→ 木生火（您的财星）→ 财运激活

**预期效果**: 
30-60日内可能出现：加薪机会、项目提成、意外收入

**执行难度**: ⭐⭐ (需购置鱼缸，但操作简单)
**投入成本**: 约[金额]

---

### 2. 事业助力布局 ⭐
**执行区域**: 书房/办公区
**具体行动**:
将办公桌朝向[方位]，桌面左侧（青龙位）放置[物品]，右侧（白虎位）
保持整洁。

**预期效果**:
工作效率提升，贵人相助增多，项目推进更顺畅

**执行难度**: ⭐ (仅需调整家具朝向)
**投入成本**: 0元

---

### 3. 健康守护布局 ⭐⭐⭐
**执行区域**: 厨房/卫生间（二黑病符位）
**具体行动**:
[详细化解步骤]

**预期效果**:
减少小病小痛，家人健康状况改善

**执行难度**: ⭐⭐⭐ (需要持续维护)

【合规约束（必须严格遵守）】
- ❌ 禁用词汇: "必定"、"一定"、"注定"、"灾难"、"凶事"、"破财"、"血光"
- ✅ 替换为: "可能"、"建议"、"有机会"、"挑战"、"不够顺畅"
- ✅ 每个章节结尾必须加上: "💡 以上分析结合了传统命理与现代风水理论，仅供参考，不构成专业建议。"
- ✅ 语气始终积极、建设性，即使指出风险也要同时给出解决方案
`;

// 实际调用
async function generateSynthesisSection(
  baziData: BaziData,
  fengshuiData: FengshuiData
): Promise<string> {
  const prompt = SYNTHESIS_PROMPT
    .replace('{{dayMaster}}', baziData.dayMaster)
    .replace('{{favorableGod}}', baziData.favorableGod || '未计算')
    // ... 其他数据注入
  
  const result = await generateText({
    model: openai('deepseek-chat'),  // 性价比高
    prompt: prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });
  
  return result.text;
}
```

#### 第5章：2025年度行动清单

```markdown
# 📋 您的2025年专属行动清单

根据前面的综合分析，我们为您提炼出最关键、最容易执行的行动要点。
建议您将此清单打印或保存在手机中，定期查看与执行。

---

## 🏠 风水布局（首要任务）

### ✅ 本月内必须完成

1. **催财第一要务** (影响力: ⭐⭐⭐⭐⭐ | 难度: ⭐⭐)
   - [ ] 在客厅正东放置流动水景或6条金鱼鱼缸
   - [ ] 预期效果: 30日内财运提升
   - [ ] 截止日期: 2025年2月10日前

2. **化解健康隐患** (影响力: ⭐⭐⭐⭐ | 难度: ⭐)
   - [ ] 在厨房门口悬挂铜葫芦或放置金属钟表
   - [ ] 预期效果: 减少小病小痛
   - [ ] 截止日期: 立即

### ⏰ 季度性调整

3. **办公桌朝向优化** (影响力: ⭐⭐⭐ | 难度: ⭐)
   - [ ] 调整书桌朝向东南（文昌位）
   - [ ] 执行时间: Q1完成即可

---

## 💼 事业发展（把握机遇）

### 🗓️ 关键时间节点

- **2025年4月**: ✅ 年度事业运最旺月
  - [ ] 主动申请晋升或新项目
  - [ ] 拓展人脉，参加行业活动
  - [ ] 更新简历，把握跳槽机会（如有意向）

- **2025年10月**: ✅ 第二波事业高峰
  - [ ] 推动重大项目落地
  - [ ] 与领导/客户深度沟通

### ⚠️ 需谨慎时期

- **2025年7-8月**: 事业运波动，不宜冒进
  - 建议: 稳扎稳打，做好手头工作
  - 避免: 贸然跳槽、大额投资

---

## 💰 财富管理（理性投资）

### ✅ 正财策略（稳健）
- [ ] 确保每月储蓄率≥20%
- [ ] 建立3-6个月应急备用金
- [ ] 可考虑定投指数基金（风险较低）

### ⚠️ 偏财提示（谨慎）
- 避免高风险投机（如杠杆、期货）
- Q2、Q4可适度参与理财产品（年化≤6%）
- 切勿听信"稳赚不赔"的投资项目

---

## ❤️ 健康与情绪（自我关怀）

### 🏃 日常习惯
- [ ] 每周运动3次以上（建议游泳、瑜伽等"水"属性运动）
- [ ] 23:00前入睡，保证7-8小时睡眠
- [ ] 多喝水（每日8杯），多食黑色食物（黑豆、黑木耳）

### 🧘 情绪管理
- 您的命盘显示有时压力较大，需学会"放水"（释放压力）
- 建议: 每周至少1次独处放空时间（冥想、散步、听音乐）

---

## 🍀 2025年度幸运元素

将以下元素融入您的日常生活，可增强整体运势：

- **幸运颜色**: 蓝色、黑色、绿色
- **幸运数字**: 1、6（水的数字）
- **幸运方位**: 正东、东南
- **幸运月份**: 4月、10月
- **幸运时辰**: 子时(23-1点)、亥时(21-23点)

---

## 📅 季度回顾提醒

建议您每季度末（3/6/9/12月最后一天）回顾此清单:
- ✅ 哪些已执行？效果如何？
- ⏸️ 哪些未执行？原因是什么？
- 🔄 根据实际情况调整优先级

---

💡 记住: 风水与命理是辅助工具，真正改变命运的，是您的每一个积极行动。
```

#### 第6章：免责声明与服务说明

```markdown
# ⚖️ 重要声明

## 报告性质说明

本报告由QiFlowAI智能系统基于传统命理理论与现代算法生成，旨在为您提供
个性化的人生规划参考与风水布局建议。

## 使用限制

1. **本报告仅供参考**
   - 不应作为重大人生决策（如投资、医疗、法律）的唯一依据
   - 建议结合实际情况与专业意见综合判断

2. **结果的不确定性**
   - 命理与风水分析存在多种流派与解读方式
   - 报告结论可能与其他命理师的分析存在差异
   - 最终效果受个人行动、环境变化等多种因素影响

3. **年龄限制**
   - 本服务仅向18岁及以上用户提供

## 隐私保护

- 您的个人信息与报告内容受到严格保护
- 未经您的明确同意，我们不会向任何第三方分享您的数据
- 详见[隐私政策]

## 联系我们

如对报告内容有疑问或需要人工解答，欢迎联系:
- 邮箱: support@qiflow.ai
- 在线客服: [链接]

---

**QiFlowAI** - 让古老智慧与现代科技相遇  
报告生成时间: 2025-01-11 15:30:00
```

---

## 🛠️ 技术实现指引

### 核心文件结构

```
src/
├── lib/qiflow/reports/
│   ├── essential-report.ts          # 精华报告生成器（核心）
│   ├── basic-report.ts              # 基础报告生成器
│   └── types.ts                     # 报告类型定义
├── lib/qiflow/ai/
│   ├── synthesis-prompt.ts          # 人宅结合Prompt
│   ├── quality-audit.ts             # AI质量审核
│   ├── story-weaver.ts              # AI叙事引擎（新增）
│   └── compliance-rules.ts          # 合规规则库
├── components/report/
│   ├── sections/
│   │   ├── BaziAnalysisSection.tsx
│   │   ├── FengShuiSection.tsx
│   │   ├── SynthesisSection.tsx     # 人宅结合章节
│   │   └── ActionListSection.tsx
│   ├── ui/
│   │   ├── PaywallOverlay.tsx       # 付费墙（重要！）
│   │   ├── FlyingStarChart.tsx      # 飞星图
│   │   └── ReportCover.tsx
│   └── FengShuiReportGenerator.tsx  # 主生成器
└── app/(dashboard)/report/
    ├── [reportId]/page.tsx          # 报告详情页
    └── buy/page.tsx                 # 购买页
```

### 数据流程图

```
用户输入（birthInfo + houseInfo）
    ↓
Server Action: generateReportAction()
    ↓
┌─────────────────────────────────────┐
│ 1. 算法计算层                        │
│    - computeBaziSmart()             │
│    - generateFlyingStar()           │
│    - calculateChengmenJue()         │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 2. AI生成层（并行）                  │
│    - StoryWeaver.weavePersonality() │
│    - StoryWeaver.weaveCareer()      │
│    - generateSynthesisSection()      │
│      (人宅结合 - SYNTHESIS_PROMPT)   │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 3. 质量审核层                        │
│    - aiQualityAudit()               │
│    - checkComplianceWords()         │
│    - riskScore < 0.7 ? Pass : Retry │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 4. 报告组装层                        │
│    - assembleReportSections()       │
│    - injectMetadata()               │
│    - generatePDF() (if paid)        │
└──────────┬──────────────────────────┘
           ↓
存储到数据库 + 返回给前端
```

### 核心代码框架

#### 精华报告生成器

```typescript
// 📍 src/lib/qiflow/reports/essential-report.ts

import { computeBaziSmart } from '@/lib/bazi-pro/core/calculator/four-pillars';
import { generateFlyingStar } from '@/lib/fengshui/flying-star';
import { StoryWeaver } from '@/lib/qiflow/ai/story-weaver';
import { generateSynthesisSection } from '@/lib/qiflow/ai/synthesis-prompt';
import { aiQualityAudit } from '@/lib/qiflow/ai/quality-audit';
import { renderReportPDF } from '@/lib/pdf/report-renderer';

export interface EssentialReportInput {
  userId: string;
  birthInfo: {
    date: Date;
    time: string;
    location: { lat: number; lng: number; city: string };
  };
  houseInfo: {
    facing: string;
    degree: number;
  };
  userInfo: {
    name: string;
    gender: 'male' | 'female';
  };
}

export interface EssentialReportOutput {
  reportId: string;
  metadata: ReportMetadata;
  sections: {
    baziAnalysis: BaziAnalysisContent;
    careerWealth: CareerWealthContent;
    fengshui: FengshuiContent;
    synthesis: string;  // 人宅结合（纯文本，AI生成）
    actionList: ActionItem[];
  };
  pdfUrl?: string;
  generatedAt: Date;
}

export async function generateEssentialReport(
  input: EssentialReportInput
): Promise<EssentialReportOutput> {
  
  // ===== Step 1: 算法计算（并行） =====
  const [baziData, fengshuiData] = await Promise.all([
    computeBaziSmart({
      birthDate: input.birthInfo.date,
      birthTime: input.birthInfo.time,
      location: input.birthInfo.location,
      useTrueSolarTime: true,  // 必须启用真太阳时
    }),
    generateFlyingStar({
      facing: input.houseInfo.facing,
      degree: input.houseInfo.degree,
      year: new Date().getFullYear(),
    }),
  ]);
  
  // ===== Step 2: AI生成核心内容（并行） =====
  const storyWeaver = new StoryWeaver();
  
  const [personalityNarrative, careerNarrative, synthesisRaw] = await Promise.all([
    storyWeaver.weavePersonality(baziData, { maxLength: 500 }),
    storyWeaver.weaveCareer(baziData, { maxLength: 300 }),
    generateSynthesisSection(baziData, fengshuiData),  // 人宅结合
  ]);
  
  // ===== Step 3: AI质量审核 =====
  const allAIContent = [personalityNarrative, careerNarrative, synthesisRaw].join('\n\n');
  const auditResult = await aiQualityAudit(allAIContent);
  
  if (auditResult.riskScore > 0.7) {
    // 风险过高，记录日志并重试（最多2次）
    console.warn('[质量审核] 内容风险过高', {
      riskScore: auditResult.riskScore,
      issues: auditResult.issues,
    });
    
    // 递归重试（简化版，实际应加重试计数器）
    return generateEssentialReport(input);
  }
  
  // ===== Step 4: 组装报告 =====
  const reportData: EssentialReportOutput = {
    reportId: generateReportId(),
    metadata: {
      userId: input.userId,
      reportType: 'essential',
      generatedAt: new Date(),
      baziInputs: input.birthInfo,
      fengshuiInputs: input.houseInfo,
    },
    sections: {
      baziAnalysis: {
        fourPillars: baziData.pillars,
        wuxingChart: baziData.wuxing,
        personalityNarrative: personalityNarrative,
        yongshen: baziData.yongshen,
      },
      careerWealth: {
        narrative: careerNarrative,
        suitableCareers: extractCareers(baziData),
        wealthTimeline: generateWealthTimeline(baziData, 2025),
      },
      fengshui: {
        flyingStarChart: fengshuiData.chart,
        chengmenJue: fengshuiData.chengmen,
        luckyDirections: fengshuiData.luckyAreas,
      },
      synthesis: synthesisRaw,  // 人宅结合完整文本
      actionList: extractActionItems(synthesisRaw),  // 从AI文本中提取清单
    },
    generatedAt: new Date(),
  };
  
  // ===== Step 5: 存储到数据库 =====
  await db.report.create({
    data: {
      id: reportData.reportId,
      userId: input.userId,
      type: 'essential',
      content: reportData,
      status: 'completed',
    },
  });
  
  // ===== Step 6: 如果用户已付费，生成PDF =====
  const userPayment = await checkUserPayment(input.userId, 'essential');
  if (userPayment.hasPaid) {
    const pdfBuffer = await renderReportPDF(reportData);
    const pdfUrl = await uploadToStorage(pdfBuffer, reportData.reportId);
    reportData.pdfUrl = pdfUrl;
  }
  
  return reportData;
}
```

---

## 🛡️ AI质量与合规体系

### 双审机制

```typescript
// 📍 src/lib/qiflow/ai/quality-audit.ts

export interface AuditResult {
  riskScore: number;  // 0-1, 越高越危险
  issues: Array<{
    type: 'logic' | 'compliance' | 'tone' | 'factual';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;  // 出现在哪个章节
  }>;
  suggestions: string[];
}

export async function aiQualityAudit(content: string): Promise<AuditResult> {
  const auditPrompt = `
你是一位严谨的内容审核专家，负责审核命理风水报告的质量与合规性。

【待审核内容】
${content}

【审核维度】
1. **逻辑一致性** (权重30%): 是否存在自相矛盾
2. **语言合规性** (权重40%): 是否含有禁用词、宿命论、恐吓性表述
3. **积极性** (权重20%): 是否给用户正向心理暗示
4. **可操作性** (权重10%): 建议是否具体可执行

【禁用词库】
必须标记的词汇: "必定"、"一定会"、"注定"、"命中注定"、"灾难"、
"凶事"、"血光之灾"、"破财"、"家破人亡"

【输出格式 (JSON)】
{
  "riskScore": 0.0-1.0,
  "issues": [
    {
      "type": "compliance",
      "severity": "critical",
      "description": "出现禁用词'必定'",
      "location": "第2章第3段"
    }
  ],
  "suggestions": [
    "将'必定发财'改为'有望提升财运'",
    "增加免责声明"
  ]
}
`;

  const result = await generateText({
    model: openai('gpt-4o-mini'),  // 审核用便宜快速的模型
    prompt: auditPrompt,
    temperature: 0.2,  // 低温度，追求稳定性
  });
  
  return JSON.parse(result.text);
}
```

### 合规规则库

```typescript
// 📍 src/lib/qiflow/ai/compliance-rules.ts

export const COMPLIANCE_RULES = {
  // 禁用词汇（触发立即拒绝）
  bannedWords: [
    '必定', '一定会', '注定', '命中注定',
    '灾难', '凶事', '血光', '破财', '家破人亡',
    '离婚', '丧偶', '克夫', '克妻', '绝症',
  ],
  
  // 警告词汇（需审慎使用，必须搭配缓和措辞）
  warningWords: [
    { word: '凶', replacement: '不够顺畅' },
    { word: '煞', replacement: '能量冲突' },
    { word: '冲克', replacement: '需要调和' },
  ],
  
  // 必须包含的合规文本
  requiredDisclaimers: {
    sectionEnd: '💡 以上分析仅供参考，不构成专业建议。',
    reportEnd: '本报告基于传统理论与AI算法生成，实际效果因人而异。',
  },
  
  // 积极表述指引
  positiveFraming: {
    // 将负面表述转换为建设性建议
    rules: [
      {
        negative: '你的财运不好',
        positive: '您可以通过以下方式提升财运...',
      },
      {
        negative: '这个方位很凶',
        positive: '此方位能量较弱，建议采取以下化解措施...',
      },
    ],
  },
};

// 实时检查函数
export function checkCompliance(text: string): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  // 检查禁用词
  for (const word of COMPLIANCE_RULES.bannedWords) {
    if (text.includes(word)) {
      violations.push(`包含禁用词: ${word}`);
    }
  }
  
  // 检查是否包含免责声明
  if (!text.includes(COMPLIANCE_RULES.requiredDisclaimers.sectionEnd)) {
    violations.push('缺少章节免责声明');
  }
  
  return {
    passed: violations.length === 0,
    violations,
  };
}
```

---

## 🔧 数据降级与容错策略

### 缺数据场景处理

```typescript
// 📍 src/lib/qiflow/reports/fallback-handler.ts

/**
 * 数据完整性检查与降级策略
 */
export function validateAndFallback(input: EssentialReportInput): {
  isComplete: boolean;
  warnings: string[];
  fallbackData: Partial<EssentialReportInput>;
} {
  const warnings: string[] = [];
  const fallback: any = {};
  
  // 场景1: 缺少精确出生时间
  if (!input.birthInfo.time || input.birthInfo.time === 'unknown') {
    warnings.push('未提供精确出生时间，时柱将使用正午(12:00)推算');
    fallback.birthInfo = {
      ...input.birthInfo,
      time: '12:00',
      timeAccuracy: 'estimated',  // 标记为估算
    };
  }
  
  // 场景2: 缺少精确经纬度
  if (!input.birthInfo.location.lat || !input.birthInfo.location.lng) {
    warnings.push('未提供精确经纬度，真太阳时校正将基于城市中心点');
    // 使用城市名称查询默认坐标
    fallback.birthInfo.location = getCityDefaultCoords(input.birthInfo.location.city);
  }
  
  // 场景3: 房屋朝向不精确
  if (!input.houseInfo.degree || input.houseInfo.degree === 0) {
    warnings.push('房屋朝向度数不精确，飞星分析将基于八方位粗略推算');
    // 将文字方向（如"南"）转换为默认度数
    fallback.houseInfo.degree = directionToDegree(input.houseInfo.facing);
  }
  
  return {
    isComplete: warnings.length === 0,
    warnings,
    fallbackData: Object.keys(fallback).length > 0 ? fallback : input,
  };
}

// 在报告中展示降级提示
export function generateDataQualityNotice(warnings: string[]): string {
  if (warnings.length === 0) return '';
  
  return `
📊 **数据精度说明**

本报告在生成过程中，存在以下数据推算情况：

${warnings.map((w, i) => `${i + 1}. ${w}`).join('\n')}

💡 为获得更精准的分析结果，建议您：
- 核实出生时间（精确到分钟）
- 提供出生地的精确经纬度
- 使用指南针测量房屋的精确朝向度数

您可以在个人中心更新这些信息，系统将为您重新生成报告。
`;
}
```

### 飞星冲突处理

```markdown
### 八宅与飞星矛盾化解模板

当用户的八宅吉方与玄空飞星凶位冲突时，使用以下标准化表述：

---

**⚠️ 能量冲突提示**

我们注意到，[方位] 在两个风水系统中呈现不同的能量特征：

1. **八宅法视角**: 此方位是您的[吉方名称]，属于个人有利方位
2. **玄空飞星视角**: 2025年此方位飞临[凶星名称]，属于流年不利方位

**如何理解这种冲突？**

八宅法关注的是"人"的能量，强调个人命卦与方位的先天契合度；
玄空飞星关注的是"时空"的能量，强调特定年份房屋的后天气场。

两者并非矛盾，而是从不同维度分析同一空间。

**建议的平衡策略：**

1. **优先级**: 八宅吉方 > 飞星凶位（因为个人能量更稳定）
2. **化解方法**: 在此方位采用"中和"布局
   - 保留八宅吉方的基本功能（如办公、决策）
   - 增加化解飞星凶位的元素（如[具体物品]）
3. **时间策略**: 在流年飞星有利月份（如[月份]）加强使用

💡 最终目标是让"人"与"宅"在"时间"中达到动态平衡。

---
```

---

## 📈 转化优化与A/B测试位

### 关键A/B测试位置

```typescript
// 📍 前端组件中预埋的A/B测试位

export const AB_TEST_VARIANTS = {
  // 测试位1: Paywall CTA文案
  paywallCTA: {
    variantA: '立即购买 $9.90',
    variantB: '解锁完整报告 $9.90',
    variantC: '获取专属方案 $9.90',
    metric: 'click_through_rate',
  },
  
  // 测试位2: 免费报告预览长度
  freePreviewLength: {
    variantA: 100,  // 字符数
    variantB: 200,
    metric: 'free_to_paid_conversion',
  },
  
  // 测试位3: 价格展示方式
  priceDisplay: {
    variantA: '$9.90',
    variantB: '仅需 $9.90',
    variantC: '$9.90 (限时优惠)',
    metric: 'purchase_intent',
  },
  
  // 测试位4: 双轨购买的默认推荐
  paymentMethod: {
    variantA: 'usd_primary',  // USD按钮更大更醒目
    variantB: 'equal_emphasis',  // 两个按钮同等大小
    metric: 'usd_vs_credits_ratio',
  },
};

// 实现示例
function PaywallCTA({ userId }: { userId: string }) {
  const variant = getABVariant(userId, 'paywallCTA');  // 稳定分组
  const buttonText = AB_TEST_VARIANTS.paywallCTA[variant];
  
  return (
    <Button
      onClick={handlePurchase}
      data-ab-test="paywall-cta"
      data-variant={variant}
    >
      {buttonText}
    </Button>
  );
}
```

### 转化漏斗监控

```typescript
// 📍 src/lib/analytics/report-funnel.ts

export const REPORT_FUNNEL_EVENTS = {
  // 漏斗阶段1: 查看免费报告
  viewFreeReport: {
    event: 'report_free_viewed',
    properties: ['userId', 'reportId', 'scrollDepth'],
  },
  
  // 漏斗阶段2: 触达Paywall
  reachPaywall: {
    event: 'paywall_reached',
    properties: ['userId', 'timeSpent', 'scrollDepth'],
  },
  
  // 漏斗阶段3: 点击购买按钮
  clickPurchase: {
    event: 'purchase_button_clicked',
    properties: ['userId', 'variant', 'paymentMethod'],
  },
  
  // 漏斗阶段4: 完成支付
  completePurchase: {
    event: 'purchase_completed',
    properties: ['userId', 'amount', 'paymentMethod', 'timeToConversion'],
  },
  
  // 漏斗阶段5: 下载PDF
  downloadPDF: {
    event: 'pdf_downloaded',
    properties: ['userId', 'reportId'],
  },
};

// 自动埋点
export async function trackFunnelEvent(
  event: keyof typeof REPORT_FUNNEL_EVENTS,
  properties: Record<string, any>
) {
  await analytics.track(REPORT_FUNNEL_EVENTS[event].event, properties);
}
```

---

## 💰 成本控制与监控

### Token预算设定

```typescript
// 📍 src/lib/qiflow/reports/cost-config.ts

export const REPORT_COST_BUDGET = {
  essential: {
    // 单份精华报告的Token预算
    maxInputTokens: 3000,   // 算法数据 + Prompt
    maxOutputTokens: 2500,  // AI生成的内容
    maxTotalCost: 0.50,     // 单份报告最高成本 $0.50
    
    breakdown: {
      personalityNarrative: 500,   // 性格叙事
      careerNarrative: 300,        // 事业财富
      synthesisSection: 1500,      // 人宅结合（最贵）
      qualityAudit: 200,           // 审核
    },
  },
  
  basic: {
    // 免费报告几乎无AI成本（仅150字速写）
    maxOutputTokens: 200,
    maxTotalCost: 0.02,
  },
};

// 成本监控守卫
export async function checkCostLimit(
  userId: string,
  reportType: 'basic' | 'essential'
): Promise<{ allowed: boolean; reason?: string }> {
  // 检查今日总成本
  const todayCost = await getDailyAICost();
  
  if (todayCost >= 50) {
    await sendAlert('AI成本已达$50阈值');
    return { allowed: false, reason: '每日成本限制' };
  }
  
  if (todayCost >= 100) {
    await sendAlert('AI成本已达$100阈值，暂停新注册');
    await toggleFeatureFlag('allow_new_reports', false);
    return { allowed: false, reason: '成本失控，已暂停服务' };
  }
  
  return { allowed: true };
}
```

### 生成速度优化

```typescript
// 📍 性能目标: P95 < 20秒

// 优化策略1: 并行化
const [result1, result2, result3] = await Promise.all([
  task1(),
  task2(),
  task3(),
]);

// 优化策略2: 流式生成（可选，二期）
async function* streamReportGeneration(input: EssentialReportInput) {
  yield { section: 'bazi', status: 'computing' };
  const bazi = await computeBazi(input);
  yield { section: 'bazi', status: 'done', data: bazi };
  
  yield { section: 'synthesis', status: 'generating' };
  const synthesis = await generateSynthesis(bazi, fengshui);
  yield { section: 'synthesis', status: 'done', data: synthesis };
}
```

---

## ✅ 上线检查清单

### P0必须完成项（Week 1）

```yaml
安全与合规 (不可妥协):
  ✅ Turnstile验证码已启用
  ✅ Webhook幂等机制已实现
  ✅ AI合规Prompt已注入所有生成点
  ✅ 禁用词检查已部署
  ✅ 免责声明已添加到报告末尾

功能完整性:
  ✅ 免费基础报告能正常生成并在线查看
  ✅ 精华报告能正常生成（含人宅结合章节）
  ✅ PDF导出功能正常
  ✅ Paywall正确拦截免费用户
  ✅ Stripe支付流程完整（$9.90 + 99积分双轨）

质量保证:
  ✅ 测试了3-5个不同八字的报告生成
  ✅ 人宅结合章节内容逻辑连贯
  ✅ AI质量审核riskScore < 0.7
  ✅ 无自相矛盾表述
  ✅ 语气积极、非宿命化

成本与监控:
  ✅ 单份报告成本监控脚本已部署
  ✅ 每日AI成本告警已配置($50警告/$100暂停)
  ✅ 报告生成失败告警已配置

数据与埋点:
  ✅ 转化漏斗埋点已部署
  ✅ A/B测试基础设施就位
  ✅ 用户报告关系正确存储到数据库
```

### 上线后48小时监控

```yaml
关键指标 (实时监控):
  - 报告生成成功率 (目标>98%)
  - 免费→付费转化率 (目标≥7%)
  - PDF下载成功率 (目标>95%)
  - 平均生成时长 P95 (目标<20s)
  - AI成本/份 (目标<$0.50)

风险信号 (触发回滚):
  - 生成失败率>5%
  - 合规投诉≥1次
  - AI成本>$1/份
  - 支付失败率>10%
```

---

## 📞 联系与支持

**文档所有者**: QiFlowAI产品团队  
**技术负责人**: [填写]  
**实施周期**: P0上线包 (Week 1)  
**文档状态**: ✅ Final - Ready for Implementation

---

**让我们开始构建一个能改变用户命运的产品！** 🚀
