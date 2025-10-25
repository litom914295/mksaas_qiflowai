"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  FileImage,
  Calendar,
  AlertCircle,
} from "lucide-react";

import type { FloorplanState } from "@/types/floorplan";
import {
  listFloorplanStates,
  createFloorplanState,
  renameFloorplanState,
  deleteFloorplanState,
  batchDeleteFloorplanStates,
} from "@/actions/qiflow/floorplan-state";
import { cn } from "@/lib/utils";

interface FloorplanManagerProps {
  /** 当前激活的方案 ID */
  currentAnalysisId: string;
  /** 切换方案回调 */
  onSwitchPlan: (analysisId: string) => void;
  /** 可选：当前方案状态（用于复制参数） */
  currentState?: FloorplanState | null;
  /** 可选：限制显示数量 */
  maxPlans?: number;
  /** 可选：自定义类名 */
  className?: string;
}

/**
 * 方案项 UI 展示类型
 */
interface FloorplanPlanItem {
  id: string;
  name: string;
  imageData?: string;
  imageType?: "url" | "base64";
  createdAt: number;
  updatedAt: number;
  isCurrent: boolean;
}

/**
 * Floorplan 方案管理器组件
 * 
 * 功能：
 * - 显示用户所有保存的户型方案列表
 * - 创建新方案（空白或复制当前）
 * - 重命名方案
 * - 删除方案（单个或批量）
 * - 切换当前激活方案
 * - 四态支持：Empty / Error / Loading / Timeout
 * 
 * @example
 * <FloorplanManager
 *   currentAnalysisId={analysisId}
 *   onSwitchPlan={setAnalysisId}
 *   currentState={floorplanState}
 * />
 */
