# QiFlow AI QiFlow AI - Warp Code Project Profile

**项目名称**: QiFlow AI QiFlow AI  
**项目类型**: Next.js 全栈 SaaS 应用（AI 命理分析平台）  
**技术栈**: Next.js 15 + TypeScript + PostgreSQL + Prisma + Better Auth  
**项目阶段**: 生产就绪 (100% 完成核心功能，持续优化中)  
**文档版本**: v1.0.0  
**最后更新**: 2025-01-12

---

## 项目概述

QiFlow AI QiFlow AI 是一个基于 AI 的中国传统命理分析 SaaS 平台，提供：

### 核心功能
- **八字分析**：基于生辰八字的命理分析（基础/详细/专业三个层级）
- **玄空风水**：飞星风水布局分析和罗盘算法
- **AI 智能咨询**：基于命理的智能问答系统
- **积分系统**：统一的积分扣减和定价管理
- **病毒式增长**：推荐裂变、每日签到、邀请排行榜
- **多支付集成**：支持微信、支付宝、Stripe 等

### 项目特色
- ✅ 完整的降级处理机制（低置信度自动降级和手动输入 fallback）
- ✅ 三色置信度系统（红/黄/绿置信度联动 UI）
- ✅ 合规检查（年龄验证、免责声明、敏感词过滤）
- ✅ 国际化支持（中文/英文）
- ✅ 完整的监控和日志系统
- ✅ Docker 容器化部署

---

## 技术架构

### 前端技术栈
```typescript
{
  "framework": "Next.js 15.5+ (App Router)",
  "language": "TypeScript 5.8+",
  "ui": "React 19 + Shadcn UI + Radix UI",
  "styling": "Tailwind CSS 4.0+",
  "forms": "React Hook Form + Zod",
  "state": "Zustand + React Query",
  "charts": "Recharts",
  "animation": "Framer Motion",
  "i18n": "next-intl 4.0"
}
```

### 后端技术栈
```typescript
{
  "runtime": "Node.js 20+",
  "api": "Next.js API Routes",
  "database": "PostgreSQL 15+ + Prisma ORM 5.7+",
  "auth": "Better Auth 1.1+ (JWT)",
  "payment": "Stripe + Alipay + WeChat Pay",
  "storage": "Aliyun OSS / AWS S3",
  "monitoring": "Sentry + Prometheus + Grafana"
}
```

### AI 集成
```typescript
{
  "providers": ["OpenAI", "Anthropic", "Google Gemini", "DeepSeek", "OpenRouter"],
  "sdk": "Vercel AI SDK 5.0+",
  "features": ["八字分析", "风水分析", "AI对话", "图片生成"]
}
```

---

## 项目结构

```
QiFlow AI_qiflowai/
├── src/
│   ├── app/[locale]/              # Next.js App Router（多语言路由）
│   │   ├── (marketing)/           # 营销页面（首页、定价、关于）
│   │   ├── (protected)/           # 认证保护页面（Dashboard、分析）
│   │   ├── analysis/              # 分析功能页面
│   │   │   ├── bazi/             # 八字分析
│   │   │   └── xuankong/         # 玄空风水
│   │   └── api/                  # API Routes
│   ├── components/                # React 组件
│   │   ├── qiflow/               # QiFlow 专用组件
│   │   │   ├── confidence-indicator.tsx
│   │   │   ├── manual-input-form.tsx
│   │   │   └── compliance/       # 合规组件
│   │   └── ui/                   # shadcn/ui 组件
│   ├── lib/                       # 核心库
│   │   ├── qiflow/               # QiFlow 算法库
│   │   │   ├── bazi/            # 八字算法
│   │   │   ├── xuankong/        # 玄空风水算法
│   │   │   ├── compass/         # 罗盘算法
│   │   │   └── degradation/     # 降级处理
│   │   ├── ai/                   # AI 服务封装
│   │   └── utils/                # 工具函数
│   ├── actions/                   # Server Actions
│   │   └── qiflow/
│   ├── config/                    # 配置文件
│   │   ├── qiflow-pricing.ts    # 定价配置
│   │   └── qiflow-thresholds.ts # 阈值配置
│   ├── db/                        # 数据库相关
│   │   └── schema.ts             # Drizzle Schema
│   ├── credits/                   # 积分系统
│   ├── payment/                   # 支付集成
│   └── i18n/                      # 国际化配置
├── .taskmaster/                   # Task Master AI 配置
│   ├── tasks/                    # 任务管理
│   ├── docs/                     # PRD 文档
│   └── config.json               # AI 模型配置
├── .warp/                         # Warp Code 配置
│   └── profiles/                 # 项目 Profiles
├── .claude/                       # Claude Code 配置
├── artifacts/                     # 开发产物
├── docs/                          # 项目文档
└── monitoring/                    # 监控配置
```

