# QiFlow AI - 开发者快速参考指南

**版本**: v0.5-alpha  
**更新日期**: 2025-01-12

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- PostgreSQL (Supabase)
- Git

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 环境变量配置
创建 `.env.local` 文件:
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# DeepSeek (主力 AI)
DEEPSEEK_API_KEY="..."

# Stripe (可选)
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# Cloudflare Turnstile (可选)
CLOUDFLARE_TURNSTILE_SECRET_KEY="..."
```

### 启动开发服务器
```bash
npm run dev
```

访问: http://localhost:3000

---

## 📁 关键文件位置

### Actions (Server Actions)
```
src/actions/
├── chat/
│   ├── create-chat-session.ts       # 创建会话 (40 积分)
│   ├── renew-chat-session.ts        # 续费会话 (40 积分)
│   ├── end-chat-session.ts          # 结束会话
│   └── get-chat-session-status.ts   # 获取会话状态
└── qiflow/
    ├── purchase-report-with-credits.ts  # 购买报告 (120 积分)
    └── claim-ab-test-reward.ts          # 领取 A/B 奖励 (10 积分)
```

### 核心库 (Libraries)
```
src/lib/
├── qiflow/
│   ├── reports/
│   │   └── essential-report.ts      # 报告生成引擎 (Phase 3)
│   ├── theme-recommendation.ts      # 智能推荐算法 (Phase 5)
│   ├── bazi.ts                      # 八字计算
│   └── fengshui/
│       └── flying-star.ts           # 玄空飞星
├── ab-test/
│   └── manager.ts                   # A/B 测试管理器 (Phase 5)
├── ai-compliance.ts                 # AI 合规 (Phase 1)
└── rag/                             # RAG 知识库 (Phase 7 - 待实施)
    ├── text-chunker.ts
    ├── embedding-service.ts
    ├── vector-search.ts
    └── rag-generator.ts
```

### 组件 (Components)
```
src/components/
├── chat/
│   ├── session-timer.tsx            # 会话倒计时 (Phase 6)
│   ├── chat-session-starter.tsx     # 会话启动组件
│   ├── enhanced-chat-interface.tsx  # Chat 界面
│   └── use-chat-session.ts          # Chat Hook
└── qiflow/
    ├── paywall-overlay.tsx                    # 支付墙
    ├── essential-report-purchase-page.tsx     # 购买页面 (含 A/B)
    ├── essential-report-detail-page.tsx       # 报告详情
    └── essential-report-list-page.tsx         # 报告列表
```

### 数据库 Schema
```
src/db/
├── schema.ts                        # 主 Schema (含 A/B 测试表)
└── schema-knowledge.ts              # RAG 知识库 Schema (Phase 7)

drizzle/
├── 0001_phase1_webhook_idempotency.sql
├── 0002_phase2_reports_and_sessions.sql
├── 0003_phase5_ab_test.sql
└── 0004_phase7_knowledge_base.sql   # (待创建)
```

### 配置文件
```
src/config/
└── qiflow-pricing.ts                # 定价配置

src/credits/
├── types.ts                         # 积分交易类型
└── manager.ts                       # 积分管理器
```

---

## 🗄️ 数据库操作

### 生成迁移文件
```bash
npx drizzle-kit generate
```

### 执行迁移
```bash
npx drizzle-kit push

# 或手动执行
node scripts/run-migration.js
```

### 查看 Schema
```bash
npx drizzle-kit studio
```

### 手动执行 SQL
```bash
psql $DATABASE_URL < drizzle/0003_phase5_ab_test.sql
```

---

## 💰 积分系统使用

### 积分交易类型
```typescript
import { CREDIT_TRANSACTION_TYPE } from "@/credits/types";

// 获取积分
MONTHLY_REFRESH        // 月度刷新
REGISTER_GIFT          // 注册礼包
PURCHASE_PACKAGE       // 购买套餐
DAILY_SIGNIN           // 每日签到
REFERRAL_REWARD        // 推荐奖励
AB_TEST_BONUS          // A/B 测试奖励

// 消耗积分
REPORT_PURCHASE        // 报告购买 (120)
CHAT_SESSION_START     // 开启会话 (40)
CHAT_SESSION_RENEW     // 续费会话 (40)
```

### 积分管理
```typescript
import { creditsManager } from "@/credits/manager";

// 获取余额
const balance = await creditsManager.getBalance(userId);

