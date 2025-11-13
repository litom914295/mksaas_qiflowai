# 性能优化与监控配置

**版本**: v5.1.1  
**更新时间**: 2025-01-18

---

## 📊 P5-2: 性能优化检查清单

### 1. 前端性能优化

#### 1.1 代码分割与懒加载
```typescript
// ✅ 使用动态导入
const ReportPDF = dynamic(() => import('@/components/reports/ReportPDF'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

// ✅ 路由级别代码分割（Next.js自动处理）
// app/(routes)/report/[id]/page.tsx
// app/(routes)/payment/page.tsx
```

**检查项**:
- [ ] 大型组件使用`dynamic`导入
- [ ] PDF生成器仅在需要时加载
- [ ] Paywall组件按需加载
- [ ] 第三方库（framer-motion, recharts）懒加载

#### 1.2 图片优化
```jsx
// ✅ 使用Next.js Image组件
import Image from 'next/image';

<Image 
  src="/images/cover.webp" 
  alt="报告封面" 
  width={800} 
  height={600} 
  priority={false} 
  loading="lazy"
/>
```

**检查项**:
- [ ] 所有图片使用WebP格式
- [ ] 关键图片设置`priority`
- [ ] 非关键图片使用`loading="lazy"`
- [ ] 提供合适的`width`和`height`
- [ ] 使用Next.js Image优化

#### 1.3 CSS优化
- [ ] 移除未使用的CSS（PurgeCSS）
- [ ] 关键CSS内联
- [ ] 非关键CSS延迟加载
- [ ] 使用CSS变量减少重复
- [ ] Tailwind生产构建启用

#### 1.4 JavaScript优化
- [ ] Tree shaking启用
- [ ] 代码压缩（UglifyJS/Terser）
- [ ] 移除console.log（生产环境）
- [ ] 使用Web Workers处理重计算
- [ ] 避免阻塞主线程

---

### 2. 后端性能优化

#### 2.1 AI调用优化
```typescript
// ✅ 使用缓存减少重复调用
import { cache } from '@/lib/cache';

async function generateReport(baziData: BaziData) {
  const cacheKey = `report:${hashBaziData(baziData)}`;
  
  // 尝试从缓存读取
  const cached = await cache.get(cacheKey);
  if (cached) return cached;
  
  // 生成新报告
  const report = await generateEssentialReport(baziData);
  
  // 缓存结果（24小时）
  await cache.set(cacheKey, report, 86400);
  
  return report;
}
```

**检查项**:
- [ ] 相同输入使用缓存（LRU缓存）
- [ ] 批量请求合并
- [ ] 提前生成常用报告（预热缓存）
- [ ] 使用流式响应（Streaming）
- [ ] 实施速率限制（Rate Limiting）

#### 2.2 数据库优化
- [ ] 索引优化（用户ID, 订单ID, 报告ID）
- [ ] 查询优化（避免N+1问题）
- [ ] 连接池配置合理
- [ ] 使用只读副本分担读压力
- [ ] 数据归档（旧报告迁移到冷存储）

#### 2.3 API响应优化
- [ ] 启用Gzip/Brotli压缩
- [ ] 使用CDN缓存静态资源
- [ ] HTTP/2启用
- [ ] Keep-Alive连接复用
- [ ] 合理设置Cache-Control

---

### 3. 核心指标基准

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| **首屏加载时间 (LCP)** | <2.5s | ⏱️ | ⬜ |
| **首次输入延迟 (FID)** | <100ms | ⏱️ | ⬜ |
| **累积布局偏移 (CLS)** | <0.1 | ⏱️ | ⬜ |
| **首次内容绘制 (FCP)** | <1.8s | ⏱️ | ⬜ |
| **Time to Interactive (TTI)** | <3.8s | ⏱️ | ⬜ |
| **总阻塞时间 (TBT)** | <300ms | ⏱️ | ⬜ |

**测试工具**:
- Google PageSpeed Insights
- Lighthouse CI
- WebPageTest

---

## 🔍 P5-3: 监控配置

### 1. 应用监控

