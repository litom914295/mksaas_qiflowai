# QiFlow 技术实现手册 v4.0

> **版本**：4.0  
> **日期**：2024-12-27  
> **状态**：基于PRD v4.0的完整技术实现指南

---

## 1. 技术栈概览

### 1.1 核心技术选型

| 层级 | 技术栈 | 版本 | 说明 |
|------|--------|------|------|
| **前端** |
| Web框架 | Next.js | 14.x | App Router, RSC |
| Mobile | React Native | 0.73.x | iOS/Android |
| UI框架 | Tailwind CSS | 3.4.x | Utility-first |
| 组件库 | Shadcn/ui | latest | Radix UI based |
| 可视化 | Konva + Pixi.js | 9.x + 8.x | 分层渲染 |
| **后端** |
| Runtime | Node.js | 20.x LTS | JavaScript运行时 |
| 框架 | NestJS | 10.x | 企业级框架 |
| API | GraphQL + REST | - | 混合API |
| 队列 | BullMQ | 5.x | Redis队列 |
| **数据** |
| 主库 | PostgreSQL | 16.x | 关系型数据库 |
| 缓存 | Redis | 7.x | 内存数据库 |
| 向量库 | pgvector | 0.5.x | 向量搜索 |
| 对象存储 | MinIO/S3 | - | 文件存储 |
| **AI/算法** |
| 八字库1 | lunar-typescript | 2.x | 农历转换 |
| 八字库2 | @alvamind/bazi | 1.x | 八字计算 |
| 罗盘 | geomagnetism | 1.x | 磁偏角 |
| 太阳 | suncalc | 1.x | 太阳位置 |
| **基础设施** |
| 容器 | Docker | 24.x | 容器化 |
| 编排 | Kubernetes | 1.29.x | 容器编排 |
| IaC | Terraform | 1.7.x | 基础设施即代码 |
| 监控 | Prometheus + Grafana | - | 指标监控 |

### 1.2 开发工具链

```json
{
  "packageManager": "pnpm@8.x",
  "monorepo": "nx@18.x",
  "typescript": "5.3.x",
  "linter": "eslint@8.x + prettier@3.x",
  "testing": {
    "unit": "vitest@1.x",
    "integration": "jest@29.x",
    "e2e": "playwright@1.x"
  },
  "ci": "GitHub Actions",
  "cd": "Vercel + AWS"
}
```

---

## 2. Monorepo架构

### 2.1 目录结构

```bash
qiflow-monorepo/
├── .github/
│   ├── workflows/          # CI/CD配置
│   └── CODEOWNERS         # 代码所有者
├── apps/
│   ├── web/               # Next.js主应用
│   │   ├── app/           # App Router
│   │   ├── components/    # 页面组件
│   │   └── public/        # 静态资源
│   ├── mobile/            # React Native应用
│   │   ├── ios/           # iOS原生代码
│   │   ├── android/       # Android原生代码
│   │   └── src/           # React Native代码
│   └── admin/             # 管理后台
├── services/
│   ├── api-gateway/       # Kong/Express网关
│   ├── bazi-service/      # 八字计算服务
│   ├── fengshui-service/  # 风水分析服务
│   ├── ai-orchestrator/   # AI调度服务
│   ├── payment-service/   # 支付服务
│   └── notification/      # 通知服务
├── packages/
│   ├── @qiflow/ui/        # 共享UI组件
│   ├── @qiflow/core/      # 核心算法
│   │   ├── bazi/          # 八字算法
│   │   ├── xuankong/      # 玄空风水
│   │   └── compass/       # 罗盘算法
│   ├── @qiflow/types/     # TypeScript定义
│   ├── @qiflow/utils/     # 工具函数
│   └── @qiflow/config/    # 共享配置
├── infrastructure/
│   ├── terraform/         # Terraform配置
│   ├── k8s/              # Kubernetes manifests
│   ├── docker/           # Dockerfile
│   └── scripts/          # 部署脚本
├── docs/                 # 文档
├── tools/                # 开发工具
└── nx.json              # Nx配置
```

