# 前端集成指南

**目标**: 快速集成Phase 2-5所有模块到现有前端  
**预计时间**: 2-3小时  
**优先级**: P0

---

## 🎯 集成概览

### 需要集成的模块
1. ✅ 双审机制（后端自动调用）
2. ✅ 免责声明（报告页面展示）
3. ✅ 成本监控（全局初始化）
4. ✅ Paywall组件（报告页面）
5. ✅ A/B测试（Paywall变体分配）
6. ✅ 转化追踪（事件埋点）

---

## 📋 Step 1: 全局初始化 (10分钟)

### 1.1 在根布局初始化监控
创建/更新 `src/app/layout.tsx`:

```typescript
import { useEffect } from 'react';
import { startCostMonitoring } from '@/lib/qiflow/monitoring/cost-alerts';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 启动成本监控（每5分钟检查一次）
    const timer = startCostMonitoring(5 * 60 * 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 1.2 创建监控工具函数
创建 `src/lib/qiflow/hooks/useCostMonitoring.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { globalCostGuard } from '@/lib/qiflow/monitoring/cost-guard';

export function useCostMonitoring() {
  const [usage, setUsage] = useState(globalCostGuard.getCurrentUsage());

  useEffect(() => {
    const timer = setInterval(() => {
      setUsage(globalCostGuard.getCurrentUsage());
    }, 10000); // 每10秒更新一次

    return () => clearInterval(timer);
  }, []);

  return usage;
}
```

---

## 📋 Step 2: 报告生成页面集成 (60分钟)

### 2.1 创建报告生成API路由
创建 `src/app/api/reports/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateEssentialReport } from '@/lib/qiflow/reports/essential-report';
import { dualAudit } from '@/lib/qiflow/quality/dual-audit-system';
import { globalCostGuard } from '@/lib/qiflow/monitoring/cost-guard';
import { track } from '@/lib/qiflow/tracking/conversion-tracker';

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();
    const userId = req.headers.get('x-user-id') || 'anonymous';
    
    // 1. 成本检查
    const costCheck = globalCostGuard.canExecute(0.50, userId);
    if (!costCheck.allowed) {
      return NextResponse.json(
        { error: costCheck.reason, fallbackStrategy: costCheck.suggestedStrategy },
        { status: 429 }
      );
    }
    
    // 2. 生成报告
    const report = await generateEssentialReport(input);
    
    // 3. 质量审核
    const audit = await dualAudit(report, { 
      isPremium: input.fengshuiData != null,
      strictMode: false 
    });
    
    if (!audit.passed) {
      // 审核未通过，记录但继续返回（非严重问题）
      console.warn('[Report] Audit failed:', audit.reason);
    }
    
    // 4. 记录成本
    const estimatedCost = report.metadata?.estimatedCost || 0.30;
    globalCostGuard.recordUsage(estimatedCost, userId);
    
    // 5. 追踪事件
    track.reportGenerated(
      input.fengshuiData ? 'essential' : 'basic',
      { userId, cost: estimatedCost }
    );
    
    return NextResponse.json({
      success: true,
      report,
      audit: {
        passed: audit.passed,
        score: audit.ruleAudit.score,
      },
    });
    
  } catch (error: any) {
    console.error('[Report API] Error:', error);
    return NextResponse.json(
      { error: error.message || '生成报告失败' },
      { status: 500 }
    );
  }
}
```

### 2.2 创建报告展示页面
创建/更新 `src/app/(dashboard)/reports/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { ReportPaywall } from '@/components/reports/ReportPaywall';
import { globalABTest, PAYWALL_EXPERIMENT } from '@/lib/qiflow/ab-testing/ab-test';
import { track } from '@/lib/qiflow/tracking/conversion-tracker';
import { getReportDisclaimers } from '@/lib/qiflow/compliance/disclaimer';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}`);
  
  // 生成报告
  async function generateReport(input: any) {
    track.pageView({ page: 'reports' });
    
    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify(input),
    });
    
    const data = await response.json();
    
    if (data.success) {
      setReport(data.report);
      
      // 如果是基础报告，显示Paywall
      if (!input.fengshuiData) {
        setShowPaywall(true);
      }
    }
  }
  
  // 处理解锁
  async function handleUnlock() {
    // 获取A/B测试变体
    const variant = globalABTest.getVariant(
      PAYWALL_EXPERIMENT.id,
      userId,
      `session_${Date.now()}`
    );
    
    // 追踪
    track.paywallShown(variant?.id || 'default', { userId });
    track.paymentInitiated(9.90, { userId, variant: variant?.id });
    
    // 跳转到支付页面
    window.location.href = `/payment?reportId=${report.id}&variant=${variant?.id}`;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">八字风水报告</h1>
      
      {/* 报告表单 */}
      {!report && (
        <ReportForm onSubmit={generateReport} />
      )}
      
      {/* 报告展示 */}
      {report && (
        <div className="space-y-6">
          <ReportDisplay report={report} />
          
          {/* Paywall */}
          {showPaywall && (
            <ReportPaywall
              config={{
                price: 9.90,
                originalPrice: 29.90,
                highlights: [
                  '深度人宅合一分析',
                  '专属吉位与化解方案',
                  '可下载PDF完整报告',
                  '专业级命理解读',
                ],
                variant: globalABTest.getVariant(
                  PAYWALL_EXPERIMENT.id,
                  userId
                )?.config.variant || 'default',
              }}
              onUnlock={handleUnlock}
              onDismiss={() => setShowPaywall(false)}
            />
          )}
          
          {/* 免责声明 */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: getReportDisclaimers(false).replace(/\n/g, '<br/>') 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 简化的表单组件（实际应该更完整）
function ReportForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
  });
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }} className="space-y-4">
      {/* 表单字段 */}
      <button type="submit" className="btn-primary">
        生成免费基础报告
      </button>
    </form>
  );
}

function ReportDisplay({ report }: { report: any }) {
  return (
    <div className="space-y-4">
      {/* 展示报告内容 */}
      <h2>{report.title}</h2>
      {/* ... 其他内容 */}
    </div>
  );
}
```

