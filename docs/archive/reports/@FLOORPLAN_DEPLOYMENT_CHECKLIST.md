# 户型叠加持久化功能 - 部署前检查清单

**版本**: v5.1.1  
**更新时间**: 2025-01-24  
**状态**: 📋 Production Ready

---

## 📊 总览

| 类别 | 检查项 | 状态 | 优先级 |
|------|--------|------|--------|
| 代码 | TypeScript 编译 | ⬜ | 🔴 Critical |
| 代码 | ESLint 检查 | ⬜ | 🟡 High |
| 代码 | 构建成功 | ⬜ | 🔴 Critical |
| 数据库 | 迁移脚本准备 | ✅ | 🔴 Critical |
| 数据库 | 迁移测试 | ⬜ | 🔴 Critical |
| 数据库 | 回滚脚本准备 | ✅ | 🟡 High |
| 配置 | 环境变量设置 | ⬜ | 🔴 Critical |
| 配置 | 云存储凭证 | ⬜ | 🟡 High |
| 配置 | 特性开关确认 | ⬜ | 🟡 High |
| 集成 | 迁移处理器集成 | ⬜ | 🟡 High |
| 集成 | 方案管理器集成 | ⬜ | 🔵 Medium |
| 测试 | 手动功能测试 | ⬜ | 🔴 Critical |
| 测试 | 浏览器兼容性测试 | ⬜ | 🟡 High |
| 测试 | 性能测试 | ⬜ | 🔵 Medium |
| 监控 | 错误日志准备 | ⬜ | 🟡 High |
| 监控 | 使用量统计准备 | ⬜ | 🔵 Medium |
| 文档 | 用户文档更新 | ⬜ | 🔵 Medium |
| 文档 | API 文档准备 | ✅ | 🔵 Medium |

---

## 🔴 Critical（必须完成）

### 1. TypeScript 编译检查

```bash
# 运行类型检查
npx tsc --noEmit

# 预期结果：0 errors
```

**检查项**:
- ⬜ 无类型错误
- ⬜ 无 `@ts-ignore` 滥用
- ⬜ 所有 Props 类型已定义

---

### 2. Next.js 构建检查

```bash
# 生产环境构建
npm run build

# 预期结果：✓ success
```

**检查项**:
- ⬜ 构建成功，无错误
- ⬜ 无 Critical 级别警告
- ⬜ Bundle size 在合理范围内

**排查方法**:
```bash
# 如果构建失败，查看详细错误
ANALYZE=true npm run build

# 检查大文件
du -sh .next/static/chunks/*
```

---

### 3. 数据库迁移执行

```bash
# 1. 备份现有数据库
pg_dump -U user -d dbname > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 执行迁移（测试环境）
psql -U user -d dbname_test -f src/db/migrations/add-floorplan-persistence.sql

# 3. 验证迁移结果
psql -U user -d dbname_test -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fengshuiAnalysis' 
AND column_name IN ('floorPlanData', 'floorPlanUrl');"

# 4. 验证索引
psql -U user -d dbname_test -c "
SELECT indexname FROM pg_indexes 
WHERE tablename = 'fengshuiAnalysis' 
AND indexname LIKE 'idx_fengshui%';"
```

**检查项**:
- ⬜ 测试环境迁移成功
- ⬜ `floorPlanData` JSONB 列已创建
- ⬜ `floorPlanUrl` TEXT 列已创建
- ⬜ 3 个索引已创建
- ⬜ 约束 `chk_floorPlanData_structure` 已添加

**验证 SQL**:
```sql
-- 测试写入
INSERT INTO "fengshuiAnalysis" (
  id, "userId", "floorPlanData", "floorPlanUrl"
) VALUES (
  gen_random_uuid(),
  'test-user-id',
  '{"id": "test", "name": "测试方案", "createdAt": "2025-01-24T00:00:00Z", "updatedAt": "2025-01-24T00:00:00Z", "imageType": "base64", "imageData": "data:image/png;base64,iVBORw0KG", "fallbackReason": null, "storageKey": null}',
  NULL
);

-- 测试查询
SELECT id, "floorPlanData"->>'name' as plan_name FROM "fengshuiAnalysis" WHERE "userId" = 'test-user-id';

-- 清理测试数据
DELETE FROM "fengshuiAnalysis" WHERE "userId" = 'test-user-id';
```

