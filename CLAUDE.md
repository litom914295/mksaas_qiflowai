# 🔮 QiFlow AI - Claude 开发文档

**版本**: v5.1.1  
**最后更新**: 2025-11-12  
**AI 助手**: Claude (Anthropic)

> 这是专门为 Claude AI 助手准备的项目文档，包含完整的项目上下文、架构设计、开发规范和业务逻辑。

---

## 📋 项目概览

**QiFlow AI** 是一个基于 **Next.js 15 + TypeScript + Better Auth** 构建的 **AI 驱动命理风水 SaaS 平台**。

### 核心定位

- **目标用户**: 对命理、风水感兴趣的用户
- **核心价值**: 提供基于 AI 的智能命理分析和风水咨询服务
- **商业模式**: 积分制付费模式
- **技术特色**: 现代化技术栈 + 传统命理算法 + AI 增强

### 关键特性

#### 🎯 业务功能
1. **八字分析** (BaZi) - 10 积分/次
2. **玄空风水** (Xuankong) - 20 积分/次
3. **智能罗盘** (Compass) - 免费工具
4. **户型分析** (Floorplan) - 待定
5. **AI 对话** (Chat) - 5 积分/次，40 积分/15分钟会话
6. **月运分析** (Monthly Fortune) - 深度解读 30 积分
7. **PDF 报告导出** - 5 积分/次

#### 🛡️ 技术特性
- **Better Auth 认证系统** - 邮箱/密码、社交登录 (GitHub/Google)
- **积分系统** - 充值、消费、交易记录、过期管理
- **国际化** - 中文、英文、马来语 (next-intl)
- **响应式设计** - 桌面、平板、移动端完美适配
- **RSC 架构** - React Server Components 优先
- **类型安全** - 严格的 TypeScript + Zod 验证

---

## 🏗️ 技术架构

### 技术栈概览

```typescript
// 前端框架
Next.js 15.2.1        // App Router + RSC
React 19.1.0          // UI 库
TypeScript 5.8.3      // 类型系统

// 样式系统
Tailwind CSS 4.0.14   // 原子化 CSS
Shadcn UI + Radix UI  // 组件库
Framer Motion 12.23   // 动画

// 后端技术
Better Auth 1.2.8     // 认证系统
Drizzle ORM 0.39.3    // 数据库 ORM
PostgreSQL 14+        // 主数据库

// AI 集成
Vercel AI SDK 5.0.0   // AI 框架
@ai-sdk/google 2.0.0  // Gemini
@ai-sdk/openai 2.0.0  // GPT
@ai-sdk/deepseek 1.0  // DeepSeek

// 开发工具
Biome 1.9.4           // Linter + Formatter
Vitest 3.2.4          // 单元测试
Playwright 1.55.1     // E2E 测试
```

### 目录结构

```
src/
├── app/                     # Next.js App Router
│   ├── [locale]/           # 国际化路由层
│   │   ├── (auth)/         # 认证页面
│   │   ├── (marketing)/    # 营销页面
│   │   └── dashboard/      # 用户仪表板
│   └── api/                # API 路由
│       ├── auth/[...all]/  # Better Auth 端点
│       └── qiflow/         # QiFlow 业务 API
├── actions/                # Server Actions
│   ├── auth.ts            # 认证操作
│   ├── credits.ts         # 积分操作
│   └── qiflow/            # QiFlow 业务逻辑
├── components/             # React 组件
│   ├── ui/                # Shadcn UI 组件
│   └── qiflow/            # QiFlow 业务组件
├── lib/                    # 核心库
│   ├── auth.ts            # Better Auth 配置
│   ├── qiflow/            # QiFlow 算法库
│   └── utils.ts           # 工具函数
├── db/                     # 数据库
│   ├── schema.ts          # Drizzle Schema
│   └── index.ts           # 数据库连接
├── config/                 # 配置文件
│   ├── qiflow-pricing.ts  # 定价配置
│   └── qiflow-thresholds.ts # 阈值配置
└── i18n/                   # 国际化配置
```

---

## 💾 数据库设计

### 核心表结构

#### 用户系统

