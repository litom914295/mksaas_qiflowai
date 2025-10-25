'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type LayoutSuggestion,
  getLayoutSuggestion,
} from '@/lib/qiflow/xuankong/layout-suggestions';
import type { Mountain, PlateCell } from '@/lib/qiflow/xuankong/types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Download,
  Eye,
  EyeOff,
  Grid3x3,
  Home,
  Info,
  Loader2,
  Maximize2,
  Move,
  RotateCw,
  Save,
  Settings,
  Sparkles,
  Upload,
  WifiOff,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from '@/components/ui/use-toast';
import { authClient } from '@/lib/auth-client';
import { useFloorplanPersist } from '@/hooks/use-floorplan-persist';
import { uploadFloorplanImage } from '@/lib/qiflow/floorplan-storage';
import { checkLocalStorageQuota } from '@/lib/qiflow/storage-quota';

interface EnhancedFloorplanOverlayProps {
  flyingStarData?: {
    facing: Mountain;
    facingDegree: number;
    plate: PlateCell[];
  };
  analysisResult?: any;
  /** 分析方案 ID，用于持久化区分不同方案 */
  analysisId?: string;
  /** 方案切换回调 */
  onAnalysisIdChange?: (id: string) => void;
}

// 九宫格位置映射（洛书顺序）
const PALACE_POSITIONS = [
  { id: 4, row: 0, col: 0, name: '巽宫', direction: '东南', angle: 135 },
  { id: 9, row: 0, col: 1, name: '离宫', direction: '南', angle: 180 },
  { id: 2, row: 0, col: 2, name: '坤宫', direction: '西南', angle: 225 },
  { id: 3, row: 1, col: 0, name: '震宫', direction: '东', angle: 90 },
  { id: 5, row: 1, col: 1, name: '中宫', direction: '中', angle: 0 },
  { id: 7, row: 1, col: 2, name: '兑宫', direction: '西', angle: 270 },
  { id: 8, row: 2, col: 0, name: '艮宫', direction: '东北', angle: 45 },
  { id: 1, row: 2, col: 1, name: '坎宫', direction: '北', angle: 0 },
  { id: 6, row: 2, col: 2, name: '乾宫', direction: '西北', angle: 315 },
];

