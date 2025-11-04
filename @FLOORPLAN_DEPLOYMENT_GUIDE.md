# 户型叠加持久化功能 - 部署指南 (v5.1.1)

## 📋 部署前检查清单

在部署户型叠加持久化功能之前，请确保完成以下准备工作：

### 1. ✅ 代码文件已就位 (13个文件)

| 文件 | 路径 | 状态 |
|------|------|------|
| 类型定义 | `src/types/floorplan.ts` | ✅ |
| 图片压缩工具 | `src/lib/qiflow/image-compression.ts` | ✅ |
| 配额监控 | `src/lib/qiflow/storage-quota.ts` | ✅ |
| 存储服务 | `src/lib/qiflow/floorplan-storage.ts` | ✅ |
| Server Actions | `src/actions/qiflow/floorplan-state.ts` | ✅ |
| 持久化 Hook | `src/hooks/use-floorplan-persist.ts` | ✅ |
| 迁移处理器 | `src/components/layout/floorplan-migration-handler.tsx` | ✅ |
| 方案管理器 | `src/components/qiflow/floorplan-manager.tsx` | ✅ |
| 主组件 | `src/components/qiflow/enhanced-floorplan-overlay.tsx` | ✅ |
| 上传 API | `src/app/api/storage/upload/route.ts` | ✅ |
| 删除 API | `src/app/api/storage/delete/route.ts` | ✅ |
| 数据库迁移 | `src/db/migrations/add-floorplan-persistence.sql` | ✅ |
| 文档 | `@FLOORPLAN_*.md` (3个文档) | ✅ |

---

## 🗄️ 步骤 1: 数据库迁移

### 1.1 执行迁移脚本

```bash
# 方法 A: 使用 psql 直接执行
psql -U your_username -d your_database -f src/db/migrations/add-floorplan-persistence.sql

# 方法 B: 使用 Drizzle (如果项目使用)
npm run db:migrate

# 方法 C: 在数据库客户端中手动执行
# 打开 src/db/migrations/add-floorplan-persistence.sql
# 复制内容到 PostgreSQL 客户端执行
```

### 1.2 验证迁移结果

```sql
-- 检查字段是否添加成功
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'fengshuiAnalysis' 
  AND column_name IN ('floorPlanData', 'floorPlanUrl')
ORDER BY ordinal_position;

-- 检查索引是否创建成功
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'fengshuiAnalysis' 
  AND indexname LIKE '%floorplan%'
ORDER BY indexname;
```

**预期结果**:
```
column_name    | data_type | is_nullable
---------------+-----------+-------------
floorPlanData  | jsonb     | YES
floorPlanUrl   | text      | YES

indexname                                  | indexdef
-------------------------------------------+---------
idx_fengshui_floorPlanData_name           | ...
idx_fengshui_floorPlanData_updatedAt      | ...
idx_fengshui_userId_createdAt             | ...
```

---

## ☁️ 步骤 2: 云存储配置

### 2.1 确认云存储提供商

项目已集成云存储服务，确认配置文件中的提供商设置：

```typescript
// 检查 src/storage/index.ts 或类似配置文件
// 支持的提供商：Cloudflare R2、AWS S3、Supabase Storage 等
```

### 2.2 环境变量配置

在 `.env.local` 或生产环境中添加以下环境变量：

```bash
# 云存储配置（根据实际提供商调整）

# Cloudflare R2 示例
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev

# 或 AWS S3 示例
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name

# 或 Supabase Storage 示例
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET_NAME=floorplans
```

### 2.3 创建存储桶（Bucket）

```bash
# 对于 Cloudflare R2
# 在 Cloudflare Dashboard → R2 → Create Bucket
# 名称: floorplans (或自定义)
# 设置: 公开访问 (Public Access)

# 对于 AWS S3
aws s3 mb s3://your-bucket-name
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json

# 对于 Supabase
# 在 Supabase Dashboard → Storage → Create Bucket
# 名称: floorplans
# 设置: Public bucket
```

### 2.4 CORS 配置 (如需要)

```json
// cors.json (AWS S3 示例)
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-domain.com"],
      "AllowedMethods": ["GET", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

---

## 🔧 步骤 3: 集成迁移处理器

### 3.1 选择集成方式

**方式 A: 全局布局集成（推荐）**

编辑 `src/app/layout.tsx`:

```typescript
import { FloorplanMigrationHandlerSilent } from '@/components/layout/floorplan-migration-handler';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <FloorplanMigrationHandlerSilent />
        {children}
      </body>
    </html>
  );
}
```

**方式 B: 主面板集成（带UI提示）**

编辑 `src/components/qiflow/enhanced-comprehensive-panel.tsx`:

```typescript
import { FloorplanMigrationHandler } from '@/components/layout/floorplan-migration-handler';