---

### 4. 环境变量配置

```bash
# 复制示例文件
cp .env.floorplan.example .env.local

# 编辑配置
nano .env.local
```

**必填项**:
```bash
# 功能开关（必填）
NEXT_PUBLIC_FLOORPLAN_ENABLED=true

# 数据库（必填，应该已存在）
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

**云存储配置（二选一）**:

**选项 A: Base64 模式（推荐灰度阶段）**
```bash
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=false
NEXT_PUBLIC_CLOUD_FREE_TIER=deny
```

**选项 B: Cloudflare R2**
```bash
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=true
NEXT_PUBLIC_CLOUD_FREE_TIER=allow
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=floorplans
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**选项 C: AWS S3**
```bash
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=true
NEXT_PUBLIC_CLOUD_FREE_TIER=allow
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
```

**选项 D: Supabase Storage**
```bash
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=true
NEXT_PUBLIC_CLOUD_FREE_TIER=allow
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET_NAME=floorplans
```

**检查项**:
- ⬜ 所有必填项已填写
- ⬜ 云存储凭证已测试（如启用）
- ⬜ 配额限制已调整（如需要）
- ⬜ 敏感信息未提交到 Git

---

### 5. 手动功能测试

**测试场景 1: 匿名用户上传**
```
1. 清空浏览器缓存
2. 未登录状态访问页面
3. 上传户型图片（< 10MB）
4. 调整透明度、缩放、位置
5. 刷新页面
6. ✅ 验证状态保持
7. 打开 DevTools > Application > Local Storage
8. ✅ 验证 `floorplan_state_guest` 存在
```

**测试场景 2: 注册用户保存**
```
1. 登录用户账号
2. 上传户型图片
3. 调整参数
4. 等待 3 秒（自动保存）
5. ✅ 验证显示"已保存"状态
6. 打开 DevTools > Network > Fetch
7. ✅ 验证调用了 /api/qiflow/floorplan-state
8. 数据库查询：
   SELECT "floorPlanData" FROM "fengshuiAnalysis" WHERE "userId" = 'your-user-id'
9. ✅ 验证数据已写入
```

**测试场景 3: 匿名迁移**
```
1. 匿名状态创建方案（步骤同场景 1）
2. 登录账号
3. ✅ 验证显示迁移提示或自动迁移
4. 刷新页面
5. ✅ 验证方案依然存在
6. 数据库查询验证数据已迁移
```

**测试场景 4: 离线模式**
```
1. 登录状态上传图片
2. DevTools > Network > Throttling > Offline
3. 调整参数
4. ✅ 验证显示"离线"徽章
5. ✅ 验证显示"等待同步"状态
6. 恢复网络
7. ✅ 验证自动同步成功
8. ✅ 验证显示"已保存"状态
```

**测试场景 5: localStorage 配额**
```
1. 上传 8 张 5MB 图片（触发配额警告）
2. ✅ 验证显示配额警告 Toast
3. 继续上传
4. ✅ 验证触发自动清理
5. 打开 DevTools > Console
6. ✅ 验证无错误日志
```

**测试场景 6: 云存储（如启用）**
```
1. 登录状态上传图片
2. DevTools > Network > XHR/Fetch
3. ✅ 验证调用 /api/storage/upload
4. ✅ 验证返回 { url, key }
5. 数据库查询：
   SELECT "floorPlanUrl", "floorPlanData"->>'imageType' 
   FROM "fengshuiAnalysis" WHERE "userId" = 'your-user-id'
6. ✅ 验证 imageType = 'url'
7. ✅ 验证 floorPlanUrl 可访问
```

**检查项**:
- ⬜ 场景 1 通过
- ⬜ 场景 2 通过
- ⬜ 场景 3 通过
- ⬜ 场景 4 通过
- ⬜ 场景 5 通过
- ⬜ 场景 6 通过（如启用云存储）

---

## 🟡 High（强烈推荐）

### 6. ESLint 检查

