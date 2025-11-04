# 房屋布局风水咨询优化改进方案

## 一、问题诊断

### 1.1 用户案例复现
**用户信息**：
- 出生时间：1973年1月7日 2:30（男性）
- 出生地：岳阳
- 咨询问题：房间应该怎么布置才能旺财运

**当前系统响应**：
```
✨ 已识别并计算您的八字信息！

📅 出生资料
- 日期：1973-01-07
- 时间：02:30
- 性别：男

根据您1973年1月7日2点30分出生于岳阳的信息，您的八字日主为癸水，五行中水元素极旺（占比49%），金元素也很强（29%），形成金水相生的格局...

### 💰 旺财房间布置建议

**1. 色彩搭配**
- 主色调：绿色、红色系（对应木、火元素）
- 点缀色：黄色、棕色（土元素）
- 避免：大面积黑色、蓝色、白色、金属色

**2. 方位重点**
- 财位：优先布置东南方（传统财位）
- 床头朝向：建议朝东或东南
- 办公座位：背靠实墙，面向南方

**3. 关键物品**
- 绿植：在东南角摆放发财树、金钱树等阔叶植物
- 灯光：使用暖黄色灯光，特别是在财位区域
- 红色元素：如红色靠垫、装饰画，增强火元素
```

### 1.2 问题识别

❌ **关键缺陷**：
1. **未收集房屋朝向信息**：系统直接给出了建议，但没有询问房屋的坐向/朝向
2. **未进行九宫飞星计算**：玄空风水的核心是九宫飞星，但系统完全跳过了这一步
3. **建议过于通用**：给出的是基于传统财位的通用建议，不是基于房屋实际九宫位的个性化分析
4. **违背系统设计原则**：系统设计明确要求"风水分析必须结合八字+九宫飞星"，但实际未执行

### 1.3 根因分析

查看代码后发现：

**文件**: `src/lib/qiflow/ai/bazi-master-processor.ts`
**问题**: 当用户同时询问八字和风水时，系统直接基于八字五行给出通用建议，没有主动引导用户提供房屋朝向信息

**文件**: `src/app/api/qiflow/chat/route.ts`  
**功能**: 虽然实现了 `generatePersonalizedFengshuiAnalysis()` 函数用于基于八字的个性化九宫飞星计算，但该函数只有在 `houseInfo` 已存在时才会调用

**缺失逻辑**: 没有在用户提及风水布局时，主动询问并收集房屋朝向信息的逻辑

---

## 二、优化改进方案

### 2.1 核心改进策略

#### 策略A：主动引导式（推荐）⭐
当用户询问风水布局相关问题时：
1. **第一步**：识别到风水咨询意图
2. **第二步**：检查是否有房屋朝向信息
3. **第三步**：如无朝向信息，主动询问并说明重要性
4. **第四步**：收集到朝向后，执行九宫飞星计算
5. **第五步**：结合八字和九宫飞星给出个性化建议

#### 策略B：渐进式（备选）
1. 先给出基于八字五行的通用建议（当前方式）
2. 在建议末尾提示：如果提供房屋朝向，可以获得基于九宫飞星的精准布局
3. 等待用户主动提供朝向

**推荐使用策略A**，理由：
- 符合系统"算法优先"原则
- 提供完整的风水分析（八字+九宫飞星）
- 与系统提示词定义的工作流一致
- 用户体验更好，一次性得到完整方案

### 2.2 实施步骤

#### 步骤1：增强意图识别

在 `src/lib/qiflow/ai/input-parser.ts` 中增强风水意图识别：