---

## 代码规范

### TypeScript 规范

```typescript
// ✅ 推荐：使用 type 定义 Props
type UserProfileProps = {
  userId: string;
  name: string;
  credits: number;
  onUpdate?: (user: User) => void;
};

// ✅ 推荐：函数组件使用箭头函数
const UserProfile = ({ userId, name, credits }: UserProfileProps) => {
  return <div>...</div>;
};

// ✅ 推荐：纯函数使用 function 关键字
function calculateCredits(usage: UsageRecord[]): number {
  return usage.reduce((sum, record) => sum + record.amount, 0);
}

// ❌ 避免：使用 enum
enum Status { PENDING, DONE } // 不推荐

// ✅ 使用：字符串字面量联合类型
type Status = 'pending' | 'done' | 'in-progress';

// ✅ 推荐：对象配置使用 as const
const QIFLOW_PRICING = {
  aiChat: 5,
  bazi: 10,
  xuankong: 20,
} as const;
```

### 命名规范

```typescript
// 文件命名：kebab-case
// ✅ user-profile.tsx, qiflow-pricing.ts

// 组件命名：PascalCase
// ✅ UserProfile, ConfidenceIndicator

// 函数/变量：camelCase
// ✅ calculateBazi, userCredits

// 常量：UPPER_SNAKE_CASE
// ✅ MAX_CREDITS, DEFAULT_THRESHOLD

// 布尔变量：使用助动词前缀
// ✅ isLoading, hasError, canEdit
```

### 文件组织

```typescript
// 组件文件结构
// src/components/qiflow/bazi-result.tsx

// 1. 导入
import { useState } from 'react';
import type { BaziResult } from '@/types';

// 2. 类型定义
type BaziResultProps = {
  result: BaziResult;
};

// 3. 辅助函数
function formatPillar(pillar: string) {
  // ...
}

// 4. 主组件
export const BaziResult = ({ result }: BaziResultProps) => {
  // 5. Hooks
  const [expanded, setExpanded] = useState(false);
  
  // 6. 派生状态
  const formattedPillars = result.pillars.map(formatPillar);
  
  // 7. 事件处理
  const handleExpand = () => setExpanded(!expanded);
  
  // 8. JSX
  return (
    <div>...</div>
  );
};

// 9. 子组件（如果简单）
const PillarCard = ({ pillar }: { pillar: string }) => {
  return <div>{pillar}</div>;
};
```

---

## QiFlow 核心概念

### 1. 积分系统

```typescript
// src/config/qiflow-pricing.ts
export const QIFLOW_PRICING = {
  // AI 对话
  aiChat: 5,                    // 每次对话
  deepInterpretation: 30,       // 深度解读
  
  // 八字分析
  bazi: 10,                     // 基础分析
  baziDetailed: 30,             // 详细分析
  baziPro: 50,                  // 专业分析
  
  // 风水分析
  xuankong: 20,                 // 玄空飞星
  compass: 15,                  // 罗盘定位
  
  // 导出功能
  pdfExport: 5,                 // PDF 基础导出
  pdfPremium: 10,               // PDF 高级导出
} as const;
```