```bash
# 运行 Lint
npm run lint

# 修复自动可修复的问题
npm run lint -- --fix
```

**检查项**:
- ⬜ 无 Error 级别错误
- ⬜ Warning 数量在合理范围内（< 10）

---

### 7. 浏览器兼容性测试

**测试浏览器**:
- ⬜ Chrome 120+ (Linux/Mac/Windows)
- ⬜ Safari 17+ (Mac/iOS)
- ⬜ Firefox 120+ (Linux/Mac/Windows)
- ⬜ Edge 120+ (Windows)
- ⬜ 移动浏览器 (iOS Safari, Android Chrome)

**测试项**:
- ⬜ localStorage API 可用
- ⬜ Canvas API 可用（图片压缩）
- ⬜ Fetch API 可用（Server Actions）
- ⬜ 文件上传正常
- ⬜ 拖拽交互正常
- ⬜ Toast 通知显示正常

**快速检查脚本**:
```javascript
// 在浏览器 Console 运行
console.log({
  localStorage: typeof localStorage !== 'undefined',
  canvas: typeof HTMLCanvasElement !== 'undefined',
  fetch: typeof fetch === 'function',
  fileAPI: typeof File !== 'undefined',
});
```

---

### 8. 迁移处理器集成

**方案 A: 全局通知模式**

编辑 `src/app/layout.tsx`：

```typescript
import { FloorplanMigrationHandler } from '@/components/layout/floorplan-migration-handler';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <FloorplanMigrationHandler /> {/* 添加此行 */}
      </body>
    </html>
  );
}
```

**方案 B: 静默后台模式**

```typescript
import { FloorplanMigrationHandlerSilent } from '@/components/layout/floorplan-migration-handler';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <FloorplanMigrationHandlerSilent /> {/* 静默模式 */}
      </body>
    </html>
  );
}
```

**检查项**:
- ⬜ 迁移处理器已集成
- ⬜ 登录后自动触发迁移
- ⬜ 迁移失败有错误提示

---

### 9. 回滚方案准备

**数据库回滚**:

```sql
-- 保存为 rollback-floorplan.sql
-- 1. 删除约束
ALTER TABLE "fengshuiAnalysis" DROP CONSTRAINT IF EXISTS "chk_floorPlanData_structure";

-- 2. 删除索引
DROP INDEX IF EXISTS "idx_fengshui_userId_createdAt";
DROP INDEX IF EXISTS "idx_fengshui_floorPlanData_updatedAt";
DROP INDEX IF EXISTS "idx_fengshui_floorPlanData_name";

-- 3. 删除列（注意：会丢失数据！）
ALTER TABLE "fengshuiAnalysis" DROP COLUMN IF EXISTS "floorPlanData";
ALTER TABLE "fengshuiAnalysis" DROP COLUMN IF EXISTS "floorPlanUrl";
```

**代码回滚**:

```bash
# 方案 A: Git 回滚
git revert <commit-hash>
git push

# 方案 B: 特性开关禁用
# 修改 .env.local
NEXT_PUBLIC_FLOORPLAN_ENABLED=false
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=false

# 重新部署
npm run build
pm2 reload app
```

**检查项**:
- ⬜ 回滚脚本已准备
- ⬜ 回滚流程已测试（测试环境）
- ⬜ 备份已创建

---

### 10. 错误监控准备

**推荐工具**:
- Sentry
- LogRocket
- Datadog

**示例配置 (Sentry)**:

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function captureFloorplanError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    tags: {
      feature: 'floorplan-persistence',
    },
    extra: context,
  });
}
```

在 `src/hooks/use-floorplan-persist.ts` 中集成：

```typescript
// 第 248 行修改
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  setSaveError(error);
  
  // 添加监控
  captureFloorplanError(error, {
    action: 'saveToDatabase',
    userId,
    analysisId: options.analysisId,
  });
}
```

**检查项**:
- ⬜ 错误监控工具已配置
- ⬜ 关键路径已添加错误捕获
- ⬜ 测试错误上报正常

---

## 🔵 Medium（建议完成）

### 11. 性能测试

**工具**:
- Chrome DevTools Lighthouse
- WebPageTest
- Next.js Built-in Analytics

**测试指标**:

```bash
# 运行 Lighthouse
npx lighthouse http://localhost:3000/qiflow --view