### 2.2 依赖管理

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'services/*'
  - 'packages/*'
  - 'tools/*'
```

---

## 3. 核心算法实现

### 3.1 八字双库融合

```typescript
// packages/@qiflow/core/bazi/adapter.ts
import { Solar } from 'lunar-typescript';
import BaziCalculator from '@alvamind/bazi-calculator';

export class BaziAdapter {
  private lunar: LunarAdapter;
  private alvamind: AlvamindAdapter;
  
  async calculate(input: BaziInput): Promise<BaziFusedResult> {
    // 并行计算
    const [result1, result2] = await Promise.all([
      this.lunar.calculate(input),
      this.alvamind.calculate(input)
    ]);
    
    // 一致性校验
    const validation = this.validateConsistency(result1, result2);
    if (validation.level1.hasMismatch) {
      throw new BaziInconsistencyError(validation);
    }
    
    // 智能融合
    return this.fuseResults(result1, result2, validation);
  }
  
  private validateConsistency(r1: BaziResult, r2: BaziResult): ValidationResult {
    const checks = {
      level1: { // 必须完全一致
        yearPillar: r1.yearPillar === r2.yearPillar,
        monthPillar: r1.monthPillar === r2.monthPillar,
        dayPillar: r1.dayPillar === r2.dayPillar,
        hourPillar: r1.hourPillar === r2.hourPillar
      },
      level2: { // 允许5%差异
        elements: this.compareElements(r1.elements, r2.elements),
        deities: this.compareDeities(r1.deities, r2.deities)
      },
      level3: { // 允许20%差异
        nayin: r1.nayin === r2.nayin,
        special: this.compareSpecial(r1.special, r2.special)
      }
    };
    
    return {
      ...checks,
      confidence: this.calculateConfidence(checks)
    };
  }
}
```

### 3.2 玄空飞星引擎

```typescript
// packages/@qiflow/core/xuankong/engine.ts
export class XuanKongEngine {
  private readonly MOUNTAINS_24 = {
    '子': { angle: [352.5, 7.5], element: '水', palace: '坎' },
    '癸': { angle: [7.5, 22.5], element: '水', palace: '坎' },
    // ... 完整24山定义
  };
  
  private readonly LUO_SHU_PATH = [5, 6, 7, 8, 9, 1, 2, 3, 4];
  
  calculate(input: XuanKongInput): XuanKongResult {
    // 1. 确定坐向
    const facing = this.determineFacing(input.facingDeg);
    const sitting = this.oppositeMountain(facing);
    
    // 2. 判断兼向
    const jianXiang = this.checkJianXiang(input.facingDeg);
    
    // 3. 生成三盘
    const periodPlate = this.generatePeriodPlate(input.period);
    const mountainPlate = this.generateMountainPlate(sitting, input.period);
    const facingPlate = this.generateFacingPlate(facing, input.period);
    
    // 4. 时运叠加
    const yearStar = this.calculateYearStar(input.year);
    const monthStar = this.calculateMonthStar(input.year, input.month);
    
    // 5. 组合分析
    const palaces = this.analyzePalaces({
      period: periodPlate,
      mountain: mountainPlate,
      facing: facingPlate,
      year: yearStar,
      month: monthStar
    });
    
    // 6. 生成断语
    const interpretations = this.generateInterpretations(palaces);
    
    return {
      facing,
      sitting,
      jianXiang,
      palaces,
      interpretations,
      meta: {
        confidence: this.calculateConfidence(input),
        checksum: this.generateChecksum(palaces)
      }
    };
  }
  
  private flyStars(startStar: number, isForward: boolean): StarPlate {
    const plate: StarPlate = {};
    const path = isForward ? this.LUO_SHU_PATH : [...this.LUO_SHU_PATH].reverse();
    
    let current = startStar;
    for (const position of path) {
      plate[position] = current;
      current = isForward ? 
        (current % 9 || 9) : 
        (current === 1 ? 9 : current - 1);
    }
    
    return plate;
  }
}
```

### 3.3 四通道罗盘融合

```typescript
// packages/@qiflow/core/compass/fusion.ts
export class CompassFusion {
  private ekf: ExtendedKalmanFilter;
  