#### 1.1 错误监控 (Sentry 配置)
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  
  beforeSend(event, hint) {
    // 过滤敏感信息
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

**监控目标**:
- [ ] JavaScript运行时错误
- [ ] API调用失败
- [ ] AI生成超时
- [ ] 支付流程错误
- [ ] 用户会话回放（可选）

#### 1.2 性能监控 (Vercel Analytics)
```typescript
// app/layout.tsx
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

**监控指标**:
- [ ] Core Web Vitals（LCP, FID, CLS）
- [ ] 页面加载时间
- [ ] API响应时间
- [ ] 用户设备分布
- [ ] 地理位置分布

#### 1.3 业务监控
```typescript
// 自定义事件追踪
import { track } from '@/lib/tracking';

// 报告生成成功率
track.reportGenerated('essential', {
  success: true,
  duration: 6500,
  cost: 0.35,
});

// 转化率
track.paymentCompleted(orderId, 9.90, {
  variant: 'urgency',
  sessionId,
});
```

**关键业务指标 (KPI)**:
| 指标 | 目标值 | 监控频率 |
|------|--------|----------|
| 报告生成成功率 | >99% | 实时 |
| Paywall到支付转化率 | >15% | 每小时 |
| 支付完成率 | >90% | 每小时 |
| 平均报告成本 | <$0.50 | 每天 |
| 用户满意度 | >4.5/5 | 每周 |

---

### 2. 成本监控

#### 2.1 实时成本追踪
```typescript
import { globalCostGuard, globalAlertSystem } from '@/lib/qiflow/monitoring';

// 每5分钟检查成本
setInterval(async () => {
  const usage = globalCostGuard.getCurrentUsage();
  
  if (usage.hourly > 8.00) {
    console.warn('⚠️ 每小时成本接近限制');
  }
  
  await globalAlertSystem.checkUsage();
}, 5 * 60 * 1000);
```

**告警阈值**:
- [ ] 每小时成本 >$8.00 (80%) → 警告
- [ ] 每小时成本 >$9.00 (90%) → 严重
- [ ] 每日成本 >$80.00 (80%) → 警告
- [ ] 每日成本 >$90.00 (90%) → 严重

#### 2.2 成本优化建议
- [ ] 启用缓存优先模式（成本降低50%）
- [ ] 使用模板降级（成本降低80%）
- [ ] 批量请求优化（成本降低20%）
- [ ] 非高峰时段预热缓存

---

### 3. 告警通知

#### 3.1 告警渠道配置
```typescript
// 配置Webhook通知
globalAlertSystem.on('critical', async (alert) => {
  // 发送到Slack/钉钉
  await fetch(process.env.WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 成本告警: ${alert.message}`,
      at: { mobiles: ['13800138000'] },
    }),
  });
  
  // 发送邮件（可选）
  await sendEmail({
    to: 'admin@qiflowai.com',
    subject: 'QiFlowAI成本告警',
    body: alert.message,
  });
});
```

**告警级别**:
| 级别 | 触发条件 | 通知方式 | 响应时间 |
|------|----------|----------|----------|
| INFO | 成本50%阈值 | 日志 | 无需响应 |
| WARNING | 成本75%阈值 | Webhook | 1小时内 |
| CRITICAL | 成本90%阈值 | Webhook+邮件+短信 | 立即响应 |

#### 3.2 监控大盘
建议使用Grafana或Datadog创建监控面板：

**面板1: 系统健康**
- 服务可用性（Uptime）
- 错误率趋势
- API响应时间
- 数据库连接池使用率

**面板2: 业务指标**
- 每小时报告生成量
- 转化率趋势（按变体）
- 收入统计
- 用户留存率

**面板3: 成本监控**
- 实时成本消耗
- Token使用趋势
- 每报告平均成本
- 月度预算执行情况

---

## 🎯 优化建议优先级

### P0（必须做）
1. ✅ 启用生产环境Gzip压缩
2. ✅ 配置错误监控（Sentry）
3. ✅ 设置成本告警
4. ✅ 实施缓存策略

### P1（强烈建议）
1. 配置CDN加速静态资源
2. 实施图片懒加载
3. 代码分割优化
4. 数据库索引优化

### P2（可选）
1. 配置Grafana监控大盘
2. 实施A/B测试分析面板
3. 用户行为热力图
4. 服务器端渲染优化

---

**下一步**: 完成性能优化和监控配置后，进入P5-4最终上线检查清单
