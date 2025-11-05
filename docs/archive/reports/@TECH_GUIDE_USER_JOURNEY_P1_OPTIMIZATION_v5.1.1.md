# 技术设计文档: 用户旅程 P1 优化 v5.1.1

**文档版本**: v5.1.1  
**创建日期**: 2025-10-12  
**负责人**: 技术团队  
**关联 PRD**: [@PRD_USER_JOURNEY_P1_OPTIMIZATION_v5.1.1.md](/@PRD_USER_JOURNEY_P1_OPTIMIZATION_v5.1.1.md)

---

## 目录

1. [架构概览](#架构概览)
2. [数据库设计](#数据库设计)
3. [API设计](#api设计)
4. [前端架构](#前端架构)
5. [技术实现细节](#技术实现细节)
6. [性能优化](#性能优化)
7. [安全方案](#安全方案)
8. [监控与日志](#监控与日志)
9. [部署方案](#部署方案)

---

## 架构概览

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户端 (Browser)                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router + React 18 + TypeScript              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   首页优化    │  │   邀请专页    │  │  分享海报    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   定价页面    │  │  Dashboard   │                        │
│  └──────────────┘  └──────────────┘                        │
├─────────────────────────────────────────────────────────────┤
│                       API Routes (Next.js)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/instant-preview      (即时体验)                 │  │
│  │  /api/invite/stats         (邀请数据)                 │  │
│  │  /api/share/generate-poster (海报生成)                │  │
│  │  /api/dashboard/overview    (Dashboard数据)           │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      业务逻辑层 (Services)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ BaZiService  │  │InviteService │  │PosterService │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │CreditService │  │AnalysisService│                       │
│  └──────────────┘  └──────────────┘                        │
├─────────────────────────────────────────────────────────────┤
│                        数据层 (Database)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL + Prisma ORM                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   users     │  │  referrals  │  │  analyses   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │  ┌─────────────┐  ┌─────────────┐                   │  │
│  │  │check_ins    │  │leaderboard  │                   │  │
│  │  └─────────────┘  └─────────────┘                   │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      外部服务 (External)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AI API     │  │   OSS/CDN    │  │  支付网关    │      │
│  │  (八字分析)   │  │  (图片存储)   │  │ (微信/支付宝) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

#### 前端
- **框架**: Next.js 14.2+ (App Router)
- **语言**: TypeScript 5.3+
- **UI库**: React 18+ + shadcn/ui + Radix UI
- **样式**: Tailwind CSS 3.4+
- **状态管理**: Zustand (轻量全局状态) + React Query (服务端状态)
- **图表**: Recharts 2.10+ (五行雷达图)
- **Canvas**: HTML5 Canvas API (海报生成)
- **表单**: React Hook Form + Zod
- **动画**: Framer Motion

#### 后端
- **运行时**: Node.js 20+
- **API**: Next.js API Routes (Edge/Serverless)
- **数据库**: PostgreSQL 15+ + Prisma ORM 5.7+
- **缓存**: Redis 7+ (分布式缓存)
- **队列**: BullMQ (异步任务，如海报生成)
- **文件存储**: Aliyun OSS / AWS S3
- **鉴权**: NextAuth.js 5+ (JWT)

#### DevOps
- **部署**: Vercel / 自建 Docker
- **监控**: Sentry (错误追踪) + Vercel Analytics
- **日志**: Pino (结构化日志)
- **CI/CD**: GitHub Actions

---

## 数据库设计

### Schema 变更

#### 1. 新增 `instant_previews` 表（即时体验记录）

```sql
-- 表：instant_previews（即时体验记录，用于风控和统计）
CREATE TABLE instant_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 输入信息
  birth_date DATE NOT NULL,
  birth_time TIME,
  
  -- IP和指纹（风控）
  ip_address VARCHAR(45),
  fingerprint VARCHAR(255),
  user_agent TEXT,
  
  -- 分析结果（简化存储）
  day_pillar VARCHAR(10),
  wuxing VARCHAR(10),
  wuxing_strength JSONB, -- {wood: 35, fire: 20, ...}
  today_fortune TEXT,
  favorable TEXT[],
  unfavorable TEXT[],
  
  -- 元数据
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id), -- 如果已登录
  
  -- 索引
  INDEX idx_instant_ip_date (ip_address, created_at),
  INDEX idx_instant_fingerprint (fingerprint),
  INDEX idx_instant_user (user_id)
);

COMMENT ON TABLE instant_previews IS '即时体验记录（风控+统计）';
```

#### 2. 扩展 `referrals` 表（邀请专页数据）

```sql
-- 扩展现有的 referrals 表
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{}';
-- progress 结构: {bazi: 1, xuankong: 0, pdf: 0, aiChat: 2}

ALTER TABLE referrals ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reward_tier VARCHAR(20); -- 'basic', 'milestone_3', 'milestone_10', etc.

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON referrals(referrer_id, status);
```

#### 3. 新增 `leaderboard` 表（邀请排行榜，快照）

```sql
-- 表：leaderboard（邀请排行榜，每月快照）
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户信息
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 排名数据
  rank INTEGER NOT NULL,
  period VARCHAR(20) NOT NULL, -- '2025-01', '2025-02'
  type VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'all_time'
  
  -- 统计数据
  total_invites INTEGER DEFAULT 0,
  activated_invites INTEGER DEFAULT 0,
  earned_credits INTEGER DEFAULT 0,
  
  -- 元数据
  snapshot_at TIMESTAMP DEFAULT NOW(),
  
  -- 索引
  UNIQUE INDEX idx_leaderboard_user_period (user_id, period, type),
  INDEX idx_leaderboard_rank (period, type, rank)
);

COMMENT ON TABLE leaderboard IS '邀请排行榜快照（每日/每月更新）';
```

#### 4. 新增 `posters` 表（分享海报记录）

```sql
-- 表：posters（分享海报记录）
CREATE TABLE posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联信息
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  
  -- 海报信息
  poster_url TEXT NOT NULL, -- OSS URL
  poster_type VARCHAR(20) DEFAULT 'bazi', -- 'bazi', 'xuankong', 'invite'
  
  -- 分享统计
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- 元数据
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- 过期时间（可选，节省存储）
  
  -- 索引
  INDEX idx_posters_user (user_id, created_at),
  INDEX idx_posters_analysis (analysis_id)
);

COMMENT ON TABLE posters IS '分享海报记录';
```

#### 5. 扩展 `check_ins` 表（每日签到）

```sql
-- 确认现有的 check_ins 表结构（如果没有则创建）
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- 连续天数（快照）
  consecutive_days INTEGER DEFAULT 1,
  
  -- 奖励
  reward_credits INTEGER DEFAULT 2,
  milestone_reward INTEGER DEFAULT 0, -- 如果达到里程碑
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 约束：每天只能签到一次
  UNIQUE INDEX idx_checkin_user_date (user_id, check_in_date),
  INDEX idx_checkin_user (user_id, check_in_date DESC)
);

COMMENT ON TABLE check_ins IS '每日签到记录';
```

#### 6. 扩展 `users` 表（会员等级）

```sql
-- 添加会员等级字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_tier VARCHAR(20) DEFAULT 'basic';
-- 'basic', 'silver', 'gold', 'platinum'

ALTER TABLE users ADD COLUMN IF NOT EXISTS total_invites INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS successful_invites INTEGER DEFAULT 0;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(member_tier);
CREATE INDEX IF NOT EXISTS idx_users_invites ON users(successful_invites DESC);
```

### Prisma Schema 更新

```prisma
// schema.prisma

model InstantPreview {
  id            String   @id @default(uuid())
  birthDate     DateTime @map("birth_date") @db.Date
  birthTime     DateTime? @map("birth_time") @db.Time
  
  ipAddress     String?  @map("ip_address") @db.VarChar(45)
  fingerprint   String?
  userAgent     String?  @map("user_agent")
  
  dayPillar     String   @map("day_pillar") @db.VarChar(10)
  wuxing        String   @db.VarChar(10)
  wuxingStrength Json    @map("wuxing_strength")
  todayFortune  String   @map("today_fortune")
  favorable     String[]
  unfavorable   String[]
  
  createdAt     DateTime @default(now()) @map("created_at")
  userId        String?  @map("user_id")
  user          User?    @relation(fields: [userId], references: [id])
  
  @@index([ipAddress, createdAt])
  @@index([fingerprint])
  @@index([userId])
  @@map("instant_previews")
}

model Referral {
  id            String   @id @default(uuid())
  referrerId    String   @map("referrer_id")
  referrer      User     @relation("Referrer", fields: [referrerId], references: [id])
  
  referredId    String   @map("referred_id")
  referred      User     @relation("Referred", fields: [referredId], references: [id])
  
  status        String   @default("pending") // 'pending', 'activated'
  progress      Json     @default("{}")
  
  activatedAt   DateTime? @map("activated_at")
  rewardTier    String?  @map("reward_tier") @db.VarChar(20)
  
  createdAt     DateTime @default(now()) @map("created_at")
  
  @@index([status])
  @@index([referrerId, status])
  @@map("referrals")
}

model Leaderboard {
  id               String   @id @default(uuid())
  userId           String   @map("user_id")
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  rank             Int
  period           String   @db.VarChar(20) // '2025-01'
  type             String   @default("monthly") @db.VarChar(20)
  
  totalInvites     Int      @default(0) @map("total_invites")
  activatedInvites Int      @default(0) @map("activated_invites")
  earnedCredits    Int      @default(0) @map("earned_credits")
  
  snapshotAt       DateTime @default(now()) @map("snapshot_at")
  
  @@unique([userId, period, type])
  @@index([period, type, rank])
  @@map("leaderboard")
}

model Poster {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  analysisId    String?  @map("analysis_id")
  analysis      Analysis? @relation(fields: [analysisId], references: [id], onDelete: SetNull)
  
  posterUrl     String   @map("poster_url")
  posterType    String   @default("bazi") @map("poster_type") @db.VarChar(20)
  
  viewCount     Int      @default(0) @map("view_count")
  downloadCount Int      @default(0) @map("download_count")
  shareCount    Int      @default(0) @map("share_count")
  
  createdAt     DateTime @default(now()) @map("created_at")
  expiresAt     DateTime? @map("expires_at")
  
  @@index([userId, createdAt])
  @@index([analysisId])
  @@map("posters")
}

model CheckIn {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  checkInDate     DateTime @default(now()) @map("check_in_date") @db.Date
  consecutiveDays Int      @default(1) @map("consecutive_days")
  
  rewardCredits   Int      @default(2) @map("reward_credits")
  milestoneReward Int      @default(0) @map("milestone_reward")
  
  createdAt       DateTime @default(now()) @map("created_at")
  
  @@unique([userId, checkInDate])
  @@index([userId, checkInDate(sort: Desc)])
  @@map("check_ins")
}

model User {
  // ... 现有字段 ...
  
  memberTier        String   @default("basic") @map("member_tier") @db.VarChar(20)
  totalInvites      Int      @default(0) @map("total_invites")
  successfulInvites Int      @default(0) @map("successful_invites")
  
  // 关系
  instantPreviews   InstantPreview[]
  referralsGiven    Referral[] @relation("Referrer")
  referralsReceived Referral[] @relation("Referred")
  leaderboards      Leaderboard[]
  posters           Poster[]
  checkIns          CheckIn[]
  
  @@index([memberTier])
  @@index([successfulInvites(sort: Desc)])
}
```

---

## API设计

### 1. 即时体验 API

#### `POST /api/instant-preview`

**请求**
```typescript
interface InstantPreviewRequest {
  birthDate: string; // ISO date: "1990-01-01"
  birthTime?: string; // Optional: "12:00"
}
```

**响应**
```typescript
interface InstantPreviewResponse {
  success: boolean;
  data?: {
    dayPillar: string;        // "甲子"
    wuxing: string;           // "木"
    wuxingStrength: {
      wood: number;   // 35
      fire: number;   // 20
      earth: number;  // 15
      metal: number;  // 15
      water: number;  // 15
    };
    todayFortune: string;     // AI生成的今日运势
    favorable: string[];      // ["学习", "社交"]
    unfavorable: string[];    // ["决策", "投资"]
  };
  error?: string;
  rateLimited?: boolean;
}
```

**实现**
```typescript
// src/app/api/instant-preview/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { calculateBaZi } from '@/lib/bazi/calculator';
import { generateTodayFortune } from '@/lib/ai/fortune-generator';
import { prisma } from '@/lib/prisma';

const requestSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. 速率限制（IP级别：每日5次）
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimit({
      key: `instant-preview:${ip}`,
      limit: 5,
      window: 24 * 60 * 60 * 1000, // 24小时
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, rateLimited: true, error: '今日体验次数已用完，请明天再试或注册账号' },
        { status: 429 }
      );
    }
    
    // 2. 验证输入
    const body = await req.json();
    const { birthDate, birthTime } = requestSchema.parse(body);
    
    // 3. 计算八字（轻量级）
    const baziResult = calculateBaZi({
      date: new Date(birthDate),
      time: birthTime,
      lightweight: true, // 只计算日柱和五行，不做深度分析
    });
    
    // 4. AI生成今日运势（缓存策略：同一日柱当天只生成一次）
    const cacheKey = `fortune:${baziResult.dayPillar}:${new Date().toISOString().split('T')[0]}`;
    let todayFortune = await redis.get(cacheKey);
    
    if (!todayFortune) {
      todayFortune = await generateTodayFortune({
        dayPillar: baziResult.dayPillar,
        wuxing: baziResult.wuxing.dominant,
      });
      await redis.set(cacheKey, todayFortune, 'EX', 24 * 60 * 60); // 缓存24小时
    }
    
    // 5. 记录到数据库（异步，不阻塞响应）
    prisma.instantPreview.create({
      data: {
        birthDate: new Date(birthDate),
        birthTime: birthTime ? new Date(`1970-01-01T${birthTime}`) : null,
        ipAddress: ip,
        fingerprint: req.headers.get('x-fingerprint'),
        userAgent: req.headers.get('user-agent'),
        dayPillar: baziResult.dayPillar,
        wuxing: baziResult.wuxing.dominant,
        wuxingStrength: baziResult.wuxing.strength,
        todayFortune,
        favorable: baziResult.favorable,
        unfavorable: baziResult.unfavorable,
        userId: req.auth?.userId || null,
      },
    }).catch(console.error); // 失败不影响响应
    
    // 6. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        dayPillar: baziResult.dayPillar,
        wuxing: baziResult.wuxing.dominant,
        wuxingStrength: baziResult.wuxing.strength,
        todayFortune,
        favorable: baziResult.favorable,
        unfavorable: baziResult.unfavorable,
      },
    });
  } catch (error) {
    console.error('Instant preview error:', error);
    return NextResponse.json(
      { success: false, error: '分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
```

---

### 2. 邀请数据 API

#### `GET /api/invite/stats`

**响应**
```typescript
interface InviteStatsResponse {
  success: boolean;
  data?: {
    user: {
      referralCode: string;
      inviteUrl: string;
      tier: string; // 'basic', 'silver', 'gold', 'platinum'
    };
    stats: {
      totalInvites: number;
      activatedInvites: number;
      pendingInvites: number;
      earnedCredits: number;
      nextMilestone: number;    // 下一里程碑人数（如：10）
      toNextMilestone: number;  // 还需邀请人数
    };
    invites: Array<{
      id: string;
      name: string;
      avatar: string;
      registeredAt: string;
      status: 'pending' | 'activated';
      progress: string; // "八字分析 ✓  风水分析 ⏳"
      reward: number;
      rewardGranted: boolean;
    }>;
    leaderboard: Array<{
      rank: number;
      name: string;
      avatar: string;
      tier: string;
      invites: number;
      earnedCredits: number;
    }>;
    userRank?: {
      rank: number;
      invites: number;
      toNextRank: number;
    };
  };
}
```

**实现**
```typescript
// src/app/api/invite/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { maskName } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // 1. 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        memberTier: true,
        totalInvites: true,
        successfulInvites: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    // 2. 获取邀请记录
    const invites = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            name: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // 3. 计算统计数据
    const totalInvites = invites.length;
    const activatedInvites = invites.filter((i) => i.status === 'activated').length;
    const pendingInvites = totalInvites - activatedInvites;
    
    // 计算已获得积分（从 credit_transactions 表）
    const earnedCredits = await prisma.creditTransaction.aggregate({
      where: {
        userId,
        type: { in: ['referral_reward', 'milestone_reward'] },
      },
      _sum: { amount: true },
    });
    
    // 4. 计算下一里程碑
    const milestones = [3, 10, 30, 100];
    const nextMilestone = milestones.find((m) => m > activatedInvites) || 100;
    const toNextMilestone = nextMilestone - activatedInvites;
    
    // 5. 格式化邀请记录
    const formattedInvites = invites.map((invite) => {
      const progress = invite.progress as any;
      const progressText = [
        progress.bazi >= 1 ? '八字分析 ✓' : '八字分析 ⏳',
        progress.xuankong >= 1 ? '风水分析 ✓' : '风水分析 ⏳',
        progress.pdf >= 1 ? 'PDF导出 ✓' : 'PDF导出 ⏳',
        progress.aiChat >= 3 ? 'AI对话 ✓' : `AI对话 (${progress.aiChat}/3)`,
      ].join('  ');
      
      return {
        id: invite.id,
        name: maskName(invite.referred.name),
        avatar: invite.referred.avatar || '/default-avatar.png',
        registeredAt: invite.createdAt.toISOString(),
        status: invite.status,
        progress: progressText,
        reward: invite.status === 'activated' ? 30 : 0,
        rewardGranted: invite.status === 'activated',
      };
    });
    
    // 6. 获取排行榜（本月）
    const currentPeriod = new Date().toISOString().slice(0, 7); // '2025-01'
    const leaderboard = await prisma.leaderboard.findMany({
      where: { period: currentPeriod, type: 'monthly' },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            memberTier: true,
          },
        },
      },
      orderBy: { rank: 'asc' },
      take: 10,
    });
    
    const formattedLeaderboard = leaderboard.map((entry) => ({
      rank: entry.rank,
      name: maskName(entry.user.name),
      avatar: entry.user.avatar || '/default-avatar.png',
      tier: entry.user.memberTier,
      invites: entry.activatedInvites,
      earnedCredits: entry.earnedCredits,
    }));
    
    // 7. 获取用户排名
    const userLeaderboardEntry = await prisma.leaderboard.findUnique({
      where: {
        userId_period_type: {
          userId,
          period: currentPeriod,
          type: 'monthly',
        },
      },
    });
    
    const userRank = userLeaderboardEntry
      ? {
          rank: userLeaderboardEntry.rank,
          invites: userLeaderboardEntry.activatedInvites,
          toNextRank: userLeaderboardEntry.rank > 10 ? userLeaderboardEntry.rank - 10 : 0,
        }
      : undefined;
    
    // 8. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        user: {
          referralCode: user.referralCode,
          inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${user.referralCode}`,
          tier: user.memberTier,
        },
        stats: {
          totalInvites,
          activatedInvites,
          pendingInvites,
          earnedCredits: earnedCredits._sum.amount || 0,
          nextMilestone,
          toNextMilestone,
        },
        invites: formattedInvites,
        leaderboard: formattedLeaderboard,
        userRank,
      },
    });
  } catch (error) {
    console.error('Invite stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
```

---

### 3. 海报生成 API

#### `POST /api/share/generate-poster`

**请求**
```typescript
interface GeneratePosterRequest {
  analysisId: string;
  type?: 'bazi' | 'xuankong' | 'invite';
}
```

**响应**
```typescript
interface GeneratePosterResponse {
  success: boolean;
  posterUrl?: string;
  error?: string;
}
```

**实现（使用队列异步生成）**
```typescript
// src/app/api/share/generate-poster/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { posterQueue } from '@/lib/queues/poster-queue';

const requestSchema = z.object({
  analysisId: z.string().uuid(),
  type: z.enum(['bazi', 'xuankong', 'invite']).optional().default('bazi'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { analysisId, type } = requestSchema.parse(body);
    
    // 1. 检查是否已生成过（24小时内）
    const existingPoster = await prisma.poster.findFirst({
      where: {
        userId: session.user.id,
        analysisId,
        posterType: type,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (existingPoster) {
      return NextResponse.json({
        success: true,
        posterUrl: existingPoster.posterUrl,
      });
    }
    
    // 2. 获取分析数据
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        user: {
          select: { referralCode: true },
        },
      },
    });
    
    if (!analysis || analysis.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Analysis not found' }, { status: 404 });
    }
    
    // 3. 加入队列（异步生成，立即返回job ID）
    const job = await posterQueue.add('generate', {
      userId: session.user.id,
      analysisId,
      type,
      analysisData: analysis.result, // JSON数据
      referralCode: analysis.user.referralCode,
    });
    
    // 4. 轮询等待生成完成（最多等待5秒）
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const jobResult = await job.getState();
      if (jobResult === 'completed') {
        const result = await job.returnvalue;
        return NextResponse.json({
          success: true,
          posterUrl: result.posterUrl,
        });
      }
      
      if (jobResult === 'failed') {
        throw new Error('Poster generation failed');
      }
      
      attempts++;
    }
    
    // 5. 超时，返回pending状态（前端可轮询）
    return NextResponse.json({
      success: false,
      error: 'Generation in progress',
      jobId: job.id,
    }, { status: 202 });
    
  } catch (error) {
    console.error('Generate poster error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate poster' }, { status: 500 });
  }
}
```

**海报生成Worker**
```typescript
// src/lib/queues/poster-worker.ts

import { Worker } from 'bullmq';
import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';
import { uploadToOSS } from '@/lib/storage/oss';
import { prisma } from '@/lib/prisma';

// 注册中文字体
registerFont('./fonts/SourceHanSans-Bold.ttf', { family: 'SourceHanSans', weight: 'bold' });
registerFont('./fonts/SourceHanSans-Regular.ttf', { family: 'SourceHanSans', weight: 'normal' });

export const posterWorker = new Worker(
  'poster',
  async (job) => {
    const { userId, analysisId, type, analysisData, referralCode } = job.data;
    
    try {
      // 1. 创建Canvas
      const canvas = createCanvas(750, 1334);
      const ctx = canvas.getContext('2d');
      
      // 2. 背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, 1334);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 750, 1334);
      
      // 3. Logo
      const logo = await loadImage('./public/brand/logo-bazi.svg');
      ctx.drawImage(logo, 50, 50, 150, 30);
      
      // 4. 标题
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px SourceHanSans';
      ctx.textAlign = 'center';
      ctx.fillText('我的八字分析结果', 375, 150);
      
      // 5. 四柱八字（示意）
      const fourPillars = analysisData.fourPillars;
      ctx.font = '36px SourceHanSans';
      ctx.fillText(`年柱: ${fourPillars.year}`, 200, 250);
      ctx.fillText(`月柱: ${fourPillars.month}`, 550, 250);
      ctx.fillText(`日柱: ${fourPillars.day}`, 200, 320);
      ctx.fillText(`时柱: ${fourPillars.hour}`, 550, 320);
      
      // 6. 五行雷达图（简化：文字展示）
      const wuxing = analysisData.wuxing.strength;
      ctx.font = '28px SourceHanSans';
      ctx.fillText(`木 ${wuxing.wood}% | 火 ${wuxing.fire}% | 土 ${wuxing.earth}%`, 375, 500);
      ctx.fillText(`金 ${wuxing.metal}% | 水 ${wuxing.water}%`, 375, 550);
      
      // 7. 关键结论
      ctx.font = '32px SourceHanSans';
      ctx.fillText('═══ 关键结论 ═══', 375, 650);
      ctx.font = '28px SourceHanSans';
      ctx.fillText(`✓ 五行属性：${analysisData.wuxing.dominant}`, 375, 720);
      ctx.fillText(`✓ 综合评分：${analysisData.scores.overall}/100`, 375, 780);
      ctx.fillText(`✓ 性格特质：${analysisData.personality.summary}`, 375, 840);
      
      // 8. 二维码
      const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${referralCode}`;
      const qrCodeDataUrl = await QRCode.toDataURL(inviteUrl, { width: 200 });
      const qrCodeImage = await loadImage(qrCodeDataUrl);
      ctx.drawImage(qrCodeImage, 275, 950, 200, 200);
      
      // 9. 底部文案
      ctx.font = '24px SourceHanSans';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('扫码体验AI八字分析', 375, 1200);
      ctx.fillText(`使用邀请码 ${referralCode} 双方各得20积分`, 375, 1240);
      
      // 10. 水印
      ctx.font = '16px SourceHanSans';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillText('QiFlow AI 提供技术支持', 375, 1300);
      
      // 11. 转换为Buffer
      const buffer = canvas.toBuffer('image/png');
      
      // 12. 上传到OSS
      const fileName = `posters/${userId}/${analysisId}_${Date.now()}.png`;
      const posterUrl = await uploadToOSS(fileName, buffer, {
        contentType: 'image/png',
        cacheControl: 'max-age=31536000', // 缓存1年
      });
      
      // 13. 保存到数据库
      await prisma.poster.create({
        data: {
          userId,
          analysisId,
          posterUrl,
          posterType: type,
        },
      });
      
      return { posterUrl };
    } catch (error) {
      console.error('Poster generation failed:', error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    concurrency: 5, // 同时处理5个任务
  }
);

posterWorker.on('completed', (job) => {
  console.log(`Poster ${job.id} completed`);
});

posterWorker.on('failed', (job, err) => {
  console.error(`Poster ${job?.id} failed:`, err);
});
```

---

### 4. Dashboard 数据 API

#### `GET /api/dashboard/overview`

**响应**
```typescript
interface DashboardOverviewResponse {
  success: boolean;
  data?: {
    user: {
      name: string;
      memberTier: string;
      credits: number;
    };
    checkIn: {
      todayCheckedIn: boolean;
      consecutiveDays: number;
      last7Days: Array<{
        date: string;
        checkedIn: boolean;
      }>;
    };
    invites: {
      totalInvites: number;
      activatedInvites: number;
      earnedCredits: number;
      nextMilestone: {
        target: number;
        remaining: number;
        reward: number;
      };
    };
    recentAnalyses: Array<{
      id: string;
      type: string;
      name: string;
      createdAt: string;
    }>;
    recentTransactions: Array<{
      id: string;
      type: string;
      description: string;
      amount: number;
      createdAt: string;
    }>;
  };
}
```

**实现（省略，结构类似前面的API）**

---

## 前端架构

### 目录结构

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/
│   │   │   ├── (home)/
│   │   │   │   └── page.tsx                 # 首页（包含即时体验）
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx                 # 定价页面
│   │   │   └── invite/
│   │   │       └── page.tsx                 # 邀请专页 ★NEW★
│   │   ├── (protected)/
│   │   │   └── dashboard/
│   │   │       └── page.tsx                 # Dashboard ★UPDATED★
│   │   └── api/
│   │       ├── instant-preview/
│   │       │   └── route.ts                 # 即时体验API ★NEW★
│   │       ├── invite/
│   │       │   └── stats/
│   │       │       └── route.ts             # 邀请数据API ★NEW★
│   │       ├── share/
│   │       │   └── generate-poster/
│   │       │       └── route.ts             # 海报生成API ★NEW★
│   │       └── dashboard/
│   │           └── overview/
│   │               └── route.ts             # Dashboard数据API ★NEW★
│   └── globals.css
│
├── components/
│   ├── qiflow/
│   │   ├── homepage/
│   │   │   ├── InstantTrySection.tsx        # 即时体验组件 ★UPDATED★
│   │   │   └── InstantResultEnhanced.tsx    # 增强结果展示 ★NEW★
│   │   ├── invite/
│   │   │   ├── InvitePageHeader.tsx         # 邀请页头部 ★NEW★
│   │   │   ├── InviteProgress.tsx           # 邀请进度 ★NEW★
│   │   │   ├── ShareOptions.tsx             # 分享选项 ★NEW★
│   │   │   ├── InviteHistory.tsx            # 邀请记录 ★NEW★
│   │   │   ├── Leaderboard.tsx              # 排行榜 ★NEW★
│   │   │   └── IncentiveExplain.tsx         # 激励说明 ★NEW★
│   │   ├── share/
│   │   │   ├── PosterGenerator.tsx          # 海报生成器 ★NEW★
│   │   │   └── ShareButtons.tsx             # 分享按钮 ★NEW★
│   │   ├── pricing/
│   │   │   ├── PricingPageHeader.tsx        # 定价页头部 ★NEW★
│   │   │   ├── PricingTable.tsx             # 套餐表 ★UPDATED★
│   │   │   ├── UseCaseSection.tsx           # 使用场景 ★NEW★
│   │   │   ├── PricingCalculator.tsx        # 积分计算器 ★NEW★
│   │   │   ├── TestimonialSection.tsx       # 用户评价 ★NEW★
│   │   │   └── PromoBanner.tsx              # 限时优惠 ★NEW★
│   │   └── dashboard/
│   │       ├── WelcomeSection.tsx           # 欢迎区域 ★NEW★
│   │       ├── DailyCheckInCard.tsx         # 每日签到 ★NEW★
│   │       ├── QuickActions.tsx             # 快速操作 ★NEW★
│   │       ├── RecentAnalysis.tsx           # 最近分析 ★NEW★
│   │       ├── InviteSection.tsx            # 邀请卡片 ★NEW★
│   │       ├── CreditsActivity.tsx          # 积分动态 ★NEW★
│   │       └── Recommendations.tsx          # 推荐内容 ★NEW★
│   └── ui/
│       └── ... (shadcn/ui组件)
│
├── lib/
│   ├── bazi/
│   │   ├── calculator.ts                    # 八字计算（轻量级模式）★UPDATED★
│   │   └── fortune-generator.ts             # 今日运势生成 ★NEW★
│   ├── share/
│   │   ├── generate-poster.ts               # 前端海报生成 ★NEW★
│   │   └── poster-utils.ts                  # 海报工具函数 ★NEW★
│   ├── queues/
│   │   ├── poster-queue.ts                  # 海报生成队列 ★NEW★
│   │   └── poster-worker.ts                 # 海报生成Worker ★NEW★
│   ├── storage/
│   │   └── oss.ts                           # OSS上传工具 ★NEW★
│   ├── rate-limit.ts                        # 速率限制 ★NEW★
│   ├── redis.ts                             # Redis客户端
│   └── prisma.ts                            # Prisma客户端
│
├── hooks/
│   ├── useInstantPreview.ts                 # 即时体验Hook ★NEW★
│   ├── useInviteStats.ts                    # 邀请数据Hook ★NEW★
│   ├── usePosterGenerator.ts                # 海报生成Hook ★NEW★
│   └── useDashboard.ts                      # Dashboard数据Hook ★NEW★
│
└── types/
    ├── instant-preview.ts                   # 即时体验类型 ★NEW★
    ├── invite.ts                            # 邀请类型 ★NEW★
    ├── poster.ts                            # 海报类型 ★NEW★
    └── dashboard.ts                         # Dashboard类型 ★NEW★
```

### 关键组件实现

#### 1. 即时体验组件（前端）

```typescript
// src/components/qiflow/homepage/InstantTrySection.tsx

'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { InstantResultEnhanced } from './InstantResultEnhanced';
import { useInstantPreview } from '@/hooks/useInstantPreview';

const formSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '请输入有效的日期格式'),
});

export function InstantTrySection() {
  const [result, setResult] = useState(null);
  const { mutate: getPreview, isPending } = useInstantPreview();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { birthDate: '' },
  });
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    getPreview(data, {
      onSuccess: (response) => {
        if (response.success) {
          setResult(response.data);
        } else if (response.rateLimited) {
          toast.error(response.error);
        } else {
          toast.error('分析失败，请稍后重试');
        }
      },
      onError: () => {
        toast.error('网络错误，请检查连接');
      },
    });
  };
  
  return (
    <section className="py-16 bg-gradient-to-b from-purple-900/20 to-blue-900/20">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            ✨ 免费即时体验
          </h2>
          <p className="text-muted-foreground">
            输入您的出生日期，立即获取专业八字分析
          </p>
        </div>
        
        {!result ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="选择出生日期"
                {...form.register('birthDate')}
                className="flex-1"
              />
              <Button type="submit" disabled={isPending} className="min-w-[120px]">
                {isPending ? '分析中...' : '立即体验'}
              </Button>
            </div>
            {form.formState.errors.birthDate && (
              <p className="text-sm text-red-500">
                {form.formState.errors.birthDate.message}
              </p>
            )}
          </form>
        ) : (
          <InstantResultEnhanced data={result} onReset={() => setResult(null)} />
        )}
      </div>
    </section>
  );
}
```

```typescript
// src/components/qiflow/homepage/InstantResultEnhanced.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { WuxingRadarChart } from '@/components/qiflow/charts/WuxingRadarChart';
import Link from 'next/link';

export function InstantResultEnhanced({ data, onReset }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 精准度展示 */}
      <div className="flex gap-2 justify-center">
        <Badge variant="success">✓ 您的日柱：{data.dayPillar}</Badge>
        <Badge variant="success">✓ 五行属性：{data.wuxing}</Badge>
      </div>
      
      {/* 五行雷达图 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">五行力量分布</h3>
        <WuxingRadarChart data={data.wuxingStrength} />
      </Card>
      
      {/* 今日运势 */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <h3 className="text-lg font-semibold mb-4">📅 今日运势预测</h3>
        <p className="text-muted-foreground mb-4">{data.todayFortune}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-green-600 mb-2">宜：</p>
            <p className="text-sm">{data.favorable.join('、')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-red-600 mb-2">忌：</p>
            <p className="text-sm">{data.unfavorable.join('、')}</p>
          </div>
        </div>
      </Card>
      
      {/* 解锁更多（CTA强化） */}
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
        
        <div className="relative">
          <h3 className="text-lg font-semibold mb-2">🎁 解锁完整分析</h3>
          
          {/* 模糊化预览 */}
          <div className="mb-4 text-sm text-muted-foreground blur-sm select-none">
            完整报告包含：
            <br />• 十神分析：正财、偏财、食神...
            <br />• 大运流年：近10年运势走向
            <br />• 事业财运：职业选择、财富机遇
            <br />• 婚姻感情：桃花运、配偶特质
            <br />• 健康运势：五行平衡、注意事项
          </div>
          
          <div className="flex gap-2">
            <Button asChild size="lg" className="flex-1">
              <Link href="/auth/register">
                立即注册（今日免费）
              </Link>
            </Button>
            <Button variant="outline" onClick={onReset}>
              重新分析
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

#### 2. 邀请专页组件（前端）

```typescript
// src/app/[locale]/(marketing)/invite/page.tsx

import { InvitePageHeader } from '@/components/qiflow/invite/InvitePageHeader';
import { InviteProgress } from '@/components/qiflow/invite/InviteProgress';
import { ShareOptions } from '@/components/qiflow/invite/ShareOptions';
import { InviteHistory } from '@/components/qiflow/invite/InviteHistory';
import { Leaderboard } from '@/components/qiflow/invite/Leaderboard';
import { IncentiveExplain } from '@/components/qiflow/invite/IncentiveExplain';

export default async function InvitePage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-12">
      <InvitePageHeader />
      <InviteProgress />
      <ShareOptions />
      <Leaderboard />
      <InviteHistory />
      <IncentiveExplain />
    </div>
  );
}
```

```typescript
// src/components/qiflow/invite/ShareOptions.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useInviteStats } from '@/hooks/useInviteStats';
import { usePosterGenerator } from '@/hooks/usePosterGenerator';
import { Copy, Share2, Image as ImageIcon } from 'lucide-react';

export function ShareOptions() {
  const { data } = useInviteStats();
  const { mutate: generatePoster, isPending: isGenerating } = usePosterGenerator();
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  
  const referralCode = data?.user.referralCode || '';
  const inviteUrl = data?.user.inviteUrl || '';
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}已复制到剪贴板！`);
  };
  
  const handleGeneratePoster = () => {
    generatePoster(
      { type: 'invite' },
      {
        onSuccess: (response) => {
          if (response.success && response.posterUrl) {
            setPosterUrl(response.posterUrl);
            setShowPosterModal(true);
          }
        },
      }
    );
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">分享您的邀请</h2>
      
      {/* 邀请码 */}
      <div className="space-y-2 mb-4">
        <label className="text-sm font-medium">您的专属邀请码</label>
        <div className="flex gap-2">
          <Input value={referralCode} readOnly className="flex-1" />
          <Button
            variant="outline"
            onClick={() => copyToClipboard(referralCode, '邀请码')}
          >
            <Copy className="w-4 h-4 mr-2" />
            复制
          </Button>
        </div>
      </div>
      
      {/* 邀请链接 */}
      <div className="space-y-2 mb-6">
        <label className="text-sm font-medium">邀请链接</label>
        <div className="flex gap-2">
          <Input value={inviteUrl} readOnly className="flex-1" />
          <Button
            variant="outline"
            onClick={() => copyToClipboard(inviteUrl, '邀请链接')}
          >
            <Copy className="w-4 h-4 mr-2" />
            复制
          </Button>
        </div>
      </div>
      
      {/* 一键分享 */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-medium">一键分享到</h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm">💬 微信</Button>
          <Button variant="outline" size="sm">🔖 朋友圈</Button>
          <Button variant="outline" size="sm">📱 微博</Button>
          <Button variant="outline" size="sm">🐧 QQ</Button>
          <Button variant="outline" size="sm">💌 短信</Button>
        </div>
      </div>
      
      {/* 生成海报 */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium mb-2">生成邀请海报</h3>
        <p className="text-sm text-muted-foreground mb-4">
          生成精美海报，分享到社交平台
        </p>
        <Button onClick={handleGeneratePoster} disabled={isGenerating}>
          <ImageIcon className="w-4 h-4 mr-2" />
          {isGenerating ? '生成中...' : '生成海报'}
        </Button>
      </div>
      
      {/* 海报预览Modal（省略实现） */}
    </Card>
  );
}
```

---

## 性能优化

### 1. 前端优化

#### 代码分割
```typescript
// 动态导入重组件
const PosterGenerator = dynamic(() => import('@/components/qiflow/share/PosterGenerator'), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false,
});

const Leaderboard = dynamic(() => import('@/components/qiflow/invite/Leaderboard'), {
  loading: () => <Skeleton className="h-[600px]" />,
});
```

#### 图片优化
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};
```

#### 缓存策略
```typescript
// React Query配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      refetchOnWindowFocus: false,
    },
  },
});
```

### 2. 后端优化

#### Redis缓存
```typescript
// 热点数据缓存
async function getLeaderboard(period: string) {
  const cacheKey = `leaderboard:${period}`;
  
  // 尝试从缓存读取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 从数据库查询
  const leaderboard = await prisma.leaderboard.findMany({
    where: { period, type: 'monthly' },
    orderBy: { rank: 'asc' },
    take: 10,
  });
  
  // 写入缓存（1小时）
  await redis.set(cacheKey, JSON.stringify(leaderboard), 'EX', 3600);
  
  return leaderboard;
}
```

#### 数据库查询优化
```typescript
// 使用索引、避免N+1查询
const invites = await prisma.referral.findMany({
  where: { referrerId: userId },
  include: {
    referred: {
      select: {
        name: true,
        avatar: true,
        createdAt: true,
      },
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 20, // 分页
  skip: (page - 1) * 20,
});
```

#### CDN加速
```typescript
// OSS配置CDN
const posterUrl = `https://cdn.qiflow.ai/${ossKey}`;

// 响应头
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
```

---

## 安全方案

### 1. 速率限制

```typescript
// src/lib/rate-limit.ts

import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimit({
  key,
  limit,
  window,
}: {
  key: string;
  limit: number;
  window: number; // ms
}) {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, Math.ceil(window / 1000));
  }
  
  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    reset: Date.now() + window,
  };
}
```

### 2. 输入验证

```typescript
// Zod Schema严格验证
const instantPreviewSchema = z.object({
  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((date) => {
      const parsed = new Date(date);
      const now = new Date();
      const minDate = new Date('1900-01-01');
      return parsed >= minDate && parsed <= now;
    }, '日期必须在1900年至今之间'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});
```

### 3. XSS防护

```typescript
// DOMPurify清理用户输入
import DOMPurify from 'isomorphic-dompurify';

function sanitizeUserInput(input: string) {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

### 4. CSRF防护

```typescript
// Next.js默认CSRF保护
// 使用NextAuth.js的csrf token
```

---

## 监控与日志

### 1. 错误监控（Sentry）

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 2. 性能监控

```typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. 结构化日志

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// 使用示例
logger.info({ userId, action: 'instant_preview' }, 'User requested instant preview');
```

---

## 部署方案

### 1. Vercel部署（推荐）

```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "regions": ["hkg1"], # 香港节点
  "env": {
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url",
    "OSS_ACCESS_KEY": "@oss-access-key"
  }
}
```

### 2. Docker部署（自建）

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# 依赖安装
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: qiflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  worker:
    build: .
    command: node dist/worker.js
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 3. CI/CD（GitHub Actions）

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 总结

本技术设计文档涵盖了：
- ✅ **完整的系统架构**（前后端分离、微服务化）
- ✅ **数据库Schema设计**（6个新表/扩展表）
- ✅ **4个核心API设计**（请求/响应/实现代码）
- ✅ **前端架构**（组件化、模块化）
- ✅ **性能优化方案**（缓存、CDN、代码分割）
- ✅ **安全方案**（速率限制、输入验证、XSS/CSRF防护）
- ✅ **监控与日志**（Sentry、Analytics、结构化日志）
- ✅ **部署方案**（Vercel、Docker、CI/CD）

**下一步**: 使用 TaskMaster 将需求分解为可执行任务。

---

**文档状态**: ✅ 已完成  
**审核状态**: 待审核  
**下一步**: TaskMaster 任务分解