export function FloorplanManager({
  currentAnalysisId,
  onSwitchPlan,
  currentState,
  maxPlans,
  className,
}: FloorplanManagerProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [plans, setPlans] = useState<FloorplanPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  // 创建方案对话框状态
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [copyCurrentParams, setCopyCurrentParams] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 重命名对话框状态
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamePlanId, setRenamePlanId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * 加载方案列表
   */
  const loadPlans = useCallback(async () => {
    if (!userId) {
      setPlans([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsTimeout(false);

    const timeoutId = setTimeout(() => {
      setIsTimeout(true);
    }, 10000);

    try {
      const result = await listFloorplanStates(userId);
      clearTimeout(timeoutId);

      if (!result.success || !result.data) {
        setError(result.error || "加载方案列表失败");
        setPlans([]);
        return;
      }

      const items: FloorplanPlanItem[] = result.data.map((plan) => ({
        id: plan.id,
        name: plan.name,
        imageData: plan.imageData,
        imageType: plan.imageType,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        isCurrent: plan.id === currentAnalysisId,
      }));

      setPlans(items);
    } catch (err) {
      clearTimeout(timeoutId);
      setError(err instanceof Error ? err.message : "未知错误");
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentAnalysisId]);

  /**
   * 创建新方案
   */
  const handleCreate = async () => {
    if (!userId) {
      toast({
        title: "需要登录",
        description: "请先登录后再创建方案",
        variant: "destructive",
      });
      return;
    }

    if (!newPlanName.trim()) {
      toast({
        title: "方案名称不能为空",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const initialState = copyCurrentParams && currentState
        ? {
            ...currentState,
            name: newPlanName,
            id: undefined, // 生成新 ID
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
        : {
            name: newPlanName,
            imageData: "",
            imageType: "url" as const,
            rotation: 0,
            scale: 1,
            position: { x: 0, y: 0 },
            showOverlay: true,
            showLabels: true,
            overlayOpacity: 0.5,
            gridLineWidth: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

      const result = await createFloorplanState(userId, initialState);

      if (!result.success || !result.data) {
        throw new Error(result.error || "创建方案失败");
      }

      toast({
        title: "创建成功",
        description: `方案 "${newPlanName}" 已创建`,
      });

      setIsCreateDialogOpen(false);
      setNewPlanName("");
      setCopyCurrentParams(false);

      // 刷新列表并切换到新方案
      await loadPlans();
      onSwitchPlan(result.data.id);
    } catch (err) {
      toast({
        title: "创建失败",
        description: err instanceof Error ? err.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * 重命名方案
   */
  const handleRename = async () => {
    if (!userId || !renamePlanId) return;

    if (!renameValue.trim()) {
      toast({
        title: "方案名称不能为空",
        variant: "destructive",
      });
      return;
    }

    setIsRenaming(true);

    try {
      const result = await renameFloorplanState(userId, renamePlanId, renameValue);

      if (!result.success) {
        throw new Error(result.error || "重命名失败");
      }

      toast({
        title: "重命名成功",
      });

      setRenameDialogOpen(false);
      setRenamePlanId(null);
      setRenameValue("");

      await loadPlans();
    } catch (err) {
      toast({
        title: "重命名失败",
        description: err instanceof Error ? err.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  /**
   * 删除方案
   */
  const handleDelete = async () => {
    if (!userId || !deletePlanId) return;

    setIsDeleting(true);

    try {
      const result = await deleteFloorplanState(userId, deletePlanId);

      if (!result.success) {
        throw new Error(result.error || "删除失败");
      }

      toast({
        title: "删除成功",
      });

      setDeleteDialogOpen(false);
      setDeletePlanId(null);

      // 如果删除的是当前方案，切换到第一个方案
      if (deletePlanId === currentAnalysisId) {
        const remainingPlans = plans.filter((p) => p.id !== deletePlanId);
        if (remainingPlans.length > 0) {
          onSwitchPlan(remainingPlans[0].id);
        }
      }

      await loadPlans();
    } catch (err) {
      toast({
        title: "删除失败",
        description: err instanceof Error ? err.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * 打开重命名对话框
   */
  const openRenameDialog = (planId: string, currentName: string) => {
    setRenamePlanId(planId);
    setRenameValue(currentName);
    setRenameDialogOpen(true);
  };

  /**
   * 打开删除确认对话框
   */
  const openDeleteDialog = (planId: string) => {
    setDeletePlanId(planId);
    setDeleteDialogOpen(true);
  };

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  /**
   * 显示的方案列表（限制数量）
   */
  const displayedPlans = useMemo(() => {
    if (!maxPlans) return plans;
    return plans.slice(0, maxPlans);
  }, [plans, maxPlans]);

  /**
   * Empty 态
   */
  if (!isLoading && !error && !isTimeout && plans.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>户型方案管理</CardTitle>
          <CardDescription>还没有保存的户型方案</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileImage className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-6">
            创建您的第一个户型方案<br />
            保存并管理多套户型叠加配置
          </p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建方案
              </Button>
            </DialogTrigger>
            <CreatePlanDialog
              newPlanName={newPlanName}
              setNewPlanName={setNewPlanName}
              copyCurrentParams={copyCurrentParams}
              setCopyCurrentParams={setCopyCurrentParams}
              isCreating={isCreating}
              onConfirm={handleCreate}
              hasCurrentState={!!currentState}
            />
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  /**
   * Error 态
   */
  if (error) {
    return (
      <Card className={cn("w-full border-destructive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            加载失败
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadPlans} variant="outline">
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  /**
   * Timeout 态
   */
  if (isTimeout) {
    return (
      <Card className={cn("w-full border-warning", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertCircle className="h-5 w-5" />
            加载超时
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            网络连接较慢，请稍后重试
          </p>
          <Button onClick={loadPlans} variant="outline">
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  /**
   * Loading 态
   */
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>户型方案管理</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  /**
   * 正常展示态
   */
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>户型方案管理</CardTitle>
          <CardDescription>
            共 {plans.length} 个方案
            {maxPlans && plans.length > maxPlans && ` (显示前 ${maxPlans} 个)`}
          </CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              创建方案
            </Button>
          </DialogTrigger>
          <CreatePlanDialog
            newPlanName={newPlanName}
            setNewPlanName={setNewPlanName}
            copyCurrentParams={copyCurrentParams}
            setCopyCurrentParams={setCopyCurrentParams}
            isCreating={isCreating}
            onConfirm={handleCreate}
            hasCurrentState={!!currentState}
          />
        </Dialog>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedPlans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              plan.isCurrent && "ring-2 ring-primary"
            )}
            onClick={() => !plan.isCurrent && onSwitchPlan(plan.id)}
          >
            <CardContent className="p-4">
              {/* 缩略图 */}
              <div className="relative aspect-video w-full mb-3 rounded-md overflow-hidden bg-muted">
                {plan.imageData ? (
                  <Image
                    src={plan.imageData}
                    alt={plan.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {plan.isCurrent && (
                  <Badge className="absolute top-2 right-2" variant="default">
                    当前
                  </Badge>
                )}
              </div>

              {/* 方案信息 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{plan.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(plan.updatedAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>

                {/* 操作菜单 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>操作</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameDialog(plan.id, plan.name);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      重命名
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(plan.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>

      {/* 重命名对话框 */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名方案</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-input">新名称</Label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="输入新的方案名称"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              disabled={isRenaming}
            >
              取消
            </Button>
            <Button onClick={handleRename} disabled={isRenaming}>
              {isRenaming ? "重命名中..." : "确认"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。确定要删除该户型方案吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/**
 * 创建方案对话框
 */
function CreatePlanDialog({
  newPlanName,
  setNewPlanName,
  copyCurrentParams,
  setCopyCurrentParams,
  isCreating,
  onConfirm,
  hasCurrentState,
}: {
  newPlanName: string;
  setNewPlanName: (v: string) => void;
  copyCurrentParams: boolean;
  setCopyCurrentParams: (v: boolean) => void;
  isCreating: boolean;
  onConfirm: () => void;
  hasCurrentState: boolean;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>创建新方案</DialogTitle>
        <DialogDescription>
          创建一个新的户型叠加方案
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="plan-name">方案名称</Label>
          <Input
            id="plan-name"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            placeholder="例如：主卧风水方案"
          />
        </div>
        {hasCurrentState && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="copy-params"
              checked={copyCurrentParams}
              onChange={(e) => setCopyCurrentParams(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="copy-params" className="cursor-pointer">
              复制当前方案的参数
            </Label>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setNewPlanName("");
            setCopyCurrentParams(false);
          }}
          disabled={isCreating}
        >
          取消
        </Button>
        <Button onClick={onConfirm} disabled={isCreating || !newPlanName.trim()}>
          {isCreating ? "创建中..." : "创建"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