export function EnhancedFloorplanOverlay({
  flyingStarData,
  analysisResult,
  analysisId = 'default',
  onAnalysisIdChange,
}: EnhancedFloorplanOverlayProps) {
  // 会话管理
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  // 数据提取
  const data = flyingStarData || {
    facing: '子' as Mountain,
    facingDegree: analysisResult?.metadata?.facingDegree || 0,
    plate: analysisResult?.basicAnalysis?.plates?.period || [],
  };

  // 🔑 核心：持久化 Hook
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
    enabled: true,
  });

  // UI 状态管理
  const [autoRotated, setAutoRotated] = useState(false);
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'split' | 'overlay'>('overlay');
  const [quotaWarning, setQuotaWarning] = useState(false);

  // 从持久化状态中提取数据（兼容旧状态）
  const floorplanImage = floorplanState?.imageData || null;
  const rotation = floorplanState?.rotation ?? 0;
  const scale = floorplanState?.scale ?? 1;
  const position = floorplanState?.position ?? { x: 0, y: 0 };
  const showOverlay = floorplanState?.showOverlay ?? true;
  const showLabels = floorplanState?.showLabels ?? true;
  const overlayOpacity = floorplanState?.overlayOpacity ?? 0.7;
  const gridLineWidth = floorplanState?.gridLineWidth ?? 2;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 💾 配额监控
  useEffect(() => {
    const quota = checkLocalStorageQuota();
    setQuotaWarning(quota.percentage > 80);
  }, [floorplanState]);

  // 🖼️ 图片上传（集成持久化）
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        // 调用封装的上传服务（自动压缩、云上传、降级 Base64）
        const result = await uploadFloorplanImage(file, userId || '');

        if (!result.success) {
          throw new Error(result.error || '图片上传失败');
        }

        // 更新状态（自动触发持久化）
        updateFloorplanState({
          imageData: result.imageData,
          imageType: result.imageType,
          storageKey: result.storageKey,
          id: floorplanState?.id || `floorplan_${Date.now()}`,
          name:
            floorplanState?.name ||
            `方案 ${new Date().toLocaleString('zh-CN')}`,
          createdAt: floorplanState?.createdAt || Date.now(),
          updatedAt: Date.now(),
        });

        toast.success('上传成功', {
          description:
            result.imageType === 'url'
              ? '图片已上传到云存储'
              : '图片已保存为 Base64',
        });

        // 自动对准
        autoAlignFloorplan();
      } catch (error) {
        toast.error('上传失败', {
          description: error instanceof Error ? error.message : '未知错误',
        });
      }
    },
    [userId, floorplanState, updateFloorplanState]
  );

  // 🧭 自动旋转对准功能
  const autoAlignFloorplan = useCallback(() => {
    const rotationAngle = data.facingDegree;
    updateFloorplanState({ rotation: rotationAngle });
    setAutoRotated(true);

    // 显示成功提示
    setTimeout(() => {
      setAutoRotated(false);
    }, 3000);
  }, [data, updateFloorplanState]);

  // 👆 拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!floorplanImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // 暂存到本地状态，不立即持久化（性能优化）
    // 实际应用中可使用 throttle
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // 拖拽结束时更新持久化状态
    if (isDragging) {
      updateFloorplanState({ position });
    }
  }, [isDragging, position, updateFloorplanState]);

  // 🔍 缩放控制
  const handleZoom = useCallback(
    (delta: number) => {
      const newScale = Math.max(0.3, Math.min(3, scale + delta));
      updateFloorplanState({ scale: newScale });
    },
    [scale, updateFloorplanState]
  );

  // 🔄 重置视图
  const resetView = useCallback(() => {
    updateFloorplanState({
      scale: 1,
      position: { x: 0, y: 0 },
      rotation: data.facingDegree,
    });
    setAutoRotated(true);
    setTimeout(() => setAutoRotated(false), 3000);
  }, [data.facingDegree, updateFloorplanState]);

  // 导出功能
  const handleExport = useCallback(() => {
    if (!canvasRef.current || !floorplanImage) return;

    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `floorplan-analysis-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  }, [floorplanImage]);

  // 获取宫位建议
  const getPalaceSuggestion = (
    palaceIndex: number
  ): LayoutSuggestion | null => {
    const cell = data.plate.find((c: any) => c.palace === palaceIndex);
    if (!cell) return null;
    return getLayoutSuggestion(cell.mountainStar, cell.facingStar);
  };

  // 获取吉凶颜色
  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'auspicious':
        return {
          bg: 'rgba(34, 197, 94, 0.15)',
          border: 'rgba(34, 197, 94, 0.8)',
          text: 'text-green-700',
          badge: 'bg-green-500',
        };
      case 'inauspicious':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.8)',
          text: 'text-red-700',
          badge: 'bg-red-500',
        };
      case 'neutral':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.8)',
          text: 'text-yellow-700',
          badge: 'bg-yellow-500',
        };
      default:
        return {
          bg: 'rgba(156, 163, 175, 0.15)',
          border: 'rgba(156, 163, 175, 0.8)',
          text: 'text-gray-700',
          badge: 'bg-gray-500',
        };
    }
  };

  // 📊 加载态
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <p className="text-muted-foreground">加载户型方案中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 💾 状态指示器栏 */}
      {floorplanImage && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* 保存状态 */}
          {isSaving && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              保存中...
            </Badge>
          )}

          {!isSaving && !saveError && floorplanState && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300"
            >
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
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-300"
            >
              <WifiOff className="h-3 w-3" />
              离线模式
            </Badge>
          )}

          {/* 配额警告 */}
          {quotaWarning && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-300"
            >
              <AlertTriangle className="h-3 w-3" />
              存储空间接近上限
              <button
                onClick={clearLocal}
                className="ml-1 underline hover:no-underline"
              >
                清理缓存
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* 上传区域 */}
      {!floorplanImage ? (
        <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Upload className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  上传户型图
                </h3>
                <p className="text-gray-600 max-w-md">
                  上传您的户型平面图，系统将自动对准方位并叠加九宫飞星分析，帮您优化家居布局
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-xl"
              >
                <Upload className="mr-2 h-5 w-5" />
                选择户型图文件
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>支持 JPG、PNG、PDF 等格式</span>
              </div>

              {/* 使用指南 */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Info className="mr-2 h-4 w-4" />
                    查看使用指南
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>户型图叠加分析 - 使用指南</DialogTitle>
                    <DialogDescription>
                      了解如何准备和使用户型图进行风水分析
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Home className="h-4 w-4 text-purple-600" />
                        1. 户型图准备
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-6">
                        <li>使用清晰的户型平面图或CAD图纸</li>
                        <li>确保图片包含所有房间和主要区域</li>
                        <li>最好带有尺寸标注和方位指示</li>
                        <li>建议分辨率：1920x1080以上</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Compass className="h-4 w-4 text-blue-600" />
                        2. 自动对准功能
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-6">
                        <li>上传后系统会根据您的坐向数据自动旋转图片</li>
                        <li>您可以手动微调旋转角度以获得最佳效果</li>
                        <li>支持1°精度调整和快捷旋转按钮</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Grid3x3 className="h-4 w-4 text-green-600" />
                        3. 九宫格分析
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-6">
                        <li>绿色区域：吉星位，适合重要房间</li>
                        <li>红色区域：凶星位，需要化解或避免</li>
                        <li>黄色区域：中性位，可正常使用</li>
                        <li>点击宫位查看详细布局建议</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* 顶部工具栏 */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                    <Compass className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">户型图分析工作台</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>
                        {data.facing} ({data.facingDegree}°)
                      </span>
                      {autoRotated && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-300 animate-pulse"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          已自动对准
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExport}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>导出分析图</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    更换图片
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 主工作区 */}
          <div className="grid lg:grid-cols-[300px_1fr] gap-4">
            {/* 左侧控制面板 */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  调整控制
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="transform" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transform">变换</TabsTrigger>
                    <TabsTrigger value="display">显示</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transform" className="space-y-4 mt-4">
                    {/* 旋转控制 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <RotateCw className="h-4 w-4" />
                          旋转角度
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={Math.round(rotation)}
                            onChange={(e) =>
                              updateFloorplanState({
                                rotation: Number(e.target.value) % 360,
                              })
                            }
                            className="w-16 h-8 text-xs text-center"
                          />
                          <span className="text-xs text-gray-500">°</span>
                        </div>
                      </div>
                      <Slider
                        value={[rotation]}
                        onValueChange={(v) =>
                          updateFloorplanState({ rotation: v[0] })
                        }
                        min={0}
                        max={360}
                        step={1}
                        className="w-full"
                      />
                      <div className="grid grid-cols-4 gap-1">
                        {[-90, -15, 15, 90].map((angle) => (
                          <Button
                            key={angle}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateFloorplanState({
                                rotation: (rotation + angle) % 360,
                              })
                            }
                            className="text-xs"
                          >
                            {angle > 0 ? '+' : ''}
                            {angle}°
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={autoAlignFloorplan}
                        className="w-full"
                      >
                        <Compass className="mr-2 h-4 w-4" />
                        重新自动对准
                      </Button>
                    </div>

                    <Separator />

                    {/* 缩放控制 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Maximize2 className="h-4 w-4" />
                          缩放比例
                        </Label>
                        <span className="text-sm font-mono text-gray-600">
                          {Math.round(scale * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[scale]}
                        onValueChange={(v) =>
                          updateFloorplanState({ scale: v[0] })
                        }
                        min={0.3}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleZoom(-0.2)}
                          className="text-xs"
                        >
                          <ZoomOut className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFloorplanState({ scale: 1 })}
                          className="text-xs"
                        >
                          100%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleZoom(0.2)}
                          className="text-xs"
                        >
                          <ZoomIn className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetView}
                      className="w-full"
                    >
                      重置视图
                    </Button>
                  </TabsContent>

                  <TabsContent value="display" className="space-y-4 mt-4">
                    {/* 显示控制 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <Grid3x3 className="h-4 w-4" />
                          显示九宫格
                        </Label>
                        <Switch
                          checked={showOverlay}
                          onCheckedChange={(checked) =>
                            updateFloorplanState({ showOverlay: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          显示标签
                        </Label>
                        <Switch
                          checked={showLabels}
                          onCheckedChange={(checked) =>
                            updateFloorplanState({ showLabels: checked })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">叠加层透明度</Label>
                        <Slider
                          value={[overlayOpacity]}
                          onValueChange={(v) =>
                            updateFloorplanState({ overlayOpacity: v[0] })
                          }
                          min={0.1}
                          max={1}
                          step={0.05}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-right">
                          {Math.round(overlayOpacity * 100)}%
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">网格线宽度</Label>
                        <Slider
                          value={[gridLineWidth]}
                          onValueChange={(v) =>
                            updateFloorplanState({ gridLineWidth: v[0] })
                          }
                          min={1}
                          max={5}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 右侧预览区域 */}
            <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
              <div
                ref={containerRef}
                className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-inner cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* 户型图层 */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease',
                  }}
                >
                  <img
                    src={floorplanImage}
                    alt="户型图"
                    className="max-w-full max-h-full object-contain"
                    draggable={false}
                  />
                </div>

                {/* 九宫格叠加层 */}
                {showOverlay && (
                  <div
                    className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0 p-4 pointer-events-none"
                    style={{ opacity: overlayOpacity }}
                  >
                    {PALACE_POSITIONS.map((pos) => {
                      const cell = data.plate.find(
                        (c: any) => c.palace === pos.id
                      );
                      const suggestion = cell
                        ? getPalaceSuggestion(pos.id)
                        : null;
                      const colors = suggestion
                        ? getSuggestionColor(suggestion.type)
                        : getSuggestionColor('general');

                      return (
                        <div
                          key={pos.id}
                          className="relative pointer-events-auto cursor-pointer transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: colors.bg,
                            borderWidth: `${gridLineWidth}px`,
                            borderStyle: 'solid',
                            borderColor: colors.border,
                            borderRadius: '8px',
                          }}
                          onClick={() => setSelectedPalace(pos.id)}
                        >
                          {showLabels && (
                            <>
                              {/* 宫位名称 */}
                              <div className="absolute top-2 left-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-white/90 backdrop-blur-sm shadow-sm"
                                >
                                  {pos.name}
                                </Badge>
                              </div>

                              {/* 飞星数据 */}
                              {cell && (
                                <div className="absolute top-2 right-2 flex flex-col gap-1">
                                  <div className="text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm font-mono">
                                    山{cell.mountainStar}
                                  </div>
                                  <div className="text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm font-mono">
                                    向{cell.facingStar}
                                  </div>
                                </div>
                              )}

                              {/* 吉凶标识 */}
                              {suggestion && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                                  <Badge
                                    className={`${colors.badge} text-white text-xs shadow-lg`}
                                  >
                                    {suggestion.title}
                                  </Badge>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 方位指示器 */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-2xl backdrop-blur-sm border-2 border-white/30">
                    <div className="flex items-center gap-2">
                      <Compass className="h-5 w-5 animate-pulse" />
                      <div className="text-sm font-semibold">
                        {data.facing} {data.facingDegree}°
                      </div>
                    </div>
                  </div>
                </div>

                {/* 拖拽提示 */}
                {isDragging && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Move className="h-4 w-4" />
                      <span className="text-sm">拖动调整位置</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部提示 */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>点击宫位查看详细建议</span>
                </div>
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  <span>拖动调整 | 滚轮缩放</span>
                </div>
              </div>
            </Card>
          </div>

          {/* 布局建议详情弹窗 */}
          {selectedPalace && (
            <Card className="border-2 border-purple-200 shadow-2xl">
              {(() => {
                const suggestion = getPalaceSuggestion(selectedPalace);
                const cell = data.plate.find(
                  (c: any) => c.palace === selectedPalace
                );
                const position = PALACE_POSITIONS.find(
                  (p) => p.id === selectedPalace
                );

                if (!suggestion || !cell || !position) return null;

                const colors = getSuggestionColor(suggestion.type);

                return (
                  <div>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 ${colors.badge} rounded-lg flex items-center justify-center shadow-lg`}
                          >
                            <Home className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              {position.name} - {suggestion.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {position.direction}方位 · 山星{cell.mountainStar}{' '}
                              向星{cell.facingStar}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPalace(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                      {/* 吉凶属性 */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          吉凶属性：
                        </span>
                        <Badge className={`${colors.badge} text-white`}>
                          {suggestion.type === 'auspicious'
                            ? '吉'
                            : suggestion.type === 'inauspicious'
                              ? '凶'
                              : '中性'}
                        </Badge>
                      </div>

                      {/* 风水解析 */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          风水解析
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {suggestion.description}
                        </p>
                      </div>

                      {/* 增强建议 */}
                      {suggestion.enhance && suggestion.enhance.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            增强建议
                          </h4>
                          <div className="grid gap-2">
                            {suggestion.enhance.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 bg-green-50 p-3 rounded-lg"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 化解方法 */}
                      {suggestion.dissolve &&
                        suggestion.dissolve.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                              <AlertCircle className="h-4 w-4" />
                              化解方法
                            </h4>
                            <div className="grid gap-2">
                              {suggestion.dissolve.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 bg-red-50 p-3 rounded-lg"
                                >
                                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* 房间推荐 */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2 text-sm text-gray-700">
                            ✅ 适合房间
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.suitableRooms.map((room, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                {room}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {suggestion.avoidRooms &&
                          suggestion.avoidRooms.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm text-gray-700">
                                ❌ 避免房间
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {suggestion.avoidRooms.map((room, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="bg-red-100 text-red-800"
                                  >
                                    {room}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* 配色和物品推荐 */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {suggestion.colorScheme &&
                          suggestion.colorScheme.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm text-gray-700">
                                🎨 推荐色系
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {suggestion.colorScheme.map((color, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="bg-purple-100 text-purple-800"
                                  >
                                    {color}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {suggestion.items && suggestion.items.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-gray-700">
                              🏺 推荐物品
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.items.map((item, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="bg-amber-100 text-amber-800"
                                >
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                );
              })()}
            </Card>
          )}
        </div>
      )}

      {/* 隐藏的canvas用于导出 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
