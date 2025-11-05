# Enhanced Floorplan Overlay 集成示例 (v5.1.1)

## 目录

1. [概述](#概述)
2. [集成步骤](#集成步骤)
3. [完整代码示例](#完整代码示例)
4. [关键变更说明](#关键变更说明)
5. [UI 状态指示器](#ui-状态指示器)
6. [最佳实践](#最佳实践)

---

## 概述

本文档展示如何将 **户型叠加持久化功能** 集成到现有的 `enhanced-floorplan-overlay.tsx` 组件中。

**核心变更**：
- ✅ 使用 `useFloorplanPersist` Hook 替代本地 `useState`
- ✅ 图片上传自动压缩并云存储/Base64 降级
- ✅ 参数变化自动保存到 localStorage + 数据库
- ✅ 页面刷新/切换后状态完整恢复
- ✅ 离线模式自动排队，恢复网络后同步
- ✅ 保存状态实时提示（保存中 / 成功 / 失败）

---

## 集成步骤

### 步骤 1: 安装依赖导入

在 `src/components/qiflow/enhanced-floorplan-overlay.tsx` 文件顶部添加：

```typescript path=null start=null
import { useSession } from "next-auth/react";
import { useFloorplanPersist } from "@/hooks/use-floorplan-persist";
import { uploadFloorplanImage } from "@/lib/qiflow/floorplan-storage";
import { toast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, XCircle, WifiOff, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
```

### 步骤 2: 组件参数扩展

添加 `analysisId` 参数到组件 Props：

```typescript path=null start=null
interface EnhancedFloorplanOverlayProps {
  // 现有参数...
  analysisId?: string; // 新增：用于区分不同方案
  onAnalysisIdChange?: (id: string) => void; // 可选：支持外部切换方案
}

export function EnhancedFloorplanOverlay({
  // 现有参数解构...
  analysisId = "default",
  onAnalysisIdChange,
}: EnhancedFloorplanOverlayProps) {
  // ...
}
```

### 步骤 3: Hook 初始化

替换现有的 `useState` 为持久化 Hook：

```typescript path=null start=null
const { data: session } = useSession();
const userId = session?.user?.id;

// 使用持久化 Hook
const {
  state: floorplanState,
  updateState: updateFloorplanState,
  isLoading,
  isSaving,
  isOffline,
  saveError,
  retry,
  refresh,
  clearLocal,
} = useFloorplanPersist({
  analysisId,
  userId,
  enabled: true, // 可选：通过配置控制
  debounceMs: 300,
  autoSaveInterval: 10000,
});
```

### 步骤 4: 图片上传处理

替换现有的图片上传逻辑：

```typescript path=null start=null
const handleImageUpload = async (file: File) => {
  try {
    // 调用封装的上传服务（自动压缩、云上传、降级 Base64）
    const result = await uploadFloorplanImage(file, userId);

    if (!result.success) {
      throw new Error(result.error || "图片上传失败");
    }

    // 更新状态（自动触发持久化）
    updateFloorplanState({
      imageData: result.imageData,
      imageType: result.imageType,
      storageKey: result.storageKey,
      id: floorplanState?.id || `floorplan_${Date.now()}`,
      name: floorplanState?.name || `方案 ${Date.now()}`,
      createdAt: floorplanState?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });

    toast({
      title: "上传成功",
      description: result.imageType === "url" 
        ? "图片已上传到云存储" 
        : "图片已保存为 Base64",
    });
  } catch (error) {
    toast({
      title: "上传失败",
      description: error instanceof Error ? error.message : "未知错误",
      variant: "destructive",
    });
  }
};
```

### 步骤 5: 参数变化处理

将所有本地状态更新改为调用 `updateFloorplanState`：

```typescript path=null start=null
// 旋转
const handleRotationChange = (value: number) => {
  updateFloorplanState({ rotation: value % 360 });
};

// 缩放
const handleScaleChange = (value: number) => {
  updateFloorplanState({ scale: value });
};

// 位置
const handlePositionChange = (x: number, y: number) => {
  updateFloorplanState({ position: { x, y } });
};

// 叠加层开关
const handleOverlayToggle = (show: boolean) => {
  updateFloorplanState({ showOverlay: show });
};

// 透明度
const handleOpacityChange = (value: number) => {
  updateFloorplanState({ overlayOpacity: value });
};

// ...其他参数同理
```

### 步骤 6: 添加状态指示器 UI

在组件顶部添加保存状态、离线状态、配额警告等提示：

```typescript path=null start=null
{/* 状态指示器栏 */}
<div className="flex items-center gap-2 mb-4">
  {/* 保存状态 */}
  {isSaving && (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Loader2 className="h-3 w-3 animate-spin" />
      保存中...
    </Badge>
  )}
  
  {!isSaving && !saveError && floorplanState && (
    <Badge variant="success" className="flex items-center gap-1">
      <CheckCircle2 className="h-3 w-3" />
      已保存
    </Badge>
  )}
  
  {saveError && (
    <Badge variant="destructive" className="flex items-center gap-1">
      <XCircle className="h-3 w-3" />
      保存失败
      <button
        onClick={retry}
        className="ml-1 underline hover:no-underline"
      >
        重试
      </button>
    </Badge>
  )}

  {/* 离线状态 */}
  {isOffline && (
    <Badge variant="warning" className="flex items-center gap-1">
      <WifiOff className="h-3 w-3" />
      离线模式
    </Badge>
  )}

  {/* 配额警告 */}
  {quotaWarning && (
    <Badge variant="warning" className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      存储空间接近上限
      <button onClick={clearLocal} className="ml-1 underline">
        清理缓存
      </button>
    </Badge>
  )}
</div>
```

---

## 完整代码示例

以下是一个简化的完整集成示例（仅展示核心变更部分）：

```typescript path=null start=null
"use client";

import { useSession } from "next-auth/react";
import { useFloorplanPersist } from "@/hooks/use-floorplan-persist";
import { uploadFloorplanImage } from "@/lib/qiflow/floorplan-storage";
import { toast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, XCircle, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EnhancedFloorplanOverlayProps {
  analysisId?: string;
  onAnalysisIdChange?: (id: string) => void;
  // ...其他现有参数
}

export function EnhancedFloorplanOverlay({
  analysisId = "default",
  onAnalysisIdChange,
  // ...其他参数解构
}: EnhancedFloorplanOverlayProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // 🔑 核心：使用持久化 Hook
  const {
    state: floorplanState,
    updateState: updateFloorplanState,
    isLoading,
    isSaving,
    isOffline,
    saveError,
    retry,
    clearLocal,
  } = useFloorplanPersist({
    analysisId,
    userId,
  });

  // 🖼️ 图片上传
  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadFloorplanImage(file, userId);
      if (!result.success) throw new Error(result.error || "上传失败");

      updateFloorplanState({
        imageData: result.imageData,
        imageType: result.imageType,
        storageKey: result.storageKey,
        id: floorplanState?.id || `floorplan_${Date.now()}`,
        name: floorplanState?.name || "默认方案",
        createdAt: floorplanState?.createdAt || Date.now(),
        updatedAt: Date.now(),
      });

      toast({ title: "上传成功" });
    } catch (error) {
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  // 🔄 参数更新
  const handleRotationChange = (value: number) => {
    updateFloorplanState({ rotation: value % 360 });
  };

  const handleScaleChange = (value: number) => {
    updateFloorplanState({ scale: value });
  };

  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 📊 状态指示器 */}
      <div className="flex items-center gap-2">
        {isSaving && (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            保存中...
          </Badge>
        )}
        {!isSaving && !saveError && (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            已保存
          </Badge>
        )}
        {saveError && (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            保存失败
            <button onClick={retry} className="ml-1 underline">
              重试
            </button>
          </Badge>
        )}
        {isOffline && (
          <Badge variant="warning">
            <WifiOff className="h-3 w-3 mr-1" />
            离线模式
          </Badge>
        )}
      </div>

      {/* 🎨 原有的 UI 组件 */}
      <div className="canvas-container">
        {floorplanState?.imageData && (
          <img
            src={floorplanState.imageData}
            alt="Floorplan"
            style={{
              transform: `rotate(${floorplanState.rotation}deg) scale(${floorplanState.scale})`,
              transformOrigin: "center",
            }}
          />
        )}
      </div>

      {/* 🎛️ 控制面板 */}
      <div className="controls">
        <label>旋转角度</label>
        <input
          type="range"
          min="0"
          max="360"
          value={floorplanState?.rotation || 0}
          onChange={(e) => handleRotationChange(Number(e.target.value))}
        />

        <label>缩放比例</label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={floorplanState?.scale || 1}
          onChange={(e) => handleScaleChange(Number(e.target.value))}
        />

        {/* ...更多控制项 */}
      </div>
    </div>
  );
}
```

---

## 关键变更说明

### 1. 状态管理变更

| 变更前 (useState)              | 变更后 (useFloorplanPersist)     |
|-------------------------------|----------------------------------|
| `const [image, setImage]`      | `floorplanState.imageData`       |
| `const [rotation, setRotation]`| `floorplanState.rotation`        |
| `setRotation(90)`              | `updateFloorplanState({rotation: 90})` |

**好处**：
- ✅ 状态自动持久化到 localStorage + 数据库
- ✅ 页面刷新后完整恢复
- ✅ 离线变更自动排队，网络恢复后同步

### 2. 图片处理变更

| 变更前                         | 变更后                           |
|-------------------------------|----------------------------------|
| 手动 `FileReader` 读取 Base64 | `uploadFloorplanImage(file, userId)` |
| 无压缩，大文件占用空间          | 自动压缩至 1920px, 质量 85%      |
| 只支持 Base64                  | 云存储优先，失败降级 Base64       |

**好处**：
- ✅ 节省存储空间 (~70% 压缩率)
- ✅ 提升上传速度
- ✅ 支持云存储（免费用户可选）

### 3. 保存时机变更

| 变更前                         | 变更后                           |
|-------------------------------|----------------------------------|
| 需要手动点击"保存"按钮          | 自动保存，无需手动操作            |
| 切换 tab 时状态丢失             | 自动保存，切换后恢复              |
| 页面刷新后状态重置              | 自动恢复完整状态                  |

**好处**：
- ✅ 用户体验更流畅，无需担心丢失
- ✅ 防抖 300ms + 10s 自动保存，性能优化

---

## UI 状态指示器

建议在组件顶部添加以下状态指示器：

### 1. 保存状态

```typescript path=null start=null
{isSaving && <Badge>保存中...</Badge>}
{!isSaving && !saveError && <Badge variant="success">已保存</Badge>}
{saveError && <Badge variant="destructive">保存失败 <button onClick={retry}>重试</button></Badge>}
```

### 2. 离线状态

```typescript path=null start=null
{isOffline && (
  <Alert variant="warning">
    <WifiOff className="h-4 w-4" />
    <AlertTitle>离线模式</AlertTitle>
    <AlertDescription>
      您的修改已保存在本地，网络恢复后将自动同步到云端。
    </AlertDescription>
  </Alert>
)}
```

### 3. 配额警告

```typescript path=null start=null
{quotaWarning && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>存储空间即将用尽</AlertTitle>
    <AlertDescription>
      本地存储使用率 {quotaPercentage}%，
      <button onClick={clearLocal}>点击清理旧缓存</button>
    </AlertDescription>
  </Alert>
)}
```

---

## 最佳实践

### 1. 错误处理

```typescript path=null start=null
// ❌ 不推荐：忽略错误
updateFloorplanState({ rotation: 90 });

// ✅ 推荐：捕获并处理错误
try {
  updateFloorplanState({ rotation: 90 });
} catch (error) {
  toast({
    title: "保存失败",
    description: error.message,
    variant: "destructive",
  });
}
```

### 2. 性能优化

```typescript path=null start=null
// ❌ 不推荐：频繁调用
onMouseMove={(e) => {
  updateFloorplanState({ position: { x: e.clientX, y: e.clientY } });
}}

// ✅ 推荐：使用 throttle 或仅在 mouseup 时更新
const handleDragEnd = (x: number, y: number) => {
  updateFloorplanState({ position: { x, y } });
};
```

### 3. 用户体验

```typescript path=null start=null
// ✅ 推荐：显示加载状态
if (isLoading) {
  return <Skeleton className="h-96 w-full" />;
}

// ✅ 推荐：提供重试机制
{saveError && (
  <Button onClick={retry} variant="outline">
    重试保存
  </Button>
)}
```

### 4. 登录状态检测

```typescript path=null start=null
// ✅ 推荐：未登录时提示
{!userId && (
  <Alert>
    <AlertTitle>未登录</AlertTitle>
    <AlertDescription>
      当前使用匿名模式，数据存储在本地。
      <Link href="/auth/signin">登录后可跨设备同步</Link>
    </AlertDescription>
  </Alert>
)}
```

---

## 测试验收标准

集成完成后，验证以下场景：

| 场景                           | 预期结果                         |
|-------------------------------|----------------------------------|
| 上传图片并调整参数              | 立即保存到 localStorage          |
| 300ms 内连续调整参数            | 仅触发一次数据库保存              |
| 刷新页面                       | 完整恢复所有参数和图片            |
| 切换到其他 tab 后返回           | 状态不丢失                       |
| 断网后调整参数                  | 显示离线提示，本地排队            |
| 恢复网络                       | 自动同步到数据库                  |
| 登录前修改 → 登录               | 数据自动迁移到账号                |
| localStorage 配额接近上限       | 显示警告并提供清理入口            |
| 云上传失败                     | 自动降级为 Base64 并继续          |

---

## 故障排查

### 问题 1: 状态未保存

**原因**：Hook 未正确初始化  
**解决**：检查 `userId` 和 `analysisId` 是否正确传递

```typescript path=null start=null
console.log("userId:", userId, "analysisId:", analysisId);
```

### 问题 2: 图片上传失败

**原因**：云存储接口配置错误  
**解决**：检查 `/api/storage/upload` 端点是否正常

```typescript path=null start=null
// 测试云上传
const result = await uploadFloorplanImage(testFile, userId);
console.log("Upload result:", result);
```

### 问题 3: localStorage 配额超限

**原因**：Base64 图片过大  
**解决**：调用 `clearLocal()` 或增大压缩率

```typescript path=null start=null
// 主动清理
clearLocal();

// 或调整压缩参数（在 image-compression.ts）
maxWidth: 1280, // 降低至 1280px
quality: 0.7,   // 降低质量至 70%
```

---

## 相关文档

- [@FLOORPLAN_PERSIST_INTEGRATION.md](./FLOORPLAN_PERSIST_INTEGRATION.md) - 完整 API 参考
- [src/hooks/use-floorplan-persist.ts](src/hooks/use-floorplan-persist.ts) - Hook 源码
- [src/lib/qiflow/floorplan-storage.ts](src/lib/qiflow/floorplan-storage.ts) - 存储服务源码
- [src/actions/qiflow/floorplan-state.ts](src/actions/qiflow/floorplan-state.ts) - Server Actions 源码

---

**版本**: v5.1.1  
**最后更新**: 2025-01-22  
**作者**: Warp AI Agent
