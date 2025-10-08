'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    BarChart3,
    BookOpen,
    Download,
    Eye,
    Info,
    Lightbulb,
    RotateCcw,
    Settings,
    Share2
} from 'lucide-react';
import { useState } from 'react';

interface FengshuiControlsProps {
  onViewChange: (view: 'overview' | 'palaces' | 'geju' | 'advice') => void;
  onToggleDetails: (show: boolean) => void;
  onToggleLegend: (show: boolean) => void;
  onResetView: () => void;
  onExport: () => void;
  onShare: () => void;
  currentView: string;
  showDetails: boolean;
  showLegend: boolean;
}

export function FengshuiControls({
  onViewChange,
  onToggleDetails,
  onToggleLegend,
  onResetView,
  onExport,
  onShare,
  currentView,
  showDetails,
  showLegend
}: FengshuiControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const viewOptions = [
    { key: 'overview', label: '总览', icon: Eye, description: '查看整体分析结果' },
    { key: 'palaces', label: '九宫格', icon: BarChart3, description: '详细九宫飞星图' },
    { key: 'geju', label: '格局', icon: BookOpen, description: '格局分析详情' },
    { key: 'advice', label: '建议', icon: Lightbulb, description: '布局建议和指导' }
  ];

  return (
    <Card className="p-4 bg-white/90 backdrop-blur-sm border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">分析控制面板</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '收起' : '展开'}
        </Button>
      </div>

      {/* 视图切换 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">分析视图</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentView === option.key;
            
            return (
              <Button
                key={option.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onViewChange(option.key as any)}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* 显示选项 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">显示选项</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">显示详细信息</span>
              </div>
              <Switch
                checked={showDetails}
                onCheckedChange={onToggleDetails}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">显示图例说明</span>
              </div>
              <Switch
                checked={showLegend}
                onCheckedChange={onToggleLegend}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">操作</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetView}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重置视图
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出报告
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="w-full flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              分享分析结果
            </Button>
          </div>

          {/* 当前状态 */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">当前状态</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {viewOptions.find(v => v.key === currentView)?.label}
                </Badge>
                <span>当前视图</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={showDetails ? "default" : "outline"} className="text-xs">
                  {showDetails ? '开启' : '关闭'}
                </Badge>
                <span>详细信息</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={showLegend ? "default" : "outline"} className="text-xs">
                  {showLegend ? '开启' : '关闭'}
                </Badge>
                <span>图例说明</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