// 扣除积分
await creditsManager.deduct(userId, 120, {
  type: CREDIT_TRANSACTION_TYPE.REPORT_PURCHASE,
  description: "购买精华报告",
});

// 添加积分
await creditsManager.addCredits(userId, 10, {
  type: CREDIT_TRANSACTION_TYPE.AB_TEST_BONUS,
  description: "采纳推荐奖励",
});
```

---

## 🤖 AI 服务使用

### 报告生成
```typescript
import { generateEssentialReport } from "@/lib/qiflow/reports/essential-report";

const reportOutput = await generateEssentialReport({
  birthInfo: {
    birthDate: "1990-01-01",
    birthHour: "09",
    gender: "male",
    location: "北京市",
  },
  selectedThemes: ["career", "relationship", "health"],
});

// reportOutput 包含:
// - baziData: 八字数据
// - flyingStarData: 玄空飞星数据
// - themes: 3 个主题的分析
// - qualityScore: 质量评分
```

### A/B 测试
```typescript
import { abTestManager } from "@/lib/ab-test/manager";

// 获取用户变体
const variant = await abTestManager.getVariant({
  experimentName: "theme_recommendation_v1",
  userId: userId,
});

// 追踪事件
await abTestManager.trackEvent({
  experimentName: "theme_recommendation_v1",
  userId: userId,
  eventType: "recommendation_adopted",
  eventData: { adoptedThemes: ["career", "health", "family"] },
});

// 检查是否已领取奖励
const hasReceived = await abTestManager.hasReceivedReward({
  experimentName: "theme_recommendation_v1",
  userId: userId,
});
```

### 智能推荐
```typescript
import { recommendThemes, explainRecommendation } from "@/lib/qiflow/theme-recommendation";
import { calculateBaziElements } from "@/lib/qiflow/bazi";

// 计算五行
const elements = calculateBaziElements("1990-01-01", "09");

// 生成推荐
const recommended = recommendThemes({
  birthDate: "1990-01-01",
  gender: "male",
  elements,
});
// => ["relationship", "career", "education"]

// 生成解释
const explanation = explainRecommendation({
  birthDate: "1990-01-01",
  gender: "male",
  elements,
});
```

---

## 🧪 测试命令

### 单元测试
```bash
npm test

# 监听模式
npm test -- --watch

# 覆盖率
npm test -- --coverage
```

### E2E 测试
```bash
npm run test:e2e
```

### 类型检查
```bash
npm run typecheck
```

### Lint
```bash
npm run lint

# 自动修复
npm run lint:fix
```

---

## 📊 常用查询

### 查看报告统计
```sql
-- 报告总数
SELECT COUNT(*) FROM qiflow_reports;

-- 按状态统计
SELECT status, COUNT(*) 
FROM qiflow_reports 
GROUP BY status;

-- 收入统计
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as count,
  SUM(credits_used) as total_credits
FROM qiflow_reports
WHERE status = 'completed'
GROUP BY date
ORDER BY date DESC;
```

### 查看 A/B 测试结果
```sql
-- 实验统计
SELECT 
  e.name,
  a.variant_id,
  COUNT(DISTINCT a.user_id) as users,
  COUNT(ev.id) as events
FROM ab_test_experiments e
JOIN ab_test_assignments a ON e.id = a.experiment_id
LEFT JOIN ab_test_events ev ON a.id = ev.assignment_id
GROUP BY e.name, a.variant_id;

-- 转化率统计
SELECT 
  a.variant_id,
  COUNT(DISTINCT CASE WHEN ev.event_type = 'recommendation_adopted' THEN ev.user_id END) as adopted,
  COUNT(DISTINCT CASE WHEN ev.event_type = 'purchase_completed' THEN ev.user_id END) as converted,
  COUNT(DISTINCT a.user_id) as total_users
FROM ab_test_assignments a
LEFT JOIN ab_test_events ev ON a.id = ev.assignment_id
WHERE a.experiment_id = (SELECT id FROM ab_test_experiments WHERE name = 'theme_recommendation_v1')
GROUP BY a.variant_id;
```

### 查看 Chat 会话统计
```sql
-- 会话统计
SELECT 
  status,
  COUNT(*) as count,
  SUM(credits_used) as total_credits,
  AVG(message_count) as avg_messages
FROM chat_sessions
GROUP BY status;