```typescript
// user 表
{
  id: string (PK)
  name: string
  email: string (unique)
  emailVerified: boolean
  credits: integer (积分余额)
  customerId: string (Stripe customer)
  role: string
  banned: boolean
}

// session 表
{
  id: string (PK)
  token: string (unique)
  userId: string (FK)
  expiresAt: timestamp
}

// account 表
{
  id: string (PK)
  userId: string (FK)
  providerId: string
  password: string (bcrypt)
}
```

#### 积分系统

```typescript
// credit_transaction 表
{
  id: string (PK)
  userId: string (FK)
  type: 'purchase' | 'consume' | 'gift' | 'expire'
  amount: integer
  remainingAmount: integer
  paymentId: string
  expirationDate: timestamp
  metadata: jsonb
}
```

---

## 🔐 认证系统

### Better Auth 配置

**文件**: `src/lib/auth.ts`

```typescript
export const auth = betterAuth({
  baseURL: getBaseUrl(),
  database: drizzleAdapter(await getDb(), {
    provider: 'pg',
  }),
  password: {
    async hash(password: string) {
      return await bcrypt.hash(password, 10);
    },
    async verify(password: string, hash: string) {
      return await bcrypt.compare(password, hash);
    },
    config: {
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
  },
  socialProviders: {
    github: { enabled: !!process.env.GITHUB_CLIENT_ID },
    google: { enabled: !!process.env.GOOGLE_CLIENT_ID },
  },
});
```

### 使用示例

```typescript
// Server Action 中验证
const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session?.user) {
  throw new Error('Unauthorized');
}
```

---

## 💰 积分系统

### 定价配置

**文件**: `src/config/qiflow-pricing.ts`

```typescript
export const QIFLOW_PRICING = {
  aiChat: 5,              // AI 对话
  bazi: 10,               // 八字分析
  xuankong: 20,           // 玄空风水
  deepInterpretation: 30, // 深度解读
  pdfExport: 5,           // PDF 导出
  reportBasic: 50,        // 基础报告
  reportEssential: 120,   // 精华报告
  chatSession15Min: 40,   // 15 分钟会话
} as const;
```

### 消费积分

```typescript
export async function consumeCredits(
  userId: string,
  product: QiflowProduct,
  description?: string
) {
  const amount = QIFLOW_PRICING[product];
  
  await db.transaction(async (tx) => {
    // 更新余额
    await tx.update(user)
      .set({ credits: sql`${user.credits} - ${amount}` })
      .where(eq(user.id, userId));
    
    // 记录交易
    await tx.insert(creditTransaction).values({
      userId,
      type: 'consume',
      amount: -amount,
      description,
    });
  });
}
```

---

## 🎯 QiFlow 业务逻辑

### 1. 八字分析

**算法包**: `@aharris02/bazi-calculator-by-alvamind`

```typescript
import { calculateBazi } from '@aharris02/bazi-calculator-by-alvamind';

const baziResult = calculateBazi({
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  gender: 'male',
});
```

### 2. 玄空风水

**置信度阈值**: `src/config/qiflow-thresholds.ts`

```typescript
export const CONFIDENCE_THRESHOLDS = {
  REJECT: 0.4,    // 🔴 红色拒答
  WARNING: 0.7,   // 🟡 黄色警告
  NORMAL: 0.7,    // 🟢 绿色正常
};
```

### 3. AI 对话

```typescript
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

const result = streamText({
  model: google('gemini-pro'),
  messages,
  system: '你是 QiFlow AI 的命理顾问...',
});
```

---

## 🌍 国际化

### 配置

**文件**: `src/i18n/routing.ts`

```typescript
export const routing = defineRouting({
  locales: ['zh-CN', 'en', 'ms'],
  defaultLocale: 'zh-CN',
});
```

### 使用

```tsx
// 服务器组件
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('Dashboard');
return <h1>{t('title')}</h1>;

// 客户端组件
import { useTranslations } from 'next-intl';

const t = useTranslations('Dashboard');
return <h1>{t('title')}</h1>;
```

---

## 🎨 开发规范

### TypeScript

