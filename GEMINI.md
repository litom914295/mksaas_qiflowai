# 🔮 QiFlow AI - 项目文档

**版本**: v5.1.1  
**最后更新**: 2025-11-12  
**项目仓库**: https://github.com/litom914295/qiflowai

---

## 📋 项目概览

QiFlow AI 是一个基于现代化技术栈构建的**AI驱动的命理风水SaaS平台**，提供八字分析、玄空风水、智能罗盘、户型分析、AI对话等多个核心功能模块。

### 核心特性

- **🔮 八字分析** - 基于生辰八字的智能命理分析，支持手动输入和自动计算
- **🏠 玄空风水** - 飞星风水布局分析，提供详细的方位建议
- **🧭 智能罗盘** - 基于传感器的罗盘读取，支持置信度检测和手动校准
- **📐 户型分析** - 可视化户型编辑器，支持风水布局评估
- **💬 AI 对话** - 多模型支持的智能对话系统，提供专业咨询服务
- **📊 个人仪表板** - 完整的用户数据管理和历史记录查看
- **🔐 Better Auth 认证** - 现代化的身份认证系统，支持邮箱登录、会话管理
- **💰 积分系统** - 完整的积分充值、消费、交易记录管理
- **🌍 国际化支持** - 支持中文(zh-CN)、英文(en)、马来语(ms)等多语言切换
- **📱 响应式设计** - 完美适配桌面端、平板和移动设备

---

## 💻 技术栈

### 前端框架