export function EnhancedComprehensivePanel() {
  return (
    <>
      <FloorplanMigrationHandler />
      {/* 其他内容 */}
    </>
  );
}
```

### 3.2 验证迁移处理器

1. 打开浏览器 DevTools → Console
2. 未登录状态上传户型图并调整参数
3. 登录账号
4. 观察控制台输出 `[Migration]` 日志
5. 检查 localStorage 中 `floorplan_anonymous_*` 键是否已清理

---

## 🚀 步骤 4: 构建与部署

### 4.1 本地测试

```bash
# 安装依赖（如有新增）
npm install

# 运行开发服务器
npm run dev

# 打开浏览器访问
# http://localhost:3000
```

### 4.2 测试核心功能

按照 `@FLOORPLAN_INTEGRATION_COMPLETE.md` 中的验证步骤测试：

- [ ] 上传户型图
- [ ] 调整旋转/缩放参数
- [ ] 观察"已保存"状态
- [ ] 刷新页面验证状态恢复
- [ ] 测试离线模式（DevTools → Network → Offline）
- [ ] 测试登录迁移（未登录 → 登录）

### 4.3 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果（可选）
npm run start

# 或部署到 Vercel/Netlify 等平台
vercel deploy --prod
```

---

## 🔍 步骤 5: 监控与验证

### 5.1 数据库监控

```sql
-- 查询使用户型叠加功能的用户数
SELECT COUNT(DISTINCT "userId") AS active_users
FROM "fengshuiAnalysis"
WHERE "floorPlanData" IS NOT NULL;

-- 查询平均数据大小
SELECT 
  AVG(pg_column_size("floorPlanData")) AS avg_bytes,
  MAX(pg_column_size("floorPlanData")) AS max_bytes
FROM "fengshuiAnalysis"
WHERE "floorPlanData" IS NOT NULL;

-- 查询最近24小时的新增方案数
SELECT COUNT(*) AS new_plans_24h
FROM "fengshuiAnalysis"
WHERE "floorPlanData" IS NOT NULL
  AND "updatedAt" > NOW() - INTERVAL '24 hours';
```

### 5.2 云存储监控

```bash
# Cloudflare R2 - 查看使用情况
# Dashboard → R2 → your-bucket → Metrics

# AWS S3 - 查看使用情况
aws s3 ls s3://your-bucket-name/floorplans/ --recursive | wc -l

# Supabase - 查看使用情况
# Dashboard → Storage → floorplans → Usage
```

### 5.3 应用日志监控

关键日志标识符：
- `[Floorplan Storage]` - 存储相关日志
- `[Floorplan Persist]` - 持久化 Hook 日志
- `[Storage Upload]` - 上传 API 日志
- `[Storage Delete]` - 删除 API 日志
- `[Migration]` - 数据迁移日志

---

## ⚙️ 步骤 6: 配置灰度开关（可选）

### 6.1 功能开关配置

创建 `src/config/floorplan.ts`:

```typescript
export const FLOORPLAN_CONFIG = {
  // 总开关
  enabled: process.env.NEXT_PUBLIC_FLOORPLAN_ENABLED === 'true',
  
  // 云存储开关
  cloudUpload: {
    enabled: process.env.NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED === 'true',
    freeTierStrategy: process.env.NEXT_PUBLIC_CLOUD_FREE_TIER || 'allow', // allow | deny | auto
  },
  
  // 配额限制
  maxPlansPerUser: parseInt(process.env.NEXT_PUBLIC_MAX_PLANS_PER_USER || '10'),
  maxImageSizeMB: parseInt(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB || '10'),
  
  // 性能配置
  debounceMs: 300,
  autoSaveInterval: 10000,
};
```

### 6.2 环境变量示例

```bash
# .env.local (开发环境 - 全部启用)
NEXT_PUBLIC_FLOORPLAN_ENABLED=true
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=true
NEXT_PUBLIC_CLOUD_FREE_TIER=allow
NEXT_PUBLIC_MAX_PLANS_PER_USER=10
NEXT_PUBLIC_MAX_IMAGE_SIZE_MB=10

# .env.production (生产环境 - 灰度发布)
NEXT_PUBLIC_FLOORPLAN_ENABLED=true
NEXT_PUBLIC_CLOUD_UPLOAD_ENABLED=false  # 先禁用云上传，测试 Base64 模式
NEXT_PUBLIC_CLOUD_FREE_TIER=deny
NEXT_PUBLIC_MAX_PLANS_PER_USER=5
NEXT_PUBLIC_MAX_IMAGE_SIZE_MB=5
```

### 6.3 在组件中使用开关

```typescript
// enhanced-floorplan-overlay.tsx
import { FLOORPLAN_CONFIG } from '@/config/floorplan';

const {
  state: floorplanState,
  updateState,
  // ...
} = useFloorplanPersist({
  analysisId,
  userId,
  enabled: FLOORPLAN_CONFIG.enabled, // 使用开关
});
```