```typescript
// 风水布局关键词
const FENGSHUI_KEYWORDS = [
  '房间', '房屋', '家里', '住宅', '办公室', '卧室', '客厅',
  '风水', '布局', '布置', '摆放', '装修', '朝向',
  '财位', '旺财', '招财', '文昌位', '桃花位'
];

// 检测是否为风水咨询
function detectFengshuiIntent(input: string): boolean {
  return FENGSHUI_KEYWORDS.some(keyword => input.includes(keyword));
}

// 检测是否提供了朝向信息
function hasDirectionInfo(input: string, context: any): boolean {
  const directionKeywords = [
    '朝南', '朝北', '朝东', '朝西',
    '朝向', '坐向', '度数',
    '东南', '西北', '东北', '西南'
  ];
  
  // 检查输入
  const hasInInput = directionKeywords.some(k => input.includes(k));
  
  // 检查上下文
  const hasInContext = context?.houseInfo?.facing || context?.houseInfo?.degree;
  
  return hasInInput || hasInContext;
}
```

#### 步骤2：修改AI聊天API主流程

**文件**: `src/app/api/qiflow/chat/route.ts`

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, context = {} } = body;
    
    // 1. 检测意图
    const isFengshuiQuestion = detectFengshuiIntent(message);
    const hasBaziData = context.baziData && Object.keys(context.baziData).length > 0;
    const hasHouseInfo = context.houseInfo || hasDirectionInfo(message, context);
    
    // 2. 风水咨询的完整性检查
    if (isFengshuiQuestion) {
      // 2.1 如果没有八字数据，先引导提供
      if (!hasBaziData) {
        return NextResponse.json({
          success: true,
          needsInfo: 'bazi',
          message: `要为您提供**个性化的风水布局方案**，我需要先了解您的八字信息。这样才能根据您的五行喜忌，确定最适合您的财位、文昌位等方位。

请告诉我：
📅 您的出生年月日时（请注明公历或农历）
👤 性别
📍 出生地点（用于时区校正）

例如："我是1973年1月7日凌晨2点30分在岳阳出生的男性"`
        });
      }
      
      // 2.2 有八字但没有房屋朝向，引导提供
      if (hasBaziData && !hasHouseInfo) {
        return NextResponse.json({
          success: true,
          needsInfo: 'house_direction',
          message: `✨ 太好了！我已经知道您的八字特征：
          
**您的命理特点**：
- 日主：${context.baziData.dayMaster || '癸水'}
- 五行特征：${formatFiveElements(context.baziData.fiveElements)}
- 需要补充的元素：${getWeakestElement(context.baziData.fiveElements)}

要为您量身定制房屋布局方案，我还需要知道：

🏠 **您的房屋朝向信息**：
1. 房屋的坐向（例如：坐北朝南、坐东朝西）或
2. 大门朝向度数（用手机指南针APP站在门外测量）

📅 房屋建成年份（可选，用于确定建筑运势）

例如："我家是坐北朝南的房子，2015年建成"

有了这些信息，我将结合您的八字和**九宫飞星**为您计算：
✓ 您的专属财位（基于日主和五行）
✓ 最适合的卧室方位
✓ 事业文昌位
✓ 需要化解的煞位
✓ 个性化色彩和材质建议`
        });
      }
      
      // 2.3 八字和房屋信息都有，进行完整分析
      if (hasBaziData && hasHouseInfo) {
        // 解析或使用已有的房屋信息
        const houseInfo = context.houseInfo || parseHouseDirection(message);
        
        // 基于八字的个性化九宫飞星计算
        const fengshuiAnalysis = generatePersonalizedFengshuiAnalysis(
          houseInfo, 
          context.baziData
        );
        
        // 生成完整的个性化建议
        const response = await generateCombinedFengshuiResponse(
          message,
          fengshuiAnalysis,
          context.baziData
        );
        
        return NextResponse.json({
          success: true,
          content: response,
          fengshuiData: fengshuiAnalysis,
          type: 'combined_analysis'
        });
      }
    }
    
    // 3. 其他类型的咨询...
    // ...
  } catch (error) {
    // ...
  }
}
```

#### 步骤3：优化房屋朝向解析

```typescript
// 解析用户输入中的房屋朝向信息
function parseHouseDirection(input: string): any {
  const directionMap: any = {
    '北': 0, '东北': 45, '东': 90, '东南': 135,
    '南': 180, '西南': 225, '西': 270, '西北': 315,
    '坐北朝南': 180, '坐南朝北': 0,
    '坐东朝西': 270, '坐西朝东': 90,
    '坐东南朝西北': 315, '坐西北朝东南': 135,
    '坐东北朝西南': 225, '坐西南朝东北': 45,
  };
  
  // 1. 查找朝向关键词
  let degree = null;
  for (const [key, val] of Object.entries(directionMap)) {
    if (input.includes(key)) {
      degree = val as number;
      break;
    }
  }
  
  // 2. 提取度数（支持"180度"、"180°"等格式）
  const degreeMatch = input.match(/(\d{1,3})\s*[度°]/);
  if (degreeMatch) {
    degree = parseInt(degreeMatch[1]);
  }
  
  // 3. 提取建成年份
  const yearMatch = input.match(/(\d{4})\s*年/);
  const buildYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  
  return {
    facing: degree !== null ? `${degree}度` : '未知',
    degree: degree || 180, // 默认朝南
    buildYear,
  };
}