### 2. 置信度系统

```typescript
// src/config/qiflow-thresholds.ts
export const CONFIDENCE_THRESHOLDS = {
  REJECT: 0.4,      // 🔴 红色：拒答 + 手动输入
  WARNING: 0.7,     // 🟡 黄色：警告 + 校准引导
  NORMAL: 0.7,      // 🟢 绿色：正常处理
} as const;

// 使用示例
const handleConfidence = (confidence: number) => {
  if (confidence < CONFIDENCE_THRESHOLDS.REJECT) {
    // 显示手动输入表单
    return <ManualInputForm />;
  }
  if (confidence < CONFIDENCE_THRESHOLDS.WARNING) {
    // 显示校准引导
    return <CalibrationGuide />;
  }
  // 正常处理
  return <NormalFlow />;
};
```

### 3. 降级处理

```typescript
// src/lib/qiflow/degradation/strategy.ts
export async function analyzeBaziWithDegradation(input: BaziInput) {
  try {
    // 1. 尝试使用 AI 分析
    const result = await analyzeBaziWithAI(input);
    
    if (result.confidence < CONFIDENCE_THRESHOLDS.REJECT) {
      // 2. 置信度过低，降级到手动输入
      return {
        status: 'degraded',
        message: '自动分析置信度不足，请手动确认',
        needManualInput: true,
      };
    }
    
    if (result.confidence < CONFIDENCE_THRESHOLDS.WARNING) {
      // 3. 置信度一般，提供校准建议
      return {
        status: 'warning',
        result,
        calibrationSuggestion: getCalibrationSuggestion(input),
      };
    }
    
    // 4. 置信度良好，正常返回
    return {
      status: 'success',
      result,
    };
    
  } catch (error) {
    // 5. 错误处理，降级到基础算法
    console.error('AI分析失败，降级到基础算法', error);
    return {
      status: 'fallback',
      result: await basicBaziCalculation(input),
    };
  }
}
```

---

## 开发工作流

### 1. 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入必要的 API Keys

# 数据库设置
npm run db:generate    # 生成 Prisma 客户端
npm run db:push        # 推送 schema 到数据库
npm run db:studio      # 打开数据库管理界面

# 启动开发服务器
npm run dev            # http://localhost:3000/zh
```

### 2. 代码质量检查

```bash
# 类型检查
npm run type-check

# 代码格式化（Biome）
npm run lint           # 检查
npm run lint:fix       # 修复

# 运行测试
npm run test:unit      # 单元测试
npm run test:e2e       # E2E 测试
```

### 3. 数据库操作

```bash
# 生成迁移
npm run db:generate

# 执行迁移
npm run db:migrate

# 推送到数据库（开发环境）
npm run db:push

# 备份数据库
npm run backup:db

# 查看备份列表
npm run backup:list

# 创建管理员用户
npm run seed:admin
```

### 4. i18n 相关

```bash
# 验证翻译完整性
npm run validate:i18n

# 合并翻译文件
npm run merge:i18n

# 同步基础翻译
npm run sync:i18n-base
```

---

## Task Master AI 集成

### 初始化和设置

```bash
# 1. 初始化 Task Master（如果尚未初始化）
task-master init

# 2. 配置 AI 模型
task-master models --setup

# 3. 从 PRD 生成任务（如果有新的 PRD）
task-master parse-prd .taskmaster/docs/prd.txt --append

# 4. 分析任务复杂度
task-master analyze-complexity --research

# 5. 展开复杂任务
task-master expand --all --research
```

### 日常开发流程

```bash
# 查看所有任务
task-master list

# 获取下一个任务
task-master next

# 查看任务详情
task-master show <task-id>

# 展开任务为子任务
task-master expand --id=<task-id> --research

# 更新任务状态
task-master set-status --id=<task-id> --status=in-progress
task-master set-status --id=<task-id> --status=done

