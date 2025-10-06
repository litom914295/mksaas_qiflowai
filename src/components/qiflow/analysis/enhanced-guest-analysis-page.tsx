/**
 * 增强版访客分析页面
 * Enhanced Guest Analysis Page
 * 
 * 提供完整的风水罗盘功能和分析体验
 */

'use client';

import CompassThemeSelector from '@/components/compass/compass-theme-selector';
import FengShuiCompass from '@/components/compass/feng-shui-compass';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type CompassThemeKey } from '@/lib/compass/themes';
import {
    ArrowLeft,
    Compass,
    Download,
    Eye,
    Loader2,
    Palette,
    Play,
    RotateCcw,
    Settings,
    Share2,
    Sparkles,
    Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface CompassEvent {
  type: string;
  timestamp: number;
  direction?: number;
  theme?: string;
}

interface AIAnalysisResult {
  confidence: number;
  recommendations: string[];
  insights: string[];
}

export default function EnhancedGuestAnalysisPage() {
  const router = useRouter();

  // 罗盘状态
  const [currentDirection, setCurrentDirection] = useState<number>(0);
  const [currentTheme, setCurrentTheme] = useState<CompassThemeKey>('compass');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [compassEvents, setCompassEvents] = useState<CompassEvent[]>([]);
  const [isAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  // 罗盘配置
  const [compassConfig] = useState({
    width: 600,
    height: 600,
    interactive: true,
    enableAnimation: true,
    showDetailedInfo: true,
  });

  // 获取可用主题列表（保留以备将来使用）
  // const availableThemes = getThemeList();

  // AI分析结果
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // 处理方向变化
  const handleDirectionChange = useCallback((direction: number) => {
    setCurrentDirection(direction);
    
    // 记录事件
    const event: CompassEvent = {
      type: 'direction_change',
      timestamp: Date.now(),
      direction,
    };
    setCompassEvents(prev => [...prev.slice(-9), event]);

    // 清除之前的分析结果，等待用户点击分析按钮
    if (hasAnalyzed) {
      setAiAnalysis(null);
      setHasAnalyzed(false);
    }
  }, [hasAnalyzed]);

  // 执行风水分析 - 跳转到罗盘专用分析结果页面
  const handleAnalyze = useCallback(() => {
    if (isAnalyzing || currentDirection === null) return;
    
    // 记录分析事件
    const event: CompassEvent = {
      type: 'analysis_start',
      timestamp: Date.now(),
      direction: currentDirection,
      theme: currentTheme,
    };
    setCompassEvents(prev => [...prev.slice(-9), event]);

    // 构建分析结果页面的URL参数
    const params = new URLSearchParams({
      direction: currentDirection.toString(),
      theme: currentTheme,
      timestamp: new Date().getTime().toString()
    });
    
    // 跳转到罗盘专用分析结果页面，连接现有的分析系统
    // 保留项目中现有的所有分析模块：八字命理分析、十神分析、用神分析、大运流年分析、九宫飞星排盘与分析等
    router.push(`/zh-CN/compass-analysis-result?${params.toString()}`);
  }, [currentDirection, currentTheme, isAnalyzing, router]);

  // 处理主题变化
  const handleThemeChange = useCallback((theme: CompassThemeKey) => {
    setCurrentTheme(theme);
    
    // 记录事件
    const event: CompassEvent = {
      type: 'theme_change',
      timestamp: Date.now(),
      theme,
    };
    setCompassEvents(prev => [...prev.slice(-9), event]);
  }, []);

  // 校准罗盘
  const handleCalibrate = useCallback(() => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setCurrentDirection(0);
    }, 2000);
  }, []);

  // 重置罗盘
  const handleReset = useCallback(() => {
    setCurrentDirection(0);
    setCompassEvents([]);
    setAiAnalysis(null);
    setHasAnalyzed(false);
  }, []);

  // 导出分析结果
  const handleExport = useCallback(() => {
    const data = {
      direction: currentDirection,
      theme: currentTheme,
      events: compassEvents,
      analysis: aiAnalysis,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feng-shui-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentDirection, currentTheme, compassEvents, aiAnalysis]);

  // 分享功能
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '风水罗盘分析结果',
          text: `当前方位: ${currentDirection}°，使用主题: ${currentTheme}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('分享失败:', error);
      }
    } else {
      // 复制到剪贴板
      const text = `风水罗盘分析结果\n当前方位: ${currentDirection}°\n使用主题: ${currentTheme}\n链接: ${window.location.href}`;
      navigator.clipboard.writeText(text);
    }
  }, [currentDirection, currentTheme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 头部导航 */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
              <div className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">风水罗盘分析</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {currentDirection.toFixed(1)}°
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCalibrate}
                disabled={isCalibrating}
                className="flex items-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${isCalibrating ? 'animate-spin' : ''}`} />
                {isCalibrating ? '校准中...' : '校准'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 罗盘区域 */}
          <div className="xl:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                {/* 主题选择器 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">选择罗盘主题</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      分享
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="flex items-center gap-2"
                      disabled={!hasAnalyzed}
                    >
                      <Download className="w-4 h-4" />
                      导出
                    </Button>
                  </div>
                </div>

                <CompassThemeSelector
                  currentTheme={currentTheme}
                  onThemeChange={handleThemeChange}
                />

                {/* 罗盘组件 */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <FengShuiCompass
                      width={compassConfig.width}
                      height={compassConfig.height}
                      theme={currentTheme}
                      interactive={compassConfig.interactive}
                      onDirectionChange={handleDirectionChange}
                    />
                    
                    {isCalibrating && (
                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-lg">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">校准中...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 分析按钮 */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        当前方位: <span className="font-semibold text-primary">{currentDirection.toFixed(1)}°</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        调整罗盘到合适方位后，点击下方按钮开始分析
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || isCalibrating}
                      size="lg"
                      className="px-8 py-3 text-lg font-semibold"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          开始风水分析
                        </>
                      )}
                    </Button>

                    {hasAnalyzed && !isAnalyzing && (
                      <div className="text-center">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          分析完成
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 当前状态 */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">当前状态</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">方位角度</span>
                  <Badge variant="outline">{currentDirection.toFixed(1)}°</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">当前主题</span>
                  <Badge variant="outline">{currentTheme}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">记录事件</span>
                  <Badge variant="outline">{compassEvents.length}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">分析状态</span>
                  <Badge variant={hasAnalyzed ? "default" : "secondary"}>
                    {isAnalyzing ? "分析中" : hasAnalyzed ? "已完成" : "未开始"}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* AI分析结果 */}
            {aiAnalysis && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">AI分析</h3>
                  <Badge variant="secondary">
                    {(aiAnalysis.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                
                <Tabs defaultValue="recommendations" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recommendations">建议</TabsTrigger>
                    <TabsTrigger value="insights">洞察</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recommendations" className="space-y-2">
                    {aiAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        {rec}
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="insights" className="space-y-2">
                    {aiAnalysis.insights.map((insight, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        {insight}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </Card>
            )}

            {/* 操作历史 */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">操作历史</h3>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {compassEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无操作记录</p>
                ) : (
                  compassEvents.slice(-10).reverse().map((event, index) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {event.type === 'direction_change' ? '方向变化' : 
                           event.type === 'theme_change' ? '主题切换' : 
                           event.type === 'analysis_start' ? '开始分析' : '其他操作'}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.direction && (
                        <div className="text-muted-foreground">
                          方位: {event.direction.toFixed(1)}°
                        </div>
                      )}
                      {event.theme && (
                        <div className="text-muted-foreground">
                          主题: {event.theme}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// 命名导出
export { EnhancedGuestAnalysisPage };

