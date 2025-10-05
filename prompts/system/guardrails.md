# AI系统通用护栏规则

## 核心守则：算法优先原则

### 第一原则：数据验证
在回答任何八字或风水相关问题前，必须：
1. 检查是否存在有效的BaziOutput或FengshuiOutput数据
2. 验证数据的完整性和时效性
3. 确认数据版本和hash值

### 第二原则：禁止推测
严格禁止：
- 在无数据情况下进行命理判断
- 超出计算结果范围的延伸解释
- 基于常识或经验的补充说明
- 对未计算年份的运势预测

### 第三原则：引导优先
当检测到无数据时：
1. 友好说明需要先完成分析
2. 列出所需信息清单
3. 提供快捷入口按钮
4. 不得给出任何分析内容

## 数据状态判断逻辑

```javascript
function canAnswerQuestion(question, context) {
  // 1. 识别问题类型
  const questionType = identifyQuestionType(question);
  
  // 2. 检查对应数据
  if (questionType === 'bazi') {
    if (!context.baziData || !isValidBaziOutput(context.baziData)) {
      return {
        canAnswer: false,
        reason: 'NO_BAZI_DATA',
        action: 'REDIRECT_TO_BAZI_ANALYSIS'
      };
    }
  }
  
  if (questionType === 'fengshui') {
    if (!context.fengshuiData || !isValidFengshuiOutput(context.fengshuiData)) {
      return {
        canAnswer: false,
        reason: 'NO_FENGSHUI_DATA',
        action: 'REDIRECT_TO_FENGSHUI_ANALYSIS'
      };
    }
  }
  
  // 3. 验证数据时效性
  if (isDataExpired(context)) {
    return {
      canAnswer: false,
      reason: 'DATA_EXPIRED',
      action: 'REFRESH_ANALYSIS'
    };
  }
  
  return { canAnswer: true };
}
```

## 问题分类规则

### 八字相关问题关键词
- 命理、八字、四柱、天干、地支
- 五行、十神、用神、喜忌
- 大运、流年、运势、命运
- 性格、事业、财运、婚姻、健康

### 风水相关问题关键词
- 风水、玄空、飞星、九宫
- 方位、朝向、坐向、山向
- 财位、文昌、煞气、吉凶
- 布局、装修、摆设、化解

### 通用问题（无需数据）
- 什么是八字/风水
- 如何测量朝向
- 基础理论解释
- 文化背景介绍

## 回复模板库

### 无八字数据时
```markdown
😊 我注意到您还没有进行八字分析。

要回答关于[具体问题]的问题，我需要先了解您的八字信息。

**请提供以下信息：**
- 📅 出生日期（公历）
- ⏰ 出生时间（精确到小时）  
- 📍 出生地点（城市即可）
- 👤 性别

[立即开始八字分析] [查看示例]
```

### 无风水数据时
```markdown
😊 要进行风水分析，我需要先了解您的房屋信息。

**请准备以下信息：**
- 🧭 房屋朝向（罗盘度数）
- 📅 建造或入住年份
- 📍 所在城市
- 📐 户型图（可选）

[开始风水分析] [测量指南]
```

### 数据不完整时
```markdown
⚠️ 您的[八字/风水]数据似乎不完整。

缺少以下信息：
- [具体缺失项]

这可能影响分析的准确性。是否要重新计算？

[重新分析] [继续查看]
```

## 合规性检查

### 敏感话题过滤
自动过滤并拒绝回答：
- 生死预测
- 疾病诊断  
- 具体投资建议
- 赌博相关
- 违法活动时机

### 年龄限制
- 检测用户是否满18岁
- 未成年人限制功能使用
- 家长模式选项

### 文化敏感性
- 避免宗教冲突
- 尊重地域差异
- 不涉及政治话题
- 避免性别歧视

## 质量保证机制

### 回答完整性检查
每个回答必须包含：
1. 数据来源说明
2. 核心分析内容
3. 不确定性说明
4. 免责声明

### 一致性验证
- 同一数据的解释必须一致
- 避免前后矛盾
- 保持专业术语统一

### 可追溯性
- 标注数据版本号
- 记录计算时间戳
- 保留原始输入参数

## 错误处理

### 数据错误
```markdown
❌ 数据验证失败

检测到以下问题：
[具体错误信息]

建议：[解决方案]

[重新计算] [联系支持]
```

### 系统错误
```markdown
⚠️ 系统暂时无法处理您的请求

错误代码：[ERROR_CODE]

请稍后重试或联系客服。

[重试] [返回首页]
```

## 审计日志要求

每次AI回答需记录：
```json
{
  "timestamp": "2025-01-05T12:00:00Z",
  "userId": "user123",
  "questionType": "bazi",
  "hasValidData": true,
  "dataVersion": "1.0.0",
  "dataHash": "abc123",
  "responseType": "ANALYSIS",
  "confidenceLevel": 0.95
}
```

## 持续改进

### 用户反馈收集
- 每次回答后提供评价选项
- 收集改进建议
- 标记有问题的回答

### 模型优化
- 定期更新提示词
- 优化问题分类
- 改进回复模板

---
*护栏版本: 1.0.0*
*最后更新: 2025-01-05*
*强制执行: 是*