  async fuseReadings(readings: SensorReading[]): Promise<FusedResult> {
    // 1. 异常值检测
    const filtered = this.outlierDetection(readings);
    
    // 2. 权重计算
    const weights = this.calculateWeights(filtered);
    
    // 3. 卡尔曼滤波
    this.ekf.predict(Date.now() - this.lastUpdate);
    
    for (const reading of filtered) {
      if (reading.confidence > 0.3) {
        this.ekf.update(
          reading.value,
          reading.source,
          weights[reading.source]
        );
      }
    }
    
    // 4. 提取结果
    const fusedHeading = this.normalizeAngle(this.ekf.state[0]);
    const uncertainty = Math.sqrt(this.ekf.covariance[0][0]);
    
    return {
      heading: fusedHeading,
      uncertainty,
      confidence: this.calculateConfidence(uncertainty, weights),
      contributors: this.getContributors(weights),
      quality: this.assessQuality(filtered)
    };
  }
  
  private calculateWeights(readings: SensorReading[]): WeightMap {
    const weights: WeightMap = {};
    
    for (const reading of readings) {
      let weight = this.baseWeights[reading.source];
      
      // 环境因素调整
      weight *= this.getEnvironmentFactor(reading);
      
      // 一致性奖励
      weight *= 0.5 + 0.5 * this.checkConsistency(reading, readings);
      
      // 时效性衰减
      const age = Date.now() - reading.timestamp;
      weight *= Math.exp(-age / 10000); // 10秒半衰期
      
      weights[reading.source] = weight;
    }
    
    // 归一化
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    for (const source in weights) {
      weights[source] /= sum;
    }
    
    return weights;
  }
}
```

---

## 4. AI Orchestrator实现

### 4.1 架构设计

```typescript
// services/ai-orchestrator/src/orchestrator.ts
export class AIOrchestrator {
  private router: ModelRouter;
  private executor: ToolExecutor;
  private observer: ObservabilityLayer;
  
  async process(request: AIRequest): Promise<AIResponse> {
    // 1. 请求追踪
    const traceId = this.observer.startTrace(request);
    
    try {
      // 2. 安全检查
      await this.securityCheck(request);
      
      // 3. 路由决策
      const routing = await this.router.route(request);
      
      // 4. 工具执行
      const toolResults = await this.executor.execute(
        request.tools,
        request.context
      );
      
      // 5. 模型调用
      const response = await this.callModel(
        routing.model,
        request,
        toolResults
      );
      
      // 6. 输出验证
      await this.validateOutput(response);
      
      // 7. 引用链构建
      const citations = this.buildCitations(response, toolResults);
      
      return {
        ...response,
        citations,
        traceId
      };
      
    } catch (error) {
      // 降级处理
      return this.handleDegradation(error, request);
    } finally {
      this.observer.endTrace(traceId);
    }
  }
}
```

### 4.2 工具白名单

```typescript
// services/ai-orchestrator/src/tools/whitelist.ts
export const TOOL_WHITELIST = {
  basic: [
    {
      name: 'calc_bazi_basic',
      rateLimit: { rpm: 60, rpd: 1000 },
      timeout: 3000,
      cost: 0.001,
      validator: zodSchema.baziInput,
      permissions: ['free_user', 'paid_user']
    },
    {
      name: 'calc_fengshui_xuankong',
      rateLimit: { rpm: 30, rpd: 500 },
      timeout: 5000,
      cost: 0.002,
      validator: zodSchema.xuankongInput,
      permissions: ['paid_user']
    }
  ],
  premium: [
    {
      name: 'generate_detailed_report',
      rateLimit: { rpm: 10, rpd: 100 },
      timeout: 30000,
      cost: 0.05,
      permissions: ['premium_user'],
      requires: ['subscription_active']
    }
  ]
};
```

---

## 5. 前端实现

### 5.1 Next.js App Router结构

```typescript
// apps/web/app/layout.tsx
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