// 格式化五行显示
function formatFiveElements(elements: any): string {
  return Object.entries(elements)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([element, percent]) => `${element}${percent}%`)
    .join('，');
}

// 获取最弱的五行
function getWeakestElement(elements: any): string {
  const sorted = Object.entries(elements)
    .sort((a, b) => (a[1] as number) - (b[1] as number));
  return sorted[0]?.[0] || '火';
}
```

#### 步骤4：增强九宫飞星个性化分析

**文件**: `src/app/api/qiflow/chat/route.ts` 

在现有 `generatePersonalizedFengshuiAnalysis()` 函数中增强：

```typescript
function generatePersonalizedFengshuiAnalysis(houseInfo: any, baziData: any) {
  // ... 现有代码 ...
  
  // 【新增】根据用户关注点定制分析
  const userConcern = extractUserConcern(houseInfo.originalQuery || '');
  
  const analysis = {
    // ... 现有字段 ...
    
    // 【新增】专项布局建议
    roomLayoutAdvice: {
      bedroom: generateBedroomAdvice(baziData, nineStarMap, personalizedGuidance),
      livingRoom: generateLivingRoomAdvice(baziData, nineStarMap, personalizedGuidance),
      study: generateStudyAdvice(baziData, nineStarMap, personalizedGuidance),
      kitchen: generateKitchenAdvice(baziData, nineStarMap, personalizedGuidance),
    },
    
    // 【新增】针对性建议
    specificAdvice: userConcern === 'wealth' ? 
      generateWealthEnhancementPlan(baziData, nineStarMap, personalizedGuidance) :
      userConcern === 'career' ?
      generateCareerEnhancementPlan(baziData, nineStarMap, personalizedGuidance) :
      generateGeneralAdvice(baziData, nineStarMap, personalizedGuidance),
  };
  
  return analysis;
}

// 生成卧室布置建议
function generateBedroomAdvice(baziData: any, nineStars: any, guidance: any) {
  const dayMaster = baziData.dayMaster || '';
  const weakElement = getWeakestElement(baziData.fiveElements);
  
  return {
    bestDirection: guidance.healthDirection?.direction || '根据日主确定',
    bedHeading: `床头朝${getDirectionByElement(weakElement).direction}最佳（补充用神）`,
    colors: guidance.favorableColors,
    materials: guidance.favorableMaterials,
    avoidance: `避免床头朝${guidance.unfavorableDirection?.direction}（忌神方位）`,
    decorations: [
      `使用${guidance.favorableColors[0]}色床品`,
      `床头两侧放置${guidance.favorableMaterials[0]}材质床头柜`,
      `房间整体采用${guidance.favorableColors.join('、')}主色调`,
    ]
  };
}