```typescript
// ✅ 使用 type
type User = { id: string; name: string };

// ✅ 字符串字面量联合类型
type Status = 'pending' | 'active';

// ❌ 避免 enum
// enum Status { Pending, Active }

// ✅ as const
const COLORS = { primary: '#007bff' } as const;
```

### React 组件

```tsx
// ✅ 箭头函数 + 类型
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};
```

### Server Actions

```typescript
'use server';

import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
});

export async function createPost(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }
  
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return { error: result.error };
  }
  
  // 执行操作...
}
```

---

## 🔧 开发命令

```bash
# 开发
npm run dev              # Turbopack
npm run dev:fast         # 快速启动

# 代码质量
npm run lint             # Lint 检查
npm run format           # 格式化
npm run type-check       # 类型检查

# 测试
npm run test:unit        # 单元测试
npm run test:e2e         # E2E 测试

# 数据库
npm run db:push          # 推送 Schema
npm run db:studio        # 数据库管理
npm run db:migrate       # 执行迁移

# 构建
npm run build            # 生产构建
npm run start            # 启动生产服务器
```

---

## 🔒 安全最佳实践

### 1. 输入验证

```typescript
// ✅ 使用 Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const result = schema.safeParse(data);
```

### 2. SQL 注入防护

```typescript
// ✅ Drizzle ORM 自动防护
const user = await db.query.user.findFirst({
  where: eq(user.email, email),
});
```

### 3. XSS 防护

```tsx
// ✅ React 自动转义
return <div>{userInput}</div>;

// ❌ 避免 dangerouslySetInnerHTML
```

### 4. 环境变量

```typescript
// ✅ 服务器端
process.env.DATABASE_URL

// ✅ 客户端 (必须 NEXT_PUBLIC_ 前缀)
process.env.NEXT_PUBLIC_APP_URL
```

---

## 📊 性能优化

### 1. RSC 优先

```tsx
// ✅ 默认使用 Server Component
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### 2. 数据缓存

```typescript
// ✅ fetch 缓存
const data = await fetch(url, {
  next: { revalidate: 3600 },
});
```

### 3. 代码分割

```tsx
// ✅ 动态导入
import dynamic from 'next/dynamic';

const Heavy = dynamic(() => import('./Heavy'), {
  loading: () => <div>Loading...</div>,
});
```

### 4. Suspense

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  );
}
```

---

## 🐛 调试

### 服务器日志

```typescript
console.log('✅ Success:', { userId, action });
console.error('❌ Error:', { error, context });
```

### 数据库调试

```bash
# Drizzle Studio
npm run db:studio
# 访问 http://localhost:4983
```

---

## 📝 常见问题

### 数据库连接失败

```bash
echo $DATABASE_URL
npm run db:studio
npm run db:push
```

### TypeScript 错误

```bash
rm -rf .next
npm run type-check
```

### 积分不一致

```bash
npm run verify:credits
```

---

## 🎯 开发检查清单

### 功能开发
- [ ] 需求分析
- [ ] Schema 设计
- [ ] Server Action 实现
- [ ] Zod 验证
- [ ] 错误处理
- [ ] 单元测试
- [ ] E2E 测试

### 代码质量
- [ ] TypeScript 类型
- [ ] Lint 通过
- [ ] 格式化一致
- [ ] 无 console.log

### 安全检查
- [ ] 输入验证
- [ ] 认证检查
- [ ] SQL 注入防护
- [ ] XSS 防护

### 性能检查
- [ ] 使用 RSC
- [ ] 数据缓存
- [ ] 代码分割
- [ ] Suspense

---

## 📞 支持

- **仓库**: https://github.com/litom914295/qiflowai
- **Issues**: [GitHub Issues](https://github.com/litom914295/qiflowai/issues)

---

## 📚 参考文档

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [Better Auth](https://better-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vercel AI SDK](https://sdk.vercel.ai/)

---

## 📌 Task Master 集成

**Import Task Master's development workflow commands and guidelines**

@./.taskmaster/CLAUDE.md

---

**🎉 QiFlow AI - 让 AI 与传统文化完美融合！**

*最后更新: 2025-11-12*
