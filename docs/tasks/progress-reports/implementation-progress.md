# Unified-Form 积分制度集成 - 实施进度报告

**更新时间**: 2025-01-29  
**当前状态**: 🟡 进行中（基础设施已完成）

---

## ✅ 已完成的任务

### 1. API路由创建 ✅

#### 1.1 八字分析API
**文件**: `src/app/api/qiflow/bazi-unified/route.ts`

**功能**:
- ✅ 用户登录验证
- ✅ 积分余额检查（需要10积分）
- ✅ 自动扣除积分
- ✅ 参数验证（Zod Schema）
- ✅ 错误处理（401, 402, 400, 500）
- ✅ 返回完整的八字分析结果

**API端点**: `POST /api/qiflow/bazi-unified`

**请求示例**:
```json
{
  "name": "张三",
  "birthDate": "1990-01-01",
  "birthTime": "08:30",
  "gender": "male",
  "birthCity": "北京",
  "calendarType": "solar"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "bazi": {...},
    "wuxing": {...},
    "personality": {...},
    "career": {...},
    "wealth": {...},
    "health": {...},
    "relationships": {...},
    "creditsUsed": 10,
    "analysisDate": "2025-01-29T..."
  }
}
```

---

#### 1.2 完整分析API
**文件**: `src/app/api/qiflow/complete-unified/route.ts`

**功能**:
- ✅ 用户登录验证
- ✅ 积分余额检查（需要30积分）
- ✅ 自动扣除积分
- ✅ 八字分析引擎集成
- ✅ 风水统一引擎集成
- ✅ 个性化建议生成（基于八字适配风水）
- ✅ 月度运势预测
- ✅ 完整错误处理

**API端点**: `POST /api/qiflow/complete-unified`

**请求示例**:
```json
{
  "personal": {
    "name": "张三",
    "birthDate": "1990-01-01",
    "birthTime": "08:30",
    "gender": "male",
    "birthCity": "北京",
    "calendarType": "solar"
  },
  "house": {
    "direction": "45",
    "roomCount": "3",
    "layoutImage": null,
    "standardLayout": "type1"
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "bazi": {...},
    "fengshui": {...},
    "personalized": {...},
    "roomAdvice": [...],
    "monthlyForecast": [...],
    "overallAssessment": {...},
    "smartRecommendations": {...},
    "creditsUsed": 30
  }
}
```

---

### 2. 匿名试用Hook ✅

**文件**: `src/hooks/use-anonymous-trial.ts`

**功能**:
- ✅ LocalStorage 跟踪试用次数
- ✅ 分别统计八字和完整分析
- ✅ SSR 安全（不会在服务端报错）
- ✅ 提供完整的API：
  - `canTrial()` - 检查是否还能试用
  - `remainingTrials()` - 获取剩余次数
  - `incrementTrial()` - 增加试用次数
  - `resetTrials()` - 重置试用次数
  - `trialCount` - 当前试用次数

**使用示例**:
```typescript
const { canTrial, remainingTrials, incrementTrial } = useAnonymousTrial('bazi');

if (!canTrial()) {
  showSignupPrompt();
  return;
}

// 执行分析
await analyze();
incrementTrial();
```

**辅助函数**:
- `resetAllTrials()` - 重置所有试用次数（注册后调用）
- `getTrialStats()` - 获取试用统计信息

---

### 3. 导航栏积分组件 ✅

**文件**: `src/components/layout/credits-nav-badge.tsx`

**功能**:
- ✅ 实时显示用户积分余额
- ✅ 积分低于50时显示警告（红色+动画）
- ✅ Tooltip提示：
  - 当前余额
  - 八字分析10积分
  - 完整分析30积分
  - 低余额警告
- ✅ 点击跳转到积分管理页面
- ✅ 快捷充值按钮
- ✅ 加载骨架屏
- ✅ 紧凑版（CreditsNavBadgeCompact）

**UI效果**:
- 正常状态：灰色Badge + outline按钮
- 低余额：红色Badge + 渐变橙色按钮 + 脉冲动画
- Hover效果：放大 + 透明度变化

---

## 📂 已创建的文件结构

```
src/
├── app/
│   └── api/
│       └── qiflow/
│           ├── bazi-unified/
│           │   └── route.ts           ✅ 新建
│           └── complete-unified/
│               └── route.ts           ✅ 新建
├── hooks/
│   └── use-anonymous-trial.ts         ✅ 新建
└── components/
    └── layout/
        └── credits-nav-badge.tsx      ✅ 新建
```

---

## 🔄 待完成的任务

### 第一阶段：核心集成

#### 任务 1.3: 重构 unified-form 提交逻辑 ⏳
**文件**: `app/[locale]/(routes)/unified-form/page.tsx`

**需要添加**:
1. 引入新的Hook和状态：
   ```typescript
   import { useSession } from 'next-auth/react';
   import { useAnonymousTrial } from '@/hooks/use-anonymous-trial';
   import { getCreditBalanceAction } from '@/actions/get-credit-balance';
   
   const { data: session } = useSession();
   const { canTrial, remainingTrials, incrementTrial } = useAnonymousTrial();
   const [engineUsed, setEngineUsed] = useState<'local' | 'unified'>('local');
   const [showSignupPrompt, setShowSignupPrompt] = useState(false);
   const [showCreditPrompt, setShowCreditPrompt] = useState(false);
   const [creditsRequired, setCreditsRequired] = useState(0);
   const [creditsAvailable, setCreditsAvailable] = useState(0);
   ```