// 生成财运增强方案
function generateWealthEnhancementPlan(baziData: any, nineStars: any, guidance: any) {
  return {
    title: '🔥 旺财增强方案（基于您的八字定制）',
    steps: [
      {
        priority: '最高优先级',
        action: `在${guidance.wealthDirection?.direction}设置财位`,
        reason: guidance.wealthDirection?.reason || '',
        items: [
          `摆放${guidance.favorableColors[0]}色聚宝盆或招财摆件`,
          `放置${guidance.favorableMaterials[0]}材质的储钱罐`,
          `保持该方位明亮整洁`,
          `可放置流水装置（需符合五行喜忌）`
        ]
      },
      {
        priority: '次重点',
        action: `在${guidance.favorableDirection?.direction}设置主要活动区`,
        reason: '这是您的用神方位，活动越多运势越旺',
        items: [
          `客厅沙发面向此方位`,
          `办公桌朝向此方位`,
          `多在此方位活动`
        ]
      },
      {
        priority: '辅助措施',
        action: '整体色彩和装饰调整',
        reason: '通过环境五行补充命局所需',
        items: [
          `主色调：${guidance.favorableColors.join('、')}（占30%）`,
          `材质：${guidance.favorableMaterials.join('、')}`,
          `避免：${guidance.unfavorableColors?.join('、')}大面积使用`
        ]
      }
    ]
  };
}
```

#### 步骤5：优化系统提示词

**文件**: `src/lib/qiflow/ai/system-prompt.ts`

在现有提示词基础上增加：

```typescript
export function getSystemPrompt(options: {
  hasUserBazi?: boolean;
  hasHouseInfo?: boolean;
} = {}) {
  let prompt = AI_FENGSHUI_MASTER_PROMPT;
  
  // 如果是风水咨询但缺少必要信息，强调引导原则
  if (!options.hasUserBazi || !options.hasHouseInfo) {
    prompt += `

## 【当前对话状态】
${!options.hasUserBazi ? '- ❌ 尚未获取用户八字信息' : '- ✅ 已有用户八字信息'}
${!options.hasHouseInfo ? '- ❌ 尚未获取房屋朝向信息' : '- ✅ 已有房屋朝向信息'}

### 【重要】信息收集准则
1. 风水分析必须同时具备：①用户八字 ②房屋朝向
2. 缺任一项都不能给出具体的方位和布局建议
3. 只能给出通用的五行调理原则
4. 必须友好地引导用户提供缺失信息
5. 说明完整信息的重要性（如：个性化财位vs通用财位的差异）

### 【禁止行为】
- ❌ 在没有房屋朝向时给出具体的方位建议（如"东南方"、"南方"等）
- ❌ 在没有九宫飞星计算时声称已进行风水分析
- ❌ 使用模糊或通用的风水建议冒充个性化分析
`;
  } else {
    prompt += `

## 【当前对话状态】
- ✅ 已有用户八字信息
- ✅ 已有房屋朝向信息
- ✅ 已完成九宫飞星计算

### 【分析要求】
1. 严格基于九宫飞星的计算结果
2. 结合用户八字的五行喜忌
3. 给出明确的方位指引（精确到宫位和度数范围）
4. 说明每个建议背后的命理和风水原理
5. 提供可操作的具体措施
`;
  }
  
  return prompt;
}
```

### 2.3 预期效果

优化后，用户提问 "我的房间应该怎么布置才能旺财运" 的完整流程：

#### 第一轮对话（用户提问）
```
用户：1973年1月7日2点30分男性岳阳，我的房间应该怎么布置才能旺财运
```

#### 第一轮响应（系统引导）
```
✨ 太好了！我已经知道您的八字特征：

**您的命理特点**：
- 日主：癸水
- 五行分析：水49%，金29%，木12%，土8%，火2%
- 五行特征：水极旺、金较强、火极弱
- 需要补充：火元素（仅2%）
- 用神：火、木

要为您量身定制房屋布局旺财方案，我还需要知道：

🏠 **您的房屋朝向信息**：
1. 房屋的坐向（例如：坐北朝南、坐东朝西）或
2. 大门朝向度数（用手机指南针APP站在门外测量）

