# QiFlow 技术实现手册 v5.0

> **版本**：5.0  
> **日期**：2024-12-27  
> **状态**：基于v4.0融合MKSaaS架构的技术实现指南

---

## 1. 技术栈演进

### 1.1 从v4.0到v5.0的技术迁移

| 组件 | v4.0方案 | v5.0方案(MKSaaS) | 迁移策略 |
|------|----------|------------------|----------|
| **框架** | Next.js 14 | Next.js 15 App Router | 直接升级 |
| **数据库** | PostgreSQL + Prisma | PostgreSQL + Drizzle ORM | Schema迁移 |
| **认证** | 自建JWT | Better Auth | 完全替换 |
| **支付** | 自建系统 | Stripe + Credits | 完全替换 |
| **UI** | Ant Design | Radix UI + Shadcn/ui | 组件重写 |
| **状态管理** | Redux | Zustand | 逐步迁移 |
| **API** | REST + GraphQL | Server Actions + tRPC | 新增模式 |
| **AI SDK** | 自建封装 | Vercel AI SDK | 统一接口 |

### 1.2 保留的QiFlow核心模块
- 八字双库融合算法（完整保留）
- 玄空飞星引擎（完整保留）
- 四通道罗盘系统（完整保留）
- AI Orchestrator（适配AI SDK）

---

## 2. 项目结构（基于MKSaaS Template）

### 2.1 目录组织
```bash
qiflow-v5/
├── src/
│   ├── app/                  # Next.js 15 App Router
│   │   └── [locale]/          # 国际化路由
│   │       ├── (marketing)/   # 营销页面
│   │       ├── (dashboard)/   # 用户仪表板
│   │       │   ├── bazi/      # 八字分析（新增）
│   │       │   ├── fengshui/  # 风水分析（新增）
│   │       │   └── ai-chat/   # AI对话（新增）
│   │       └── (auth)/        # 认证页面（MKSaaS）
│   │
│   ├── actions/               # Server Actions
│   │   ├── qiflow/           # QiFlow业务逻辑（新增）
│   │   │   ├── calculate-bazi.ts
│   │   │   ├── xuankong-analysis.ts
│   │   │   └── compass-reading.ts
│   │   └── [MKSaaS actions]  # 继承MKSaaS
│   │
│   ├── lib/                   
│   │   ├── qiflow/           # QiFlow核心算法（新增）
│   │   │   ├── bazi/         # 八字双库融合
│   │   │   ├── xuankong/     # 玄空风水引擎
│   │   │   └── compass/      # 罗盘融合算法
│   │   └── [MKSaaS libs]     # 继承MKSaaS
│   │
│   ├── components/
│   │   ├── qiflow/           # QiFlow专有组件（新增）
│   │   │   ├── bazi-chart/   # 八字图表
│   │   │   ├── flying-star/  # 飞星九宫格
│   │   │   └── compass-view/ # 罗盘视图
│   │   └── [MKSaaS comps]    # 继承MKSaaS
│   │
│   └── db/
│       ├── schema.ts          # MKSaaS基础表
│       └── schema-qiflow.ts   # QiFlow扩展表（新增）
```

---

## 3. 认证系统集成（Better Auth）

### 3.1 配置扩展
```typescript
// src/lib/auth-qiflow.ts
import { auth as mksaasAuth } from './auth';
import { subscribe } from '@/newsletter';
import { addRegisterGiftCredits } from '@/credits/credits';
import { createInitialBaziProfile } from '@/lib/qiflow/user';

// 扩展MKSaaS的auth配置
export const auth = betterAuth({
  ...mksaasAuth.options,
  
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // 继承MKSaaS的钩子
          await mksaasAuth.options.databaseHooks.user.create.after(user);
          
          // QiFlow特有逻辑
          await createInitialBaziProfile(user.id);
          
          // 赠送额外积分（命理服务专用）
          if (websiteConfig.qiflow.registerBonus.enable) {
            await addQiFlowBonus(user.id);
          }
        }
      }
    }
  },
  
  // 添加微信登录（中国市场）
  socialProviders: {
    ...mksaasAuth.options.socialProviders,
    wechat: {
      clientId: process.env.WECHAT_APP_ID!,
      clientSecret: process.env.WECHAT_APP_SECRET!
    }
  }
});
```

---

## 4. 数据库Schema集成（Drizzle ORM）

### 4.1 Schema扩展策略
```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as mksaasSchema from './schema';
import * as qiflowSchema from './schema-qiflow';

// 合并schema
export const schema = {
  ...mksaasSchema,
  ...qiflowSchema
};

// 创建数据库实例
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

### 4.2 数据迁移
```bash
# 生成迁移文件
pnpm db:generate

# 应用迁移
pnpm db:migrate