# 在子任务中记录实现笔记
task-master update-subtask --id=<subtask-id> --prompt="实现了XXX功能，使用了YYY技术"

# 添加新任务
task-master add-task --prompt="需要优化XXX性能" --research

# 验证依赖关系
task-master validate-dependencies
```

### MCP 工具调用

```typescript
// 在 Warp Code 中，可以通过 MCP 直接调用 Task Master
// 这些工具自动连接到 .taskmaster/ 配置

// 获取任务列表
call_mcp_tool("get_tasks", {
  projectRoot: "D:\\test\\QiFlow AI_qiflowai",
  status: "pending"
})

// 获取下一个任务
call_mcp_tool("next_task", {
  projectRoot: "D:\\test\\QiFlow AI_qiflowai"
})

// 展开任务
call_mcp_tool("expand_task", {
  id: "1.2",
  projectRoot: "D:\\test\\QiFlow AI_qiflowai",
  research: true
})

// 更新任务状态
call_mcp_tool("set_task_status", {
  id: "1.2",
  status: "done",
  projectRoot: "D:\\test\\QiFlow AI_qiflowai"
})
```

---

## 关键 API 端点

### 认证相关
- `POST /api/auth/sign-up` - 用户注册
- `POST /api/auth/sign-in` - 用户登录
- `POST /api/auth/sign-out` - 用户登出
- `GET /api/auth/session` - 获取会话

### QiFlow 分析
- `POST /api/qiflow/bazi/analyze` - 八字分析
- `POST /api/qiflow/xuankong/analyze` - 玄空风水分析
- `POST /api/qiflow/compass/read` - 罗盘读取
- `POST /api/ai/chat` - AI 对话

### 积分系统
- `GET /api/credits/balance` - 查询积分余额
- `POST /api/credits/purchase` - 购买积分
- `GET /api/credits/history` - 积分历史
- `POST /api/credits/deduct` - 扣除积分

### 推荐系统
- `POST /api/referral/create` - 创建推荐
- `GET /api/referral/stats` - 推荐统计
- `POST /api/referral/check-activation` - 检查激活状态

### 支付系统
- `POST /api/payment/create-checkout` - 创建支付会话
- `POST /api/payment/webhook` - 支付回调
- `GET /api/payment/orders` - 订单列表

---

## 常见开发任务

### 添加新的分析功能

```typescript
// 1. 定义类型 (src/types/qiflow.ts)
export type MyAnalysisInput = {
  param1: string;
  param2: number;
};

export type MyAnalysisResult = {
  result: string;
  confidence: number;
};

// 2. 实现算法 (src/lib/qiflow/my-feature/algorithm.ts)
export async function analyzeMyFeature(input: MyAnalysisInput): Promise<MyAnalysisResult> {
  // 算法实现
}

// 3. 创建 Server Action (src/actions/qiflow/my-feature.ts)
'use server';

import { checkCredits, deductCredits } from '@/credits';
import { analyzeMyFeature } from '@/lib/qiflow/my-feature';

export async function analyzeMyFeatureAction(input: MyAnalysisInput) {
  const user = await getCurrentUser();
  
  // 检查积分
  const cost = QIFLOW_PRICING.myFeature;
  const hasEnough = await checkCredits(user.id, cost);
  if (!hasEnough) {
    return { error: '积分不足' };
  }
  
  // 执行分析
  const result = await analyzeMyFeature(input);
  
  // 扣除积分
  await deductCredits(user.id, cost, 'my_feature_analysis');
  
  return { success: true, result };
}

// 4. 创建 UI 组件 (src/components/qiflow/my-feature-form.tsx)
'use client';

import { useForm } from 'react-hook-form';
import { analyzeMyFeatureAction } from '@/actions/qiflow/my-feature';