// apps/web/app/dashboard/page.tsx
export default async function DashboardPage() {
  // RSC - 服务端获取数据
  const user = await getCurrentUser();
  const recentReports = await getRecentReports(user.id);
  
  return (
    <DashboardClient 
      user={user} 
      reports={recentReports}
    />
  );
}
```

### 5.2 可视化引擎集成

```typescript
// packages/@qiflow/ui/src/visualization/engine.tsx
import { Stage, Layer } from 'react-konva';
import * as PIXI from 'pixi.js';

export function VisualizationEngine({ 
  floorPlan, 
  xuankongData 
}: VisualizationProps) {
  // Konva静态层
  const konvaRef = useRef<Konva.Stage>(null);
  
  // Pixi动效层
  const pixiRef = useRef<PIXI.Application>(null);
  
  useEffect(() => {
    // 初始化Pixi应用
    const app = new PIXI.Application({
      transparent: true,
      resolution: window.devicePixelRatio,
      antialias: true
    });
    
    pixiRef.current = app;
    
    // 创建粒子系统
    const particles = new ParticleSystem(app);
    particles.createEmitters(xuankongData.palaces);
    
    return () => {
      app.destroy();
    };
  }, []);
  
  return (
    <div className="relative">
      {/* Konva静态层 */}
      <Stage ref={konvaRef} width={800} height={600}>
        <Layer>
          <FloorPlanLayer data={floorPlan} />
          <GridOverlay data={xuankongData} />
        </Layer>
      </Stage>
      
      {/* Pixi动效层 */}
      <div 
        ref={pixiContainerRef} 
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
```

---

## 6. 数据库设计

### 6.1 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  subscription_tier VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 八字案例表
CREATE TABLE bazi_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  birth_datetime TIMESTAMPTZ NOT NULL,
  birth_location JSONB NOT NULL, -- {lat, lng, timezone}
  true_solar_time TIMESTAMPTZ,
  pillars JSONB NOT NULL, -- {year, month, day, hour}
  elements JSONB,
  interpretation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 风水案例表
CREATE TABLE fengshui_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  floor_plan_url TEXT,
  facing_deg DECIMAL(5,2),
  confidence INTEGER CHECK (confidence IN (0,1,2)),
  period INTEGER CHECK (period BETWEEN 1 AND 9),
  jian_xiang BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 玄空结果表
CREATE TABLE xuankong_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES fengshui_cases(id),
  palaces JSONB NOT NULL, -- 九宫数据
  overlay JSONB, -- 年月叠加
  interpretations JSONB,
  checksum VARCHAR(64),
  version VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bazi_user_created ON bazi_cases(user_id, created_at DESC);
CREATE INDEX idx_fengshui_user_created ON fengshui_cases(user_id, created_at DESC);
```

---

## 7. API设计

### 7.1 RESTful API

```typescript
// services/api-gateway/src/routes/xuankong.ts
import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// 玄空推导
router.post('/api/v1/fengshui/xuankong/derive', 
  validateRequest(xuankongInputSchema),
  rateLimit({ window: '1m', limit: 30 }),
  async (req, res) => {
    const result = await xuankongService.derive(req.body);
    
    res.json({
      success: true,
      data: result,
      meta: {
        version: '4.0.0',
        timestamp: new Date().toISOString()
      }
    });
  }
);

// 获取规则包列表
router.get('/api/v1/fengshui/xuankong/rulepacks',
  cacheMiddleware(300), // 5分钟缓存
  async (req, res) => {
    const packs = await xuankongService.getRulePacks();
    res.json({ success: true, data: packs });
  }
);
```

### 7.2 GraphQL Schema

```graphql
type Query {
  # 获取用户的风水案例
  fengshuiCases(
    userId: ID!
    limit: Int = 10
    offset: Int = 0
  ): FengshuiCaseConnection!
  
  # 获取玄空分析结果
  xuankongResult(caseId: ID!): XuankongResult
}

type Mutation {
  # 创建风水案例
  createFengshuiCase(
    input: FengshuiCaseInput!
  ): FengshuiCase!
  
  # 执行玄空推导
  deriveXuankong(
    input: XuankongInput!
  ): XuankongResult!
}

type FengshuiCase {
  id: ID!
  floorPlanUrl: String
  facingDeg: Float!
  period: Int!
  confidence: Int!
  jianXiang: Boolean!
  createdAt: DateTime!
  xuankongResult: XuankongResult
}

type XuankongResult {
  id: ID!
  palaces: JSON!
  interpretations: JSON!
  checksum: String!
  version: String!
}
```

---

## 8. 部署架构

### 8.1 Kubernetes配置

```yaml
# infrastructure/k8s/deployments/xuankong-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: xuankong-service
  namespace: qiflow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: xuankong-service
  template:
    metadata:
      labels:
        app: xuankong-service
    spec:
      containers:
      - name: xuankong
        image: qiflow/xuankong-service:4.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: DB_CONNECTION
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 8.2 CI/CD Pipeline

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
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run tests
        run: pnpm test:ci
      - name: Run build
        run: pnpm build
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy services to K8s
        run: |
          kubectl apply -f infrastructure/k8s/
          kubectl rollout status deployment/xuankong-service
```

---

## 9. 监控与可观测性

### 9.1 Prometheus配置

```yaml
# infrastructure/monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'xuankong-service'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - qiflow
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: xuankong-service
```

### 9.2 日志规范

```typescript
// packages/@qiflow/utils/src/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({
      service: process.env.SERVICE_NAME,
      version: process.env.VERSION,
      env: process.env.NODE_ENV
    })
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      userId: req.user?.id
    })
  }
});
```

---

## 10. 安全实现

### 10.1 认证中间件

```typescript
// services/api-gateway/src/middleware/auth.ts
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    
    const payload = await verifyJWT(token);
    req.user = await userService.findById(payload.sub);
    
    if (!req.user) {
      throw new UnauthorizedError('User not found');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
```

### 10.2 速率限制

```typescript
// services/api-gateway/src/middleware/rateLimit.ts
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl',
  points: 100, // 请求数
  duration: 60, // 秒
  blockDuration: 60 * 5 // 封禁5分钟
});

export const rateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = req.user?.id || req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: error.msBeforeNext / 1000
    });
  }
};
```

---

## 11. 性能优化

### 11.1 缓存策略

```typescript
// packages/@qiflow/utils/src/cache.ts
export class CacheManager {
  private redis: RedisClient;
  
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set<T>(
    key: string, 
    value: T, 
    ttl: number = 3600
  ): Promise<void> {
    await this.redis.setex(
      key,
      ttl,
      JSON.stringify(value)
    );
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 11.2 数据库优化

```sql
-- 分区表（按月分区）
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type VARCHAR(50),
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE events_2024_12 PARTITION OF events
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
  
-- 物化视图（统计加速）
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_reports,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  MAX(created_at) as last_active
FROM bazi_cases
GROUP BY user_id;

-- 定期刷新
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-stats', '0 * * * *', 
  'REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;');
```

---

## 12. 测试策略

### 12.1 单元测试

```typescript
// packages/@qiflow/core/xuankong/__tests__/engine.test.ts
import { describe, it, expect } from 'vitest';
import { XuanKongEngine } from '../engine';

describe('XuanKongEngine', () => {
  const engine = new XuanKongEngine();
  
  it('应该正确计算子山午向', () => {
    const result = engine.calculate({
      facingDeg: 180,
      period: 9,
      year: 2024,
      month: 12
    });
    
    expect(result.facing).toBe('午');
    expect(result.sitting).toBe('子');
    expect(result.palaces['离'].mountain).toBe(7);
    expect(result.palaces['离'].facing).toBe(3);
  });
  
  it('应该正确处理兼向', () => {
    const result = engine.calculate({
      facingDeg: 175, // 接近午向边界
      period: 9
    });
    
    expect(result.jianXiang).toBeTruthy();
    expect(result.jianXiang.type).toBe('left_jian');
  });
});
```

### 12.2 集成测试

```typescript
// services/xuankong-service/__tests__/integration.test.ts
import request from 'supertest';
import { app } from '../src/app';

describe('POST /api/v1/fengshui/xuankong/derive', () => {
  it('应该返回正确的玄空结果', async () => {
    const response = await request(app)
      .post('/api/v1/fengshui/xuankong/derive')
      .send({
        facingDeg: 180,
        period: 9,
        year: 2024,
        month: 12
      })
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.facing).toBe('午');
    expect(response.body.data.checksum).toBeDefined();
  });
  
  it('应该正确处理速率限制', async () => {
    // 发送超过限制的请求
    for (let i = 0; i < 35; i++) {
      await request(app)
        .post('/api/v1/fengshui/xuankong/derive')
        .send({ facingDeg: 180, period: 9 });
    }
    
    // 第36个请求应该被拒绝
    const response = await request(app)
      .post('/api/v1/fengshui/xuankong/derive')
      .send({ facingDeg: 180, period: 9 })
      .expect(429);
      
    expect(response.body.error).toBe('Too many requests');
  });
});
```

---

## 13. 故障处理

### 13.1 熔断器实现

```typescript
// packages/@qiflow/utils/src/circuit-breaker.ts
export class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold = 5,
    private timeout = 30000,
    private resetTimeout = 60000
  ) {}
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