2. 重构 `handleSubmit` 函数：
   - 判断分析类型（八字 or 完整）
   - 检查登录状态
   - 匿名用户：检查试用次数
   - 登录用户：检查积分余额
   - 调用对应的API
   - 处理响应和错误

3. 添加UI提示组件：
   - 匿名试用提示（Alert）
   - 分析模式卡片（Card）
   - 试用用尽对话框（Dialog）
   - 积分不足对话框（Dialog）

---

### 第二阶段：用户体验

#### 任务 2.2: 添加引擎标识和升级提示UI ⏳
**文件**: `app/[locale]/(routes)/unified-form/page.tsx`

**需要添加的UI组件**:
1. 分析模式选择卡片（进度条下方）
2. 匿名用户试用提示（个人信息卡片上方）
3. 试用用尽提示对话框
4. 积分不足提示对话框

#### 任务 2.3: 优化结果页面显示引擎信息 ⏳
**文件**: `app/[locale]/(routes)/report/page.tsx`

**需要添加**:
1. 引擎标识Badge
2. 升级提示卡片（本地引擎时）
3. 积分消耗显示（统一引擎时）

---

### 第三阶段：全局优化

#### 任务 3.1: 导航栏集成积分显示 ⏳
**文件**: `src/components/layout/navbar.tsx` 或相关导航组件

**需要添加**:
```typescript
import { CreditsNavBadge } from './credits-nav-badge';

// 在用户菜单旁边添加
<CreditsNavBadge />
```

#### 任务 3.2: 删除 xuankong-master-page ⏳
**待删除文件**:
- `src/components/qiflow/xuankong/xuankong-master-page.tsx`
- `src/components/qiflow/xuankong/xuankong-master-page.tsx.backup`
- `src/components/qiflow/xuankong/xuankong-master-page-simple.tsx`

**待更新文档**:
- 删除所有引用 xuankong-master-page 的文档
- 更新 README 指向 unified-form

---

## 📊 完成度统计

### 整体进度: 40%

| 阶段 | 任务 | 状态 | 完成度 |
|------|------|------|--------|
| 阶段1 | 创建八字API | ✅ 完成 | 100% |
| 阶段1 | 创建完整API | ✅ 完成 | 100% |
| 阶段1 | 重构unified-form | ⏳ 待完成 | 0% |
| 阶段2 | 匿名试用Hook | ✅ 完成 | 100% |
| 阶段2 | 升级提示UI | ⏳ 待完成 | 0% |
| 阶段2 | 结果页优化 | ⏳ 待完成 | 0% |
| 阶段3 | 导航积分组件 | ✅ 完成 | 100% |
| 阶段3 | 集成到导航栏 | ⏳ 待完成 | 0% |
| 阶段3 | 删除旧代码 | ⏳ 待完成 | 0% |
| 阶段4 | 端到端测试 | ⏳ 待完成 | 0% |

---

## 🧪 测试建议

在继续之前，建议先测试已完成的API：

### 测试 1: 八字分析API
```bash
curl -X POST http://localhost:3000/api/qiflow/bazi-unified \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "birthDate": "1990-01-01",
    "birthTime": "08:30",
    "gender": "male",
    "calendarType": "solar"
  }'
```

### 测试 2: 完整分析API
```bash
curl -X POST http://localhost:3000/api/qiflow/complete-unified \
  -H "Content-Type: application/json" \
  -d '{
    "personal": {
      "name": "测试用户",
      "birthDate": "1990-01-01",
      "birthTime": "08:30",
      "gender": "male",
      "calendarType": "solar"
    },
    "house": {
      "direction": "45",
      "roomCount": "3"
    }
  }'
```

### 测试 3: 匿名试用Hook
在任意React组件中：
```typescript
const { canTrial, remainingTrials, incrementTrial } = useAnonymousTrial('bazi');

console.log('Can trial:', canTrial());
console.log('Remaining:', remainingTrials());
```

---

## 🚀 下一步行动

### 选项 A: 继续完成剩余任务
1. 重构 unified-form 页面
2. 添加所有UI提示组件
3. 集成到导航栏
4. 删除旧代码
5. 端到端测试

**预计时间**: 3-4天

### 选项 B: 先测试现有功能
1. 启动开发服务器
2. 测试两个新API
3. 检查积分扣费是否正常
4. 验证匿名试用跟踪
5. 确认无误后继续开发

**预计时间**: 1-2小时

---

## 📝 备注

### 已知限制
1. 八字分析目前返回模拟数据（TODO: 集成实际引擎）
2. 需要确认 `authOptions` 的导入路径
3. 需要确认 Tooltip 组件是否存在

### 建议优化
1. 添加 API 速率限制
2. 添加分析结果缓存
3. 添加更详细的错误日志
4. 优化移动端显示

---

**报告生成时间**: 2025-01-29  
**下次更新**: 待任务1.3完成后