---

## 🐛 故障排查指南

### 问题 1: 数据库迁移失败

**症状**: SQL 执行报错

**排查步骤**:
1. 检查数据库连接：`psql -U your_user -d your_db -c "SELECT version();"`
2. 检查表是否存在：`\d fengshuiAnalysis`
3. 检查权限：`\du` (用户应有 CREATE 权限)

**解决方案**:
```sql
-- 手动添加字段
ALTER TABLE "fengshuiAnalysis" ADD COLUMN IF NOT EXISTS "floorPlanData" JSONB;
ALTER TABLE "fengshuiAnalysis" ADD COLUMN IF NOT EXISTS "floorPlanUrl" TEXT;
```

### 问题 2: 云上传失败，全部降级 Base64

**症状**: Console 显示 `[Floorplan Storage] 云上传失败`

**排查步骤**:
1. 检查环境变量：`console.log(process.env.R2_ACCOUNT_ID)`
2. 测试上传 API：`curl -X POST http://localhost:3000/api/storage/upload -F "file=@test.jpg" -F "folder=test"`
3. 检查存储桶权限和 CORS 配置

**解决方案**:
- 验证云存储凭证
- 检查存储桶是否为公开访问
- 确认 API 返回格式 `{url, key}` 或 `{publicUrl, path}`

### 问题 3: 状态不持久化

**症状**: 刷新页面后状态丢失

**排查步骤**:
1. 打开 DevTools → Application → Local Storage
2. 查找 `floorplan_` 开头的键
3. 检查 Hook 是否正确初始化：`console.log(floorplanState)`

**解决方案**:
```typescript
// 确保 Hook 正确传递参数
useFloorplanPersist({
  analysisId: 'valid-id',  // 不能为空
  userId: session?.user?.id, // 可为 undefined
  enabled: true, // 确保启用
});
```

### 问题 4: localStorage 配额超限

**症状**: Console 报错 `QuotaExceededError`

**排查步骤**:
```javascript
// 在 Console 中运行
const quota = checkLocalStorageQuota();
console.log('LocalStorage 使用率:', quota.percentage + '%');
```

**解决方案**:
```javascript
// 手动清理旧缓存
cleanOldFloorplanCache(30); // 清理 30 天前的缓存

// 或强制清空所有户型缓存
Object.keys(localStorage)
  .filter(key => key.startsWith('floorplan_'))
  .forEach(key => localStorage.removeItem(key));
```

---

## 📊 性能基准

### 预期性能指标

| 操作 | 目标 | 备注 |
|------|------|------|
| 图片上传 (1MB) | < 1.5s | 包含压缩 + 云上传 |
| 图片上传 (3MB) | < 3s | 包含压缩 + 云上传 |
| localStorage 写入 | < 10ms | 立即响应 |
| 数据库保存 | < 500ms | 防抖后执行 |
| 首屏加载 (localStorage) | < 100ms | 快速渲染 |
| 首屏加载 (数据库) | < 1s | 后台校准 |
| 离线恢复同步 | < 2s | 网络恢复后 |

### 压缩效果基准

| 原图大小 | 压缩后大小 | 压缩率 | 压缩耗时 |
|----------|------------|--------|----------|
| 500KB | ~150KB | 70% | < 100ms |
| 1MB | ~300KB | 70% | < 200ms |
| 3MB | ~900KB | 70% | < 500ms |
| 5MB | ~1.5MB | 70% | < 800ms |

---

## 🔐 安全检查清单

- [ ] 所有 Server Actions 已添加 Zod 验证
- [ ] 上传接口验证用户登录状态
- [ ] 删除接口验证文件所有权
- [ ] 环境变量不包含敏感信息（使用 Secrets Manager）
- [ ] 云存储 CORS 仅允许特定域名
- [ ] 文件大小限制已设置（默认 10MB）
- [ ] 文件类型限制已设置（仅 JPG/PNG/WebP）
- [ ] 日志不记录图片原文和 Base64
- [ ] 匿名用户数据不包含 PII

---

## 📞 技术支持

### 相关文档

1. **API 参考**: `@FLOORPLAN_PERSIST_INTEGRATION.md`
2. **集成指南**: `@FLOORPLAN_INTEGRATION_EXAMPLE.md`
3. **完成报告**: `@FLOORPLAN_INTEGRATION_COMPLETE.md`
4. **本文档**: `@FLOORPLAN_DEPLOYMENT_GUIDE.md`

### 联系方式

- **技术文档**: 查看项目 `/docs` 目录
- **Issue 跟踪**: GitHub Issues
- **代码审查**: Pull Request

---

**版本**: v5.1.1  
**最后更新**: 2025-01-22  
**维护者**: Warp AI Agent