### 13.2 优雅降级

```typescript
// services/ai-orchestrator/src/degradation.ts
export class DegradationStrategy {
  async execute(level: number, request: AIRequest): Promise<AIResponse> {
    switch(level) {
      case 1: // 使用备用模型
        return this.useFallbackModel(request);
        
      case 2: // 返回缓存结果
        return this.getCachedResponse(request);
        
      case 3: // 返回静态内容
        return this.getStaticResponse(request);
        
      case 4: // 拒绝非关键请求
        if (!this.isCritical(request)) {
          throw new ServiceUnavailableError('Service degraded');
        }
        return this.processMinimal(request);
        
      default:
        throw new ServiceUnavailableError('Service unavailable');
    }
  }
}
```

---

## 14. 开发工具

### 14.1 本地开发环境

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: qiflow_dev
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

### 14.2 开发脚本

```json
// package.json (root)
{
  "scripts": {
    "dev": "nx run-many --target=serve --all --parallel",
    "build": "nx run-many --target=build --all",
    "test": "nx run-many --target=test --all",
    "lint": "nx run-many --target=lint --all",
    "affected:test": "nx affected:test",
    "affected:build": "nx affected:build",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:down": "docker-compose -f docker-compose.dev.yml down",
    "db:migrate": "nx run database:migrate",
    "db:seed": "nx run database:seed"
  }
}
```