-- 续费统计
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as sessions,
  SUM((metadata->>'renewalCount')::int) as total_renewals,
  AVG((metadata->>'renewalCount')::int) as avg_renewals
FROM chat_sessions
GROUP BY date
ORDER BY date DESC;
```

---

## 🔧 常见问题

### 1. 数据库连接失败
**问题**: `Error: getaddrinfo ENOTFOUND`

**解决**:
```bash
# 检查环境变量
echo $DATABASE_URL

# 测试连接
psql $DATABASE_URL -c "SELECT 1"
```

### 2. 积分扣除失败
**问题**: 余额不足或重复扣除

**检查**:
```typescript
// 先检查余额
const balance = await creditsManager.getBalance(userId);
console.log("Current balance:", balance);

// 查看交易记录
const transactions = await db
  .select()
  .from(creditTransaction)
  .where(eq(creditTransaction.userId, userId))
  .orderBy(desc(creditTransaction.createdAt))
  .limit(10);
```

### 3. A/B 测试变体不一致
**问题**: 同一用户每次获取不同变体

**原因**: MD5 哈希分桶算法应该保证一致性

**检查**:
```typescript
// 验证哈希分桶
import { createHash } from "crypto";

const userId = "test-user-123";
const hash = createHash("md5").update(userId).digest("hex");
const hashNum = parseInt(hash.substring(0, 8), 16);
console.log("Hash:", hashNum); // 应该每次相同
```

### 4. 报告生成超时
**问题**: 生成时间 > 30s

**优化**:
- 检查 AI 模型响应时间
- 并行生成多个主题
- 降低 temperature 参数
- 使用更快的模型 (DeepSeek)

### 5. Chat 会话过期未更新
**问题**: 过期后状态仍为 `active`

**修复**:
```typescript
// 手动更新过期会话
import { getChatSessionStatusAction } from "@/actions/chat/get-chat-session-status";

// 调用此 Action 会自动更新过期状态
const result = await getChatSessionStatusAction(sessionId);
```

---

## 📝 代码规范

### 命名约定
```typescript
// 组件: PascalCase
export function ChatSessionStarter() {}

// 函数: camelCase
export async function createChatSessionAction() {}

// 常量: UPPER_SNAKE_CASE
const SESSION_DURATION_MS = 15 * 60 * 1000;

// 类型: PascalCase
type SessionTimerProps = {...}

// 接口: PascalCase (不使用 I 前缀)
interface SearchOptions {...}
```

### 文件组织
```typescript
// 1. Imports
import { ... } from "...";

// 2. Types/Interfaces
interface Props {...}

// 3. Constants
const MAX_RETRIES = 3;

// 4. Main exports
export function Component() {...}

// 5. Helper functions
function helperFunction() {...}
```

### 错误处理
```typescript
try {
  // 操作
  const result = await someAction();
  
  if (!result.success) {
    // 处理业务错误
    toast({ title: "操作失败", description: result.error });
    return;
  }
  
  // 成功逻辑
} catch (error) {
  // 处理系统错误
  console.error("System error:", error);
  toast({ title: "系统错误", description: "请稍后重试" });
}
```

---

## 🚀 部署清单

### 1. 环境变量检查
- [ ] DATABASE_URL
- [ ] AUTH_SECRET
- [ ] OPENAI_API_KEY
- [ ] DEEPSEEK_API_KEY
- [ ] STRIPE_SECRET_KEY (可选)
- [ ] CLOUDFLARE_TURNSTILE_SECRET_KEY (可选)

### 2. 数据库迁移
- [ ] 执行所有迁移脚本
- [ ] 验证表结构
- [ ] 创建必要的索引

### 3. 构建检查
- [ ] `npm run build` 无错误
- [ ] `npm run typecheck` 通过
- [ ] `npm run lint` 通过

### 4. 功能测试
- [ ] 用户注册/登录
- [ ] 报告购买流程
- [ ] Chat 会话创建
- [ ] A/B 测试分组
- [ ] 积分扣除/添加

### 5. 性能优化
- [ ] 启用 Next.js 缓存
- [ ] 图片优化
- [ ] API 响应时间 < 3s
- [ ] 首屏加载 < 2s

---

## 📞 联系与支持

**技术文档**: `mksaas/docs/`  
**问题反馈**: [待补充]  
**代码仓库**: D:\test\mksaas_qiflowai

---

**最后更新**: 2025-01-12 03:45 UTC+8  
**维护者**: QiFlow AI Team