📅 房屋建成年份（可选，用于确定建筑运势）

例如："我家是坐北朝南的房子，2015年建成"

有了朝向信息后，我将结合您的八字特点和**九宫飞星**为您计算：

✓ **您的专属财位**（基于癸水日主和火用神）
✓ **最适合的卧室方位**（补充火元素）
✓ **事业文昌位**（增强事业运）
✓ **需要化解的煞位**（避免水过旺）
✓ **个性化色彩方案**（重点补火）
✓ **装饰材质建议**（增强用神能量）

💡 **为什么需要朝向**：
传统风水只能告诉您"财位在东南角"，但基于您的八字，您真正的旺财方位可能完全不同！结合九宫飞星，我能找到最适合**您**的财位。
```

#### 第二轮对话（用户提供朝向）
```
用户：我家坐北朝南，2018年建成的
```

#### 第二轮响应（完整个性化分析）
```
🎉 完美！现在我可以为您提供完整的个性化风水旺财方案了！

---

## 📐 九宫飞星分析（基于您的房屋）

**房屋信息**：
- 坐向：坐北朝南（子山午向）
- 朝向度数：180°
- 建成年份：2018年（属九运房屋）
- 所属宫位：离宫（南方火宫）

**九宫飞星排布**：
```
东南（巽宫）  南方（离宫）   西南（坤宫）
  4绿木星      9紫火星        2黑土星
  
东方（震宫）  中宫          西方（兑宫）
  3碧木星      5黄土星        7赤金星
  
东北（艮宫）  北方（坎宫）   西北（乾宫）
  8白土星      1白水星        6白金星
```

---

## 🔥 您的专属旺财方案（基于八字+九宫飞星）

### ⭐ 第一优先级：南方离宫（您的最佳财位）

**为什么是南方**：
1. 您八字水旺（49%）火弱（2%），南方属火，是您的用神方位
2. 您的房子坐北朝南，南方是离宫，九宫飞星中恰好是9紫火星
3. 9紫星在九运中为正当旺星，主喜庆、财运、桃花
4. 癸水日主，南方火为您的正财方位（水克火为财）
5. **三重优势叠加：用神方位+当旺飞星+正财宫位**

**具体布置**：
✅ **重点强化**（最重要）
- 客厅沙发区设置在南方，增加停留时间
- 在南方墙面挂红色/紫色装饰画（山水画、九鱼图）
- 摆放红色聚宝盆或紫水晶洞
- 安装暖色调射灯，保持明亮（火气）

✅ **色彩搭配**
- 使用红色、紫色、橙色为主色调（补火）
- 配合绿色植物（木生火，增强能量）
- 避免黑色、深蓝色装饰（水克火）

✅ **物品摆放**
- 电视、音响等电器（属火）
- 常开的落地灯或台灯（火光）
- 红木家具或其他木质家具（木生火）

---

### 💎 第二优先级：东南巽宫（文昌+生财）

**为什么是东南**：
1. 东南方是4绿文昌星位，主学业、智慧、事业
2. 4绿木星生9紫火星，形成"木火通明"格局
3. 木属性可以疏通您命局的水势（水生木，木生火）
4. 利于事业发展，事业好则财运自然旺

**具体布置**：
✅ **书房/办公区**
- 最好设在东南方
- 书桌面向南方（朝向用神方位）
- 摆放文昌塔、绿色植物、毛笔字画

✅ **装饰建议**
- 绿色、青色为主调
- 放置发财树、富贵竹等阔叶植物
- 木质书架、实木办公桌

---

### 🛏️ 第三优先级：卧室选择

**最佳位置**：南方或东南方

**理由**：
1. 您水极旺（49%），需要火木平衡
2. 睡眠时间最长，环境影响最大
3. 南方（火）或东南（木）可以长时间补充用神能量

**卧室布置**：
✅ **床位摆放**
- 床头朝南或东南（吸收火木之气）
- 避免床头朝北（水方，加重水势）