# 数据库管理界面
pnpm db:studio
```

---

## 5. Server Actions实现

### 5.1 安全Action封装
```typescript
// src/lib/safe-action-qiflow.ts
import { createSafeActionClient } from 'next-safe-action';
import { auth } from '@/lib/auth-qiflow';

// QiFlow专用的安全action客户端
export const qiflowAction = createSafeActionClient({
  handleReturnedServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }
    return '计算过程中出现错误';
  },
  
  defineMetadata() {
    return {
      actionName: 'qiflow-action',
      trackingId: nanoid()
    };
  }
});

// 需要认证的action
export const authQiflowAction = qiflowAction.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: headers()
  });
  
  if (!session) {
    throw new Error('请先登录');
  }
  
  return next({
    ctx: {
      user: session.user,
      session
    }
  });
});
```

---

## 6. AI集成（Vercel AI SDK）

### 6.1 Provider配置
```typescript
// src/ai/qiflow/config.ts
export const aiProviders = {
  // 复用MKSaaS已配置的providers
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY
  }),
  
  deepseek: createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY
  }),
  
  google: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY
  }),
  
  // QiFlow特有配置
  qiflowRouter: {
    bazi: 'openai:gpt-4o',        // 八字分析用GPT-4
    fengshui: 'deepseek:chat',    // 风水分析用DeepSeek
    chat: 'google:gemini-flash'    // 对话用Gemini
  }
};
```

### 6.2 流式响应实现
```typescript
// src/app/api/qiflow/chat/route.ts
import { streamText } from 'ai';
import { aiProviders } from '@/ai/qiflow/config';

export async function POST(req: Request) {
  const { messages, analysisType } = await req.json();
  
  // 根据分析类型选择模型
  const model = aiProviders[aiProviders.qiflowRouter[analysisType]];
  
  // 加载知识库
  const knowledge = await loadQiFlowKnowledge(analysisType);
  
  // 流式生成
  const result = await streamText({
    model,
    messages: enhanceWithKnowledge(messages, knowledge),
    temperature: 0.7,
    maxTokens: 2000
  });
  
  return result.toDataStreamResponse();
}
```

---

## 7. 支付系统集成（Stripe + Credits）

### 7.1 QiFlow定价配置
```typescript
// src/config/qiflow-pricing.ts
export const qiflowPricing = {
  credits: {
    bazi: 10,           // 八字分析消耗
    xuankong: 20,       // 玄空风水消耗
    aiChat: 5,          // AI对话消耗
    pdfExport: 5        // PDF导出消耗
  },
  
  plans: {
    // 复用MKSaaS的订阅计划
    pro: {
      ...websiteConfig.price.plans.pro,
      features: [
        '无限次八字分析',
        '专业风水评估',
        'AI深度解读',
        'PDF报告导出'
      ]
    },
    
    // QiFlow特有计划
    master: {
      id: 'master',
      prices: [{
        priceId: process.env.STRIPE_PRICE_MASTER!,
        amount: 9900, // $99/月
        interval: 'month'
      }],
      features: [
        '所有Pro功能',
        '1对1专家咨询',
        '择日择时服务',
        '企业API访问'
      ]
    }
  }
};
```

---

## 8. 部署架构（基于MKSaaS）

### 8.1 Vercel部署配置
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "regions": ["sin1", "hnd1", "sfo1"], // 亚太优先
  "env": {
    "DATABASE_URL": "@database_url",
    "OPENAI_API_KEY": "@openai_api_key",
    "STRIPE_SECRET_KEY": "@stripe_secret_key"
  }
}
```

### 8.2 数据库选择
- **开发环境**: Neon PostgreSQL (免费层)
- **生产环境**: Supabase PostgreSQL (亚太区域)
- **备选方案**: PlanetScale MySQL

---

## 9. 性能优化策略

### 9.1 缓存层级
```typescript
// 1. 浏览器缓存 (Service Worker)
// 2. CDN缓存 (Vercel Edge)
// 3. Redis缓存 (Upstash)
// 4. 数据库缓存 (Materialized Views)

// Redis缓存示例
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
});

export async function getCachedBazi(key: string) {
  const cached = await redis.get(key);
  if (cached) return cached;
  
  const result = await calculateBazi(key);
  await redis.set(key, result, { ex: 86400 }); // 缓存24小时
  
  return result;
}
```

### 9.2 性能监控
- Vercel Analytics (Web Vitals)
- OpenPanel (用户行为)
- Sentry (错误追踪)
- Prometheus + Grafana (自定义指标)

---

## 10. 测试策略

### 10.1 测试金字塔
```
         E2E (10%)
        /         \
    Integration (30%)
   /                 \
Unit Tests (60%)
```

### 10.2 测试工具
- **单元测试**: Vitest
- **集成测试**: Jest + Testing Library
- **E2E测试**: Playwright
- **性能测试**: K6

---

