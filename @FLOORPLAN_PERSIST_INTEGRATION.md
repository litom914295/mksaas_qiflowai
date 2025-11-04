# 户型图持久化功能集成指南

> **版本**: v1.0  
> **更新时间**: 2025-01-24  
> **状态**: ✅ 核心功能已完成，待 UI 集成

---

## 📋 目录

1. [功能概述](#功能概述)
2. [已完成模块](#已完成模块)
3. [集成步骤](#集成步骤)
4. [API 文档](#api-文档)
5. [使用示例](#使用示例)
6. [配置选项](#配置选项)
7. [常见问题](#常见问题)

---

## 功能概述

### 核心特性

- ✅ **混合持久化**：localStorage 快速缓存 + 数据库可靠存储
- ✅ **云存储支持**：图片上传到 Cloudflare R2，失败自动降级 Base64
- ✅ **离线优先**：离线时可操作，恢复后自动同步
- ✅ **多方案管理**：每个用户可保存多套户型叠加方案
- ✅ **匿名用户支持**：登录后自动迁移 localStorage 数据
- ✅ **自动保存**：300ms 防抖 + 10秒定时保存
- ✅ **冲突解决**：基于时间戳的智能合并策略

### 技术架构

```
┌─────────────────────────────────────────┐
│  UI Components (React)                  │
│  └─ useFloorplanPersist Hook            │
└─────────────┬───────────────────────────┘
              │
     ┌────────┴─────────┐
     ▼                  ▼
┌──────────┐    ┌──────────────┐
│localStorage│   │ Server Actions│
│  (缓存)   │   │  (数据库)     │
└──────────┘    └───────┬──────┘
                        │
                ┌───────┴────────┐
                ▼                ▼
        ┌─────────────┐  ┌──────────┐
        │ Cloud Storage│  │ Database │
        │ (图片)       │  │ (状态)   │
        └─────────────┘  └──────────┘
```

---

## 已完成模块

### 1. 类型定义 (`types/floorplan.ts`)

```typescript
export interface FloorplanState {
  id: string;
  name?: string;
  imageData: string;
  imageType: 'url' | 'base64';
  storageKey?: string;
  rotation: number;
  scale: number;
  position: { x: number; y: number };
  showOverlay: boolean;
  showLabels: boolean;
  overlayOpacity: number;
  gridLineWidth: number;
  analysisId?: string;
  createdAt: number;
  updatedAt: number;
}
```

### 2. 工具函数

| 文件 | 功能 | 导出函数 |
|------|------|----------|
| `lib/qiflow/image-compression.ts` | 图片压缩 | `compressImage()`, `imageToBase64()` |
| `lib/qiflow/storage-quota.ts` | 配额监控 | `checkLocalStorageQuota()`, `cleanOldFloorplanCache()` |
| `lib/qiflow/floorplan-storage.ts` | 云存储 | `uploadFloorplanImage()`, `deleteCloudFile()` |

### 3. Server Actions (`actions/qiflow/floorplan-state.ts`)

```typescript
// 核心 CRUD
saveFloorplanState(analysisId, state)
loadFloorplanState(analysisId)
listFloorplanStates()
deleteFloorplanState(analysisId)

// 扩展功能
createFloorplanState(initialState?, name?)
renameFloorplanState(analysisId, name)
migrateAnonymousData(anonymousData)
batchDeleteFloorplanStates(analysisIds)
```

### 4. 持久化 Hook (`hooks/use-floorplan-persist.ts`)

```typescript
const {
  state,         // 当前状态
  updateState,   // 更新并自动保存
  isLoading,     // 加载状态
  isSaving,      // 保存状态
  isOffline,     // 离线状态
  saveError,     // 错误信息
  retry,         // 重试保存
  refresh,       // 刷新数据
  clearLocal,    // 清除缓存
} = useFloorplanPersist({
  analysisId: 'xxx',
  userId: 'optional',
});
```

---

## 集成步骤

### 第一步：更新主组件 `enhanced-floorplan-overlay.tsx`

**修改位置**：第 94-106 行（原 useState 部分）

**替换前：**
```typescript
const [floorplanImage, setFloorplanImage] = useState<string | null>(null);
const [rotation, setRotation] = useState(0);
const [scale, setScale] = useState(1);
// ... 其他 useState
```

**替换后：**
```typescript
const session = await getSession(); // 获取用户会话
const { state, updateState, isSaving, saveError, retry } = useFloorplanPersist({
  analysisId: analysisResult?.id || 'default',
  userId: session?.user?.id,
  enabled: true,
});

// 使用 state 替代原 useState
const floorplanImage = state?.imageData;
const rotation = state?.rotation || 0;
const scale = state?.scale || 1;
// ...
```

**图片上传处理（第 113-127 行）：**
```typescript
const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // 1. 压缩图片
  const compressed = await compressImage(file);
  
  // 2. 上传到云存储（或降级 Base64）
  const uploadResult = await uploadFloorplanImage(
    file, 
    session?.user?.id || 'anonymous',
    DEFAULT_CLOUD_STORAGE_CONFIG
  );

  if (uploadResult.success) {
    // 3. 更新状态（自动触发保存）
    updateState({
      imageData: uploadResult.imageData,
      imageType: uploadResult.imageType,
      storageKey: uploadResult.storageKey,
      id: state?.id || `floorplan_${Date.now()}`,
      createdAt: state?.createdAt || Date.now(),
    });
  }
}, [session, updateState, state]);
```

**参数调整处理（第 161-163 行等）：**
```typescript
const handleZoom = (delta: number) => {
  updateState({ scale: Math.max(0.3, Math.min(3, (state?.scale || 1) + delta)) });
};

const handleRotationChange = (value: number) => {
  updateState({ rotation: value % 360 });
};
```

### 第二步：添加保存状态指示器

在顶部工具栏添加（第 339-398 行之后）：

```tsx
{/* 保存状态指示器 */}
{isSaving && (
  <div className="flex items-center gap-2 text-sm text-blue-600">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>保存中...</span>
  </div>
)}

{saveError && (
  <div className="flex items-center gap-2 text-sm text-red-600">
    <AlertCircle className="h-4 w-4" />
    <span>{saveError}</span>
    <Button variant="ghost" size="sm" onClick={retry}>
      重试
    </Button>
  </div>
)}

{!isSaving && !saveError && state && (
  <div className="flex items-center gap-2 text-sm text-green-600">
    <CheckCircle2 className="h-4 w-4" />
    <span>已保存</span>
  </div>
)}
```

### 第三步：添加离线提示

在主预览区域顶部添加（第 591 行之后）：

```tsx
{/* 离线模式横幅 */}
{isOffline && (
  <div className="absolute top-0 left-0 right-0 z-20 bg-yellow-100 border-b-2 border-yellow-300 px-4 py-2">
    <div className="flex items-center gap-2 text-sm text-yellow-800">
      <AlertCircle className="h-4 w-4" />
      <span>离线模式：更改将在恢复网络后自动同步</span>
    </div>
  </div>
)}
```

### 第四步：添加配额警告

在组件内监听配额：

```typescript
useEffect(() => {
  const quota = checkLocalStorageQuota();
  if (quota.isNearLimit) {
    // 显示警告 Toast
    console.warn('[Floorplan] 存储空间接近上限');
  }
}, [state]);
```

---

## API 文档

### uploadFloorplanImage()

上传户型图到云存储或降级为 Base64。

**签名：**
```typescript
uploadFloorplanImage(
  file: File,
  userId: string,
  config?: CloudStorageConfig
): Promise<UploadResult>
```

**参数：**
- `file`: 图片文件对象
- `userId`: 用户 ID（匿名用户传 'anonymous'）
- `config`: 云存储配置（可选）

**返回：**
```typescript
{
  success: boolean;
  imageData: string;        // URL 或 Base64
  imageType: 'url' | 'base64';
  storageKey?: string;      // 云存储 key（用于删除）
  error?: string;
  fallbackReason?: string;  // 降级原因
}
```

**示例：**
```typescript
const result = await uploadFloorplanImage(file, userId);
if (result.success) {
  if (result.imageType === 'url') {
    console.log('云上传成功:', result.imageData);
  } else {
    console.log('已降级为 Base64');
  }
}
```

### useFloorplanPersist()

持久化 Hook。

**参数：**
```typescript
{
  analysisId: string;           // 必需：分析 ID
  userId?: string;              // 可选：用户 ID
  debounceMs?: number;          // 可选：防抖延迟（默认 300ms）
  autoSaveIntervalMs?: number;  // 可选：自动保存间隔（默认 10s）
  enabled?: boolean;            // 可选：是否启用（默认 true）
}
```

**返回值：**
- `state`: 当前状态或 null
- `updateState(updates)`: 更新状态（部分更新或函数式）
- `isLoading`: 是否正在加载
- `isSaving`: 是否正在保存
- `isOffline`: 是否离线
- `saveError`: 保存错误信息
- `retry()`: 手动重试保存
- `refresh()`: 从数据库刷新
- `clearLocal()`: 清除本地缓存

---

## 使用示例

### 示例 1：基础集成

```typescript
function FloorplanComponent({ analysisId }: { analysisId: string }) {
  const session = useSession();
  const { state, updateState, isLoading } = useFloorplanPersist({
    analysisId,
    userId: session?.user?.id,
  });

  if (isLoading) return <div>加载中...</div>;
  if (!state) return <div>暂无数据</div>;

  return (
    <div>
      <img src={state.imageData} alt="户型图" />
      <button onClick={() => updateState({ rotation: state.rotation + 90 })}>
        旋转
      </button>
    </div>
  );
}
```

### 示例 2：图片上传

```typescript
async function handleUpload(file: File) {
  // 1. 上传到云存储
  const uploadResult = await uploadFloorplanImage(file, userId, {
    freeTierStrategy: 'allow',
    maxImageSize: 10 * 1024 * 1024,
    maxImageDimension: 4096,
    freeTierMaxPlans: 0,
  });

  if (!uploadResult.success) {
    alert(uploadResult.error);
    return;
  }

  // 2. 更新状态
  updateState({
    id: state?.id || `floorplan_${Date.now()}`,
    imageData: uploadResult.imageData,
    imageType: uploadResult.imageType,
    storageKey: uploadResult.storageKey,
    createdAt: state?.createdAt || Date.now(),
    updatedAt: Date.now(),
  });
}
```

### 示例 3：匿名用户迁移

```typescript
// 在登录成功后调用
async function handleLoginSuccess(userId: string) {
  // 1. 扫描 localStorage 匿名数据
  const anonymousData: MigrationDataItem[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && FloorplanStorageKeys.isAnonymousKey(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        const state = JSON.parse(value) as FloorplanState;
        const analysisId = FloorplanStorageKeys.extractAnalysisId(key);
        if (analysisId) {
          anonymousData.push({ key, state, analysisId });
        }
      }
    }
  }

  // 2. 批量迁移
  if (anonymousData.length > 0) {
    const result = await migrateAnonymousData(anonymousData);
    console.log(`迁移完成: ${result.migratedCount} 成功, ${result.failedCount} 失败`);
    
    // 3. 清理匿名数据
    if (result.success) {
      cleanAnonymousFloorplanCache();
    }
  }
}
```

---

## 配置选项

### 云存储配置

在 `types/floorplan.ts` 中定义：

```typescript
export const DEFAULT_CLOUD_STORAGE_CONFIG: CloudStorageConfig = {
  freeTierStrategy: 'allow',     // 'allow' | 'deny' | 'auto'
  freeTierMaxPlans: 0,           // 0 = 无限制
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxImageDimension: 4096,        // 4K
};
```

### 灰度开关

```typescript
// 在组件中控制
const ENABLE_FLOORPLAN_PERSIST = true; // 灰度开关

useFloorplanPersist({
  analysisId,
  userId,
  enabled: ENABLE_FLOORPLAN_PERSIST,
});
```

---

## 常见问题

### Q1: localStorage 配额不足怎么办？

**A:** Hook 会自动调用 `autoCleanIfNeeded()` 清理过期缓存。也可以手动清理：

```typescript
import { cleanOldFloorplanCache } from '@/lib/qiflow/storage-quota';

// 清理 7 天以上的缓存
cleanOldFloorplanCache(7);
```

### Q2: 云上传失败会怎样？

**A:** 自动降级为 Base64 存储在数据库中。用户无感知，但会记录 `fallbackReason`。

### Q3: 如何处理冲突？

**A:** Hook 使用时间戳自动解决：
- 加载时：比较 localStorage 和数据库，使用较新的
- 保存时：最后写入的优先
- 迁移时：`updatedAt` 较新的覆盖旧的

### Q4: 离线时的数据会丢失吗？

**A:** 不会。离线时数据保存在 localStorage，恢复网络后自动同步到数据库。

### Q5: 如何测试功能？

```typescript
// 模拟离线
window.dispatchEvent(new Event('offline'));

// 检查配额
const quota = checkLocalStorageQuota();
console.log(`已使用: ${quota.percentage.toFixed(1)}%`);

// 查看统计
const stats = getFloorplanCacheStats();
console.log(`总方案数: ${stats.totalCount}`);
```

---

## 下一步

### 待完成任务

1. ✅ 核心功能已完成
2. 🔄 UI 集成（主组件更新）
3. 🔄 方案管理 UI
4. 🔄 匿名迁移处理器
5. ⏳ 数据库索引优化
6. ⏳ 单元测试
7. ⏳ 文档补充

### 快速启动

1. 复制本文档中的代码到对应文件
2. 安装依赖（如需要）：`npm install uuid`
3. 重启开发服务器
4. 测试图片上传和状态保存

---

## 技术支持

如遇问题，请检查：
1. 浏览器控制台日志（`[Floorplan Persist]` 前缀）
2. localStorage 配额（F12 → Application → Local Storage）
3. 网络请求（F12 → Network → `/api/storage/upload`）
4. 数据库记录（检查 `fengshuiAnalysis` 表的 `floorPlanData` 字段）

---

**版本历史**
- v1.0 (2025-01-24): 初始版本，核心功能完成