✅ **色彩方案**
- 床品：红色、粉色、橙色、绿色系
- 窗帘：暖色系，透光性好（增加光线=增火气）
- 墙面：米黄、浅粉、浅绿

✅ **装饰物**
- 床头两侧放小夜灯（长明，火气）
- 木质床头柜
- 红色或绿色地毯

---

### ⚠️ 需要化解的区域

#### ❌ 北方坎宫（水位过旺区）

**问题**：
- 北方是1白水星位
- 您本命水已经49%，再加强水会失衡
- 可能导致财运不稳、情绪低落

**化解方案**：
- 该方位不宜设卧室、财位
- 减少黑色、蓝色装饰
- 可放置绿色植物（水生木，泄水气）
- 避免鱼缸、水景（加重水势）

#### ❌ 西方兑宫（金水相生区）

**问题**：
- 西方7赤金星，金生水，会加重您的水势
- 您本命金也有29%，不需再补

**化解方案**：
- 不宜设主要活动区
- 使用红色、橙色压制金气（火克金）
- 可作为储藏室、卫生间

---

## 🎨 整体色彩方案（基于您的五行）

**主色调**（占40%）：
- 🔴 红色系：大红、酒红、玫红（直接补火）
- 🟣 紫色系：紫罗兰、紫红（火属性）
- 🟠 橙色系：橙红、珊瑚橙（火属性）

**辅助色**（占30%）：
- 🟢 绿色系：翠绿、墨绿、青绿（木生火）
- 🟡 黄色系：明黄、橙黄（温暖色调）

**点缀色**（占20%）：
- ⚪ 白色、米色（基础色）
- 🟤 棕色、木色（自然色）

**避免色**（少于10%）：
- ⚫ 黑色、深灰（水色，加重水势）
- 🔵 蓝色、深蓝（水色）
- ⚪ 大量金属色、银色（金色，生水）

---

## 🛠️ 装饰材质建议

**优先使用**：
1. **木质**：实木家具、竹制品、木地板（木生火，疏水）
2. **火属性**：电器、灯具、塑料制品
3. **布艺**：棉麻材质（木属性）

**适量使用**：
- 陶瓷、石材（土属性，可以泄水）

**避免或减少**：
- 大量金属家具（金生水）
- 玻璃制品（金属性）
- 水景装置（增水）

---

## 📋 执行计划（分步实施）

### 第一周：重点突破
✅ 确定南方客厅区为主活动区
✅ 更换南方区域的装饰画为红色/紫色系
✅ 在南方财位摆放红色聚宝盆
✅ 安装/调整南方照明，保持明亮

### 第二周：卧室调整
✅ 调整床位，床头朝南或东南
✅ 更换红色/橙色/粉色系床品
✅ 床头两侧增加小夜灯

### 第三周：整体优化
✅ 逐步更换软装色彩（窗帘、地毯、抱枕）
✅ 在东南方设置办公/学习区
✅ 添加绿色植物（南方、东南方）

### 第四周：细节完善
✅ 北方、西方区域减少使用频率
✅ 增加暖色系装饰品
✅ 调整家具材质（增加木质比例）

---

## 💡 特别提醒

1. **渐进式调整**：不需要一次性大改，可以逐步更换，每周感受变化
2. **保持整洁**：尤其是南方财位，务必保持整洁明亮
3. **活用空间**：多在南方、东南方活动，增强接收能量
4. **心态积极**：风水是辅助，主要还是靠自己努力
5. **定期调整**：每年立春后可微调布局，适应流年变化

---

## 🔮 预期效果

完成以上布局后，预计3-6个月内您会感受到：
- 💰 财运逐步改善，收入渠道增加
- 🌟 精神状态更好，行动力增强
- 💼 事业发展顺利，贵人相助
- 🏠 家庭氛围和谐，心情愉悦

---

💡 **温馨提示**：以上方案是基于您的八字（癸水日主，水旺火弱）和房屋九宫飞星（坐北朝南九运房）的精准定制方案。如果房屋朝向或建成年份有误，请及时告知，我将重新计算。