| 技术 | 版本 | 描述 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 15.2.1 | React 框架，支持 App Router 和 RSC |
| [React](https://react.dev/) | 19.1.0 | UI 库 |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.3 | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 4.0.14 | 样式框架 |
| [Shadcn UI](https://ui.shadcn.com/) | 最新 | UI 组件库 |
| [Framer Motion](https://www.framer.com/motion/) | 12.23.24 | 动画库 |
| [React Hook Form](https://react-hook-form.com/) | 7.62.0 | 表单管理 |
| [Zod](https://zod.dev/) | 4.0.17 | Schema 验证 |

### 后端技术

| 技术 | 版本 | 描述 |
|------|------|------|
| [Better Auth](https://better-auth.com/) | 1.2.8 | 现代化认证系统 |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.39.3 | 数据库 ORM |
| [PostgreSQL](https://www.postgresql.org/) | 14+ | 关系型数据库 |
| [Next Safe Action](https://next-safe-action.dev/) | 7.10.4 | Server Actions 类型安全 |
| [Resend](https://resend.com/) | 4.4.1 | 邮件服务 |

### AI 集成

| 技术 | 版本 | 描述 |
|------|------|------|
| [Vercel AI SDK](https://sdk.vercel.ai/) | 5.0.0 | AI 应用框架 |
| [@ai-sdk/google](https://www.npmjs.com/package/@ai-sdk/google) | 2.0.0 | Google Gemini 集成 |
| [@ai-sdk/openai](https://www.npmjs.com/package/@ai-sdk/openai) | 2.0.0 | OpenAI GPT 集成 |
| [@ai-sdk/deepseek](https://www.npmjs.com/package/@ai-sdk/deepseek) | 1.0.0 | DeepSeek 集成 |
| [@openrouter/ai-sdk-provider](https://www.npmjs.com/package/@openrouter/ai-sdk-provider) | 1.0.0-beta.6 | OpenRouter 多模型集成 |

### 开发工具

| 工具 | 版本 | 描述 |
|------|------|------|
| [Biome](https://biomejs.dev/) | 1.9.4 | Linter & Formatter |
| [Vitest](https://vitest.dev/) | 3.2.4 | 单元测试框架 |
| [Playwright](https://playwright.dev/) | 1.55.1 | E2E 测试框架 |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | 0.30.4 | 数据库迁移工具 |
| [tsx](https://github.com/privatenumber/tsx) | 4.19.3 | TypeScript 执行器 |

---

## 📁 项目结构

```
mksaas_qiflowai/
├── src/                                # 源代码目录
│   ├── app/                            # Next.js App Router
│   │   ├── [locale]/                   # 国际化路由
│   │   │   ├── (admin)/                # 管理后台
│   │   │   ├── (auth)/                 # 认证页面(登录/注册)
│   │   │   ├── (marketing)/            # 营销页面(首页/定价)
│   │   │   └── dashboard/              # 用户仪表板
│   │   │       ├── bazi/               # 八字分析
│   │   │       ├── xuankong/           # 玄空风水
│   │   │       ├── compass/            # 罗盘功能
│   │   │       ├── floorplan/          # 户型分析
│   │   │       └── ai-chat/            # AI对话
│   │   └── api/                        # API 路由
│   │       ├── auth/                   # Better Auth 端点
│   │       ├── credits/                # 积分相关 API
│   │       └── qiflow/                 # QiFlow 业务 API
│   ├── actions/                        # Server Actions
│   │   ├── qiflow/                     # QiFlow 业务逻辑
│   │   │   ├── bazi.ts                 # 八字分析
│   │   │   ├── xuankong.ts             # 玄空风水
│   │   │   ├── compass.ts              # 罗盘功能
│   │   │   └── floorplan.ts            # 户型分析
│   │   ├── auth.ts                     # 认证相关
│   │   └── credits.ts                  # 积分操作
│   ├── components/                     # React 组件
│   │   ├── qiflow/                     # QiFlow 业务组件
│   │   │   ├── bazi/                   # 八字组件
│   │   │   ├── xuankong/               # 玄空风水组件
│   │   │   ├── compass/                # 罗盘组件
│   │   │   └── floorplan/              # 户型组件
│   │   ├── ui/                         # Shadcn UI 组件
│   │   ├── auth/                       # 认证组件
│   │   └── dashboard/                  # 仪表板组件
│   ├── lib/                            # 工具库
│   │   ├── qiflow/                     # QiFlow 核心算法
│   │   │   ├── bazi/                   # 八字算法
│   │   │   ├── xuankong/               # 玄空风水算法
│   │   │   ├── compass/                # 罗盘算法
│   │   │   └── floorplan/              # 户型分析算法
│   │   ├── auth.ts                     # Better Auth 配置
│   │   ├── auth-client.ts              # 客户端认证
│   │   └── utils.ts                    # 通用工具
│   ├── db/                             # 数据库
│   │   ├── schema.ts                   # Drizzle ORM Schema
│   │   └── index.ts                    # 数据库连接
│   ├── config/                         # 配置文件
│   │   ├── qiflow-pricing.ts           # QiFlow 定价配置
│   │   ├── qiflow-thresholds.ts        # 置信度阈值配置
│   │   └── floorplan.ts                # 户型配置
│   ├── types/                          # TypeScript 类型定义
│   ├── i18n/                           # 国际化配置
│   │   ├── request.ts                  # next-intl 请求配置
│   │   └── routing.ts                  # 路由配置
│   └── styles/                         # 样式文件
├── messages/                           # 国际化翻译文件
│   ├── zh-CN.json                      # 简体中文
│   ├── en.json                         # 英文
│   └── ms.json                         # 马来语
├── scripts/                            # 工具脚本
│   ├── test-auth-complete.ts           # 认证测试
│   ├── add-test-credits.ts             # 添加测试积分
│   ├── backup-database.ts              # 数据库备份
│   └── dev-optimize.js                 # 开发环境优化
├── tests/                              # 测试文件
│   ├── unit/                           # 单元测试
│   │   ├── credits/                    # 积分系统测试
│   │   └── qiflow/                     # QiFlow 算法测试
│   └── e2e/                            # E2E 测试
├── docs/                               # 项目文档
│   ├── getting-started/                # 入门指南
│   ├── features/                       # 功能文档
│   └── prd/                            # 产品需求文档
└── public/                             # 静态资源
    ├── images/                         # 图片资源
    └── locales/                        # 本地化资源
```

---

## 🎯 核心业务功能

### 1. 八字分析 (BaZi Analysis)

**功能描述**: 基于用户的出生年月日时进行八字命理分析

**关键文件**:
- `src/actions/qiflow/bazi.ts` - Server Action
- `src/lib/qiflow/bazi/` - 算法实现
- `src/components/qiflow/bazi/` - UI 组件
- `src/app/[locale]/dashboard/bazi/` - 页面路由

**积分消耗**: 10 积分/次

**核心算法**: 使用 `@aharris02/bazi-calculator-by-alvamind` 包进行八字排盘计算

### 2. 玄空风水 (Xuankong Fengshui)

**功能描述**: 飞星风水布局分析，提供方位建议和布局优化

**关键文件**:
- `src/actions/qiflow/xuankong.ts` - Server Action
- `src/lib/qiflow/xuankong/` - 算法实现
- `src/components/qiflow/xuankong/` - UI 组件
- `src/app/[locale]/dashboard/xuankong/` - 页面路由

**积分消耗**: 20 积分/次

**置信度阈值**:
- 🔴 **红色拒答** (< 0.4): 置信度过低，拒绝处理
- 🟡 **黄色警告** (0.4-0.7): 置信度一般，提供警告
- 🟢 **绿色正常** (≥ 0.7): 置信度良好，正常处理

### 3. 智能罗盘 (Smart Compass)

**功能描述**: 基于设备传感器的智能罗盘，支持置信度分析

**关键文件**:
- `src/actions/qiflow/compass.ts` - Server Action
- `src/lib/qiflow/compass/` - 算法实现
- `src/components/qiflow/compass/` - UI 组件
- `src/app/[locale]/dashboard/compass/` - 页面路由

**积分消耗**: 不消耗积分（工具型功能）

**置信度分析**: 
- 使用加速度计、磁力计、陀螺仪三种传感器数据
- 实时计算置信度分数
- 提供手动校准选项

### 4. 户型分析 (Floorplan Analysis)

**功能描述**: 可视化户型编辑器，支持风水布局评估

**关键文件**:
- `src/actions/qiflow/floorplan.ts` - Server Action
- `src/lib/qiflow/floorplan/` - 算法实现
- `src/components/qiflow/floorplan/` - UI 组件
- `src/app/[locale]/dashboard/floorplan/` - 页面路由

**积分消耗**: 待定

**技术实现**: 使用 Fabric.js 或 Konva 实现画布编辑功能

### 5. AI 对话 (AI Chat)

**功能描述**: 多模型支持的智能对话系统

**关键文件**:
- `src/app/[locale]/dashboard/ai-chat/` - 页面路由
- `src/app/api/ai-chat/` - API 端点
- `src/components/chat/` - 聊天组件

**积分消耗**: 
- 基础对话: 5 积分/次
- 15分钟会话: 40 积分

**支持的 AI 模型**:
- Google Gemini
- OpenAI GPT
- Anthropic Claude
- DeepSeek
- OpenRouter (多模型)

### 6. 积分系统 (Credits System)

**功能描述**: 完整的积分充值、消费、交易记录管理

**关键文件**:
- `src/actions/credits.ts` - Server Action
- `src/app/api/credits/` - API 端点
- `src/config/qiflow-pricing.ts` - 定价配置

**积分定价** (根据 `src/config/qiflow-pricing.ts`):
```typescript
export const QIFLOW_PRICING = {
  aiChat: 5,              // AI对话
  bazi: 10,               // 八字分析
  xuankong: 20,           // 玄空风水
  deepInterpretation: 30, // 深度解读
  pdfExport: 5,           // PDF导出
  reportBasic: 50,        // 基础报告
  reportEssential: 120,   // 精华报告
  chatSession15Min: 40,   // 15分钟会话
} as const;
```

---

## 🛠️ 开发规范

### TypeScript 使用规范

```typescript
// ✅ 推荐：使用 type 定义 Props
type MyComponentProps = {
  name: string;
  age?: number;
};

// ✅ 推荐：使用字符串字面量联合类型
type Status = 'loading' | 'success' | 'error';

// ❌ 避免：使用 enum
// enum Status { Loading, Success, Error }

// ✅ 推荐：使用 as const 进行常量断言
const COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
} as const;
```

### 代码风格

- **使用 function 关键字** 定义纯函数
- **使用箭头函数** 定义 React 组件
- **使用 Biome** 进行代码格式化和 Lint
- **严格的 TypeScript 模式**
- **禁用 console.log** (生产环境)

### 命名约定

```typescript
// 文件/目录命名：小写+连字符
// components/auth-wizard/steps.tsx

// 组件命名：PascalCase
const AuthWizard = () => {};

// 函数命名：camelCase
function calculateScore() {}

// 常量命名：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// 布尔变量：使用助动词前缀
const isLoading = true;
const hasError = false;
```

### UI 与样式

- **使用 Shadcn UI** 和 **Radix UI** 组件
- **Tailwind CSS** 进行样式开发
- **Mobile-first** 响应式设计
- **使用 Tailwind 响应式变体** (`md:`, `lg:`)

```tsx
// 示例：响应式设计
<div className="w-full md:w-1/2 lg:w-1/3">
  <p className="text-sm md:text-base lg:text-lg">
    响应式文本
  </p>
</div>
```

### 性能优化

```tsx
// ✅ 使用 React Server Components (RSC)
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData(); // 服务器端获取数据
  return <Dashboard data={data} />;
}

// ✅ 使用 Suspense 包裹客户端组件
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientComponent />
    </Suspense>
  );
}

// ✅ 动态导入
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
});

// ✅ 使用 next/image
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // 首屏图片
/>
```

### 状态管理

```typescript
// ✅ URL 参数状态：使用 nuqs
import { useQueryState } from 'nuqs';

const [search, setSearch] = useQueryState('search');

// ✅ 本地状态：使用 useState
const [count, setCount] = useState(0);

// ✅ 全局状态：使用 Zustand (轻量级)
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 数据获取与缓存

```typescript
// ✅ 使用 Next.js 扩展的 fetch API
const data = await fetch('https://api.example.com/data', {
  next: {
    revalidate: 3600, // 1小时后重新验证
  },
});

// ✅ 使用标签进行缓存管理
const data = await fetch('https://api.example.com/data', {
  next: {
    tags: ['users'],
  },
});

// 重新验证缓存
import { revalidateTag } from 'next/cache';
revalidateTag('users');
```

### API Routes 与安全

```typescript
// ✅ 使用 Zod 验证输入
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = schema.safeParse(body);
  
  if (!result.success) {
    return Response.json(
      { error: result.error },
      { status: 400 }
    );
  }
  
  // ✅ 使用环境变量
  const apiKey = process.env.API_KEY;
  
  // 处理请求...
}
```

### 错误处理

```tsx
// ✅ 使用 error.tsx 边界
// app/[locale]/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// ✅ 使用 not-found.tsx
// app/[locale]/dashboard/not-found.tsx
export default function NotFound() {
  return <h2>404 - Page Not Found</h2>;
}
```

---

## 🔧 环境变量配置

### 必需配置

```env
# 数据库连接 (至少配置一个)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_DATABASE_URL="postgresql://user:password@db.host:5432/database"  # 直连，优先级最高
SESSION_DATABASE_URL="postgresql://user:password@pooler:6543/database"  # 连接池，回退选项

# Better Auth 安全密钥 (必须配置)
BETTER_AUTH_SECRET="your-32-char-random-secret-key"  # 生成: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"  # 生产环境改为实际域名

# 应用基础 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### AI 模型配置 (可选)

```env
# AI 模型 API Keys (根据使用的模型选择性配置)
ANTHROPIC_API_KEY="sk-ant-api03-..."  # Claude 模型
OPENAI_API_KEY="sk-proj-..."          # GPT 模型
GOOGLE_API_KEY="..."                  # Gemini 模型
PERPLEXITY_API_KEY="pplx-..."         # Perplexity 搜索
```

### 支付配置 (可选)

```env
# 支付配置 (如需启用支付功能)
ALIPAY_APP_ID="your_alipay_app_id"
ALIPAY_PRIVATE_KEY="your_alipay_private_key"
WECHAT_APP_ID="your_wechat_app_id"
WECHAT_MCH_ID="your_wechat_mch_id"
```

### 邮件服务 (可选)

```env
# 邮件服务 (如需启用邮件通知)
RESEND_API_KEY="re_..."  # Resend 邮件服务
```

### 分析与监控 (可选)

```env
# 分析与监控
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"  # Google Analytics
SENTRY_DSN="https://..."          # Sentry 错误跟踪
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-token"
```

### 功能开关

```env
# 功能开关
ENABLE_PAYMENT="true"         # 启用支付功能
ENABLE_ANALYTICS="true"       # 启用分析统计
ENABLE_AB_TESTING="false"     # 启用 A/B 测试
DISABLE_IMAGE_OPTIMIZATION="false"  # 禁用图片优化
```

---

## 🚀 常用命令

### 开发命令

```bash
# 标准启动 (使用 Turbopack)
npm run dev

# 快速启动 (带缓存优化)
npm run dev:fast

# 清理缓存后启动
npm run dev:clean

# 使用 Webpack 启动
npm run dev:webpack
```

### 构建与部署

```bash
# 生产构建
npm run build

# 启动生产服务器
npm run start

# 分析 Bundle 大小
npm run analyze
```

### 数据库操作

```bash
# 推送 Schema 到数据库
npm run db:push

# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 打开数据库管理界面
npm run db:studio

# 备份数据库
npm run backup:db

# 列出备份
npm run backup:list
```

### 代码质量检查

```bash
# Lint 检查
npm run lint

# Lint 修复
npm run lint:fix

# 代码格式化
npm run format

# TypeScript 类型检查
npm run type-check

# TypeScript 类型检查 (watch模式)
npm run type-check:watch

# 全面检查
npm run check-all
```

### 测试命令

```bash
# 运行单元测试
npm run test:unit

# 运行单元测试 (watch模式)
npm run test:unit:watch

# 运行单元测试 (UI界面)
npm run test:unit:ui

# 测试覆盖率
npm run test:coverage

# 积分系统测试
npm run test:credits

# API 测试
npm run test:api

# 安全测试
npm run test:security

# E2E 测试
npm run test:e2e

# E2E 测试 (UI模式)
npm run test:e2e:ui

# E2E 测试 (有头模式)
npm run test:e2e:headed

# E2E 测试 (调试模式)
npm run test:e2e:debug

# E2E 测试报告
npm run test:e2e:report
```

### 积分管理

```bash
# 添加测试积分
npm run add-credits

# 添加演示积分
npm run add-demo-credits

# 验证积分一致性
npm run verify:credits

# 列出所有用户
npm run list-users

# 列出所有联系人
npm run list-contacts
```

### 国际化 (i18n)

```bash
# 验证翻译文件
npm run validate:i18n

# 合并翻译文件
npm run merge:i18n

# 同步基础翻译
npm run sync:i18n-base

# 翻译占位符
npm run translate:todos

# 翻译剩余内容
npm run translate:remaining
```

### 其他工具

```bash
# 邮件模板开发服务器
npm run email

# Knip 未使用代码检测
npm run knip

# 生成 Cloudflare Types
npm run cf-typegen
```

---

## 🔑 关键配置文件

### 1. QiFlow 定价配置

**文件路径**: `src/config/qiflow-pricing.ts`

```typescript
export const QIFLOW_PRICING = {
  aiChat: 5,              // AI对话
  bazi: 10,               // 八字分析
  xuankong: 20,           // 玄空风水
  deepInterpretation: 30, // 深度解读
  pdfExport: 5,           // PDF导出
  reportBasic: 50,        // 基础报告
  reportEssential: 120,   // 精华报告
  chatSession15Min: 40,   // 15分钟会话
} as const;

// 获取产品定价
export function getQiflowPrice(product: QiflowProduct): number {
  return QIFLOW_PRICING[product];
}

// 检查用户是否有足够积分
export function hasEnoughCredits(
  userCredits: number,
  product: QiflowProduct
): boolean {
  return userCredits >= QIFLOW_PRICING[product];
}
```

### 2. 置信度阈值配置

**文件路径**: `src/config/qiflow-thresholds.ts`

```typescript
// 置信度阈值
export const CONFIDENCE_THRESHOLDS = {
  REJECT: 0.4,    // 红色拒答阈值
  WARNING: 0.7,   // 黄色提示阈值
  NORMAL: 0.7,    // 绿色正常阈值
} as const;

// 置信度状态配置
export const CONFIDENCE_STATES = {
  reject: {
    color: 'red',
    icon: '❌',
    label: '置信度过低',
    message: '分析结果置信度过低，建议重新输入或调整参数',
  },
  warning: {
    color: 'yellow',
    icon: '⚠️',
    label: '置信度一般',
    message: '分析结果置信度一般，建议谨慎参考',
  },
  normal: {
    color: 'green',
    icon: '✅',
    label: '置信度良好',
    message: '分析结果置信度良好，可以放心参考',
  },
} as const;

// 算法特定阈值
export const ALGORITHM_THRESHOLDS = {
  bazi: {
    minAccuracy: 0.6,
    maxProcessingTime: 5000, // 5秒
    requiredFields: ['datetime', 'gender'],
  },
  xuankong: {
    minAccuracy: 0.5,
    maxProcessingTime: 3000, // 3秒
    requiredFields: ['facing', 'observedAt'],
    toleranceDeg: 3,
  },
  compass: {
    minAccuracy: 0.7,
    maxProcessingTime: 1000, // 1秒
    requiredFields: ['accelerometer', 'magnetometer', 'gyroscope'],
    calibrationRequired: true,
  },
} as const;
```

### 3. Better Auth 配置

**文件路径**: `src/lib/auth.ts`

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
```

### 4. 数据库 Schema

**文件路径**: `src/db/schema.ts`

主要表结构包括：
- `users` - 用户表
- `sessions` - 会话表
- `accounts` - 账户表
- `credits` - 积分表
- `credit_transactions` - 积分交易记录表
- `bazi_analyses` - 八字分析记录表
- `xuankong_analyses` - 玄空风水分析记录表

---

## 🛡️ 安全与合规

### 已实现的安全措施

- ✅ **年龄验证** - 18岁弹窗确认
- ✅ **免责声明** - 顶部固定声明栏
- ✅ **敏感词过滤** - 自动检测和拒答
- ✅ **积分验证** - 使用前检查余额
- ✅ **输入验证** - Zod schema验证
- ✅ **错误处理** - 完善的错误边界
- ✅ **SQL 注入防护** - 使用 Drizzle ORM
- ✅ **XSS 防护** - React 自动转义
- ✅ **CSRF 防护** - Better Auth 内置

### 置信度分级处理

- 🔴 **红色** (< 0.4): 拒答 + 手动输入引导
- 🟡 **黄色** (0.4-0.7): 警告 + 校准引导  
- 🟢 **绿色** (≥ 0.7): 正常处理

### 安全头部

在 `next.config.ts` 中配置的安全头部：

```typescript
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN',
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff',
},
{
  key: 'X-XSS-Protection',
  value: '1; mode=block',
},
{
  key: 'Referrer-Policy',
  value: 'origin-when-cross-origin',
}
```

---

## 🌍 国际化支持

### 支持的语言

| 语言代码 | 语言名称 | 翻译文件 |
|---------|---------|---------|
| `zh-CN` | 简体中文 | `messages/zh-CN.json` |
| `en` | English | `messages/en.json` |
| `ms` | Malay (马来语) | `messages/ms.json` |

### 添加新语言

1. 在 `messages/` 目录创建新的翻译文件（如 `ja.json`）
2. 在 `src/i18n/routing.ts` 添加语言配置
3. 复制 `messages/zh-CN.json` 的结构进行翻译

### 使用翻译

```tsx
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('namespace');
  
  return <h1>{t('title')}</h1>;
}
```

---

## 📊 项目状态

### 当前版本: v5.1.1

| 模块 | 状态 | 完成度 |
|------|------|--------|
| 认证系统 | ✅ 完成 | 100% |
| 积分系统 | ✅ 完成 | 100% |
| 八字分析 | ✅ 完成 | 100% |
| 玄空风水 | ✅ 完成 | 100% |
| 罗盘功能 | ✅ 完成 | 100% |
| 户型分析 | ✅ 完成 | 100% |
| AI 对话 | ✅ 完成 | 100% |
| 国际化 | ✅ 完成 | 100% |
| 响应式设计 | ✅ 完成 | 100% |
| 管理后台 | 🚧 进行中 | 80% |

### 里程碑

- ✅ **v1.0** - 基础功能完成 (2025-10-02)
- ✅ **v5.1** - Better Auth 迁移 (2025-10-27)
- 🚧 **v5.2** - 管理后台完善 (进行中)
- 📅 **v6.0** - 性能优化与缓存 (计划中)

---

## ❓ 常见问题

### 1. 数据库连接失败

```bash
# 检查环境变量
echo $DATABASE_URL

# 测试数据库连接
npm run db:studio

# 重新推送 Schema
npm run db:push
```

### 2. 依赖安装失败

```bash
# 清理缓存
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 或使用 pnpm
pnpm install
```

### 3. TypeScript 编译错误

```bash
# 类型检查
npx tsc --noEmit

# 清理构建缓存
rm -rf .next

# 重新构建
npm run build
```

### 4. 端口被占用

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### 5. AI 模型 API 调用失败

- 检查 API Key 是否正确配置
- 确认 API 额度是否充足
- 查看网络连接是否正常
- 检查模型 ID 是否正确

### 6. 积分余额不一致

```bash
# 运行积分一致性验证
npm run verify:credits

# 查看积分交易记录
# 在数据库中查询 credit_transactions 表
```

---

## 📞 联系方式

- **项目仓库**: https://github.com/litom914295/qiflowai
- **问题反馈**: [GitHub Issues](https://github.com/litom914295/qiflowai/issues)
- **Pull Request**: [GitHub PR](https://github.com/litom914295/qiflowai/pulls)
- **作者**: QiFlow AI Team

---

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [Better Auth 文档](https://better-auth.com/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Shadcn UI 文档](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/)

---

**🎉 QiFlow AI - 让命理与科技完美融合！**

*最后更新: 2025-11-12*