---

## 15. 文档规范

### 15.1 API文档

使用OpenAPI 3.0规范，自动生成文档：

```typescript
// services/api-gateway/src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QiFlow API',
      version: '4.0.0',
      description: '专业八字风水AI分析平台API文档'
    },
    servers: [
      { url: 'https://api.qiflow.ai/v1' },
      { url: 'http://localhost:3000/v1' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

### 15.2 代码注释规范

```typescript
/**
 * 玄空飞星计算引擎
 * @description 实现三元九运玄空飞星的核心算法
 * @author QiFlow Algorithm Team
 * @since 4.0.0
 */
export class XuanKongEngine {
  /**
   * 计算玄空飞星盘
   * @param {XuanKongInput} input - 输入参数
   * @param {number} input.facingDeg - 朝向角度(0-360)
   * @param {number} input.period - 元运(1-9)
   * @returns {XuanKongResult} 玄空飞星结果
   * @throws {InvalidInputError} 输入参数无效
   * @example
   * const engine = new XuanKongEngine();
   * const result = engine.calculate({
   *   facingDeg: 180,
   *   period: 9
   * });
   */
  calculate(input: XuanKongInput): XuanKongResult {
    // ...
  }
}
```

---

*文档版本*：4.0  
*发布日期*：2024-12-27  
*下次更新*：2025-01-31  
*文档所有者*：Engineering Team