祝您财运亨通！🎉
```

---

## 三、技术实现清单

### 3.1 需要修改的文件

| 文件 | 修改内容 | 优先级 |
|------|---------|--------|
| `src/lib/qiflow/ai/input-parser.ts` | 增强风水意图识别，增加朝向信息检测函数 | 🔴 高 |
| `src/app/api/qiflow/chat/route.ts` | 修改主流程，增加信息完整性检查和引导逻辑 | 🔴 高 |
| `src/app/api/qiflow/chat/route.ts` | 增强`parseHouseDirection()`朝向解析 | 🔴 高 |
| `src/app/api/qiflow/chat/route.ts` | 增强`generatePersonalizedFengshuiAnalysis()`，增加房间布置建议 | 🟡 中 |
| `src/lib/qiflow/ai/system-prompt.ts` | 增加动态提示词生成函数`getSystemPrompt()` | 🟡 中 |
| `src/lib/qiflow/ai/bazi-master-processor.ts` | 修改财运建议生成逻辑，当询问风水时引导提供朝向 | 🟢 低 |

### 3.2 测试用例

#### 测试用例1：只有八字，询问风水
```
输入：1973年1月7日2:30男性岳阳，房间怎么布置旺财运
预期：识别到风水咨询，引导提供房屋朝向信息
```

#### 测试用例2：提供八字和朝向
```
输入：1973年1月7日2:30男性岳阳，房间怎么布置旺财运，家里坐北朝南
预期：直接进行九宫飞星+八字综合分析，给出详细布局方案
```

#### 测试用例3：追加提供朝向
```
第一轮：1973年1月7日2:30男性岳阳，房间怎么布置旺财运
第二轮：我家坐北朝南，2018年建的
预期：第一轮引导，第二轮给出完整分析
```

### 3.3 验收标准

✅ **必须满足**：
1. 用户询问风水布局时，如无朝向信息必须先引导
2. 说明为什么需要朝向信息（个性化vs通用）
3. 提供明确的示例格式
4. 收集到朝向后，执行九宫飞星计算
5. 最终建议必须基于九宫飞星+八字的结合

✅ **期望达到**：
1. 引导语言友好、专业
2. 说明朝向重要性时有说服力
3. 最终分析详细、可操作
4. 分步骤列出执行计划
5. 提供预期效果说明

---

## 四、FAQ

### Q1：为什么现在的系统没有做到这一点？
A：现有系统虽然实现了九宫飞星算法（`generatePersonalizedFengshuiAnalysis`），但在对话流程中缺少信息完整性检查，导致在没有朝向信息时直接给出通用建议，跳过了九宫飞星计算环节。

### Q2：这个改进的工作量有多大？
A：主要是流程控制逻辑的修改，核心算法已经存在，预计：
- 核心逻辑修改：4-6小时
- 测试与调优：2-3小时
- 总计：1个工作日内可完成

### Q3：会不会影响用户体验（需要多次提问）？
A：实际上会提升体验：
- **改进前**：用户得到通用建议，效果不佳，可能需要反复追问
- **改进后**：一次性引导，获得精准方案，满意度更高

### Q4：如果用户不愿意提供朝向怎么办？
A：可以给出两种选择：
1. 基于八字的通用五行调理建议（不涉及具体方位）
2. 提示如果提供朝向，可以获得精准的九宫飞星方案

---

## 五、总结

这个优化方案的核心是**补全信息收集环节**，确保系统在进行风水分析时：
1. ✅ 有八字信息
2. ✅ 有房屋朝向信息
3. ✅ 执行九宫飞星计算
4. ✅ 结合两者给出个性化建议

这样才能真正实现系统设计的初衷："算法优先、八字定制风水"，区别于市面上千篇一律的通用风水建议。

---

**版本**：v1.0  
**日期**：2025-01-08  
**状态**：待实施  
**优先级**：🔴 高（影响核心功能体验）