## 11. 开发工作流

### 11.1 Git分支策略
```
main
├── develop
│   ├── feature/bazi-v2
│   ├── feature/xuankong
│   └── feature/ai-chat
└── release/v5.0
```

### 11.2 CI/CD流程
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

---

## 12. 安全最佳实践

### 12.1 环境变量管理
```typescript
// src/lib/env.mjs
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    OPENAI_API_KEY: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    // QiFlow特有
    BAZI_API_SECRET: z.string().min(1),
    XUANKONG_LICENSE: z.string().min(1)
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url()
  }
});
```

### 12.2 数据加密
- 传输加密: TLS 1.3
- 存储加密: AES-256-GCM
- 敏感数据: 使用Vault或KMS

---

## 附录：迁移检查清单

- [ ] MKSaaS模版初始化完成
- [ ] 数据库Schema扩展完成
- [ ] Better Auth配置完成
- [ ] Stripe支付集成完成
- [ ] QiFlow核心算法迁移完成
- [ ] AI SDK集成完成
- [ ] UI组件迁移完成
- [ ] 测试覆盖率达标
- [ ] 性能基准测试通过
- [ ] 安全审计通过

---

*文档版本*：5.0  
*基于*：MKSaaS Template + QiFlow v4.0  
*更新日期*：2024-12-27

---

## 13. API参考（Server Actions 与 Route Handlers）

> 原则：以 next-safe-action + Zod 为核心，所有输入输出均强校验；统一错误结构；与积分/订阅策略耦合最小化。

### 13.1 统一错误结构
```json
{
  "code": "string",            // e.g. VALIDATION_ERROR | PERMISSION_DENIED | RATE_LIMITED | PROVIDER_ERROR
  "message": "string",         // 面向用户的安全文案
  "details": { "...": "..." }, // 开发调试用，可为空
  "traceId": "uuid"            // 便于链路追踪
}
```

### 13.2 Bazi 计算（Server Action）
- 路径：src/actions/qiflow/calculate-bazi.ts
- 权限：需要登录；免费用户扣积分（qiflowPricing.credits.bazi），Pro/更高订阅免扣
- 幂等：同一输入以 checksum 去重（可选）
- 输入（Zod）：
```ts
import { z } from 'zod';
export const baziInputSchema = z.object({
  birthDate: z.string().datetime({ offset: true }), // ISO 8601
  birthTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().default('auto'),
  location: z.object({ lat: z.number(), lng: z.number(), name: z.string().optional() }).optional()
});
```
- 输出（示意）：
```ts
export type BaziResult = {
  id: string;
  pillars: { year: any; month: any; day: any; hour: any };
  elements: { wood: number; fire: number; earth: number; metal: number; water: number };
  tenGods?: Record<string, number>;
  meta: { confidence: number; checksum: string };
};
```
- 错误：VALIDATION_ERROR | PERMISSION_DENIED | INSUFFICIENT_CREDITS | PROVIDER_ERROR

### 13.3 玄空风水分析（Server Action）
- 路径：src/actions/qiflow/xuankong-analysis.ts
- 权限：登录；订阅优先，否侧按次扣费
- 输入：facingDeg、year、month（PRD v5.0）
- 输出：flyingStars、mountainFacing、recommendations、jianXiang、confidence
- 降级：当罗盘不可用时，允许手动输入角度与“地理/建筑对齐”

### 13.4 罗盘读取（Route Handler + Client 组合）
- Route：src/app/api/compass/normalize/route.ts（可选）
- 逻辑：前端收集 DeviceOrientation + WMM + SunCalc，服务端仅做归一化与审计打点

### 13.5 AI 对话（流式）
- Route：src/app/api/qiflow/chat/route.ts
- 协议：SSE/流式文本；最大 tokens 与超时保护；对来源引用进行最少化保留
- 错误：PROVIDER_ERROR（含子码 openai/deepseek/google），TOO_MANY_REQUESTS

---

## 14. 前端实现细则（与 UI/PRD v5.0 对齐）

### 14.1 App Router 与边界
- RSC 优先：分析结果与只读页面使用 RSC；需要状态/浏览器 API 的组件用 'use client' 拆到叶子
- 组件边界：数据获取逻辑禁止内联到 UI 组件，统一由 Server Actions + 小型 hooks 注入
- 国际化：next-intl 路由段 [locale]；四柱“竖排/横排”在非中文区域默认横排，可配置切换

### 14.2 组件规范
- Shadcn/Radix 组合：保留 Radix 无障碍特性；组件变体用 class-variance-authority
- 触控与可达性：触控热区≥44px；所有交互控件具有 aria-label；焦点环统一 token（--ring）
- 动效：优先 opacity/transform；支持 prefers-reduced-motion，提供静态替代