---

## 📋 Step 3: 支付成功页面集成 (20分钟)

### 3.1 更新支付成功回调
创建/更新 `src/app/payment/success/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { track } from '@/lib/qiflow/tracking/conversion-tracker';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reportId = searchParams.get('reportId');
  
  useEffect(() => {
    if (orderId) {
      // 追踪支付完成
      track.paymentCompleted(orderId, 9.90, {
        reportId,
        timestamp: Date.now(),
      });
      
      // 追踪报告解锁
      track.reportUnlocked(reportId || '', {
        orderId,
      });
    }
  }, [orderId, reportId]);
  
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ 支付成功！
      </h1>
      <p className="text-lg mb-6">
        您的精华报告已解锁，正在为您准备...
      </p>
      <button 
        onClick={() => window.location.href = `/reports/${reportId}`}
        className="btn-primary"
      >
        查看完整报告
      </button>
    </div>
  );
}
```

---

## 📋 Step 4: 监控面板（可选，30分钟）

### 4.1 创建管理员监控页面
创建 `src/app/(dashboard)/admin/monitoring/page.tsx`:

```typescript
'use client';

import { useCostMonitoring } from '@/lib/qiflow/hooks/useCostMonitoring';
import { globalTracker } from '@/lib/qiflow/tracking/conversion-tracker';
import { useState, useEffect } from 'react';

export default function MonitoringPage() {
  const costUsage = useCostMonitoring();
  const [funnel, setFunnel] = useState(null);
  
  useEffect(() => {
    // 获取转化漏斗数据
    const funnelData = globalTracker.getFunnel();
    setFunnel(funnelData);
  }, []);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">系统监控</h1>
      
      {/* 成本监控卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="每小时成本"
          value={`$${costUsage.hourly.toFixed(2)}`}
          limit={`/ $${costUsage.limits.hourly}`}
          percentage={(costUsage.hourly / costUsage.limits.hourly) * 100}
        />
        <MetricCard
          title="每日成本"
          value={`$${costUsage.daily.toFixed(2)}`}
          limit={`/ $${costUsage.limits.daily}`}
          percentage={(costUsage.daily / costUsage.limits.daily) * 100}
        />
        <MetricCard
          title="剩余预算（日）"
          value={`$${costUsage.remainingDaily.toFixed(2)}`}
          limit=""
          percentage={100 - (costUsage.daily / costUsage.limits.daily) * 100}
        />
      </div>
      
      {/* 转化漏斗 */}
      {funnel && (
        <div className="bg-card rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">转化漏斗</h2>
          <div className="space-y-2">
            <FunnelStep label="总访问" value={funnel.totalViews} />
            <FunnelStep label="Paywall展示" value={funnel.paywallShown} percentage={funnel.viewToPaywall} />
            <FunnelStep label="发起支付" value={funnel.paymentInitiated} percentage={funnel.paywallToPayment} />
            <FunnelStep label="完成支付" value={funnel.paymentCompleted} percentage={funnel.paymentToComplete} />
            <div className="mt-4 p-4 bg-primary/10 rounded">
              <p className="text-lg font-bold">
                总体转化率: {funnel.overallConversion}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, limit, percentage }: any) {
  const color = percentage > 90 ? 'text-red-600' : percentage > 75 ? 'text-yellow-600' : 'text-green-600';
  
  return (
    <div className="bg-card rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{limit}</p>
      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function FunnelStep({ label, value, percentage }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-bold">{value}</span>
        {percentage && (
          <span className="text-sm text-muted-foreground">
            ({percentage}%)
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## 📋 Step 5: 环境变量配置 (5分钟)

### 5.1 更新 `.env.local`
```bash
# 成本监控
COST_LIMIT_HOURLY=10.00
COST_LIMIT_DAILY=100.00