# 关注指标：
# - First Contentful Paint (FCP) < 1.8s
# - Largest Contentful Paint (LCP) < 2.5s
# - Total Blocking Time (TBT) < 200ms
# - Cumulative Layout Shift (CLS) < 0.1
```

**压力测试**:

```javascript
// 在浏览器 Console 运行
async function stressTest() {
  const count = 100;
  const start = performance.now();
  
  for (let i = 0; i < count; i++) {
    localStorage.setItem(`test_${i}`, JSON.stringify({ data: 'x'.repeat(1000) }));
  }
  
  const duration = performance.now() - start;
  console.log(`${count} 次写入耗时: ${duration.toFixed(2)}ms`);
  
  // 清理
  for (let i = 0; i < count; i++) {
    localStorage.removeItem(`test_${i}`);
  }
}

stressTest();
```

**检查项**:
- ⬜ Lighthouse Score > 90
- ⬜ localStorage 写入 < 10ms
- ⬜ 图片压缩 < 200ms
- ⬜ 云上传 < 2s

---

### 12. 方案管理器集成

**集成到风水分析页面**:

```typescript
// src/app/qiflow/page.tsx (或相应页面)
import { FloorplanManager } from '@/components/qiflow/floorplan-manager';
import { useState } from 'react';

export default function QiflowPage() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | undefined>();
  
  return (
    <div>
      {/* 方案列表（侧边栏或抽屉） */}
      <FloorplanManager
        onSelectPlan={(id) => setSelectedAnalysisId(id)}
      />
      
      {/* 主编辑器 */}
      <EnhancedFloorplanOverlay
        analysisId={selectedAnalysisId}
        onAnalysisIdChange={setSelectedAnalysisId}
      />
    </div>
  );
}
```

**检查项**:
- ⬜ 方案管理器已集成
- ⬜ 可查看方案列表
- ⬜ 可创建新方案
- ⬜ 可重命名方案
- ⬜ 可删除方案

---

### 13. 使用量统计准备

**添加埋点**:

```typescript
// src/lib/analytics.ts
export function trackFloorplanEvent(
  event: 'upload' | 'save' | 'load' | 'delete',
  properties?: Record<string, any>
) {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', `floorplan_${event}`, properties);
  }
  
  // 自定义 API
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event: `floorplan_${event}`, properties }),
  }).catch(() => {}); // 静默失败
}
```

集成到 Hook：

```typescript
// src/hooks/use-floorplan-persist.ts
import { trackFloorplanEvent } from '@/lib/analytics';

// 第 203 行添加
const result = await saveFloorplanStateAction(...);
if (result.success) {
  trackFloorplanEvent('save', { analysisId, userId }); // 添加此行
}

// 第 144 行添加
const result = await loadFloorplanStateAction(...);
if (result.success) {
  trackFloorplanEvent('load', { analysisId, userId }); // 添加此行
}
```

**检查项**:
- ⬜ 埋点已添加
- ⬜ 数据上报正常
- ⬜ Dashboard 可查看统计

---

### 14. 用户文档更新

**添加到帮助中心**:

```markdown
# 户型叠加功能使用指南

## 上传户型图

1. 点击"上传户型图"按钮
2. 选择图片文件（支持 PNG, JPG, JPEG）
3. 等待上传完成

## 调整叠加效果

- **透明度**：拖动滑块调整图片透明度
- **缩放**：拖动滑块调整图片大小
- **旋转**：拖动滑块调整图片角度
- **位置**：直接拖拽图片调整位置

## 自动保存

系统会自动保存您的调整：
- ✅ 每次调整后 300 毫秒自动保存
- ✅ 每 10 秒定时保存
- ✅ 离开页面时保存

## 管理方案

1. 点击"方案管理"按钮
2. 查看所有保存的方案
3. 可以创建、重命名、删除方案

## 常见问题

**Q: 为什么显示"离线"徽章？**  
A: 当前网络不可用，系统会在恢复网络后自动同步数据。

**Q: 为什么显示配额警告？**  
A: 浏览器存储空间不足，建议删除旧方案或清理浏览器缓存。