export const MyFeatureForm = () => {
  const form = useForm<MyAnalysisInput>();
  
  const onSubmit = async (data: MyAnalysisInput) => {
    const result = await analyzeMyFeatureAction(data);
    // 处理结果
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
};

// 5. 创建页面 (src/app/[locale]/analysis/my-feature/page.tsx)
import { MyFeatureForm } from '@/components/qiflow/my-feature-form';

export default function MyFeaturePage() {
  return (
    <div>
      <h1>我的新功能</h1>
      <MyFeatureForm />
    </div>
  );
}

// 6. 更新定价配置 (src/config/qiflow-pricing.ts)
export const QIFLOW_PRICING = {
  // ...existing
  myFeature: 25, // 新增
} as const;
```

### 修改现有定价

```typescript
// src/config/qiflow-pricing.ts
export const QIFLOW_PRICING = {
  aiChat: 5,           // 原 5
  bazi: 12,            // 修改：原 10
  xuankong: 20,
} as const;

// ⚠️ 注意：修改定价后，需要：
// 1. 更新文档和用户界面显示
// 2. 通知现有用户
// 3. 记录变更日志
```

### 添加新的支付方式

```typescript
// 1. 在 src/payment/providers/ 创建新的 provider
// src/payment/providers/new-provider.ts
export class NewPaymentProvider {
  async createCheckout(amount: number, userId: string) {
    // 实现支付逻辑
  }
  
  async handleWebhook(payload: any) {
    // 处理回调
  }
}

// 2. 注册 provider (src/payment/index.ts)
import { NewPaymentProvider } from './providers/new-provider';

export const paymentProviders = {
  stripe: new StripeProvider(),
  alipay: new AlipayProvider(),
  wechat: new WechatProvider(),
  newProvider: new NewPaymentProvider(), // 新增
};

// 3. 添加环境变量 (.env)
NEW_PROVIDER_API_KEY="your_key"
NEW_PROVIDER_SECRET="your_secret"

// 4. 更新 UI (src/components/payment/payment-methods.tsx)
const PAYMENT_METHODS = [
  { id: 'stripe', name: 'Stripe', icon: '💳' },
  { id: 'alipay', name: '支付宝', icon: '🔵' },
  { id: 'wechat', name: '微信支付', icon: '💬' },
  { id: 'newProvider', name: '新支付', icon: '🆕' }, // 新增
];
```

---

## 调试技巧

### 1. 日志查看

```bash
# 开发环境日志
npm run dev
# 查看终端输出

# 生产环境日志
# 查看 Sentry 或 日志文件
tail -f logs/app.log
```

### 2. 数据库调试

```bash
# 打开 Prisma Studio
npm run db:studio

# 直接查询数据库
psql $DATABASE_URL
```

### 3. API 调试

```typescript
// 在 Server Action 中添加日志
export async function myAction(input: Input) {
  console.log('[DEBUG] Input:', input);
  
  const result = await someOperation();
  console.log('[DEBUG] Result:', result);
  
  return result;
}
```

### 4. 前端调试

```typescript
// 使用 React DevTools
// 安装浏览器扩展：React Developer Tools

// 使用 console 调试
useEffect(() => {
  console.log('[DEBUG] State updated:', state);
}, [state]);

// 使用断点
debugger; // 程序会在这里暂停
```

---

## 性能优化建议

### 1. 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_users_credits ON users(credits);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_transactions_user_id ON credit_transactions(user_id);

-- 查询优化：使用 select 指定字段
// ❌ 不推荐
const user = await db.user.findUnique({ where: { id } });

// ✅ 推荐
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, name: true, credits: true }
});
```

### 2. 前端优化

```typescript
// 使用动态导入
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// 使用 React.memo
const ExpensiveComponent = React.memo(({ data }) => {
  // 仅在 data 变化时重新渲染
  return <div>{data}</div>;
});

// 使用 useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### 3. API 优化

```typescript
// 使用缓存
import { cache } from 'react';

export const getUser = cache(async (userId: string) => {
  return await db.user.findUnique({ where: { id: userId } });
});

// 使用并发请求
const [user, credits, history] = await Promise.all([
  getUser(userId),
  getCredits(userId),
  getHistory(userId),
]);
```

---

## 安全最佳实践

### 1. 输入验证

```typescript
import { z } from 'zod';

// 定义 Schema
const BaziInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().optional(),
  location: z.string().min(2).max(100),
});