# 告警通知（可选）
WEBHOOK_URL=https://your-webhook-url.com

# Sentry（可选）
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## ✅ 集成检查清单

### 核心集成
- [ ] 全局初始化成本监控
- [ ] 报告生成API集成双审和成本控制
- [ ] 报告页面集成Paywall组件
- [ ] Paywall集成A/B测试
- [ ] 所有页面埋点追踪事件
- [ ] 支付成功页面追踪转化

### 可选集成
- [ ] 管理员监控面板
- [ ] 实时告警通知
- [ ] 转化数据可视化

---

## 🧪 快速测试

### 测试1: 报告生成流程
```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问报告页面
http://localhost:3000/reports

# 3. 填写表单生成报告

# 4. 验证：
# - 报告成功生成
# - Paywall正确显示
# - 免责声明显示
# - 控制台无错误
```

### 测试2: 成本监控
```bash
# 打开浏览器控制台，执行：
import { globalCostGuard } from '@/lib/qiflow/monitoring/cost-guard';
console.log(globalCostGuard.getCurrentUsage());

# 应该看到当前成本使用情况
```

### 测试3: A/B测试
```bash
# 多次刷新报告页面
# 应该看到不同的Paywall变体（4种）
# 同一用户应该稳定看到相同变体
```

---

## 🚨 常见问题

### Q1: 导入路径错误
**解决**: 确保`tsconfig.json`配置了路径别名：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Q2: 客户端组件报错
**解决**: 确保使用客户端钩子的组件添加`'use client'`指令

### Q3: 成本监控不工作
**解决**: 检查`layout.tsx`中是否正确调用`startCostMonitoring()`

---

## 📝 下一步

完成集成后：
1. ✅ 执行端到端测试
2. ✅ 运行`@LAUNCH_TEST_CHECKLIST.md`中的测试
3. ✅ 完成`@LAUNCH_CHECKLIST_FINAL.md`上线检查

---

**预计完成时间**: 2-3小时  
**难度**: 中等  
**优先级**: P0