### 14.3 可视化
- 飞星九宫格：密度切换（舒适/紧凑）；长按/悬停显示详情；移动端采用气泡层
- 罗盘：默认 2D；首次交互再按需加载 3D；低性能设备自动降级（UA + FPS 侦测）
- 图片与图标：next/image + SVG 图标；颜色随主题 token 变化

---

## 15. 监控与可观测性

### 15.1 错误与性能
- Sentry：初始化采样率 0.2，关键路径提升至 1.0；标注 traceId 与 userId
- OpenTelemetry：可选接入，采集 Server Actions 时延与错误率
- Web Vitals：Vercel Analytics，重点 LCP/INP/CLS；目标：LCP<2s、INP<100ms

### 15.2 业务埋点（OpenPanel）
- 事件命名：qf.bazi.run、qf.fengshui.run、qf.ai.chat、qf.subscription.upgrade
- 属性：user_tier、locale、device、duration_ms、credits_delta、model_provider
- 仪表盘：按周活跃付费用户（WAPU）、转化漏斗、留存曲线

---

## 16. 故障与降级策略

### 16.1 AI 编排
- 退避重试：2/4/8 秒指数退避，最大 3 次；按模型与错误码 白名单/黑名单
- FallBack：gpt-4o → deepseek → gemini；对成本敏感任务首选 deepseek
- 幂等：对同一对话轮次以 conversationId + turnId 保证去重

### 16.2 罗盘
- 权限拒绝：降级为“手动输入角度 + 地图对齐”；提示置信度低
- 干扰检测：超过阈值（例如 σ>5°）提示重新校准（8 字形动画）

### 16.3 业务侧
- 积分不足：引导订阅/充值；保留最近一次免费预览（只读）
- 支付失败：Stripe 重试 Webhook；客户门户入口暴露

---

## 17. 安全与合规

### 17.1 安全头与 CSP
- 统一在 src/middleware.ts 设置安全头（CSP、X-Frame-Options、Referrer-Policy、HSTS）
- AI 供应商域名加入 CSP allowlist；仅允许受信脚本与图片来源

### 17.2 输入校验与净化
- 所有 Server Actions/Route Handlers 使用 Zod 严格校验；对字符串做清理（trim/normalize）

### 17.3 认证与授权
- Better Auth：会话 CookieCache + 过期刷新；敏感操作要求“近期会话”
- RBAC：预留 admin role；管理端隔离

### 17.4 合规
- GDPR/CCPA：导出/删除用户数据的流程；日志脱敏；数据区域优先部署在 APAC

---

## 18. 性能与数据库优化

### 18.1 缓存层次
- 应用缓存：Next.js fetch 缓存 + revalidateTag；对知识库/配置化数据设标签刷新
- 边缘缓存：Vercel Edge/CF Cache（静态、SWR）
- 数据缓存：可选 Redis（Upstash）按键控 TTL

### 18.2 Drizzle/Postgres
- 索引策略：user_id、created_at、type 组合索引；避免 LIKE 前缀模糊搜索
- 慢查询：pg_stat_statements + auto_explain；分页采用 keyset pagination

### 18.3 前端
- 组件懒加载、路由分割、图片 WebP、content-visibility、CSS containment

---

## 19. CI/CD 与环境矩阵

### 19.1 环境
- dev：预览分支、较低采样/埋点；测试密钥
- staging：接近生产配置；只对核心团队开放
- prod：只允许主分支发布；必要的审批

### 19.2 部署
- Vercel（默认）：pnpm build；地区优先 APAC；保护环境变量
- Cloudflare（可选）：opennextjs-cloudflare；KV/R2 作为备选存储

### 19.3 质量门槛
- lint/test/build 必须通过；最小覆盖 70%（单测 + 关键路径集成测）

---

## 20. 测试体系

### 20.1 测试金字塔
- Unit（60%）：算法、格式化、适配器
- Integration（30%）：Server Actions、数据库读写、支付
- E2E（10%）：关键用户路径（八字→AI→导出；罗盘→分析→建议）

### 20.2 目录规范
- tests/unit/**、tests/integration/**、tests/e2e/**；fixtures 与 mocks 共享

### 20.3 关键用例
- Bazi：边界（闰月/时辰边界/真太阳时）；双库不一致时的融合结果
- XuanKong：兼向、元运切换；飞星路径校验
- AI：多模型 fallback；超时/重试；引用完整性
- 支付：订阅生命周期、Webhook 重放、积分扣费幂等

---

## 21. 与 PRD v5.0 的对齐关系
- 功能映射：本指南各章节与 PRD v5.0“核心功能/指标/里程碑”一一对应；任何新增功能需同时在 PRD 与本指南登记
- 指标闭环：监控埋点项与 PRD 的北极星指标（WAPU、转化、留存）一致
- 风险联动：故障与降级策略与 PRD 的“黑天鹅预案/红队演练”保持同步