// 验证输入
export async function analyzeBaziAction(input: unknown) {
  const validated = BaziInputSchema.parse(input); // 会抛出错误
  // 或者
  const result = BaziInputSchema.safeParse(input); // 返回 { success, data?, error? }
  
  if (!result.success) {
    return { error: result.error.message };
  }
  
  // 使用 validated 数据
}
```

### 2. 认证检查

```typescript
// 在 Server Action 中
export async function protectedAction() {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: '未登录' };
  }
  
  if (!user.emailVerified) {
    return { error: '请先验证邮箱' };
  }
  
  // 继续处理
}
```

### 3. 积分验证

```typescript
export async function expensiveAction() {
  const user = await getCurrentUser();
  const cost = QIFLOW_PRICING.expensiveFeature;
  
  // 检查积分
  const hasEnough = await checkCredits(user.id, cost);
  if (!hasEnough) {
    return { error: '积分不足' };
  }
  
  // 执行操作
  const result = await doExpensiveOperation();
  
  // 扣除积分
  await deductCredits(user.id, cost, 'expensive_feature');
  
  return { success: true, result };
}
```

### 4. 敏感数据处理

```typescript
// ❌ 不要在日志中输出敏感信息
console.log('User data:', user); // 可能包含密码、token 等

// ✅ 脱敏后输出
console.log('User:', { id: user.id, email: maskEmail(user.email) });

// ❌ 不要返回敏感字段给前端
return { user: dbUser }; // 包含 password hash

// ✅ 选择性返回
return { 
  user: { 
    id: dbUser.id, 
    name: dbUser.name, 
    email: dbUser.email 
  } 
};
```

---

## 部署指南

### 1. Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### 2. Docker 部署

```bash
# 构建镜像
docker build -t qiflowai-qiflowai .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  qiflowai-qiflowai

# 使用 docker-compose
docker-compose up -d
```

### 3. 环境变量检查清单

```bash
# 必需的环境变量
✅ DATABASE_URL
✅ ANTHROPIC_API_KEY (或其他 AI provider)
✅ NEXT_PUBLIC_BASE_URL

# 可选的环境变量
◻️ STRIPE_SECRET_KEY (如果启用 Stripe)
◻️ ALIPAY_APP_ID (如果启用支付宝)
◻️ WECHAT_APP_ID (如果启用微信支付)
◻️ SENTRY_DSN (如果启用错误追踪)
◻️ NEXT_PUBLIC_GA_ID (如果启用 Google Analytics)
```

---

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查环境变量
echo $DATABASE_URL

# 测试连接
npm run db:studio

# 重新生成 Prisma 客户端
npm run db:generate
```

#### 2. 依赖安装失败
```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install

# 或使用 pnpm
pnpm install
```

#### 3. 类型错误
```bash
# 运行类型检查
npm run type-check

# 查看详细错误
npx tsc --noEmit --pretty
```

#### 4. 构建失败
```bash
# 清理 .next 缓存
rm -rf .next
npm run build

# 查看详细日志
NEXT_TELEMETRY_DEBUG=1 npm run build
```

---

## 重要文件速查

### 配置文件
- `package.json` - 依赖和脚本
- `tsconfig.json` - TypeScript 配置
- `next.config.ts` - Next.js 配置
- `.env` - 环境变量
- `tailwind.config.js` - Tailwind 配置

### 文档文件
- `README.md` - 项目概述
- `QUICK_START.md` - 快速开始
- `@PRD_*.md` - 产品需求文档
- `@TECH_GUIDE_*.md` - 技术设计文档
- `@TASK_PLAN_*.md` - 任务计划