**Q: 上传的图片去哪了？**  
A: 登录用户的图片保存在云端，未登录用户的图片保存在本地。
```

**检查项**:
- ⬜ 用户文档已编写
- ⬜ 常见问题已整理
- ⬜ 截图/视频已准备

---

## 🚀 部署流程（建议顺序）

### 阶段 0: 准备（1 天）

- [ ] 完成所有 Critical 检查项
- [ ] 完成数据库备份
- [ ] 准备回滚方案

### 阶段 1: 灰度 10%（3-5 天）

```bash
# 配置
NEXT_PUBLIC_FLOORPLAN_ENABLED=true
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=false  # Base64 模式
NEXT_PUBLIC_CLOUD_FREE_TIER=deny
NEXT_PUBLIC_MAX_PLANS_PER_USER=3  # 限制配额
```

- [ ] 部署到生产环境
- [ ] 监控错误率 < 1%
- [ ] 收集用户反馈

### 阶段 2: 灰度 50%（3-5 天）

```bash
# 配置
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=true  # 开启云存储
NEXT_PUBLIC_CLOUD_FREE_TIER=auto
NEXT_PUBLIC_MAX_PLANS_PER_USER=5  # 扩大配额
```

- [ ] 监控云存储成本
- [ ] 监控 API 成功率 > 99%
- [ ] 监控性能指标

### 阶段 3: 全量发布（持续）

```bash
# 配置
NEXT_PUBLIC_CLOUD_FREE_TIER=allow
NEXT_PUBLIC_MAX_PLANS_PER_USER=10
```

- [ ] 发布给所有用户
- [ ] 持续监控指标
- [ ] 优化成本和性能

---

## 📊 监控指标

### 关键指标 (SLI)

| 指标 | 目标 | 监控方式 |
|------|------|----------|
| 上传成功率 | > 99% | API logs |
| 保存成功率 | > 99% | Database logs |
| 平均响应时间 | < 500ms | APM |
| 错误率 | < 1% | Sentry |
| localStorage 命中率 | > 80% | Custom metrics |

### 业务指标

| 指标 | 监控方式 |
|------|----------|
| 日活用户数 (DAU) | Google Analytics |
| 上传图片数量 | Database count |
| 平均方案数/用户 | Database avg |
| 云存储流量 (GB) | Cloud provider dashboard |
| 成本 ($/月) | Billing dashboard |

---

## ✅ 最终确认

- [ ] 所有 Critical 项已完成
- [ ] 至少完成 50% High 项
- [ ] 数据库迁移已测试
- [ ] 回滚方案已准备
- [ ] 监控已配置
- [ ] 团队已培训

---

## 📞 应急联系

| 角色 | 姓名 | 联系方式 |
|------|------|----------|
| 项目负责人 | - | - |
| 后端工程师 | - | - |
| 运维工程师 | - | - |
| 数据库管理员 | - | - |

---

**准备完成后，在每个检查项前的 ⬜ 打上 ✅，确保万无一失！**

---

## 🆘 故障排查快速指南

### 问题 1: 构建失败

```bash
# 清除缓存重新构建
rm -rf .next node_modules
npm install
npm run build
```

### 问题 2: 迁移失败

```bash
# 检查数据库连接
psql -U user -d dbname -c "SELECT version();"

# 手动执行每条 SQL
psql -U user -d dbname
> \i src/db/migrations/add-floorplan-persistence.sql
```

### 问题 3: 云存储无法访问

```bash
# 检查凭证
env | grep R2_
env | grep AWS_
env | grep SUPABASE_

# 测试 API 端点
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.png" \
  -F "folder=floorplans/test"
```

### 问题 4: localStorage 配额

```javascript
// 浏览器 Console 运行
function checkQuota() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  console.log(`当前使用: ${(total / 1024).toFixed(2)} KB`);
}
checkQuota();
```

### 问题 5: 性能问题

```bash
# 分析 Bundle 大小
ANALYZE=true npm run build

# 启用 React Profiler
# DevTools > Profiler > Start Recording
```

---

**此清单应在部署前 72 小时开始执行，确保有足够时间处理任何问题。**