### 核心代码文件
- `src/lib/qiflow/` - QiFlow 核心算法
- `src/actions/qiflow/` - Server Actions
- `src/components/qiflow/` - QiFlow UI 组件
- `src/config/qiflow-pricing.ts` - 定价配置
- `src/config/qiflow-thresholds.ts` - 阈值配置
- `src/credits/` - 积分系统
- `src/payment/` - 支付系统

---

## Warp Code 使用技巧

### 1. 理解项目上下文

当你问"这个项目是做什么的？"时，我会基于此 Profile 给出准确回答。

### 2. 代码生成

```
你: "帮我添加一个新的风水分析功能，叫做'八宅风水'"

我: 会基于现有的代码结构和规范，生成：
- 类型定义 (src/types/qiflow.ts)
- 算法实现 (src/lib/qiflow/bazhai/)
- Server Action (src/actions/qiflow/bazhai.ts)
- UI 组件 (src/components/qiflow/bazhai-form.tsx)
- 页面 (src/app/[locale]/analysis/bazhai/page.tsx)
- 更新定价配置
```

### 3. 代码审查

```
你: "审查这段代码，看看有没有问题"

我: 会基于项目规范检查：
- TypeScript 类型是否正确
- 是否遵循命名规范
- 是否有安全问题
- 是否有性能问题
- 是否缺少错误处理
```

### 4. 调试协助

```
你: "这个 API 调用总是返回 401"

我: 会检查：
- 认证逻辑
- Session 管理
- API Route 配置
- 环境变量配置
并提供修复建议
```

### 5. 任务管理集成

```
你: "从 Task Master 获取下一个任务并开始实现"

我: 会：
1. 调用 MCP 工具获取任务
2. 分析任务需求
3. 生成实现代码
4. 更新任务状态
5. 记录实现笔记
```

---

## 附录

### 相关文档链接
- 📖 [Next.js 官方文档](https://nextjs.org/docs)
- 📖 [Prisma 官方文档](https://www.prisma.io/docs)
- 📖 [Better Auth 文档](https://www.better-auth.com/docs)
- 📖 [Shadcn UI 文档](https://ui.shadcn.com)
- 📖 [Task Master AI 文档](https://task-master.ai/docs)

### 项目仓库
- 🔗 [GitHub 仓库](https://github.com/litom914295/QiFlow AI_qiflowai)
- 🐛 [问题追踪](https://github.com/litom914295/QiFlow AI_qiflowai/issues)

### 联系方式
- 💬 项目讨论：GitHub Discussions
- 🐛 Bug 报告：GitHub Issues
- 📧 技术支持：通过 GitHub Issues

---

**Profile 版本**: v1.0.0  
**最后更新**: 2025-01-12  
**维护者**: QiFlow AI QiFlow AI Team

---

## 使用此 Profile 的示例对话

### 示例 1: 了解项目
```
你: "这个项目的主要技术栈是什么？"
我: "这是一个基于 Next.js 15 的全栈 SaaS 应用，使用 TypeScript、PostgreSQL、Prisma ORM 和 Better Auth。前端使用 React 19 + Shadcn UI + Tailwind CSS，支持国际化（中文/英文）。项目实现了 AI 命理分析功能，包括八字分析、玄空风水、AI 对话等。"
```

### 示例 2: 代码生成
```
你: "帮我生成一个新的 Server Action，用于查询用户的积分余额"
我: [基于项目规范生成符合格式的代码，包含类型定义、输入验证、错误处理等]
```

### 示例 3: 任务管理
```
你: "显示 Task Master 中待完成的任务"
我: [调用 MCP 工具获取任务列表，并格式化展示]
```

### 示例 4: 故障排查
```
你: "为什么我的 API 调用返回 500 错误？"
我: [基于项目架构和常见问题，提供系统的排查步骤和可能的解决方案]
```
